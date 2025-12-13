import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { X, Upload, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadWithRetry, isNetworkError } from "@/lib/uploadWithRetry";

interface ImageUploadProps {
  currentImageId?: string | null;
  currentImageUrl?: string | null;
  onImageUploaded: (imageId: string) => void;
}

export const ImageUpload = ({ currentImageId, currentImageUrl, onImageUploaded }: ImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, or WebP image",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please select an image to upload",
        variant: "destructive",
      });
      return;
    }

    if (!altText.trim()) {
      toast({
        title: "Alt text required",
        description: "Please provide alt text for accessibility",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('altText', altText);
      if (caption) formData.append('caption', caption);
      if (credit) formData.append('credit', credit);
      if (currentImageId) formData.append('oldImageId', currentImageId);

      const response = await uploadWithRetry(
        async () => {
          const result = await supabase.functions.invoke('process-image', {
            body: formData,
          });
          if (result.error) throw result.error;
          return result;
        },
        {
          maxRetries: 3,
          retryDelay: 2000,
          onProgress: setProgress,
          onRetry: (attempt, error) => {
            if (isNetworkError(error)) {
              toast({
                title: `Retrying upload (${attempt}/3)`,
                description: "Network issue detected, retrying...",
              });
            }
          }
        }
      );

      const { imageId } = response.data;

      toast({
        title: "Success!",
        description: "Image uploaded successfully",
      });

      onImageUploaded(imageId);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload image after multiple attempts",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(currentImageUrl || null);
    setAltText("");
    setCaption("");
    setCredit("");
    setProgress(0);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Content Image</Label>
        {currentImageId && !selectedFile && (
          <span className="text-sm text-muted-foreground">Current image</span>
        )}
      </div>

      {previewUrl && (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          {selectedFile && (
            <button
              onClick={handleCancel}
              className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {!selectedFile ? (
        <div>
          <Label htmlFor="image-upload" className="cursor-pointer">
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, or WebP (max 5MB)
                </p>
              </div>
            </div>
            <Input
              id="image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Label>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="alt-text">Alt Text *</Label>
            <Input
              id="alt-text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Describe the image for accessibility"
              required
            />
          </div>

          <div>
            <Label htmlFor="caption">Caption (optional)</Label>
            <Input
              id="caption"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Image caption"
            />
          </div>

          <div>
            <Label htmlFor="credit">Credit (optional)</Label>
            <Input
              id="credit"
              value={credit}
              onChange={(e) => setCredit(e.target.value)}
              placeholder="Artist or source credit"
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-center text-muted-foreground">
                Uploading... {progress}%
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button
              onClick={handleUpload}
              disabled={uploading || !altText.trim()}
              className="flex-1"
            >
              {uploading ? "Uploading..." : currentImageId ? "Replace Image" : "Upload Image"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              disabled={uploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};