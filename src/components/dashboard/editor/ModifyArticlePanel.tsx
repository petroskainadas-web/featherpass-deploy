import { useMemo, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useDashboardContext } from "../context/DashboardContext";
import { useArticleItem, useArticleList } from "../hooks/useArticleList";
import { DASHBOARD_ITEMS_PER_PAGE } from "../hooks/usePagedSupabaseQuery";

const ModifyArticlePanel = () => {
  const { startArticleEdit } = useDashboardContext();
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const articleQuery = useArticleList(page);
  const { fetchFullArticle, deleteArticle } = useArticleItem();

  const filteredArticles = useMemo(() => {
    const items = articleQuery.data || [];
    return items.filter((item) => {
      const matchesType = filterType === "all" || item.article_type === filterType;
      const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [articleQuery.data, filterType, search]);

  const handleEdit = async (id: number) => {
    const full = await fetchFullArticle(id);
    if (full) {
      startArticleEdit(full);
    }
  };

  const handleDelete = (id: number) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil((articleQuery.totalCount || 0) / DASHBOARD_ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Modify Published Articles</CardTitle>
            <p className="text-sm text-muted-foreground">Review, edit, or delete articles.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")}>
            All
          </Button>
          {["Design Notes", "Plot Crafting", "Worldbuilding Tips"].map((type) => (
            <Button
              key={type}
              size="sm"
              variant={filterType === type ? "default" : "outline"}
              onClick={() => setFilterType(type)}
            >
              {type}
            </Button>
          ))}
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full md:w-64 ml-auto"
          />
        </div>

        <div className="space-y-3">
          {articleQuery.isLoading && <p>Loading articles...</p>}
          {filteredArticles.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-muted-foreground">
                  Published: {item.published_date ? new Date(item.published_date).toLocaleDateString() : "Unknown"} • {item.view_count || 0} views • {item.like_count || 0} likes
                </span>
                <Badge variant={item.article_type as any}>{item.article_type}</Badge>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleEdit(item.id)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
              </div>
            </div>
          ))}
          {!articleQuery.isLoading && filteredArticles.length === 0 && (
            <p className="text-sm text-muted-foreground">No articles found.</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || articleQuery.isFetching}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page + 1} of {Math.max(totalPages, 1)}
          </span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => p + 1)}
            disabled={articleQuery.isFetching || filteredArticles.length < DASHBOARD_ITEMS_PER_PAGE}
          >
            Next <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone and will permanently delete this article.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId) {
                  deleteArticle.mutate(selectedId);
                }
                setDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
    </div>
  );
};

export default ModifyArticlePanel;
