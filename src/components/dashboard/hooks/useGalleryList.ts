import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DASHBOARD_ITEMS_PER_PAGE, usePagedSupabaseQuery } from "./usePagedSupabaseQuery";

export const useGalleryList = (page: number) => {
  return usePagedSupabaseQuery<any, Record<string, never>>({
    keyPrefix: "gallery-list",
    page,
    filters: {},
    queryFn: async (currentPage) => {
      const offset = currentPage * DASHBOARD_ITEMS_PER_PAGE;
      const { data, error } = await supabase
        .from("gallery_images")
        .select("id, title, image_type, orientation, published_date, view_count, created_at")
        .order("created_at", { ascending: false })
        .range(offset, offset + DASHBOARD_ITEMS_PER_PAGE - 1);

      if (error) throw error;
      return data || [];
    },
    countFn: async () => {
      const { count, error } = await supabase
        .from("gallery_images")
        .select("*", { count: "exact", head: true });

      if (error) throw error;
      return count || 0;
    },
  });
};

export const useGalleryItem = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const fetchFullGalleryImage = async (id: string) => {
    const { data, error } = await supabase
      .from("gallery_images")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    return data;
  };

  const deleteGalleryImage = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("gallery_images").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success!", description: "Gallery image deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["gallery-list"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return {
    fetchFullGalleryImage,
    deleteGalleryImage,
  };
};
