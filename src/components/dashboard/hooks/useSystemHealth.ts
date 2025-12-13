import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardContext } from "../context/DashboardContext";

export interface HealthIssue {
  code: string;
  message: string;
}

export interface DatabaseHealth {
  status: 'healthy' | 'warning' | 'critical';
  canConnect: boolean;
  totalRecords: number;
  tableBreakdown: Record<string, number>;
  recentActivity24h: number;
  issues: HealthIssue[];
}

export interface StorageHealth {
  status: 'healthy' | 'warning' | 'critical';
  canListBuckets: boolean;
  totalFiles: number;
  bucketBreakdown: Record<string, number>;
  totalStorageMB: number;
  issues: HealthIssue[];
}

export interface AuthHealth {
  status: 'healthy' | 'warning' | 'critical';
  canListUsers: boolean;
  totalUsers: number;
  activeUsers7d: number;
  roleBreakdown: {
    admin: number;
    editor: number;
  };
  issues: HealthIssue[];
}

export interface EdgeFunctionsHealth {
  status: 'healthy' | 'warning' | 'critical';
  probeSuccess: boolean;
  responseTimeMs: number;
  totalFunctions: number;
  availableFunctions: string[];
  lastChecked: string;
  issues: HealthIssue[];
}

export interface ExternalIntegrationsHealth {
  status: 'healthy' | 'warning' | 'critical';
  integrations: Record<string, {
    reachable: boolean;
    latencyMs: number;
    status?: number;
    lastError: string | null;
  }>;
  totalIntegrations: number;
  lastChecked: string;
  issues: HealthIssue[];
}

export interface SystemHealthResponse {
  timestamp: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
  database: DatabaseHealth;
  storage: StorageHealth;
  authentication: AuthHealth;
  edgeFunctions: EdgeFunctionsHealth;
  externalIntegrations: ExternalIntegrationsHealth;
}

export const useSystemHealth = () => {
  const { ensureValidSession } = useDashboardContext();

  const query = useQuery<SystemHealthResponse>({
    queryKey: ["system-health"],
    queryFn: async () => {
      const isValid = await ensureValidSession();
      if (!isValid) throw new Error("Session invalid");

      const { data, error } = await supabase.functions.invoke("system-health");
      if (error) throw error;
      return data as SystemHealthResponse;
    },
    enabled: false, // Manual trigger only
    staleTime: 0, // Always refetch
    retry: 1,
  });

  return query;
};
