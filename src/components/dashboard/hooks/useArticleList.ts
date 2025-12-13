import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_ITEMS_PER_PAGE, usePagedSupabaseQuery } from "./usePagedSupabaseQuery";

export const useArticleList = (page: number) => {
  return usePagedSupabaseQuery<any, Record<string, never>>({
    keyPrefix: "article-list",
    page,
    filters: {},
    queryFn: async (currentPage) => {
      const offset = currentPage * DASHBOARD_ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from("article_content")
        .select("id, title, article_type, created_at, updated_at, published_date, view_count, like_count")
        .order("created_at", { ascending: false })
        .range(offset, offset + DASHBOARD_ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return data || [];
    },
    countFn: async () => {
      const { count, error } = await supabase
        .from("article_content")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });
};

export const useArticleItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchFullArticle = async (id: number) => {
    const { data, error } = await supabase
      .from("article_content")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const deleteArticle = useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase.from("article_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Article deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["article-list"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    fetchFullArticle,
    deleteArticle,
  };
};
