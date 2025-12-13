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

interface SpellFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const SpellForm = ({ editContent, onSuccess }: SpellFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    school: "",
    castingTime: "",
    range: "",
    components: "",
    duration: "",
    description: "",
    tags: "",
  });

  const schools = [
    "Abjuration",
    "Conjuration",
    "Divination",
    "Enchantment",
    "Evocation",
    "Illusion",
    "Necromancy",
    "Transmutation",
  ];

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      setFormData({
        name: editContent.title,
        level: data.level || "",
        school: data.school || "",
        castingTime: data.castingTime || "",
        range: data.range || "",
        components: data.components || "",
        duration: data.duration || "",
        description: data.description || "",
        tags: editContent.tags?.join(", ") || "",
      });
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const contentData = {
        level: formData.level,
        school: formData.school,
        castingTime: formData.castingTime,
        range: formData.range,
        components: formData.components,
        duration: formData.duration,
        description: formData.description,
      };

      // Upload PDF if provided
      const pdfId = await uploadPdf(pdfData, user.id, editContent?.pdf_id);

      if (editContent) {
        const { error } = await supabase
          .from("library_content")
          .update({
            title: formData.name,
            level: formData.level,
            content_data: contentData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
            pdf_id: pdfId,
          })
          .eq("id", editContent.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Spell updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "spell",
          level: formData.level,
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Spell added to library" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          level: "",
          school: "",
          castingTime: "",
          range: "",
          components: "",
          duration: "",
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
        <CardTitle>{editContent ? "Edit Spell" : "Add New Spell"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Spell Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateField("name", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="level">Level *</Label>
              <Select value={formData.level} onValueChange={(value) => updateField("level", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Cantrip">Cantrip</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
                    <SelectItem key={level} value={level.toString()}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="school">School of Magic *</Label>
            <Select value={formData.school} onValueChange={(value) => updateField("school", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select school" />
              </SelectTrigger>
              <SelectContent>
                {schools.map(school => (
                  <SelectItem key={school} value={school}>{school}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="castingTime">Casting Time *</Label>
              <Input
                id="castingTime"
                value={formData.castingTime}
                onChange={(e) => updateField("castingTime", e.target.value)}
                placeholder="1 action"
                required
              />
            </div>
            <div>
              <Label htmlFor="range">Range *</Label>
              <Input
                id="range"
                value={formData.range}
                onChange={(e) => updateField("range", e.target.value)}
                placeholder="60 feet"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="components">Components *</Label>
              <Input
                id="components"
                value={formData.components}
                onChange={(e) => updateField("components", e.target.value)}
                placeholder="V, S, M (a pinch of sulfur)"
                required
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration *</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => updateField("duration", e.target.value)}
                placeholder="Instantaneous"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Spell Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="damage, fire, combat"
            />
          </div>

          <PdfUpload
            onPdfChange={setPdfData}
            existingPdf={existingPdf || undefined}
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update Spell" : "Publish Spell")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default SpellForm;
