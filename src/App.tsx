import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CookieConsentProvider } from "./contexts/CookieConsentContext";
import { CookieConsent } from "./components/CookieConsent";
import { usePageTracking } from "./hooks/usePageTracking";
import { ErrorBoundary } from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import Index from "./pages/Index";
import Products from "./pages/Products";
import Library from "./pages/Library";
import Articles from "./pages/Articles";
import ArticleView from "./components/article/ArticleView";
import Gallery from "./pages/Gallery";
import GalleryView from "./components/gallery/GalleryView";
import About from "./pages/About";
import Newsletter from "./pages/Newsletter";
import NewsletterUnsubscribe from "./pages/NewsletterUnsubscribe";
import Prelaunch from "./pages/Prelaunch";
import Privacy from "./pages/Privacy";
import Licensing from "./pages/Licensing";
import Terms from "./pages/Terms";
import Auth from "./pages/Auth";
import ResetPasswordRequest from "./pages/ResetPasswordRequest";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import CookieSettings from "./pages/CookieSettings";
import NotFound from "./pages/NotFound";

function AppRoutes() {
  usePageTracking();
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/products" element={<Products />} />
      <Route path="/library" element={<Library />} />
      <Route path="/articles" element={<Articles />} />
      <Route path="/articles/:id" element={<ArticleView />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/gallery/:id" element={<GalleryView />} />
      <Route path="/about" element={<About />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/newsletter/unsubscribe" element={<NewsletterUnsubscribe />} />
      <Route path="/prelaunch" element={<Prelaunch />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/licensing" element={<Licensing />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<CookieSettings />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password-request" element={<ResetPasswordRequest />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsentProvider>
            <ScrollToTop />
            <AppRoutes />
            <CookieConsent />
          </CookieConsentProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
