import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface SubraceViewProps {
  content: any;
}

export const SubraceView = ({ content }: SubraceViewProps) => {
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
        <p className="text-lg text-muted-foreground">{data.parentRace} Subrace</p>
      </div>

      {imageUrl && (
        <>
          <Separator />
          <div className="w-full rounded-lg overflow-hidden border border-border shadow-lg">
            <img 
              src={imageUrl} 
              alt={content.title}
              className="w-full h-auto object-contain max-h-[600px]"
            />
          </div>
        </>
      )}

      {data.description && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Description</h3>
            <p className="whitespace-pre-wrap">{data.description}</p>
          </div>
        </>
      )}

      {data.abilityScoreIncrease && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Ability Score Increase</h3>
            <p>{data.abilityScoreIncrease}</p>
          </div>
        </>
      )}

      {data.traits && Array.isArray(data.traits) && data.traits.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-3">Traits</h3>
            <div className="space-y-4">
              {data.traits.map((trait: any, idx: number) => (
                <div key={idx}>
                  <h4 className="font-bold text-foreground">{trait.name}</h4>
                  <p className="whitespace-pre-wrap mt-1">{trait.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
