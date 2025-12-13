import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_ITEMS_PER_PAGE, usePagedSupabaseQuery } from "./usePagedSupabaseQuery";

export const useContentList = (page: number) => {
  return usePagedSupabaseQuery<any, Record<string, never>>({
    keyPrefix: "content-list",
    page,
    filters: {},
    queryFn: async (currentPage) => {
      const offset = currentPage * DASHBOARD_ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from("library_content")
        .select("id, title, content_type, created_at, updated_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + DASHBOARD_ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return data || [];
    },
    countFn: async () => {
      const { count, error } = await supabase
        .from("library_content")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });
};

export const useContentItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchFullLibraryItem = async (id: string) => {
    const { data, error } = await supabase
      .from("library_content")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const deleteContent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("library_content").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Content deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["content-list"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    fetchFullLibraryItem,
    deleteContent,
  };
};
