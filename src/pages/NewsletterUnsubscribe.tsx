import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, Mail, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import newsletterBg from "@/assets/backgrounds/newsletter-bg.jpg";

export default function NewsletterUnsubscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const token = searchParams.get("token");

  const [step, setStep] = useState<"confirm" | "reason" | "processing" | "success" | "error">("confirm");
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [customReason, setCustomReason] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStep("error");
      setErrorMessage("Invalid unsubscribe link. The link may be expired or incomplete.");
    }
  }, [token]);

  const handleUnsubscribe = async () => {
    if (!token) return;

    setStep("processing");

    try {
      const reason = selectedReason === "other" ? customReason : selectedReason;

      const { data, error } = await supabase.functions.invoke("newsletter-unsubscribe", {
        body: { token, reason: reason || undefined }
      });

      if (error) throw error;

      if (data.success) {
        setEmail(data.email);
        setStep("success");
        toast({
          title: "Unsubscribed successfully",
          description: "You've been removed from our newsletter.",
        });
      } else {
        throw new Error(data.error || "Failed to unsubscribe");
      }
    } catch (error: any) {
      console.error("Unsubscribe error:", error);
      setErrorMessage(error.message || "An unexpected error occurred. Please try again.");
      setStep("error");
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResubscribe = async () => {
    if (!token) return;

    try {
      const { data, error } = await supabase.functions.invoke("newsletter-resubscribe", {
        body: { token }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "Resubscribed!",
          description: "Welcome back to our newsletter.",
        });
        navigate("/newsletter");
      }
    } catch (error: any) {
      console.error("Resubscribe error:", error);
      toast({
        title: "Error",
        description: "Failed to resubscribe. Please use the newsletter form.",
        variant: "destructive",
      });
    }
  };

  const reasons = [
    { value: "too-frequent", label: "Emails are too frequent" },
    { value: "not-relevant", label: "Content is not relevant to me" },
    { value: "never-subscribed", label: "I never signed up for this" },
    { value: "spam", label: "Emails look like spam" },
    { value: "other", label: "Other reason" },
  ];

  return (
    <Layout backgroundImage={newsletterBg}>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-2xl bg-background/95 backdrop-blur border-2 border-border/50">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <Mail className="w-16 h-16 text-primary" />
            </div>
            <CardTitle className="text-3xl font-cinzel text-foreground">
              Newsletter Unsubscribe
            </CardTitle>
            <CardDescription className="text-base text-muted-foreground">
              {step === "confirm" && "We're sorry to see you go"}
              {step === "reason" && "Help us improve (optional)"}
              {step === "processing" && "Processing your request..."}
              {step === "success" && "You've been unsubscribed"}
              {step === "error" && "Something went wrong"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === "confirm" && (
              <div className="space-y-6">
                <div className="text-center space-y-3 py-4">
                  <p className="text-foreground/90">
                    You're about to unsubscribe from the Featherpass Newsletter.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    You'll no longer receive updates about new content, exclusive homebrew releases, 
                    and special announcements.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={() => setStep("reason")}
                    className="w-full sm:w-auto"
                  >
                    Yes, unsubscribe me
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/newsletter")}
                    className="w-full sm:w-auto"
                  >
                    No, keep me subscribed
                  </Button>
                </div>
              </div>
            )}

            {step === "reason" && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <Label className="text-base font-medium text-foreground">
                    Why are you unsubscribing? (Optional)
                  </Label>
                  <RadioGroup value={selectedReason} onValueChange={setSelectedReason}>
                    {reasons.map((reason) => (
                      <div key={reason.value} className="flex items-center space-x-3 py-2">
                        <RadioGroupItem value={reason.value} id={reason.value} />
                        <Label
                          htmlFor={reason.value}
                          className="cursor-pointer text-foreground/90 font-normal"
                        >
                          {reason.label}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>

                  {selectedReason === "other" && (
                    <Textarea
                      placeholder="Please tell us more..."
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      className="mt-3"
                      maxLength={500}
                    />
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button
                    size="lg"
                    variant="destructive"
                    onClick={handleUnsubscribe}
                    className="w-full sm:w-auto"
                  >
                    Complete Unsubscribe
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => setStep("confirm")}
                    className="w-full sm:w-auto"
                  >
                    Go Back
                  </Button>
                </div>
              </div>
            )}

            {step === "processing" && (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                <p className="text-muted-foreground">Processing your request...</p>
              </div>
            )}

            {step === "success" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <CheckCircle2 className="w-16 h-16 text-green-500" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      You've been successfully unsubscribed
                    </p>
                    {email && (
                      <p className="text-sm text-muted-foreground">
                        {email} has been removed from our mailing list
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground max-w-md">
                    We're sorry to see you go. If you change your mind, you can always resubscribe 
                    using our newsletter form.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={handleResubscribe}
                    className="w-full sm:w-auto"
                  >
                    Actually, resubscribe me
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/")}
                    className="w-full sm:w-auto"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}

            {step === "error" && (
              <div className="space-y-6">
                <div className="flex flex-col items-center text-center space-y-4 py-6">
                  <AlertCircle className="w-16 h-16 text-destructive" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium text-foreground">
                      Oops! Something went wrong
                    </p>
                    <p className="text-sm text-muted-foreground max-w-md">
                      {errorMessage}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    size="lg"
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto"
                  >
                    Try Again
                  </Button>
                  <Button
                    size="lg"
                    variant="secondary"
                    onClick={() => navigate("/")}
                    className="w-full sm:w-auto"
                  >
                    Back to Home
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
