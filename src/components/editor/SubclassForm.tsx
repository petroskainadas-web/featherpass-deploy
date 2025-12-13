import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { PdfUpload } from "./PdfUpload";
import { uploadPdf, fetchPdfMetadata, type PdfUploadData } from "@/lib/pdfUploadHelper";

interface SubclassFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const SubclassForm = ({ editContent, onSuccess }: SubclassFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    className: "",
    overview: "",
    tags: "",
  });
  
  const [features, setFeatures] = useState<Record<number, { name: string; description: string }>>({});

  const subclassConfig: Record<string, number[]> = {
    "Artificer Specialization": [3, 5, 9, 15],
    "Barbarian Path": [3, 6, 10, 14],
    "Bard College": [3, 6, 14],
    "Cleric Domain": [1, 2, 6, 8, 17],
    "Druid Circle": [2, 6, 10, 14],
    "Fighter Archetype": [3, 7, 10, 15, 18],
    "Monk Way": [3, 6, 11, 17],
    "Paladin Oath": [3, 7, 15, 20],
    "Ranger Archetype": [3, 7, 11, 15],
    "Rogue Archetype": [3, 9, 13, 17],
    "Sorcerer Origin": [1, 6, 14, 18],
    "Warlock Patron": [1, 6, 10, 14],
    "Wizard School": [2, 6, 10, 14],
  };

  const classes = Object.keys(subclassConfig);

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      setFormData({
        name: editContent.title,
        className: data.className || "",
        overview: data.overview || "",
        tags: editContent.tags?.join(", ") || "",
      });
      setFeatures(data.features || {});
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
        className: formData.className,
        overview: formData.overview,
        features: features,
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
        toast({ title: "Success!", description: "Subclass updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "subclass",
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          image_id: imageId,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Subclass added to library" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          className: "",
          overview: "",
          tags: "",
        });
        setFeatures({});
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
    if (field === "className") {
      setFeatures({});
    }
  };

  const updateFeature = (level: number, field: "name" | "description", value: string) => {
    setFeatures(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [field]: value,
      },
    }));
  };

  const featureLevels = formData.className ? subclassConfig[formData.className] || [] : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editContent ? "Edit Subclass" : "Add New Subclass"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Subclass Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="e.g., Circle of the Moon, School of Necromancy"
              required
            />
          </div>

          <div>
            <Label htmlFor="className">Subclass Type *</Label>
            <Select value={formData.className} onValueChange={(value) => updateField("className", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select subclass type" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="overview">Overview</Label>
            <Textarea
              id="overview"
              value={formData.overview}
              onChange={(e) => updateField("overview", e.target.value)}
              rows={3}
              placeholder="Brief overview of the subclass"
            />
          </div>

          {featureLevels.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="font-semibold">Subclass Features</h3>
              {featureLevels.map((level) => (
                <div key={level} className="space-y-2 p-4 border rounded-lg">
                  <div>
                    <Label htmlFor={`feature-name-${level}`}>Level {level} Feature *</Label>
                    <Input
                      id={`feature-name-${level}`}
                      value={features[level]?.name || ""}
                      onChange={(e) => updateFeature(level, "name", e.target.value)}
                      placeholder="Feature name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor={`feature-desc-${level}`}>Description</Label>
                    <Textarea
                      id={`feature-desc-${level}`}
                      value={features[level]?.description || ""}
                      onChange={(e) => updateFeature(level, "description", e.target.value)}
                      rows={4}
                      placeholder="Feature description"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

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
              placeholder="wizard, necromancy, spellcaster"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update Subclass" : "Publish Subclass")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SubclassForm;
