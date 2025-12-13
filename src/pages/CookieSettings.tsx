/**
 * Cookie Settings Page
 * Dedicated page for managing cookie preferences
 */

import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { CookieCategory, CookieInfo } from "@/types/cookies";
import { Cookie, Shield, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const COOKIE_LIST: CookieInfo[] = [
  {
    name: "sidebar:state",
    category: "necessary",
    purpose: "Remembers sidebar open/closed state for better UX",
    duration: "7 days",
    required: true,
  },
  {
    name: "Supabase auth tokens",
    category: "necessary",
    purpose: "Manages user authentication and session",
    duration: "Session / Until logout",
    required: true,
  },
  {
    name: "article_likes",
    category: "necessary",
    purpose: "Stores which articles you've liked",
    duration: "Persistent",
    required: true,
  },
  {
    name: "last_like_time",
    category: "necessary",
    purpose: "Prevents spam/abuse of like feature",
    duration: "Persistent",
    required: true,
  },
  {
    name: "cookie_consent",
    category: "necessary",
    purpose: "Stores your cookie preferences",
    duration: "12 months",
    required: true,
  },
  {
    name: "_ga",
    category: "analytics",
    purpose: "Google Analytics: Distinguishes unique users",
    duration: "2 years",
    required: false,
  },
  {
    name: "_gid",
    category: "analytics",
    purpose: "Google Analytics: Distinguishes users",
    duration: "24 hours",
    required: false,
  },
  {
    name: "_gat",
    category: "analytics",
    purpose: "Google Analytics: Throttle request rate",
    duration: "1 minute",
    required: false,
  },
];

export default function CookieSettings() {
  const { consent, updateCategories, acceptAll, rejectAll } = useCookieConsent();
  const [categories, setCategories] = useState<CookieCategory>({
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  });

  useEffect(() => {
    if (consent) {
      setCategories(consent.categories);
    }
  }, [consent]);

  const handleSave = () => {
    updateCategories(categories);
    toast({
      title: "Preferences Saved",
      description: "Your cookie preferences have been updated.",
    });
  };

  const handleAcceptAll = () => {
    acceptAll();
    toast({
      title: "All Cookies Accepted",
      description: "You've accepted all cookie categories.",
    });
  };

  const handleRejectAll = () => {
    rejectAll();
    toast({
      title: "Optional Cookies Rejected",
      description: "Only necessary cookies will be used.",
    });
  };

  const categoryInfo = [
    {
      key: "necessary" as const,
      title: "Strictly Necessary",
      description: "Essential for the website to function properly. These cannot be disabled.",
      disabled: true,
    },
    {
      key: "analytics" as const,
      title: "Analytics",
      description: "Help us understand how visitors interact with our website through Google Analytics.",
      disabled: false,
    },
    {
      key: "marketing" as const,
      title: "Marketing",
      description: "Used to track visitors across websites for advertising purposes.",
      disabled: false,
    },
    {
      key: "preferences" as const,
      title: "Preferences",
      description: "Remember your settings for future visits.",
      disabled: false,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-background py-12">
        <div className="container max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-4">
              <div className="p-4 rounded-full bg-gradient-card">
                <Cookie className="h-12 w-12 text-secondary" />
              </div>
            </div>
            <h1 className="font-cinzel text-4xl font-bold text-foreground mb-4">
              Cookie Settings
            </h1>
            <p className="font-crimson text-lg text-muted-foreground max-w-2xl mx-auto">
              Manage your cookie preferences. You can change these settings at any time.
            </p>
          </div>

          {/* Current Status */}
          {consent && (
            <Card className="mb-8 p-6 bg-gradient-card border-border">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-secondary shrink-0 mt-1" />
                <div>
                  <h3 className="font-cinzel text-lg font-semibold text-foreground mb-2">
                    Current Settings
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={consent.categories.necessary ? "default" : "outline"}>
                      Necessary
                    </Badge>
                    <Badge variant={consent.categories.analytics ? "default" : "outline"}>
                      Analytics {consent.categories.analytics && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                    <Badge variant={consent.categories.marketing ? "default" : "outline"}>
                      Marketing {consent.categories.marketing && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                    <Badge variant={consent.categories.preferences ? "default" : "outline"}>
                      Preferences {consent.categories.preferences && <Check className="ml-1 h-3 w-3" />}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground font-crimson mt-3">
                    Last updated: {new Date(consent.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Cookie Categories */}
          <div className="space-y-6 mb-8">
            {categoryInfo.map((cat) => (
              <Card key={cat.key} className="p-6 bg-gradient-card border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-cinzel text-xl font-semibold text-foreground">
                        {cat.title}
                      </h3>
                      {cat.disabled && (
                        <Badge variant="secondary" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <p className="font-crimson text-muted-foreground mb-4">
                      {cat.description}
                    </p>
                    
                    {/* Cookies in this category */}
                    <div className="space-y-2">
                      {COOKIE_LIST.filter(c => c.category === cat.key).map((cookie) => (
                        <div key={cookie.name} className="text-sm pl-4 border-l-2 border-border">
                          <p className="font-crimson text-foreground font-medium">
                            {cookie.name}
                          </p>
                          <p className="font-crimson text-muted-foreground text-xs">
                            {cookie.purpose}
                          </p>
                          <p className="font-crimson text-muted-foreground text-xs">
                            Duration: {cookie.duration}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="shrink-0">
                    <Label htmlFor={`cookie-${cat.key}`} className="sr-only">
                      {cat.title}
                    </Label>
                    <Switch
                      id={`cookie-${cat.key}`}
                      checked={categories[cat.key]}
                      disabled={cat.disabled}
                      onCheckedChange={(checked) =>
                        setCategories({ ...categories, [cat.key]: checked })
                      }
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              onClick={handleRejectAll}
              className="flex-1 font-crimson"
            >
              Reject Optional
            </Button>
            <Button
              variant="outline"
              onClick={handleSave}
              className="flex-1 font-crimson"
            >
              Save Custom Settings
            </Button>
            <Button
              onClick={handleAcceptAll}
              className="flex-1 font-crimson bg-gradient-gold"
            >
              Accept All
            </Button>
          </div>

          {/* Additional Info */}
          <Card className="mt-8 p-6 bg-gradient-card border-border">
            <h3 className="font-cinzel text-lg font-semibold text-foreground mb-3">
              About Our Cookies
            </h3>
            <div className="space-y-3 font-crimson text-muted-foreground text-sm">
              <p>
                We use cookies to enhance your experience on our website. Cookies are small text files 
                stored on your device that help us understand how you use our site.
              </p>
              <p>
                <strong className="text-foreground">Strictly Necessary cookies</strong> are essential 
                for the website to work properly. They enable core functionality like authentication 
                and cannot be disabled.
              </p>
              <p>
                <strong className="text-foreground">Analytics cookies</strong> help us understand how 
                visitors interact with our website by collecting and reporting information anonymously. 
                We use Google Analytics with IP anonymization enabled.
              </p>
              <p>
                For more information about how we handle your data, please read our{" "}
                <a href="/privacy" className="text-secondary hover:underline">
                  Privacy Policy
                </a>.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
