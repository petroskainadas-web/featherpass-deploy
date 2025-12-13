import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";
import { Resend } from "npm:resend@2.0.0";
import { corsHeaders } from "../_shared/cors.ts";

// Health check thresholds
const LOW_RECORDS_THRESHOLD = 5;
const SLOW_FN_THRESHOLD_MS = 1500;
const NO_ACTIVITY_THRESHOLD_HOURS = 24;
const SLOW_INTEGRATION_THRESHOLD_MS = 3000;

const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify admin role
    const { data: roles } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", user.id);

    const isAdmin = roles?.some((r) => r.role === "admin");
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 1. DATABASE HEALTH
    let canConnect = true;
    const dbIssues: Array<{ code: string; message: string }> = [];

    let libraryContentCount,
      articleContentCount,
      galleryImagesCount,
      newsletterSubscribersCount,
      imagesCount,
      pdfsCount;

    try {
      [
        libraryContentCount,
        articleContentCount,
        galleryImagesCount,
        newsletterSubscribersCount,
        imagesCount,
        pdfsCount,
      ] = await Promise.all([
        supabaseAdmin.from("library_content").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("article_content").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("gallery_images").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("newsletter_subscribers").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("images").select("*", { count: "exact", head: true }),
        supabaseAdmin.from("content_pdfs").select("*", { count: "exact", head: true }),
      ]);

      // Check each result for errors (Tweak #1)
      if (
        libraryContentCount?.error ||
        articleContentCount?.error ||
        galleryImagesCount?.error ||
        newsletterSubscribersCount?.error ||
        imagesCount?.error ||
        pdfsCount?.error
      ) {
        canConnect = false;
        dbIssues.push({
          code: "db_unreachable",
          message: "Database queries failed. Check Supabase status or service role configuration.",
        });
      }
    } catch (error) {
      console.error("Database connection error:", error);
      canConnect = false;
      dbIssues.push({
        code: "db_unreachable",
        message: "Database queries failed. Check Supabase status or service role configuration.",
      });
    }

    const totalRecords = canConnect
      ? (libraryContentCount?.count || 0) +
        (articleContentCount?.count || 0) +
        (galleryImagesCount?.count || 0) +
        (newsletterSubscribersCount?.count || 0) +
        (imagesCount?.count || 0) +
        (pdfsCount?.count || 0)
      : 0;

    // Get recent activity (last 24 hours)
    let recentActivity = 0;
    let recentActivityError = false;
    if (canConnect) {
      try {
        const yesterday = new Date(Date.now() - NO_ACTIVITY_THRESHOLD_HOURS * 60 * 60 * 1000).toISOString();
        const [recentLibrary, recentArticles, recentGallery] = await Promise.all([
          supabaseAdmin
            .from("library_content")
            .select("*", { count: "exact", head: true })
            .gte("created_at", yesterday),
          supabaseAdmin
            .from("article_content")
            .select("*", { count: "exact", head: true })
            .gte("created_at", yesterday),
          supabaseAdmin.from("gallery_images").select("*", { count: "exact", head: true }).gte("created_at", yesterday),
        ]);

        // Check for errors in recent activity queries (Tweak #1)
        if (recentLibrary.error || recentArticles.error || recentGallery.error) {
          recentActivityError = true;
          canConnect = false;
          dbIssues.push({
            code: "db_unreachable",
            message: "Database queries failed. Check Supabase status or service role configuration.",
          });
        } else {
          recentActivity = (recentLibrary.count || 0) + (recentArticles.count || 0) + (recentGallery.count || 0);
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error);
        recentActivityError = true;
      }
    }

    // Check for low records
    if (canConnect && totalRecords < LOW_RECORDS_THRESHOLD) {
      dbIssues.push({
        code: "db_low_records",
        message:
          "Core tables contain very few records. This might be normal for a new project, otherwise check imports and migrations.",
      });
    }

    // Check for no recent activity (only if no error occurred)
    if (canConnect && !recentActivityError && recentActivity === 0 && totalRecords > 0) {
      dbIssues.push({
        code: "db_no_recent_activity",
        message:
          "No new or updated content in the last 24 hours. If this is unexpected, verify that editors and background jobs are running.",
      });
    }

    const dbStatus = !canConnect ? "critical" : dbIssues.length > 0 ? "warning" : "healthy";

    const databaseHealth = {
      status: dbStatus,
      canConnect,
      totalRecords,
      tableBreakdown: {
        library_content: libraryContentCount?.count || 0,
        article_content: articleContentCount?.count || 0,
        gallery_images: galleryImagesCount?.count || 0,
        newsletter_subscribers: newsletterSubscribersCount?.count || 0,
        images: imagesCount?.count || 0,
        content_pdfs: pdfsCount?.count || 0,
      },
      recentActivity24h: recentActivity,
      issues: dbIssues,
    };

    // 2. STORAGE HEALTH
    let canListBuckets = true;
    const storageIssues: Array<{ code: string; message: string }> = [];

    // Helper function to recursively count files in a bucket with pagination (Tweak #2)
    const countFilesInBucket = async (
      bucketName: string,
      path: string = "",
    ): Promise<{ count: number; size: number; error?: string }> => {
      let totalCount = 0;
      let totalSize = 0;
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data: items, error } = await supabaseAdmin.storage.from(bucketName).list(path, {
          limit,
          offset,
          sortBy: { column: "name", order: "asc" },
        });

        if (error) {
          console.error(`Error listing ${bucketName}/${path}:`, error);
          return { count: 0, size: 0, error: error.message || "Failed to list bucket" };
        }

        if (!items || items.length === 0) {
          hasMore = false;
          break;
        }

        for (const item of items) {
          // Folders have metadata === null, files have metadata with size
          const isFolder = item.metadata == null;

          if (isFolder) {
            // This is a folder, recurse into it
            const folderPath = path ? `${path}/${item.name}` : item.name;
            const folderStats = await countFilesInBucket(bucketName, folderPath);
            if (folderStats.error) {
              return folderStats; // Propagate error up
            }
            totalCount += folderStats.count;
            totalSize += folderStats.size;
          } else {
            // This is a file
            totalCount += 1;
            totalSize += item.metadata?.size ?? 0;
          }
        }

        // Check if we got fewer items than the limit (means we're done)
        if (items.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      return { count: totalCount, size: totalSize };
    };

    let contentImagesData = { count: 0, size: 0 };
    let galleryImagesData = { count: 0, size: 0 };
    let contentPdfsData = { count: 0, size: 0 };

    try {
      [contentImagesData, galleryImagesData, contentPdfsData] = await Promise.all([
        countFilesInBucket("content-images"),
        countFilesInBucket("gallery-images"),
        countFilesInBucket("content-pdfs"),
      ]);

      // Check for errors in bucket listing (Tweak #2)
      if (contentImagesData.error || galleryImagesData.error || contentPdfsData.error) {
        canListBuckets = false;
        storageIssues.push({
          code: "storage_unreachable",
          message:
            "Failed to list one or more buckets. Possible causes: Supabase storage outage, misconfigured bucket, or invalid service role key.",
        });
      }
    } catch (error) {
      console.error("Storage bucket listing error:", error);
      canListBuckets = false;
      storageIssues.push({
        code: "storage_unreachable",
        message:
          "Failed to list one or more buckets. Possible causes: Supabase storage outage, misconfigured bucket, or invalid service role key.",
      });
    }

    const totalFiles = contentImagesData.count + galleryImagesData.count + contentPdfsData.count;
    const totalStorageBytes = contentImagesData.size + galleryImagesData.size + contentPdfsData.size;
    const totalStorageMB = (totalStorageBytes / (1024 * 1024)).toFixed(2);

    // Check for empty storage
    if (canListBuckets && totalFiles === 0 && totalRecords > 0) {
      storageIssues.push({
        code: "storage_empty",
        message:
          "Storage buckets contain no files. If images or PDFs should already be stored, check upload paths and image processing functions.",
      });
    }

    const storageStatus = !canListBuckets ? "critical" : storageIssues.length > 0 ? "warning" : "healthy";

    const storageHealth = {
      status: storageStatus,
      canListBuckets,
      totalFiles,
      bucketBreakdown: {
        "content-images": contentImagesData.count,
        "gallery-images": galleryImagesData.count,
        "content-pdfs": contentPdfsData.count,
      },
      totalStorageMB: parseFloat(totalStorageMB),
      issues: storageIssues,
    };

    // 3. AUTHENTICATION & SECURITY HEALTH
    let canListUsers = true;
    const authIssues: Array<{ code: string; message: string }> = [];
    let allUsers: any[] = [];

    // Fetch all users with pagination
    try {
      let page = 1;
      const perPage = 1000;
      let hasMoreUsers = true;

      while (hasMoreUsers) {
        const { data, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage,
        });

        if (usersError) {
          console.error("Error fetching users:", usersError);
          canListUsers = false;
          authIssues.push({
            code: "auth_unreachable",
            message: "Failed to list users via Auth admin. Check Supabase auth status and service role credentials.",
          });
          break;
        }

        if (data.users && data.users.length > 0) {
          allUsers = allUsers.concat(data.users);

          if (data.users.length < perPage) {
            hasMoreUsers = false;
          } else {
            page++;
          }
        } else {
          hasMoreUsers = false;
        }
      }
    } catch (error) {
      console.error("Auth listing error:", error);
      canListUsers = false;
      authIssues.push({
        code: "auth_unreachable",
        message: "Failed to list users via Auth admin. Check Supabase auth status and service role credentials.",
      });
    }

    const totalUsers = allUsers.length;

    // Fetch user roles with error handling (Tweak #3)
    const { data: allRoles, error: rolesError } = await supabaseAdmin.from("user_roles").select("*");

    if (rolesError) {
      console.error("Error fetching user roles:", rolesError);
      authIssues.push({
        code: "auth_roles_error",
        message: "Failed to read user_roles. Check table existence and permissions.",
      });
    }

    const adminCount = allRoles?.filter((r) => r.role === "admin").length || 0;
    const editorCount = allRoles?.filter((r) => r.role === "editor").length || 0;

    // Get active sessions (users logged in within last 7 days)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const activeUsers = allUsers.filter((u) => u.last_sign_in_at && u.last_sign_in_at >= weekAgo).length;

    // Check for no admins
    if (canListUsers && adminCount === 0 && totalUsers > 0) {
      authIssues.push({
        code: "no_admins",
        message: "No admin users found. If you cannot access the dashboard, create an admin manually in Supabase.",
      });
    }

    // Check for only one admin
    if (canListUsers && adminCount === 1) {
      authIssues.push({
        code: "only_one_admin",
        message: "Only one admin account exists. Consider adding a backup admin to avoid lock-out.",
      });
    }

    // Check for no users
    if (canListUsers && totalUsers === 0) {
      authIssues.push({
        code: "no_users",
        message: "No users found. If this site is live and accepting signups, verify the authentication configuration.",
      });
    }

    const authStatus = !canListUsers
      ? "critical"
      : adminCount === 0 && totalUsers > 0
        ? "critical"
        : authIssues.length > 0
          ? "warning"
          : "healthy";

    const authHealth = {
      status: authStatus,
      canListUsers,
      totalUsers,
      activeUsers7d: activeUsers,
      roleBreakdown: {
        admin: adminCount,
        editor: editorCount,
      },
      issues: authIssues,
    };

    // 4. EDGE FUNCTIONS HEALTH
    const edgeFunctions = [
      "bulk-operations",
      "confirm-newsletter-subscriber",
      "contact-form",
      "dashboard-analytics",
      "database-backup",
      "database-maintenance",
      "download-content-pdf",
      "export-newsletter-subscribers",
      "list-all-users",
      "manage-user-roles",
      "newsletter-confirm",
      "newsletter-resubscribe",
      "newsletter-subscribe",
      "newsletter-sync-convertkit",
      "newsletter-unsubscribe",
      "process-gallery-image",
      "process-image",
      "reset-password-with-token",
      "send-password-reset",
      "system-health",
    ];

    let probeSuccess = true;
    let responseTimeMs = 0;
    const edgeFnIssues: Array<{ code: string; message: string }> = [];
    const startTime = Date.now();

    try {
      // Quick health check - test database connectivity using library_content (core table)
      const { error: dbTestError } = await supabaseAdmin.from("library_content").select("id").limit(1);
      responseTimeMs = Date.now() - startTime;

      if (dbTestError) {
        probeSuccess = false;
        edgeFnIssues.push({
          code: "fn_unreachable",
          message:
            "The system could not complete a simple database probe. Check Supabase status, database URL, or service role key, then inspect edge function logs if needed.",
        });
      } else if (responseTimeMs > SLOW_FN_THRESHOLD_MS) {
        edgeFnIssues.push({
          code: "fn_slow",
          message: `Edge health probe is slow (${responseTimeMs}ms). Could indicate cold starts, heavy queries, or general Supabase performance issues.`,
        });
      }
    } catch (error) {
      probeSuccess = false;
      responseTimeMs = Date.now() - startTime;
      edgeFnIssues.push({
        code: "fn_unreachable",
        message:
          "The system could not complete a simple database probe. Check Supabase status, database URL, or service role key, then inspect edge function logs if needed.",
      });
    }

    const edgeFnStatus = !probeSuccess ? "critical" : edgeFnIssues.length > 0 ? "warning" : "healthy";

    const edgeFunctionsHealth = {
      status: edgeFnStatus,
      probeSuccess,
      responseTimeMs,
      availableFunctions: edgeFunctions,
      totalFunctions: edgeFunctions.length,
      lastChecked: new Date().toISOString(),
      issues: edgeFnIssues,
    };

    // 5. EXTERNAL INTEGRATIONS HEALTH
    const externalIssues: Array<{ code: string; message: string }> = [];
    const integrations: Record<string, any> = {};

    // Check Resend using SDK (same approach as working contact-form and send-password-reset functions)
    const resendKey = Deno.env.get("RESEND_API_KEY");
    console.log("Resend API key present:", !!resendKey);
    
    if (resendKey) {
      const resendStart = Date.now();
      try {
        console.log("Resend health check starting with SDK...");
        const resend = new Resend(resendKey);
        
        // Use the SDK to list API keys - validates connection without sending email
        const { data, error } = await resend.apiKeys.list();
        const resendLatency = Date.now() - resendStart;
        
        if (error) {
          console.log(`Resend SDK error: ${error.message}`);
          integrations.resend = {
            reachable: false,
            latencyMs: resendLatency,
            lastError: error.message,
          };
          externalIssues.push({
            code: "resend_sdk_error",
            message: `Resend SDK returned error: ${error.message}`,
          });
        } else {
          console.log(`Resend health check succeeded, found ${data?.length || 0} API keys, latency: ${resendLatency}ms`);
          integrations.resend = {
            reachable: true,
            latencyMs: resendLatency,
            lastError: null,
          };
          
          if (resendLatency > SLOW_INTEGRATION_THRESHOLD_MS) {
            externalIssues.push({
              code: "resend_slow",
              message: `Resend API is responding slowly (${resendLatency}ms).`,
            });
          }
        }
      } catch (error) {
        const resendLatency = Date.now() - resendStart;
        console.error("Resend SDK exception:", error);
        integrations.resend = {
          reachable: false,
          latencyMs: resendLatency,
          lastError: error.message,
        };
        externalIssues.push({
          code: "resend_unreachable",
          message: "Resend did not respond to the health check. Check their status page and your network configuration.",
        });
      }
    }

    // Check Kit (ConvertKit) - using Kit API v4
    const kitKey = Deno.env.get("KIT_API_KEY");
    if (kitKey) {
      const kitStart = Date.now();
      try {
        console.log("Kit health check starting...");
        const kitResponse = await fetch("https://api.kit.com/v4/subscribers?per_page=1", {
          method: "GET",
          headers: {
            "X-Kit-Api-Key": kitKey,
          },
        });
        const kitLatency = Date.now() - kitStart;
        console.log(`Kit response status: ${kitResponse.status}`);

        integrations.kit = {
          reachable: kitResponse.ok,
          latencyMs: kitLatency,
          status: kitResponse.status,
          lastError: kitResponse.ok ? null : `HTTP ${kitResponse.status}`,
        };

        if (!kitResponse.ok) {
          if (kitResponse.status === 401 || kitResponse.status === 403) {
            externalIssues.push({
              code: "kit_auth_error",
              message: "Kit API responded with auth error. API key may be invalid or expired.",
            });
          } else {
            externalIssues.push({
              code: "kit_error",
              message: `Kit API returned error status ${kitResponse.status}.`,
            });
          }
        } else if (kitLatency > SLOW_INTEGRATION_THRESHOLD_MS) {
          externalIssues.push({
            code: "kit_slow",
            message: `Kit API is responding slowly (${kitLatency}ms).`,
          });
        }
      } catch (error) {
        integrations.kit = {
          reachable: false,
          latencyMs: Date.now() - kitStart,
          lastError: error.message,
        };
        externalIssues.push({
          code: "kit_unreachable",
          message: "Kit did not respond to the health check. Check their status page and your network configuration.",
        });
      }
    }

    // Check Google Analytics - Configuration check only
    const gaMeasurementId = Deno.env.get("VITE_GA_MEASUREMENT_ID");
    if (gaMeasurementId) {
      const isValidFormat = /^G-[A-Z0-9]+$/.test(gaMeasurementId);
      integrations.googleAnalytics = {
        reachable: isValidFormat,
        latencyMs: 0,
        status: isValidFormat ? 200 : 0,
        lastError: isValidFormat ? null : "Invalid measurement ID format",
      };

      if (!isValidFormat) {
        externalIssues.push({
          code: "ga_invalid_config",
          message: "Google Analytics measurement ID has invalid format. Expected format: G-XXXXXXXXXX",
        });
      }
    }

    const externalStatus = externalIssues.some((i) => i.code.includes("unreachable") || i.code.includes("auth_error"))
      ? "critical"
      : externalIssues.length > 0
        ? "warning"
        : Object.keys(integrations).length === 0
          ? "healthy" // No integrations configured
          : "healthy";

    const externalIntegrationsHealth = {
      status: externalStatus,
      integrations,
      totalIntegrations: Object.keys(integrations).length,
      lastChecked: new Date().toISOString(),
      issues: externalIssues,
    };

    // OVERALL SYSTEM STATUS
    const allStatuses = [
      databaseHealth.status,
      storageHealth.status,
      authHealth.status,
      edgeFunctionsHealth.status,
      externalIntegrationsHealth.status,
    ];

    const overallStatus = allStatuses.includes("critical")
      ? "critical"
      : allStatuses.includes("warning")
        ? "warning"
        : "healthy";

    return new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        overallStatus,
        database: databaseHealth,
        storage: storageHealth,
        authentication: authHealth,
        edgeFunctions: edgeFunctionsHealth,
        externalIntegrations: externalIntegrationsHealth,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error: any) {
    console.error("System health check error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
