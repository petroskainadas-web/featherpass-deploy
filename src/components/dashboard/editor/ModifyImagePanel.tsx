import { useMemo, useState } from "react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useDashboardContext } from "../context/DashboardContext";
import { useGalleryItem, useGalleryList } from "../hooks/useGalleryList";
import { DASHBOARD_ITEMS_PER_PAGE } from "../hooks/usePagedSupabaseQuery";

const ModifyImagePanel = () => {
  const { startGalleryImageEdit } = useDashboardContext();
  const [page, setPage] = useState(0);
  const [filterType, setFilterType] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const galleryQuery = useGalleryList(page);
  const { fetchFullGalleryImage, deleteGalleryImage } = useGalleryItem();

  const filteredImages = useMemo(() => {
    const items = galleryQuery.data || [];
    return items.filter((item) => {
      const matchesType = filterType === "all" || item.image_type === filterType;
      const matchesSearch = !search || item.title.toLowerCase().includes(search.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [filterType, galleryQuery.data, search]);

  const handleEdit = async (id: string) => {
    const full = await fetchFullGalleryImage(id);
    if (full) {
      startGalleryImageEdit(full);
    }
  };

  const handleDelete = (id: string) => {
    setSelectedId(id);
    setDeleteDialogOpen(true);
  };

  const totalPages = Math.ceil((galleryQuery.totalCount || 0) / DASHBOARD_ITEMS_PER_PAGE);

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Modify Gallery Images</CardTitle>
            <p className="text-sm text-muted-foreground">Review, edit, or delete gallery images.</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filterType === "all" ? "default" : "outline"} onClick={() => setFilterType("all")}>
            All
          </Button>
          {[
            { key: "Realm Landscapes", label: "Landscapes" },
            { key: "Cartography & Battle Maps", label: "Maps" },
            { key: "Heroes & Allies", label: "Heroes" },
            { key: "Monsters & Adversaries", label: "Monsters" },
            { key: "Relics & Items", label: "Relics" },
            { key: "Concept Art", label: "Concept Art" },
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
          {galleryQuery.isLoading && <p>Loading images...</p>}
          {filteredImages.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold">{item.title}</h3>
                <span className="text-xs text-muted-foreground">
                  Published: {item.published_date ? new Date(item.published_date).toLocaleDateString() : "Unknown"} • {item.view_count || 0} views
                </span>
                <Badge variant="secondary">{item.image_type}</Badge>
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
          {!galleryQuery.isLoading && filteredImages.length === 0 && (
            <p className="text-sm text-muted-foreground">No images found.</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || galleryQuery.isFetching}
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
            disabled={galleryQuery.isFetching || filteredImages.length < DASHBOARD_ITEMS_PER_PAGE}
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
              This action cannot be undone and will permanently delete this image.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedId) {
                  deleteGalleryImage.mutate(selectedId);
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

export default ModifyImagePanel;
