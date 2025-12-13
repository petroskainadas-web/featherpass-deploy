import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SpellViewProps {
  content: any;
}

export const SpellView = ({ content }: SpellViewProps) => {
  const data = content.content_data;

  return (
    <div className="space-y-6 font-crimson">
      <div>
        <h2 className="text-3xl font-cinzel font-bold text-foreground mb-2">{content.title}</h2>
        <p className="text-lg text-muted-foreground">
          Level {content.level} {data.school}
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-1 space-y-2 text-base">
        <div><strong style={{ color: '#BCAF8F' }}>Casting Time:</strong> {data.castingTime}</div>
        <div><strong style={{ color: '#BCAF8F' }}>Range:</strong> {data.range}</div>
        <div><strong style={{ color: '#BCAF8F' }}>Components:</strong> {data.components}</div>
        <div><strong style={{ color: '#BCAF8F' }}>Duration:</strong> {data.duration}</div>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-cinzel text-muted-foreground font-bold mb-2">Description</h3>
        <p className="whitespace-pre-wrap">{data.description}</p>
      </div>

      {data.atHigherLevels && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold text-muted-foreground mb-2">At Higher Levels</h3>
            <p className="whitespace-pre-wrap">{data.atHigherLevels}</p>
          </div>
        </>
      )}

      {data.classes && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Classes</h3>
            <p>{data.classes}</p>
          </div>
        </>
      )}
    </div>
  );
};
