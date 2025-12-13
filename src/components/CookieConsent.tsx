/**
 * Cookie Consent Banner & Modal
 * Fantasy-themed, accessible, GDPR-compliant
 */

import { useState } from "react";
import { useCookieConsent } from "@/contexts/CookieConsentContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Cookie, Shield, Settings } from "lucide-react";
import { CookieCategory } from "@/types/cookies";

export function CookieConsent() {
  const { showBanner, acceptAll, rejectAll, updateCategories } = useCookieConsent();
  const [showSettings, setShowSettings] = useState(false);
  const [customCategories, setCustomCategories] = useState<CookieCategory>({
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: false,
  });

  if (!showBanner) return null;

  const handleAcceptAll = () => {
    acceptAll();
    setShowSettings(false);
  };

  const handleRejectAll = () => {
    rejectAll();
    setShowSettings(false);
  };

  const handleSaveCustom = () => {
    updateCategories(customCategories);
    setShowSettings(false);
  };

  return (
    <>
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm shadow-fantasy">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-start gap-3 flex-1">
              <Cookie className="h-6 w-6 text-secondary shrink-0 mt-1" />
              <div className="space-y-1">
                <h3 className="font-cinzel text-lg font-semibold text-foreground">We Value Your Privacy</h3>
                <p className="text-sm text-muted-foreground font-crimson">
                  We use cookies to enhance your browsing experience and analyze site traffic. You can choose which
                  cookies to accept.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button variant="outline" size="sm" onClick={() => setShowSettings(true)} className="font-crimson">
                <Settings className="h-4 w-4 mr-2" />
                Customize
              </Button>
              <Button variant="outline" size="sm" onClick={handleRejectAll} className="font-crimson">
                Reject All
              </Button>
              <Button size="sm" onClick={handleAcceptAll} className="font-crimson bg-gradient-gold">
                Accept All
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Modal */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-cinzel text-2xl flex items-center gap-2">
              <Shield className="h-6 w-6 text-secondary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription className="font-crimson text-base">
              Manage your cookie preferences. Strictly necessary cookies cannot be disabled as they are essential for
              the site to function.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Strictly Necessary */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="font-cinzel text-base text-foreground">Strictly Necessary Cookies</Label>
                  <p className="text-sm text-muted-foreground font-crimson">
                    Essential for the website to function. These cannot be disabled.
                  </p>
                </div>
                <Switch checked={true} disabled className="ml-4" />
              </div>
              <div className="text-xs text-muted-foreground font-crimson space-y-1 pl-4">
                <p>• Authentication & session management</p>
                <p>• UI preferences (sidebar state)</p>
                <p>• Rate limiting (article likes)</p>
              </div>
            </div>

            {/* Analytics */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="font-cinzel text-base text-foreground">Analytics Cookies</Label>
                  <p className="text-sm text-muted-foreground font-crimson">
                    Help us understand how visitors interact with our website.
                  </p>
                </div>
                <Switch
                  checked={customCategories.analytics}
                  onCheckedChange={(checked) => setCustomCategories({ ...customCategories, analytics: checked })}
                  className="ml-4"
                />
              </div>
              <div className="text-xs text-muted-foreground font-crimson space-y-1 pl-4">
                <p>• Google Analytics (_ga, _gid, _gat)</p>
                <p>• Page views & navigation tracking</p>
                <p>• Anonymous usage statistics</p>
              </div>
            </div>

            {/* Marketing */}
            <div className="space-y-2 pb-4 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="font-cinzel text-base text-foreground">Marketing Cookies</Label>
                  <p className="text-sm text-muted-foreground font-crimson">
                    Used to track visitors across websites for advertising purposes.
                  </p>
                </div>
                <Switch
                  checked={customCategories.marketing}
                  onCheckedChange={(checked) => setCustomCategories({ ...customCategories, marketing: checked })}
                  className="ml-4"
                />
              </div>
              <div className="text-xs text-muted-foreground font-crimson pl-4">
                <p>Currently not in use.</p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="space-y-1 flex-1">
                  <Label className="font-cinzel text-base text-foreground">Preference Cookies</Label>
                  <p className="text-sm text-muted-foreground font-crimson">
                    Remember your settings and preferences for future visits.
                  </p>
                </div>
                <Switch
                  checked={customCategories.preferences}
                  onCheckedChange={(checked) => setCustomCategories({ ...customCategories, preferences: checked })}
                  className="ml-4"
                />
              </div>
              <div className="text-xs text-muted-foreground font-crimson pl-4">
                <p>Currently not in use.</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-border">
            <Button variant="outline" onClick={handleRejectAll} className="flex-1 font-crimson">
              Reject All
            </Button>
            <Button onClick={handleSaveCustom} className="flex-1 font-crimson bg-gradient-gold">
              Save Preferences
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
