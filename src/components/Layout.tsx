import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookOpen, Home, Library, PenTool, User, Mail, Rocket, Anvil, Edit, LogOut, LayoutDashboard, Image } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { ParallaxBackdrop } from "@/components/ParallaxBackdrop";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import navLogo from "@/assets/logonav.png";
import footerLogo from "@/assets/logo3.jpg";

interface LayoutProps {
  children: React.ReactNode;
  backgroundImage?: string;
  enableParallax?: boolean;
  overlayOpacity?: number;
}
const Layout = ({
  children,
  backgroundImage,
  enableParallax = false,
  overlayOpacity = 0.7,
}: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isEditor, setIsEditor] = useState(false);
  const [contactFormOpen, setContactFormOpen] = useState(false);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkEditorRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        checkEditorRole(session.user.id);
      } else {
        setIsEditor(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkEditorRole = async (userId: string) => {
    const { data } = await supabase
      .rpc('has_role', { _user_id: userId, _role: 'editor' });
    setIsEditor(data || false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const navItems = [{
    path: "/",
    label: "Home",
    icon: Home
  }, {
    path: "/library",
    label: "Library",
    icon: Library
  }, {
    path: "/articles",
    label: "Journal",
    icon: PenTool
  }, {
    path: "/gallery",
    label: "Gallery",
    icon: Image
  }, {
    path: "/about",
    label: "About",
    icon: User
  }, {
    path: "/products",
    label: "Forge",
    icon: Anvil
  }, {
    path: "/prelaunch",
    label: "Kickstarter",
    icon: Rocket
  }];

  const editorNavItems = isEditor ? [{
    path: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard
  }] : [];

  const allNavItems = [...navItems, ...editorNavItems];
  return <div className="relative grid min-h-screen bg-background">
      {/* Parallax Background */}
      {enableParallax && backgroundImage && (
        <ParallaxBackdrop
          backgroundImage={backgroundImage}
          overlayOpacity={overlayOpacity}
          className="z-parallax col-start-1 row-start-1 pointer-events-none"
        />
      )}

      <div className="col-start-1 row-start-1 flex min-h-screen flex-col relative z-content">
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-header">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-20">
              <Link to="/" className="flex items-center">
                <img
                  src={navLogo}
                  alt="Featherpass logo"
                  className="h-12 w-auto"
                  loading="eager"
                  decoding="async"
                />
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                {allNavItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return <Link key={item.path} to={item.path} className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-colors ${isActive ? "text-secondary bg-accent/10" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}`}>
                      <Icon className="h-4 w-4" />
                      <span className="font-crimson">{item.label}</span>
                    </Link>;
              })}
              </nav>

              {user ? (
                <Button variant="hero" size="lg" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              ) : (
                <Button variant="hero" size="lg" asChild>
                  <Link to="/auth">
                    <Edit className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </header>

        <main className="relative z-content flex-1">{children}</main>

        <footer className="relative z-footer border-t border-border mt-20" style={{ backgroundColor: 'hsla(35, 20%, 2%, 1.00)' }}>
          <div className="container mx-auto px-4 py-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
              <div>
                <img
                  src={footerLogo}
                  alt="Featherpass Logo"
                  className="h-40 w-auto rounded opacity-95 mb-4 filter ring-1 ring-muted-foreground/40"
                />
                {/*<p className="text-muted-foreground font-crimson text-sm">
                  Discover epic homebrew content for your 5e+ campaigns.
                  From fearsome monsters to powerful subclasses,
                  dive into a world of limitless adventure.
                </p>*/}
              </div>

              <div>
                <h3 className="font-cinzel font-semibold text-foreground mb-4">Content</h3>
                <ul className="space-y-2">
                  <li><Link to="/library" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Library</Link></li>
                  <li><Link to="/articles" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Journal</Link></li>
                  <li><Link to="/gallery" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Gallery</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-cinzel font-semibold text-foreground mb-4">About</h3>
                <ul className="space-y-2">
                  <li><Link to="/about" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">About</Link></li>
                  <li><Link to="/products" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Forge</Link></li>
                  <li><Link to="/prelaunch" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Kickstarter</Link></li>
                  <li>
                    <button 
                      onClick={() => setContactFormOpen(true)}
                      className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm text-left"
                    >
                      Contact Us
                    </button>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-cinzel font-semibold text-foreground mb-4">Legal</h3>
                <ul className="space-y-2">
                  <li><Link to="/privacy" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Privacy Policy</Link></li>
                  <li><Link to="/licensing" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Licensing</Link></li>
                  <li><Link to="/terms" className="text-muted-foreground hover:text-secondary transition-colors font-crimson text-sm">Terms & Conditions</Link></li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-cinzel font-semibold text-foreground mb-4">Connect</h3>
                <p className="text-muted-foreground font-crimson text-sm mb-4">
                  Stay updated with our latest releases and Kickstarter news.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/newsletter">Subscribe to Newsletter</Link>
                </Button>
              </div>
            </div>

            <div className="border-t border-border mt-8 pt-8">
              <p className="text-center text-muted-foreground font-crimson text-sm">© 2025 Featherpass. All rights reserved.</p>
            </div>
          </div>
        </footer>
        
        <ContactFormDialog open={contactFormOpen} onOpenChange={setContactFormOpen} />
      </div>
    </div>;
};
export default Layout;
