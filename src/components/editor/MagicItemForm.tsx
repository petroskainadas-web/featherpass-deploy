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

interface MagicItemFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const MagicItemForm = ({ editContent, onSuccess }: MagicItemFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    itemType: "",
    rarity: "",
    description: "",
    tags: "",
  });

  const rarities = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];
  const itemTypes = ["Armor", "Potion", "Ring", "Rod", "Scroll", "Staff", "Wand", "Weapon", "Wondrous Item"];

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      setFormData({
        name: editContent.title,
        itemType: data.itemType || "",
        rarity: editContent.rarity || "",
        description: data.description || "",
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
        itemType: formData.itemType,
        description: formData.description,
      };

      // Upload PDF if provided
      const pdfId = await uploadPdf(pdfData, user.id, editContent?.pdf_id);

      if (editContent) {
        const { error } = await supabase
          .from("library_content")
          .update({
            title: formData.name,
            rarity: formData.rarity,
            content_data: contentData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
            image_id: imageId,
            pdf_id: pdfId,
          })
          .eq("id", editContent.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Magic item updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "magic_item",
          rarity: formData.rarity,
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          image_id: imageId,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Magic item added to library" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          itemType: "",
          rarity: "",
          description: "",
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
        <CardTitle>{editContent ? "Edit Magic Item" : "Add New Magic Item"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="itemType">Item Type *</Label>
              <Select value={formData.itemType} onValueChange={(value) => updateField("itemType", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select item type" />
                </SelectTrigger>
                <SelectContent>
                  {itemTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="rarity">Rarity *</Label>
              <Select value={formData.rarity} onValueChange={(value) => updateField("rarity", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  {rarities.map(rarity => (
                    <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Item Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              required
            />
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
              placeholder="weapon, attunement, bonus"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update Magic Item" : "Publish Magic Item")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MagicItemForm;
