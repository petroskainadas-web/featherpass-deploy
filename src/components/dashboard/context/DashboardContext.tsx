import React, { createContext, useContext } from "react";
import { Tables } from "@/integrations/supabase/types";

export type DashboardMode =
  | "publish-content"
  | "modify-content"
  | "publish-article"
  | "modify-article"
  | "publish-image"
  | "modify-image"
  | "system-management"
  | "system-health"
  | "data-management"
  | "analytics"
  | "settings";

type LibraryContent = Tables<"library_content">;
type ArticleContent = Tables<"article_content">;
type GalleryImage = Tables<"gallery_images">;

export interface DashboardContextValue {
  mode: DashboardMode;
  setMode: (mode: DashboardMode) => void;
  isEditor: boolean;
  isAdmin: boolean;
  ensureValidSession: () => Promise<boolean>;
  editingContent: LibraryContent | null;
  startContentEdit: (content: LibraryContent) => void;
  finishContentEdit: () => void;
  editingArticle: ArticleContent | null;
  startArticleEdit: (article: ArticleContent) => void;
  finishArticleEdit: () => void;
  editingGalleryImage: GalleryImage | null;
  startGalleryImageEdit: (image: GalleryImage) => void;
  finishGalleryImageEdit: () => void;
}

const DashboardContext = createContext<DashboardContextValue | undefined>(
  undefined
);

export const useDashboardContext = () => {
  const ctx = useContext(DashboardContext);
  if (!ctx) {
    throw new Error("useDashboardContext must be used within DashboardProvider");
  }
  return ctx;
};

interface DashboardProviderProps {
  value: DashboardContextValue;
  children: React.ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({
  value,
  children,
}) => {
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export default DashboardContext;
