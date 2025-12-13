import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AuthDebug = () => {
  const [authState, setAuthState] = useState<any>(null);
  
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        hasSession: !!session,
        userId: session?.user?.id,
        tokenPreview: session?.access_token?.substring(0, 20),
        expiresAt: session?.expires_at,
      });
    });
  }, []);
  
  if (import.meta.env.MODE !== 'development') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded text-xs max-w-xs z-50">
      <div><strong>Auth Debug:</strong></div>
      <pre className="mt-2 overflow-auto">{JSON.stringify(authState, null, 2)}</pre>
    </div>
  );
};
