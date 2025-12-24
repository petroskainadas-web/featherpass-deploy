import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import TurnstileWidget, { TurnstileWidgetRef } from "@/components/TurnstileWidget";

interface ContactFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ContactFormDialog = ({ open, onOpenChange }: ContactFormDialogProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileWidgetRef>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    honeypot: "", // Hidden field for spam prevention
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Honeypot check - if filled, it's likely a bot
    if (formData.honeypot) {
      toast({
        title: "Error",
        description: "Invalid form submission",
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
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

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('contact-form', {
        body: {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: formData.message.trim(),
          turnstileToken,
        },
      });

      if (error) throw error;

      setIsSuccess(true);
      
      // Reset form after 3 seconds and close dialog
      setTimeout(() => {
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          honeypot: "",
        });
        setIsSuccess(false);
        setTurnstileToken(null);
        turnstileRef.current?.reset();
        onOpenChange(false);
      }, 3000);
    } catch (error: any) {
      console.error('Contact form error:', error);
      toast({
        title: "Submission Failed",
        description: error.message || "Unable to send your message. Please try again later.",
        variant: "destructive",
      });
      // Reset Turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-[550px] max-h-[90vh] overflow-y-auto bg-gradient-card border-border">
        <DialogHeader>
          <DialogTitle className="text-2xl font-cinzel text-foreground flex items-center gap-2">
            <Mail className="w-6 h-6 text-secondary" />
            Contact Us
          </DialogTitle>
          <DialogDescription className="font-crimson text-muted-foreground">
            Send us a message and we'll get back to you within 1-2 business days.
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4">
            <CheckCircle className="w-16 h-16 text-secondary mx-auto" />
            <div className="space-y-2">
              <h3 className="text-xl font-cinzel font-semibold text-foreground">
                Thank you for reaching out!
              </h3>
              <p className="text-muted-foreground font-crimson">
                Your message has been sent, and we appreciate you taking the time to contact us. 
                We aim to respond to all inquiries within 1-2 business days.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Hidden honeypot field */}
            <input
              type="text"
              name="website"
              value={formData.honeypot}
              onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
              style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="space-y-2">
              <Label htmlFor="name" className="font-crimson">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Your name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                maxLength={100}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-crimson">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                maxLength={255}
                required
                className="bg-background border-border"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject" className="font-crimson">
                Subject <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => setFormData({ ...formData, subject: value })}
                required
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Feedback">General Feedback</SelectItem>
                  <SelectItem value="Sales Inquiry">Sales Inquiry</SelectItem>
                  <SelectItem value="Collaboration">Collaboration</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message" className="font-crimson">
                Message <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="message"
                placeholder="Tell us what's on your mind..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                maxLength={2000}
                rows={6}
                required
                className="bg-background border-border resize-none"
              />
              <p className="text-xs text-muted-foreground font-crimson">
                {formData.message.length}/2000 characters
              </p>
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              onSuccess={(token) => setTurnstileToken(token)}
              onExpire={() => setTurnstileToken(null)}
              onError={() => setTurnstileToken(null)}
              className="flex justify-center"
            />

            <div className="pt-2">
              <p className="text-xs text-muted-foreground font-crimson mb-4">
                By sending, you agree to our{" "}
                <Link to="/privacy" className="text-secondary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={isSubmitting || !turnstileToken}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
