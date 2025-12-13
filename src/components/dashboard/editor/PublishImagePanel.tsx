import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import GalleryForm from "@/components/editor/GalleryForm";
import { useDashboardContext } from "../context/DashboardContext";

const PublishImagePanel = () => {
  const { editingGalleryImage, finishGalleryImageEdit } = useDashboardContext();

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{editingGalleryImage ? "Edit Gallery Image" : "Publish New Gallery Image"}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {editingGalleryImage
                ? "Update the selected gallery item."
                : "Upload and publish a new gallery image."}
            </p>
          </div>
          {editingGalleryImage && (
            <Button variant="outline" onClick={finishGalleryImageEdit}>
              Back to list
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <GalleryForm editImage={editingGalleryImage} editContent={editingGalleryImage} onSuccess={finishGalleryImageEdit} />
        </CardContent>
      </Card>
    </div>
  );
};

export default PublishImagePanel;
