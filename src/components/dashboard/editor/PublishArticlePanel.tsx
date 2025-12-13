import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ArticleForm from "@/components/editor/ArticleForm";
import { useDashboardContext } from "../context/DashboardContext";

const PublishArticlePanel = () => {
  const { editingArticle, finishArticleEdit } = useDashboardContext();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{editingArticle ? "Edit Article" : "Publish New Article"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {editingArticle
                ? "Update the selected article."
                : "Create a new article for your audience."}
            </p>
          </div>
          {editingArticle && (
            <Button variant="outline" onClick={finishArticleEdit}>
              Back to list
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <ArticleForm editArticle={editingArticle} editContent={editingArticle} onSuccess={finishArticleEdit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishArticlePanel;
