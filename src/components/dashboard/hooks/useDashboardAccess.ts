import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface DashboardAccessState {
  loading: boolean;
  hasAccess: boolean;
  isEditor: boolean;
  isAdmin: boolean;
}

export const useDashboardAccess = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [state, setState] = useState<DashboardAccessState>({
    loading: true,
    hasAccess: false,
    isEditor: false,
    isAdmin: false,
  });
  const initialModeSet = useRef(false);

  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      toast({
        title: "Session Expired",
        description: "Please log in again",
        variant: "destructive",
      });
      navigate("/auth");
      return false;
    }

    if (!session.access_token) {
      console.error("No access token in session");
      navigate("/auth");
      return false;
    }

    return true;
  }, [navigate, toast]);

  const checkAccess = useCallback(async () => {
    const isValid = await ensureValidSession();
    if (!isValid) {
      setState((prev) => ({ ...prev, loading: false, hasAccess: false }));
      return;
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      setState((prev) => ({ ...prev, loading: false, hasAccess: false }));
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 100));

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id);

    const hasEditor = roles?.some((r) => r.role === "editor") || false;
    const hasAdmin = roles?.some((r) => r.role === "admin") || false;

    if (!hasEditor && !hasAdmin) {
      toast({
        title: "Access Denied",
        description: "You need editor permissions to access this page",
        variant: "destructive",
      });
      navigate("/");
      setState({ loading: false, hasAccess: false, isEditor: false, isAdmin: false });
      return;
    }

    setState({
      loading: false,
      hasAccess: true,
      isEditor: hasEditor,
      isAdmin: hasAdmin,
    });
  }, [ensureValidSession, navigate, toast]);

  useEffect(() => {
    checkAccess();
  }, [checkAccess]);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        checkAccess();
      }
      if (event === "SIGNED_OUT") {
        setState({ loading: false, hasAccess: false, isEditor: false, isAdmin: false });
        navigate("/auth");
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [checkAccess, navigate]);

  return {
    ...state,
    ensureValidSession,
    initialModeSet,
  };
};
