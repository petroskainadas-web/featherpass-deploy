import { Suspense, lazy, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, Edit, FileText, Image, Shield, Activity, Database, BarChart3 } from "lucide-react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { DashboardMode, DashboardProvider } from "@/components/dashboard/context/DashboardContext";
import { useDashboardAccess } from "@/components/dashboard/hooks/useDashboardAccess";
import { Tables } from "@/integrations/supabase/types";

type LibraryContent = Tables<"library_content">;
type ArticleContent = Tables<"article_content">;
type GalleryImage = Tables<"gallery_images">;

const PublishContentPanel = lazy(() => import("@/components/dashboard/editor/PublishContentPanel"));
const ModifyContentPanel = lazy(() => import("@/components/dashboard/editor/ModifyContentPanel"));
const PublishArticlePanel = lazy(() => import("@/components/dashboard/editor/PublishArticlePanel"));
const ModifyArticlePanel = lazy(() => import("@/components/dashboard/editor/ModifyArticlePanel"));
const PublishImagePanel = lazy(() => import("@/components/dashboard/editor/PublishImagePanel"));
const ModifyImagePanel = lazy(() => import("@/components/dashboard/editor/ModifyImagePanel"));
const SystemManagementPanel = lazy(() => import("@/components/dashboard/admin/SystemManagementPanel"));
const SystemHealthPanel = lazy(() => import("@/components/dashboard/admin/SystemHealthPanel"));
const DataManagementPanel = lazy(() => import("@/components/dashboard/admin/DataManagementPanel"));
const AnalyticsPanel = lazy(() => import("@/components/dashboard/admin/AnalyticsPanel"));

const Dashboard = () => {
  const navigate = useNavigate();
  const { loading, hasAccess, isEditor, isAdmin, ensureValidSession, initialModeSet } = useDashboardAccess();
  const [mode, setMode] = useState<DashboardMode>("publish-content");
  const [editingContent, setEditingContent] = useState<LibraryContent | null>(null);
  const [editingArticle, setEditingArticle] = useState<ArticleContent | null>(null);
  const [editingGalleryImage, setEditingGalleryImage] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (!loading && hasAccess && !initialModeSet.current) {
      setMode(isAdmin ? "system-management" : "publish-content");
      initialModeSet.current = true;
    }
  }, [hasAccess, initialModeSet, isAdmin, loading]);

  const startContentEdit = (content: LibraryContent) => {
    setEditingContent(content);
    setMode("publish-content");
  };

  const finishContentEdit = () => {
    setEditingContent(null);
    setMode("modify-content");
  };

  const startArticleEdit = (article: ArticleContent) => {
    setEditingArticle(article);
    setMode("publish-article");
  };

  const finishArticleEdit = () => {
    setEditingArticle(null);
    setMode("modify-article");
  };

  const startGalleryImageEdit = (image: GalleryImage) => {
    setEditingGalleryImage(image);
    setMode("publish-image");
  };

  const finishGalleryImageEdit = () => {
    setEditingGalleryImage(null);
    setMode("modify-image");
  };

  const dashboardContextValue = {
    mode,
    setMode,
    isEditor,
    isAdmin,
    ensureValidSession,
    editingContent,
    startContentEdit,
    finishContentEdit,
    editingArticle,
    startArticleEdit,
    finishArticleEdit,
    editingGalleryImage,
    startGalleryImageEdit,
    finishGalleryImageEdit,
  };

  const editorTabs = [
    { key: "publish-content" as DashboardMode, label: "Publish Content", icon: Edit },
    { key: "modify-content" as DashboardMode, label: "Modify Content", icon: Edit },
    { key: "publish-article" as DashboardMode, label: "Publish Article", icon: FileText },
    { key: "modify-article" as DashboardMode, label: "Modify Article", icon: FileText },
    { key: "publish-image" as DashboardMode, label: "Publish Image", icon: Image },
    { key: "modify-image" as DashboardMode, label: "Modify Image", icon: Image },
  ];

  const adminTabs = [
    { key: "analytics" as DashboardMode, label: "Analytics", icon: BarChart3 },
    { key: "system-health" as DashboardMode, label: "System Health", icon: Activity },
    { key: "system-management" as DashboardMode, label: "System Management", icon: Shield },
    { key: "data-management" as DashboardMode, label: "Data Management", icon: Database },
    { key: "settings" as DashboardMode, label: "Account Settings", icon: Settings },
  ];

  const renderActivePanel = () => {
    switch (mode) {
      case "publish-content":
        return <PublishContentPanel />;
      case "modify-content":
        return <ModifyContentPanel />;
      case "publish-article":
        return <PublishArticlePanel />;
      case "modify-article":
        return <ModifyArticlePanel />;
      case "publish-image":
        return <PublishImagePanel />;
      case "modify-image":
        return <ModifyImagePanel />;
      case "system-management":
        return <SystemManagementPanel />;
      case "system-health":
        return <SystemHealthPanel />;
      case "data-management":
        return <DataManagementPanel />;
      case "analytics":
        return <AnalyticsPanel />;
      case "settings":
        const DashboardSettings = lazy(() => import("@/components/dashboard/admin/DashboardSettings"));
        return <DashboardSettings />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (!hasAccess) {
    return null;
  }

  return (
    <Layout>
      <DashboardProvider value={dashboardContextValue}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-4xl text-center font-cinzel text-logo-gold font-bold mb-8">Dashboard</h1>

          <div className="mb-6 space-y-4">
            {isAdmin && (
              <div className="flex flex-wrap gap-4 justify-center">
                {adminTabs.map(({ key, label, icon: Icon }) => (
                  <Button key={key} variant={mode === key ? "default" : "outline"} onClick={() => setMode(key)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            )}

            {isAdmin && isEditor && (
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
              </div>
            )}

            {isEditor && (
              <div className="flex flex-wrap gap-4 justify-center">
                {editorTabs.map(({ key, label, icon: Icon }) => (
                  <Button key={key} variant={mode === key ? "default" : "outline"} onClick={() => setMode(key)}>
                    <Icon className="mr-2 h-4 w-4" />
                    {label}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <Suspense fallback={<p>Loading panel...</p>}>{renderActivePanel()}</Suspense>
        </div>
      </DashboardProvider>
    </Layout>
  );
};

export default Dashboard;
