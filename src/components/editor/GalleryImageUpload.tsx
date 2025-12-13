import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { X, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { uploadWithRetry, isNetworkError } from "@/lib/uploadWithRetry";

interface GalleryImageUploadProps {
  currentImageFileId?: string | null;
  currentImageUrl?: string | null;
  expectedOrientation?: 'landscape' | 'portrait' | 'square';
  onImageUploaded: (imageFileId: string, imageUrl: string) => void;
}

export const GalleryImageUpload = ({ 
  currentImageFileId, 
  currentImageUrl, 
  expectedOrientation,
  onImageUploaded 
}: GalleryImageUploadProps) => {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const getOrientation = (width: number, height: number): 'landscape' | 'portrait' | 'square' => {
    const ratio = width / height;
    if (Math.abs(ratio - 1) < 0.1) return 'square';
    return ratio > 1 ? 'landscape' : 'portrait';
  };

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

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "File too large",
        description: "Image must be smaller than 10MB",
        variant: "destructive",
      });
      return;
    }

    // Check image dimensions and orientation
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const orientation = getOrientation(img.width, img.height);
        
        if (expectedOrientation && orientation !== expectedOrientation) {
          toast({
            title: "Orientation mismatch",
            description: `This image type expects ${expectedOrientation} orientation, but the uploaded image is ${orientation}. Please upload an appropriate image.`,
            variant: "destructive",
          });
          return;
        }

        setSelectedFile(file);
        setPreviewUrl(event.target?.result as string);
      };
      img.src = event.target?.result as string;
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

    setUploading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const formData = new FormData();
      formData.append('file', selectedFile);
      if (currentImageFileId) formData.append('oldImageFileId', currentImageFileId);

      const response = await uploadWithRetry(
        async () => {
          const result = await supabase.functions.invoke('process-gallery-image', {
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

      const { imageFileId, publicUrl } = response.data;

      toast({
        title: "Success!",
        description: "Gallery image uploaded successfully",
      });

      onImageUploaded(imageFileId, publicUrl);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to upload gallery image after multiple attempts",
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
    setProgress(0);
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-card">
      <div className="flex items-center justify-between">
        <Label className="text-base font-semibold">Gallery Image</Label>
        {currentImageFileId && !selectedFile && (
          <span className="text-sm text-muted-foreground">Current image</span>
        )}
      </div>

      {expectedOrientation && (
        <p className="text-sm text-muted-foreground">
          Expected orientation: <span className="font-semibold">{expectedOrientation}</span>
        </p>
      )}

      {previewUrl && (
        <div className="relative w-full aspect-video bg-muted rounded-lg overflow-hidden">
          <img 
            src={previewUrl} 
            alt="Preview" 
            className="w-full h-full object-contain"
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
          <Label htmlFor="gallery-image-upload" className="cursor-pointer">
            <div className="flex items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg hover:border-primary transition-colors">
              <div className="text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload gallery image
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, or WebP (max 10MB)
                </p>
              </div>
            </div>
            <Input
              id="gallery-image-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </Label>
        </div>
      ) : (
        <div className="space-y-4">
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
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? "Uploading..." : currentImageFileId ? "Replace Image" : "Upload Image"}
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
