import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface FeatViewProps {
  content: any;
}

export const FeatView = ({ content }: FeatViewProps) => {
  const data = content.content_data;

  return (
    <div className="space-y-6 font-crimson">
      <div>
        <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-2">{content.title}</h2>
        <p className="text-lg text-muted-foreground">
          {data.category} Feat
        </p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-cinzel text-muted-foreground font-bold mb-2">Overview</h3>
        <p className="text-foreground">{data.overview}</p>
      </div>

      <Separator />

      <div>
        <h3 className="text-lg font-cinzel text-muted-foreground font-bold mb-2">Full Description</h3>
        <p className="whitespace-pre-wrap">{data.fullDescription}</p>
      </div>

      {content.tags && content.tags.length > 0 && (
        <>
          <Separator />
          <div>
            <h3 className="text-lg font-cinzel font-bold mb-2">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {content.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
