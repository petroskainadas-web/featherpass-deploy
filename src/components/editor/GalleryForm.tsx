import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { GalleryImageUpload } from "./GalleryImageUpload";
import { z } from "zod";
import DOMPurify from "dompurify";

// Validation schema
const gallerySchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  image_type: z.enum([
    "Realm Landscapes",
    "Cartography & Battle Maps",
    "Heroes & Allies",
    "Monsters & Adversaries",
    "Relics & Items",
    "Concept Art"
  ]),
  image_description: z.string().max(1000, "Description must be less than 1000 characters").optional(),
  image_creation_tool: z.string().max(100, "Tool name must be less than 100 characters").optional(),
  prompt_used: z.string().max(2000, "Prompt must be less than 2000 characters").optional(),
  tags: z.array(z.string().max(50, "Each tag must be less than 50 characters")).optional(),
});

interface GalleryFormProps {
  editContent?: any;
  editImage?: any;
  onSuccess?: () => void;
}

const imageTypes = [
  { value: 'Realm Landscapes', orientation: 'landscape' as const },
  { value: 'Cartography & Battle Maps', orientation: 'landscape' as const },
  { value: 'Heroes & Allies', orientation: 'portrait' as const },
  { value: 'Monsters & Adversaries', orientation: 'portrait' as const },
  { value: 'Relics & Items', orientation: 'square' as const },
  { value: 'Concept Art', orientation: 'square' as const },
];

export const GalleryForm = ({ editContent, editImage, onSuccess }: GalleryFormProps) => {
  const { toast } = useToast();
  const resolvedContent = editImage || editContent;
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState(resolvedContent?.title || "");
  const [imageType, setImageType] = useState(resolvedContent?.image_type || "");
  const [imageDescription, setImageDescription] = useState(resolvedContent?.image_description || "");
  const [imageCreationTool, setImageCreationTool] = useState(resolvedContent?.image_creation_tool || "");
  const [promptUsed, setPromptUsed] = useState(resolvedContent?.prompt_used || "");
  const [tags, setTags] = useState(resolvedContent?.tags?.join(", ") || "");
  const [imageFileId, setImageFileId] = useState(resolvedContent?.image_file_id || null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const selectedImageType = imageTypes.find(t => t.value === imageType);

  const handleImageUploaded = (newImageFileId: string, newImageUrl: string) => {
    setImageFileId(newImageFileId);
    setImageUrl(newImageUrl);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!imageFileId) {
      toast({
        title: "Image required",
        description: "Please upload an image before publishing",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      // Sanitize input
      const sanitizedDescription = imageDescription.trim() ? DOMPurify.sanitize(imageDescription) : "";
      const sanitizedPrompt = promptUsed.trim() ? DOMPurify.sanitize(promptUsed) : "";

      const tagsArray = tags
        .split(",")
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      // Validate data
      const validatedData = gallerySchema.parse({
        title: title.trim(),
        image_type: imageType,
        image_description: sanitizedDescription || undefined,
        image_creation_tool: imageCreationTool.trim() || undefined,
        prompt_used: sanitizedPrompt || undefined,
        tags: tagsArray.length > 0 ? tagsArray : undefined,
      });

      const galleryData = {
        title: validatedData.title,
        image_type: validatedData.image_type,
        orientation: selectedImageType?.orientation,
        image_description: validatedData.image_description || null,
        image_creation_tool: validatedData.image_creation_tool || null,
        prompt_used: validatedData.prompt_used || null,
        tags: validatedData.tags || null,
        image_file_id: imageFileId,
        created_by: session.user.id,
      };

      if (resolvedContent) {
        const { error } = await supabase
          .from("gallery_images")
          .update(galleryData)
          .eq("id", resolvedContent.id);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Gallery image updated successfully",
        });
      } else {
        const { error } = await supabase
          .from("gallery_images")
          .insert(galleryData);

        if (error) throw error;

        toast({
          title: "Success!",
          description: "Gallery image published successfully",
        });

        // Reset form
        setTitle("");
        setImageType("");
        setImageDescription("");
        setImageCreationTool("");
        setPromptUsed("");
        setTags("");
        setImageFileId(null);
        setImageUrl(null);
      }

      onSuccess?.();
    } catch (error: any) {
      console.error('Gallery publish error:', error);
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to publish gallery image",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto p-6 bg-card rounded-lg shadow-elegant">
      <h2 className="text-2xl font-cinzel font-bold text-secondary">
        {resolvedContent ? "Update Gallery Image" : "Publish Gallery Image"}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter image title"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-type">Image Type *</Label>
        <Select value={imageType} onValueChange={setImageType}>
          <SelectTrigger>
            <SelectValue placeholder="Select image type" />
          </SelectTrigger>
          <SelectContent>
            {imageTypes.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.value} ({type.orientation})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {imageType && (
        <GalleryImageUpload
          currentImageFileId={imageFileId}
          currentImageUrl={imageUrl}
          expectedOrientation={selectedImageType?.orientation}
          onImageUploaded={handleImageUploaded}
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="image-description">Image Description</Label>
        <Textarea
          id="image-description"
          value={imageDescription}
          onChange={(e) => setImageDescription(e.target.value)}
          placeholder="Describe the image (up to 200 words)"
          maxLength={1000}
          rows={4}
        />
        <p className="text-xs text-muted-foreground">
          {imageDescription.length}/1000 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image-creation-tool">Image Creation Tool</Label>
        <Input
          id="image-creation-tool"
          value={imageCreationTool}
          onChange={(e) => setImageCreationTool(e.target.value)}
          placeholder="e.g., Midjourney, Stable Diffusion, etc."
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="prompt-used">Prompt Used</Label>
        <Textarea
          id="prompt-used"
          value={promptUsed}
          onChange={(e) => setPromptUsed(e.target.value)}
          placeholder="The prompt used to generate this image (up to 350 words)"
          maxLength={2000}
          rows={5}
        />
        <p className="text-xs text-muted-foreground">
          {promptUsed.length}/2000 characters
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input
          id="tags"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="Separate tags with commas"
        />
      </div>

      <Button
        type="submit"
        disabled={loading || !imageFileId}
        className="w-full"
        size="lg"
      >
        {loading ? "Publishing..." : resolvedContent ? "Update Image" : "Publish Image"}
      </Button>
    </form>
  );
};

export default GalleryForm;
