import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import { 
  Mail, 
  Star,
  Calendar,
  Gift,
  Bell,
  Users,
  Sparkles,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import newsletterBackground from "@/assets/backgrounds/newsletter-bg.jpg";

const Newsletter = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('newsletter-subscribe', {
        body: { email: email.trim() },
      });

      if (error) throw error;

      setIsSuccess(true);
      setEmail("");
      
      toast({
        title: "Successfully Subscribed!",
        description: "Welcome to the Featherpass community.",
      });

      // Reset success message after 5 seconds
      setTimeout(() => {
        setIsSuccess(false);
      }, 5000);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast({
        title: "Subscription Failed",
        description: error.message || "Unable to subscribe. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const newsletterBenefits = [
    {
      icon: Bell,
      title: "Kickstarter Updates",
      description: "Be the first to know about our campaign milestones, stretch goals, and special backer rewards."
    },
    {
      icon: Gift,
      title: "Exclusive Content",
      description: "Get access to subscriber-only Monsters, Spells, and Lore Essays before anyone else."
    },
    {
      icon: Star,
      title: "Behind the Scenes",
      description: "Peek into our design process with exclusive dev diaries and design notes."
    },
    {
      icon: Users,
      title: "Community Access",
      description: "Join our subscriber-only Discord channels for direct feedback and early playtesting opportunities."
    }
  ];

  {/*const pastIssues = [
    {
      issue: "#24",
      title: "The Art of Monster Design",
      date: "January 2024",
      highlights: ["Shadow Drake spotlight", "Playtesting results", "Community art showcase"]
    },
    {
      issue: "#23",
      title: "Kickstarter Countdown Begins",
      date: "December 2023",
      highlights: ["Campaign preview", "Stretch goal reveals", "Backer reward tiers"]
    },
    {
      issue: "#22",
      title: "Worldbuilding Deep Dive",
      date: "November 2023",
      highlights: ["Erlin geography", "Cultural design notes", "Adventure hooks galore"]
    },
    {
      issue: "#21",
      title: "Horror at the Table",
      date: "October 2023",
      highlights: ["Halloween specials", "Fear mechanics", "Atmospheric techniques"]
    }
  ];*/}

  return (
    <Layout backgroundImage={newsletterBackground} enableParallax overlayOpacity={0.7}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <section className="text-center mb-16">
          <div className="inline-flex items-center justify-center p-2 mb-6">
            <Mail className="w-16 h-16 text-secondary" />
          </div>
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            The Featherpass Newsletter
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
            Join DMs and Players getting exclusive content, design insights, and Kickstarter updates 
            delivered straight to their inbox every month.
          </p>
        </section>

        {/* Subscription Form */}
        <section className="max-w-md mx-auto mb-16">
          <Card className="bg-gradient-card border-border shadow-fantasy">
            <CardHeader className="text-center">
              <CardTitle className="font-cinzel text-2xl text-foreground">
                Subscribe Today
              </CardTitle>
              <CardDescription className="font-crimson">
                Free forever. Unsubscribe anytime.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isSuccess ? (
                <div className="py-8 text-center space-y-4">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto" />
                  <div className="space-y-2">
                    <h3 className="text-xl font-cinzel font-semibold text-foreground">
                      Welcome Aboard!
                    </h3>
                    <p className="text-muted-foreground font-crimson">
                      You've successfully subscribed to our newsletter. Check your inbox for a welcome message!
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-4">
                  <div>
                    <Input 
                      type="email" 
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmitting}
                      className="w-full"
                      required
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg" 
                    variant="hero"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Subscribing...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-muted-foreground font-crimson text-center">
                    We respect your privacy. No spam, ever.
                  </p>
                  <p className="text-xs text-muted-foreground font-crimson text-center">
                    By subscribing, you agree to our{" "}
                    <Link to="/privacy" className="text-secondary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </p>
                </form>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Benefits */}
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            What You'll Get
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {newsletterBenefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <Card key={index} className="bg-gradient-card border-border shadow-fantasy">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8 text-secondary" />
                      <CardTitle className="font-cinzel text-xl text-foreground">
                        {benefit.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-crimson">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Stats 
        <section className="py-16 bg-gradient-hero rounded-lg mb-16">
          <div className="text-center">
            <h2 className="text-4xl font-cinzel font-bold text-foreground mb-12">
              Join the Community
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl font-cinzel font-bold text-secondary mb-2">15,000+</div>
                <div className="text-muted-foreground font-crimson">Active Subscribers</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-cinzel font-bold text-secondary mb-2">24</div>
                <div className="text-muted-foreground font-crimson">Issues Published</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-cinzel font-bold text-secondary mb-2">4.9★</div>
                <div className="text-muted-foreground font-crimson">Average Rating</div>
              </div>
            </div>
          </div>
        </section>*/}

        {/* Past Issues 
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            Recent Issues
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pastIssues.map((issue, index) => (
              <Card key={index} className="bg-gradient-card border-border shadow-fantasy">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-cinzel">
                      {issue.issue}
                    </Badge>
                    <span className="text-sm text-muted-foreground font-crimson">
                      {issue.date}
                    </span>
                  </div>
                  <CardTitle className="font-cinzel text-xl text-foreground">
                    {issue.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground font-crimson mb-3">
                      Featured in this issue:
                    </p>
                    {issue.highlights.map((highlight, highlightIndex) => (
                      <div key={highlightIndex} className="flex items-center text-sm text-muted-foreground font-crimson">
                        <Sparkles className="w-3 h-3 mr-2 text-secondary" />
                        {highlight}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>*/}
          
          {/*<div className="text-center mt-8">
            <Button variant="outline" size="lg">
              <Calendar className="w-4 h-4 mr-2" />
              View All Issues
            </Button>
          </div>
        </section>

         Final CTA 
        <section className="text-center">
          <Card className="bg-gradient-card border-border shadow-deep p-8">
            <CardContent className="space-y-6">
              <h2 className="text-3xl font-cinzel font-bold text-foreground">
                Ready to Join the Adventure?
              </h2>
              <p className="text-lg text-muted-foreground font-crimson max-w-2xl mx-auto">
                Don't miss out on exclusive content, Kickstarter updates, and the creative insights 
                that make Chronicles of Erlin special.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                <Input 
                  type="email" 
                  placeholder="Your email address"
                  className="flex-1"
                />
                <Button variant="hero" size="lg">
                  Subscribe
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground font-crimson">
                Join thousands of DMs already getting the best homebrew content.
              </p>
            </CardContent>
          </Card>
        </section>*/}
      </div>
    </Layout>
  );
};

export default Newsletter;
