import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui/badge";
import { Eye, Calendar, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

const GalleryView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [galleryImage, setGalleryImage] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchGalleryImage();
  }, [id]);

  const fetchGalleryImage = async () => {
    try {
      if (!id) return;

      // Increment view count
      await supabase.rpc('increment_gallery_views', { gallery_image_id: id });

      // Fetch gallery image with image file data
      const { data, error } = await supabase
        .from("gallery_images")
        .select(`
          *,
          gallery_image_files (
            large_path,
            medium_path,
            thumbnail_path
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;

      if (!data) {
        toast({
          title: "Not found",
          description: "Gallery image not found",
          variant: "destructive",
        });
        navigate("/gallery");
        return;
      }

      setGalleryImage(data);

      // Get public URL for the image
      if (data.gallery_image_files) {
        const imagePath = data.gallery_image_files.large_path || 
                         data.gallery_image_files.medium_path || 
                         data.gallery_image_files.thumbnail_path;
        if (imagePath) {
          const { data: { publicUrl } } = supabase.storage
            .from('gallery-images')
            .getPublicUrl(imagePath);
          
          setImageUrl(publicUrl);
        }
      }
    } catch (error: any) {
      console.error('Error fetching gallery image:', error);
      toast({
        title: "Error",
        description: "Failed to load gallery image",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFrameStyles = (orientation: string) => {
    const baseStyle = "border-8 border-double shadow-2xl";
    if (orientation === 'landscape') {
      return `${baseStyle} border-amber-700/40 bg-gradient-to-br from-amber-900/10 via-transparent to-amber-900/10`;
    } else if (orientation === 'portrait') {
      return `${baseStyle} border-amber-800/40 bg-gradient-to-br from-amber-800/10 via-transparent to-amber-900/10`;
    }
    return `${baseStyle} border-amber-600/40 bg-gradient-to-br from-amber-700/10 via-transparent to-amber-800/10`;
  };

  const getLayoutStyles = (orientation: string) => {
    if (orientation === 'landscape') {
      return "flex-col";
    } else if (orientation === 'portrait') {
      return "md:flex-row";
    }
    return "md:flex-row-reverse";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <Skeleton className="w-full h-[600px]" />
        </div>
      </Layout>
    );
  }

  if (!galleryImage || !imageUrl) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className={`flex ${getLayoutStyles(galleryImage.orientation)} gap-8 items-start`}>
          {/* Image Section */}
          <div className={`${galleryImage.orientation === 'landscape' ? 'w-full' : galleryImage.orientation === 'portrait' ? 'md:w-2/3' : 'md:w-2/3'}`}>
            <div className={`${getFrameStyles(galleryImage.orientation)} rounded-lg overflow-hidden p-4`}>
              <h1 className="text-3xl font-cinzel font-bold text-secondary mb-4 text-center">
                {galleryImage.title}
              </h1>
              <img
                src={imageUrl}
                alt={galleryImage.title}
                className="w-full h-auto object-contain rounded-md"
              />
              {galleryImage.image_description && (
                <p className="mt-4 text-center text-muted-foreground font-crimson text-sm italic px-4">
                  {galleryImage.image_description}
                </p>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className={`${galleryImage.orientation === 'landscape' ? 'w-full' : 'md:w-1/3'} space-y-6`}>
            <div className="bg-card border border-border rounded-lg p-6 shadow-elegant">
              <div className="flex items-center justify-between mb-4">
                <Badge variant="secondary" className="text-sm">
                  {galleryImage.image_type}
                </Badge>
                <div className="flex items-center text-muted-foreground text-sm">
                  <Eye className="w-4 h-4 mr-1" />
                  {galleryImage.view_count || 0}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4 mr-2" />
                  {new Date(galleryImage.published_date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>

                {galleryImage.image_creation_tool && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2 text-secondary" />
                      Creation Tool
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {galleryImage.image_creation_tool}
                    </p>
                  </div>
                )}

                {galleryImage.prompt_used && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Prompt Used</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {galleryImage.prompt_used}
                    </p>
                  </div>
                )}

                {galleryImage.tags && galleryImage.tags.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {galleryImage.tags.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default GalleryView;
