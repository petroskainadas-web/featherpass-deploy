import { useMemo, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDashboardContext } from "../context/DashboardContext";
import { useContentItem, useContentList } from "../hooks/useContentList";
import { DASHBOARD_ITEMS_PER_PAGE } from "../hooks/usePagedSupabaseQuery";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";

const ModifyContentPanel = () => {
  const { startContentEdit } = useDashboardContext();
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const contentQuery = useContentList(page);
  const { fetchFullLibraryItem, deleteContent } = useContentItem();

  const filteredContent = useMemo(() => {
    const items = contentQuery.data || [];
    return items.filter((item) => {
      const matchesType = filterType === "all" || item.content_type === filterType;
      const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [contentQuery.data, filterType, search]);

  const handleEdit = async (id: string) => {
    const full = await fetchFullLibraryItem(id);
    if (full) {
      startContentEdit(full);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil((contentQuery.totalCount || 0) / DASHBOARD_ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Modify Published Content</CardTitle>
            <p className="text-sm text-muted-foreground">Review, edit, or delete library entries.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={filterType === "all" ? "default" : "outline"}
            onClick={() => setFilterType("all")}
          >
            All
          </Button>
          {[
            { key: "monster", label: "Monsters" },
            { key: "spell", label: "Spells" },
            { key: "magic_item", label: "Magic Items" },
            { key: "subrace", label: "Subraces" },
            { key: "npc", label: "NPCs" },
            { key: "subclass", label: "Subclasses" },
          ].map((type) => (
            <Button
              key={type.key}
              size="sm"
              variant={filterType === type.key ? "default" : "outline"}
              onClick={() => setFilterType(type.key)}
            >
              {type.label}
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
          {contentQuery.isLoading && <p>Loading content...</p>}
          {filteredContent.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-muted-foreground">
                  Created: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Unknown"}
                </span>
                <Badge variant={item.content_type as any}>{item.content_type}</Badge>
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
          {!contentQuery.isLoading && filteredContent.length === 0 && (
            <p className="text-sm text-muted-foreground">No content found.</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || contentQuery.isFetching}
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
            disabled={contentQuery.isFetching || filteredContent.length < DASHBOARD_ITEMS_PER_PAGE}
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
              This action cannot be undone and will permanently delete this content.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId) {
                  deleteContent.mutate(selectedId);
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

export default ModifyContentPanel;
