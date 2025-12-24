import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import TurnstileWidget, { TurnstileWidgetRef } from "@/components/TurnstileWidget";

const emailSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const ResetPasswordRequest = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = emailSchema.safeParse({ email });
      if (!validation.success) {
        toast({
          title: "Validation Error",
          description: validation.error.errors[0].message,
          variant: "destructive",
        });
        return;
      }

      // Require Turnstile token
      if (!turnstileToken) {
        toast({
          title: "Verification Required",
          description: "Please complete the security check",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.functions.invoke("send-password-reset", {
        body: { email, turnstileToken },
      });

      if (error) throw error;

      setSubmitted(true);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      // Reset Turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            {submitted 
              ? "Check your email for the reset link" 
              : "Enter your email to receive a password reset link"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {submitted ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If an account associated with this email address exists, a password reset link has been sent. 
                Please check your inbox and follow the instructions.
              </p>
              <Button 
                onClick={() => navigate("/auth")} 
                className="w-full"
                variant="secondary"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="editor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <TurnstileWidget
                  ref={turnstileRef}
                  onSuccess={(token) => setTurnstileToken(token)}
                  onExpire={() => setTurnstileToken(null)}
                  onError={() => setTurnstileToken(null)}
                  className="flex justify-center"
                />
                <Button type="submit" className="w-full" disabled={loading || !turnstileToken}>
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <div className="mt-4 text-center">
                <button
                  onClick={() => navigate("/auth")}
                  className="text-sm text-primary hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="w-3 h-3 mr-1" />
                  Back to Login
                </button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordRequest;
