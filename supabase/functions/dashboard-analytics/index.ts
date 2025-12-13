import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { corsHeaders } from '../_shared/cors.ts';

console.log('Dashboard Analytics function started');

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      throw new Error('Invalid authentication token');
    }

    // Check if user has editor or admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const hasAccess = roles?.some(r => r.role === 'editor' || r.role === 'admin');
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Insufficient permissions' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type } = await req.json();

    let result;

    switch (type) {
      case 'content':
        result = await getContentAnalytics(supabase);
        break;
      case 'articles':
        result = await getArticleAnalytics(supabase);
        break;
      case 'gallery':
        result = await getGalleryAnalytics(supabase);
        break;
      case 'newsletter':
        result = await getNewsletterAnalytics(supabase);
        break;
      case 'overview':
        result = await getOverviewAnalytics(supabase);
        break;
      default:
        throw new Error('Invalid analytics type');
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in dashboard-analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

async function getContentAnalytics(supabase: any) {
  // Get aggregated stats without fetching all data
  const { data: contentStats, error: statsError } = await supabase
    .from('library_content')
    .select('content_type, download_count');

  if (statsError) throw statsError;

  const totalCount = contentStats?.length || 0;
  const totalDownloads = contentStats?.reduce((sum: number, item: any) => sum + (item.download_count || 0), 0) || 0;

  const byType = contentStats?.reduce((acc: any, item: any) => {
    acc[item.content_type] = (acc[item.content_type] || 0) + 1;
    return acc;
  }, {}) || {};

  const typeDistribution = Object.entries(byType).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
    value
  }));

  // Get top 10 downloaded items only
  const { data: topDownloaded, error: topError } = await supabase
    .from('library_content')
    .select('id, title, content_type, download_count')
    .order('download_count', { ascending: false })
    .limit(10);

  if (topError) throw topError;

  return {
    totalCount,
    totalDownloads,
    typeDistribution,
    topDownloaded: topDownloaded || [],
    byType
  };
}

async function getArticleAnalytics(supabase: any) {
  // Get aggregated stats
  const { data: articleStats, error: statsError } = await supabase
    .from('article_content')
    .select('article_type, view_count, like_count, read_time');

  if (statsError) throw statsError;

  const totalCount = articleStats?.length || 0;
  const totalViews = articleStats?.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0) || 0;
  const totalLikes = articleStats?.reduce((sum: number, item: any) => sum + (item.like_count || 0), 0) || 0;
  const avgReadTime = articleStats?.length ? 
    articleStats.reduce((sum: number, item: any) => sum + (item.read_time || 0), 0) / articleStats.length : 0;

  // Get top 10 by views
  const { data: topByViews, error: viewsError } = await supabase
    .from('article_content')
    .select('id, title, article_type, view_count, published_date')
    .order('view_count', { ascending: false })
    .limit(10);

  if (viewsError) throw viewsError;

  // Get top 10 by likes
  const { data: topByLikes, error: likesError } = await supabase
    .from('article_content')
    .select('id, title, article_type, like_count, published_date')
    .order('like_count', { ascending: false })
    .limit(10);

  if (likesError) throw likesError;

  const byType = articleStats?.reduce((acc: any, item: any) => {
    if (!acc[item.article_type]) {
      acc[item.article_type] = { views: 0, likes: 0, count: 0 };
    }
    acc[item.article_type].views += item.view_count || 0;
    acc[item.article_type].likes += item.like_count || 0;
    acc[item.article_type].count += 1;
    return acc;
  }, {}) || {};

  const typeDistribution = Object.entries(byType).map(([name, stats]: [string, any]) => ({
    name,
    views: stats.views,
    likes: stats.likes,
    count: stats.count
  }));

  return {
    totalCount,
    totalViews,
    totalLikes,
    avgReadTime,
    topByViews: topByViews || [],
    topByLikes: topByLikes || [],
    typeDistribution
  };
}

async function getGalleryAnalytics(supabase: any) {
  // Get aggregated stats
  const { data: galleryStats, error: statsError } = await supabase
    .from('gallery_images')
    .select('image_type, view_count, orientation');

  if (statsError) throw statsError;

  const totalCount = galleryStats?.length || 0;
  const totalViews = galleryStats?.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0) || 0;

  // Type distribution with views
  const byTypeViews = galleryStats?.reduce((acc: any, item: any) => {
    if (!acc[item.image_type]) {
      acc[item.image_type] = { count: 0, views: 0 };
    }
    acc[item.image_type].count += 1;
    acc[item.image_type].views += item.view_count || 0;
    return acc;
  }, {}) || {};

  const typeDistribution = Object.entries(byTypeViews).map(([name, stats]: [string, any]) => ({
    name,
    value: stats.count,
    views: stats.views
  }));

  // Orientation distribution
  const orientationCounts = galleryStats?.reduce((acc: any, item: any) => {
    acc[item.orientation] = (acc[item.orientation] || 0) + 1;
    return acc;
  }, {}) || {};

  const orientationDistribution = Object.entries(orientationCounts).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }));

  // Get top 10 viewed images
  const { data: topViewed, error: topError } = await supabase
    .from('gallery_images')
    .select('id, title, image_type, view_count')
    .order('view_count', { ascending: false })
    .limit(10);

  if (topError) throw topError;

  return {
    totalCount,
    totalViews,
    typeDistribution,
    orientationDistribution,
    topViewed: topViewed || [],
    byType: byTypeViews
  };
}

async function getNewsletterAnalytics(supabase: any) {
  // Get all subscribers data for detailed analysis
  const { data: allSubscribers, error: allError } = await supabase
    .from('newsletter_subscribers')
    .select('confirmed, unsubscribed, source, unsubscribe_reason, resubscribed_count, subscribed_at, convertkit_synced');

  if (allError) throw allError;

  const confirmedSubscribers = allSubscribers?.filter(s => s.confirmed && !s.unsubscribed).length || 0;
  const unsubscribedCount = allSubscribers?.filter(s => s.unsubscribed).length || 0;
  const pendingConfirmations = allSubscribers?.filter(s => !s.confirmed && !s.unsubscribed).length || 0;
  const totalResubscriptions = allSubscribers?.reduce((sum: number, s: any) => sum + (s.resubscribed_count || 0), 0) || 0;

  // Source distribution
  const sourceCounts = allSubscribers?.reduce((acc: any, sub: any) => {
    const source = sub.source || 'Direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {}) || {};

  const sourceDistribution = Object.entries(sourceCounts).map(([name, value]) => ({
    name,
    value
  }));

  // Unsubscribe reasons distribution
  const reasonCounts = allSubscribers
    ?.filter(s => s.unsubscribed && s.unsubscribe_reason)
    .reduce((acc: any, sub: any) => {
      acc[sub.unsubscribe_reason] = (acc[sub.unsubscribe_reason] || 0) + 1;
      return acc;
    }, {}) || {};

  const reasonsDistribution = Object.entries(reasonCounts).map(([reason, count]) => ({
    reason,
    count
  }));

  // Growth data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentSubs = allSubscribers?.filter(s => new Date(s.subscribed_at) >= thirtyDaysAgo) || [];
  
  const growthData = recentSubs.reduce((acc: any, sub: any) => {
    const date = new Date(sub.subscribed_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const growth = Object.entries(growthData).map(([date, count]) => ({
    date,
    subscribers: count
  }));

  // ConvertKit sync status
  const syncedCount = allSubscribers?.filter(s => s.convertkit_synced).length || 0;
  const notSyncedCount = allSubscribers?.filter(s => !s.convertkit_synced).length || 0;

  return {
    totalSubscribers: confirmedSubscribers,
    totalUnsubscribed: unsubscribedCount,
    pendingConfirmations,
    totalResubscriptions,
    sourceDistribution,
    reasonsDistribution,
    growth,
    syncedCount,
    notSyncedCount
  };
}

async function getOverviewAnalytics(supabase: any) {
  // Get high-level overview stats
  const [
    { count: contentCount },
    { count: articleCount },
    { count: galleryCount },
    { count: subscriberCount }
  ] = await Promise.all([
    supabase.from('library_content').select('*', { count: 'exact', head: true }),
    supabase.from('article_content').select('*', { count: 'exact', head: true }),
    supabase.from('gallery_images').select('*', { count: 'exact', head: true }),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true })
      .eq('confirmed', true).eq('unsubscribed', false)
  ]);

  // Get top items for overview
  const { data: topContent } = await supabase
    .from('library_content')
    .select('title, download_count')
    .order('download_count', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: topArticle } = await supabase
    .from('article_content')
    .select('title, view_count, like_count')
    .order('view_count', { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: topImage } = await supabase
    .from('gallery_images')
    .select('title, view_count')
    .order('view_count', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Get total engagement metrics
  const { data: contentDownloads } = await supabase
    .from('library_content')
    .select('download_count');

  const { data: articleEngagement } = await supabase
    .from('article_content')
    .select('view_count, like_count');

  const { data: galleryViews } = await supabase
    .from('gallery_images')
    .select('view_count');

  const totalDownloads = contentDownloads?.reduce((sum: number, item: any) => sum + (item.download_count || 0), 0) || 0;
  const totalArticleViews = articleEngagement?.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0) || 0;
  const totalArticleLikes = articleEngagement?.reduce((sum: number, item: any) => sum + (item.like_count || 0), 0) || 0;
  const totalGalleryViews = galleryViews?.reduce((sum: number, item: any) => sum + (item.view_count || 0), 0) || 0;

  return {
    totalLibraryItems: contentCount || 0,
    totalArticles: articleCount || 0,
    totalGalleryImages: galleryCount || 0,
    totalSubscribers: subscriberCount || 0,
    mostDownloadedContent: topContent,
    mostViewedArticle: topArticle,
    mostViewedImage: topImage,
    totalDownloads,
    totalArticleViews,
    totalArticleLikes,
    totalGalleryViews,
    totalEngagement: totalDownloads + totalArticleViews + totalGalleryViews
  };
}
