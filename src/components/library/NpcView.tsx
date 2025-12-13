import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

interface NpcViewProps {
  content: any;
}

export const NpcView = ({ content }: NpcViewProps) => {
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
        <p className="text-lg text-muted-foreground">
          {data.race}{data.subrace && ` (${data.subrace})`}, {data.class}{data.subclass && ` (${data.subclass})`}, {data.alignment}
        </p>
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

      {data.background && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Background & Agenda</h3>
            <p className="whitespace-pre-wrap">{data.background}</p>
          </div>
        </>
      )}

      <Separator />

      <div className="space-y-2 text-base">
        <div><strong style={{ color: '#BCAF8F' }}>Armor Class:</strong> {data.ac}{data.acType && ` (${data.acType})`}</div>
        <div><strong style={{ color: '#BCAF8F' }}>Hit Points:</strong> {data.hp}{data.hitDice && ` (${data.hitDice})`}</div>
        <div><strong style={{ color: '#BCAF8F' }}>Speed:</strong> {data.speed}</div>
      </div>

      <Separator />

      <div className="grid grid-cols-6 gap-4 text-center text-base">
        <div><strong style={{ color: '#BCAF8F' }}>STR</strong><br/>{data.stats?.str}</div>
        <div><strong style={{ color: '#BCAF8F' }}>DEX</strong><br/>{data.stats?.dex}</div>
        <div><strong style={{ color: '#BCAF8F' }}>CON</strong><br/>{data.stats?.con}</div>
        <div><strong style={{ color: '#BCAF8F' }}>INT</strong><br/>{data.stats?.int}</div>
        <div><strong style={{ color: '#BCAF8F' }}>WIS</strong><br/>{data.stats?.wis}</div>
        <div><strong style={{ color: '#BCAF8F' }}>CHA</strong><br/>{data.stats?.cha}</div>
      </div>

      <Separator />

      <div className="space-y-2 text-base">
        {data.savingThrows && <div><strong style={{ color: '#BCAF8F' }}>Saving Throws:</strong> {data.savingThrows}</div>}
        {data.skills && <div><strong style={{ color: '#BCAF8F' }}>Skills:</strong> {data.skills}</div>}
        {data.damageResistances && <div><strong style={{ color: '#BCAF8F' }}>Damage Resistances:</strong> {data.damageResistances}</div>}
        {data.damageImmunities && <div><strong style={{ color: '#BCAF8F' }}>Damage Immunities:</strong> {data.damageImmunities}</div>}
        {data.conditionImmunities && <div><strong style={{ color: '#BCAF8F' }}>Condition Immunities:</strong> {data.conditionImmunities}</div>}
        {data.senses && <div><strong style={{ color: '#BCAF8F' }}>Senses:</strong> {data.senses}</div>}
        {data.languages && <div><strong style={{ color: '#BCAF8F' }}>Languages:</strong> {data.languages}</div>}
        {data.challenge && <div><strong style={{ color: '#BCAF8F' }}>Challenge:</strong> {data.challenge}{data.proficiencyBonus && ` Proficiency Bonus: ${data.proficiencyBonus}`}</div>}
      </div>

      {data.features && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground  mb-3">Features</h3>
            <p className="whitespace-pre-wrap">{data.features}</p>
          </div>
        </>
      )}

      {data.actions && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground  mb-3">Actions</h3>
            <p className="whitespace-pre-wrap">{data.actions}</p>
          </div>
        </>
      )}

      {data.reactions && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground  mb-3">Reactions</h3>
            <p className="whitespace-pre-wrap">{data.reactions}</p>
          </div>
        </>
      )}

      {data.legendaryActions && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground  mb-3">Legendary Actions</h3>
            <p className="whitespace-pre-wrap">{data.legendaryActions}</p>
          </div>
        </>
      )}
    </div>
  );
};
