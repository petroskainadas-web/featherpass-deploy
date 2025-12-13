import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { PdfUpload } from "./PdfUpload";
import { uploadPdf, fetchPdfMetadata, type PdfUploadData } from "@/lib/pdfUploadHelper";

interface SubraceFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const SubraceForm = ({ editContent, onSuccess }: SubraceFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    trait1Name: "",
    trait1Description: "",
    trait2Name: "",
    trait2Description: "",
    trait3Name: "",
    trait3Description: "",
    tags: "",
  });

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      const traits = data.traits || [];
      setFormData({
        name: editContent.title,
        description: data.description || "",
        trait1Name: traits[0]?.name || "",
        trait1Description: traits[0]?.description || "",
        trait2Name: traits[1]?.name || "",
        trait2Description: traits[1]?.description || "",
        trait3Name: traits[2]?.name || "",
        trait3Description: traits[2]?.description || "",
        tags: editContent.tags?.join(", ") || "",
      });
      setImageId(editContent.image_id || null);
      
      if (editContent.image_id) {
        fetchImageUrl(editContent.image_id);
      }
      if (editContent.pdf_id) {
        fetchPdfData(editContent.pdf_id);
      }
    }
  }, [editContent]);

  const fetchPdfData = async (pdfId: string) => {
    const metadata = await fetchPdfMetadata(pdfId);
    if (metadata) {
      setExistingPdf({
        fileName: metadata.file_name,
        fileSize: metadata.file_size,
        description: metadata.description || undefined,
      });
    }
  };

  const fetchImageUrl = async (imgId: string) => {
    const { data } = await supabase
      .from('images')
      .select('large_path, medium_path, thumbnail_path')
      .eq('id', imgId)
      .single();
    
    if (data) {
      const imagePath = data.large_path || data.medium_path || data.thumbnail_path;
      if (imagePath) {
        const { data: { publicUrl } } = supabase.storage
          .from('content-images')
          .getPublicUrl(imagePath);
        setImageUrl(publicUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const contentData = {
        description: formData.description,
        traits: [
          { name: formData.trait1Name, description: formData.trait1Description },
          { name: formData.trait2Name, description: formData.trait2Description },
          { name: formData.trait3Name, description: formData.trait3Description },
        ].filter(trait => trait.name && trait.description),
      };

      // Upload PDF if provided
      const pdfId = await uploadPdf(pdfData, user.id, editContent?.pdf_id);

      if (editContent) {
        const { error } = await supabase
          .from("library_content")
          .update({
            title: formData.name,
            content_data: contentData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
            image_id: imageId,
            pdf_id: pdfId,
          })
          .eq("id", editContent.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Subrace updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "subrace",
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          image_id: imageId,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Subrace added to library" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          description: "",
          trait1Name: "",
          trait1Description: "",
          trait2Name: "",
          trait2Description: "",
          trait3Name: "",
          trait3Description: "",
          tags: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editContent ? "Edit Subrace" : "Add New Subrace"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Subrace Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={3}
              placeholder="Brief description of the subrace"
            />
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Trait 1 *</h3>
            <div>
              <Label htmlFor="trait1Name">Trait Name</Label>
              <Input
                id="trait1Name"
                value={formData.trait1Name}
                onChange={(e) => updateField("trait1Name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="trait1Description">Trait Description</Label>
              <Textarea
                id="trait1Description"
                value={formData.trait1Description}
                onChange={(e) => updateField("trait1Description", e.target.value)}
                rows={3}
                required
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Trait 2</h3>
            <div>
              <Label htmlFor="trait2Name">Trait Name</Label>
              <Input
                id="trait2Name"
                value={formData.trait2Name}
                onChange={(e) => updateField("trait2Name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trait2Description">Trait Description</Label>
              <Textarea
                id="trait2Description"
                value={formData.trait2Description}
                onChange={(e) => updateField("trait2Description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="space-y-4 border-t pt-4">
            <h3 className="font-semibold">Trait 3</h3>
            <div>
              <Label htmlFor="trait3Name">Trait Name</Label>
              <Input
                id="trait3Name"
                value={formData.trait3Name}
                onChange={(e) => updateField("trait3Name", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="trait3Description">Trait Description</Label>
              <Textarea
                id="trait3Description"
                value={formData.trait3Description}
                onChange={(e) => updateField("trait3Description", e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <ImageUpload
            currentImageId={imageId}
            currentImageUrl={imageUrl}
            onImageUploaded={setImageId}
          />

          <PdfUpload
            onPdfChange={setPdfData}
            existingPdf={existingPdf || undefined}
          />

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="elf, dwarf, halfling"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update Subrace" : "Publish Subrace")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubraceForm;
