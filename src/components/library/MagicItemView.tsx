import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface MagicItemViewProps {
  content: any;
}

export const MagicItemView = ({ content }: MagicItemViewProps) => {
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
      <div className="flex justify-between items-start gap-6">
        <div className="flex-1">
          <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-2">{content.title}</h2>
          <p className="text-lg text-muted-foreground">
            {content.content_data.itemType}, {content.rarity}
            {data.requiresAttunement && " (requires attunement)"}
          </p>
        </div>
        {imageUrl && (
          <div className="w-48 h-48 rounded-lg overflow-hidden border border-border shadow-lg">
            <img 
              src={imageUrl} 
              alt={content.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-cinzel font-bold text-muted-foreground mb-2">Description</h3>
        <p className="whitespace-pre-wrap">{data.description}</p>
      </div>

      {data.properties && Array.isArray(data.properties) && data.properties.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground mb-3">Properties</h3>
            <div className="space-y-3">
              {data.properties.map((prop: any, idx: number) => (
                <div key={idx}>
                  <strong className="text-foreground">{prop.name}.</strong> {prop.description}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {data.curse && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2 text-destructive">Curse</h3>
            <p className="whitespace-pre-wrap">{data.curse}</p>
          </div>
        </>
      )}

      {data.lore && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Lore</h3>
            <p className="whitespace-pre-wrap">{data.lore}</p>
          </div>
        </>
      )}
    </div>
  );
};
