import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const analyticsQuery = (type: string) =>
  useQuery({
    queryKey: ["analytics", type],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("dashboard-analytics", {
        body: { type },
      });

      if (error) throw error;
      return data;
    },
  });

export const useAnalyticsStats = () => {
  const contentStatsQuery = analyticsQuery("content");
  const articleStatsQuery = analyticsQuery("articles");
  const galleryStatsQuery = analyticsQuery("gallery");
  const newsletterStatsQuery = analyticsQuery("newsletter");
  const overviewStatsQuery = analyticsQuery("overview");

  return {
    contentStatsQuery,
    articleStatsQuery,
    galleryStatsQuery,
    newsletterStatsQuery,
    overviewStatsQuery,
  };
};
