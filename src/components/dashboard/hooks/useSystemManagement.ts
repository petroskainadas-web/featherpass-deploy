import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useDashboardContext } from "../context/DashboardContext";

export const useSystemManagement = () => {
  const { ensureValidSession } = useDashboardContext();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const systemQuery = useQuery({
    queryKey: ["system-management"],
    queryFn: async () => {
      const isValid = await ensureValidSession();
      if (!isValid) throw new Error("Session invalid");

      const { data: usersData, error: usersError } = await supabase.functions.invoke(
        "list-all-users"
      );

      if (usersError) {
        if (usersError.message?.includes("401") || usersError.message?.includes("Unauthorized")) {
          throw new Error("Authentication Error");
        }
        throw usersError;
      }

      const { data: subscribers, error: subscribersError } = await supabase
        .from("newsletter_subscribers")
        .select("*")
        .order("subscribed_at", { ascending: false });

      if (subscribersError) throw subscribersError;

      return {
        users: usersData?.users || [],
        subscribers: subscribers || [],
      };
    },
  });

  const manageRole = useMutation({
    mutationFn: async ({
      userId,
      role,
      action,
    }: {
      userId: string;
      role: "editor" | "admin";
      action: "add" | "remove";
    }) => {
      const { error, data } = await supabase.functions.invoke("manage-user-roles", {
        body: { userId, role, action },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data?.message || "Role updated",
      });
      queryClient.invalidateQueries({ queryKey: ["system-management"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to manage role",
        variant: "destructive",
      });
    },
  });

  const confirmSubscriber = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase.functions.invoke("confirm-newsletter-subscriber", {
        body: { subscriberId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscriber confirmed successfully" });
      queryClient.invalidateQueries({ queryKey: ["system-management"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const syncConvertKit = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("newsletter-sync-convertkit");
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: data?.message || "ConvertKit sync completed successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["system-management"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sync with ConvertKit",
        variant: "destructive",
      });
    },
  });

  const unsubscribeSubscriber = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase
        .from("newsletter_subscribers")
        .update({ unsubscribed: true, unsubscribed_at: new Date().toISOString() })
        .eq("id", subscriberId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscriber unsubscribed successfully" });
      queryClient.invalidateQueries({ queryKey: ["system-management"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteSubscriber = useMutation({
    mutationFn: async (subscriberId: string) => {
      const { error } = await supabase.functions.invoke("delete-newsletter-subscriber", {
        body: { subscriberId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Subscriber deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["system-management"] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportSubscribers = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) throw new Error("Not authenticated");

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-newsletter-subscribers`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    toast({ title: "Success", description: "Subscribers exported successfully" });
  };

  const filteredUsers = useMemo(() => {
    const users = systemQuery.data?.users || [];
    return users;
  }, [systemQuery.data]);

  const filteredSubscribers = useMemo(() => {
    const subscribers = systemQuery.data?.subscribers || [];
    return subscribers;
  }, [systemQuery.data]);

  return {
    systemQuery,
    filteredUsers,
    filteredSubscribers,
    manageRole,
    confirmSubscriber,
    unsubscribeSubscriber,
    deleteSubscriber,
    exportSubscribers,
    syncConvertKit,
  };
};
