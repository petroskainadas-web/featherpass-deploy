import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface SubclassViewProps {
  content: any;
}

export const SubclassView = ({ content }: SubclassViewProps) => {
  const data = content.content_data;
  const [imageUrl, setImageUrl] = useState<string | null>(content.imageUrl ?? null);

  useEffect(() => {
    setImageUrl(content.imageUrl ?? null);

    if (!content.imageUrl && content.image_id) {
      fetchImageUrl(content.image_id);
    }
  }, [content.imageUrl, content.image_id]);

  const fetchImageUrl = async (imgId: string) => {
    const { data: imgData } = await supabase
      .from('images')
      .select('large_path, medium_path, thumbnail_path, alt_text')
      .eq('id', imgId)
      .single();
    
    if (imgData) {
      const imagePath = imgData.large_path || imgData.medium_path || imgData.thumbnail_path;
      if (imagePath) {
        const { data: { publicUrl } } = supabase.storage
          .from('content-images')
          .getPublicUrl(imagePath);
        setImageUrl(publicUrl);
      }
    }
  };

  return (
    <div className="space-y-6 font-crimson">
      <div>
        <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-2">{content.title}</h2>
        <p className="text-lg text-muted-foreground">{data.className}</p>
      </div>

      <Separator />

      {imageUrl && (
        <>
          <div className="w-full rounded-lg overflow-hidden border border-border shadow-lg">
            <img 
              src={imageUrl} 
              alt={content.title}
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
          <Separator />
        </>
      )}

      <div>
        <h3 className="text-lg font-cinzel font-bold text-logo-gold mb-2">Overview</h3>
        <p className="whitespace-pre-wrap">{data.overview}</p>
      </div>

      {data.features && Object.keys(data.features).length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-logo-gold mb-3">Features</h3>
            <div className="space-y-4">
              {Object.entries(data.features).map(([level, feature]: [string, any]) => (
                <div key={level}>
                  <h4 className="font-bold text-muted-foreground">Level {level}: {feature.name}</h4>
                  <p className="whitespace-pre-wrap mt-1">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
