import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./ImageUpload";
import { PdfUpload } from "./PdfUpload";
import { uploadPdf, fetchPdfMetadata, type PdfUploadData } from "@/lib/pdfUploadHelper";

interface MonsterFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const MonsterForm = ({ editContent, onSuccess }: MonsterFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const sizes = ["Tiny", "Small", "Medium", "Large", "Huge", "Gargantuan"];
  const types = ["Axiarch (Seraph)", "Axiarch (Tyrant)", "Beast", "Celestial (Angel)", "Celestial (Archon)", "Construct", "Dragon", "Entropian (Aberration)", "Entropian (Fluiform)", "Elemental", "Fey", "Fiend (Demon)", "Fiend (Devil)", "Giant", "Humanoid", "Monstrosity", "Ooze", "Plant", "Undead"];
  const alignments = ["LG", "NG", "CG", "LN", "N", "CN", "LE", "NE", "CE"];

  const [formData, setFormData] = useState({
    name: "",
    lore: "",
    size: "",
    type: "",
    alignment: "",
    ac: "",
    acType: "",
    hp: "",
    hitDice: "",
    speed: "",
    str: "",
    dex: "",
    con: "",
    int: "",
    wis: "",
    cha: "",
    savingThrows: "",
    skills: "",
    damageResistances: "",
    damageImmunities: "",
    conditionImmunities: "",
    senses: "",
    languages: "",
    challenge: "",
    proficiencyBonus: "",
    features: "",
    actions: "",
    reactions: "",
    legendaryActions: "",
    tags: "",
  });

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      setFormData({
        name: editContent.title,
        lore: data.lore || "",
        size: data.size || "",
        type: data.type || "",
        alignment: data.alignment || "",
        ac: data.ac || "",
        acType: data.acType || "",
        hp: data.hp || "",
        hitDice: data.hitDice || "",
        speed: data.speed || "",
        str: data.stats?.str || "",
        dex: data.stats?.dex || "",
        con: data.stats?.con || "",
        int: data.stats?.int || "",
        wis: data.stats?.wis || "",
        cha: data.stats?.cha || "",
        savingThrows: data.savingThrows || "",
        skills: data.skills || "",
        damageResistances: data.damageResistances || "",
        damageImmunities: data.damageImmunities || "",
        conditionImmunities: data.conditionImmunities || "",
        senses: data.senses || "",
        languages: data.languages || "",
        challenge: data.challenge || "",
        proficiencyBonus: data.proficiencyBonus || "",
        features: data.features || "",
        actions: data.actions || "",
        reactions: data.reactions || "",
        legendaryActions: data.legendaryActions || "",
        tags: editContent.tags?.join(", ") || "",
      });
      setImageId(editContent.image_id || null);
      
      // Fetch image URL if image_id exists
      if (editContent.image_id) {
        fetchImageUrl(editContent.image_id);
      }
      if (editContent.pdf_id) {
        fetchPdfData(editContent.pdf_id);
      }
    }
  }, [editContent]);

  const fetchPdfData = async (pdfId: string) => {
    const metadata = await fetchPdfMetadata(pdfId);
    if (metadata) {
      setExistingPdf({
        fileName: metadata.file_name,
        fileSize: metadata.file_size,
        description: metadata.description || undefined,
      });
    }
  };

  const fetchImageUrl = async (imgId: string) => {
    const { data } = await supabase
      .from('images')
      .select('large_path, medium_path, thumbnail_path')
      .eq('id', imgId)
      .single();
    
    if (data) {
      const imagePath = data.large_path || data.medium_path || data.thumbnail_path;
      if (imagePath) {
        const { data: { publicUrl } } = supabase.storage
          .from('content-images')
          .getPublicUrl(imagePath);
        setImageUrl(publicUrl);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const contentData = {
        lore: formData.lore,
        size: formData.size,
        type: formData.type,
        alignment: formData.alignment,
        ac: formData.ac,
        acType: formData.acType,
        hp: formData.hp,
        hitDice: formData.hitDice,
        speed: formData.speed,
        stats: {
          str: formData.str,
          dex: formData.dex,
          con: formData.con,
          int: formData.int,
          wis: formData.wis,
          cha: formData.cha,
        },
        savingThrows: formData.savingThrows,
        skills: formData.skills,
        damageResistances: formData.damageResistances,
        damageImmunities: formData.damageImmunities,
        conditionImmunities: formData.conditionImmunities,
        senses: formData.senses,
        languages: formData.languages,
        challenge: formData.challenge,
        proficiencyBonus: formData.proficiencyBonus,
        features: formData.features,
        actions: formData.actions,
        reactions: formData.reactions,
        legendaryActions: formData.legendaryActions,
      };

      // Upload PDF if provided
      const pdfId = await uploadPdf(pdfData, user.id, editContent?.pdf_id);

      if (editContent) {
        const { error } = await supabase
          .from("library_content")
          .update({
            title: formData.name,
            level: formData.challenge,
            content_data: contentData,
            tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
            image_id: imageId,
            pdf_id: pdfId,
          })
          .eq("id", editContent.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Monster updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "monster",
          level: formData.challenge,
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          image_id: imageId,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "Monster added to library" });
      }
      
      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          lore: "",
          size: "",
          type: "",
          alignment: "",
          ac: "",
          acType: "",
          hp: "",
          hitDice: "",
          speed: "",
          str: "",
          dex: "",
          con: "",
          int: "",
          wis: "",
          cha: "",
          savingThrows: "",
          skills: "",
          damageResistances: "",
          damageImmunities: "",
          conditionImmunities: "",
          senses: "",
          languages: "",
          challenge: "",
          proficiencyBonus: "",
          features: "",
          actions: "",
          reactions: "",
          legendaryActions: "",
          tags: "",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editContent ? "Edit Monster" : "Add New Monster"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Monster Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="lore">Monster Lore</Label>
            <Textarea
              id="lore"
              value={formData.lore}
              onChange={(e) => updateField("lore", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="size">Size *</Label>
              <Select value={formData.size} onValueChange={(value) => updateField("size", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map(size => (
                    <SelectItem key={size} value={size}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Type *</Label>
              <Select value={formData.type} onValueChange={(value) => updateField("type", value)} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alignment">Alignment</Label>
              <Select value={formData.alignment} onValueChange={(value) => updateField("alignment", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  {alignments.map(alignment => (
                    <SelectItem key={alignment} value={alignment}>{alignment}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ac">AC *</Label>
              <Input
                id="ac"
                value={formData.ac}
                onChange={(e) => updateField("ac", e.target.value)}
                placeholder="17"
                required
              />
            </div>
            <div>
              <Label htmlFor="acType">AC Type</Label>
              <Input
                id="acType"
                value={formData.acType}
                onChange={(e) => updateField("acType", e.target.value)}
                placeholder="natural armor"
              />
            </div>
            <div>
              <Label htmlFor="hp">HP *</Label>
              <Input
                id="hp"
                value={formData.hp}
                onChange={(e) => updateField("hp", e.target.value)}
                placeholder="136"
                required
              />
            </div>
            <div>
              <Label htmlFor="hitDice">Hit Dice</Label>
              <Input
                id="hitDice"
                value={formData.hitDice}
                onChange={(e) => updateField("hitDice", e.target.value)}
                placeholder="16d10 + 48"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="speed">Speed *</Label>
            <Input
              id="speed"
              value={formData.speed}
              onChange={(e) => updateField("speed", e.target.value)}
              placeholder="30 ft., fly 80 ft."
              required
            />
          </div>

          <div className="grid grid-cols-6 gap-4">
            <div>
              <Label htmlFor="str">STR *</Label>
              <Input
                id="str"
                value={formData.str}
                onChange={(e) => updateField("str", e.target.value)}
                placeholder="19 (+4)"
                required
              />
            </div>
            <div>
              <Label htmlFor="dex">DEX *</Label>
              <Input
                id="dex"
                value={formData.dex}
                onChange={(e) => updateField("dex", e.target.value)}
                placeholder="10 (+0)"
                required
              />
            </div>
            <div>
              <Label htmlFor="con">CON *</Label>
              <Input
                id="con"
                value={formData.con}
                onChange={(e) => updateField("con", e.target.value)}
                placeholder="17 (+3)"
                required
              />
            </div>
            <div>
              <Label htmlFor="int">INT *</Label>
              <Input
                id="int"
                value={formData.int}
                onChange={(e) => updateField("int", e.target.value)}
                placeholder="16 (+3)"
                required
              />
            </div>
            <div>
              <Label htmlFor="wis">WIS *</Label>
              <Input
                id="wis"
                value={formData.wis}
                onChange={(e) => updateField("wis", e.target.value)}
                placeholder="13 (+1)"
                required
              />
            </div>
            <div>
              <Label htmlFor="cha">CHA *</Label>
              <Input
                id="cha"
                value={formData.cha}
                onChange={(e) => updateField("cha", e.target.value)}
                placeholder="15 (+2)"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="savingThrows">Saving Throws</Label>
            <Input
              id="savingThrows"
              value={formData.savingThrows}
              onChange={(e) => updateField("savingThrows", e.target.value)}
              placeholder="Dex +6, Con +10, Wis +7, Cha +9"
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => updateField("skills", e.target.value)}
              placeholder="Perception +14, Stealth +6"
            />
          </div>

          <div>
            <Label htmlFor="damageResistances">Damage Resistances</Label>
            <Input
              id="damageResistances"
              value={formData.damageResistances}
              onChange={(e) => updateField("damageResistances", e.target.value)}
              placeholder="bludgeoning, piercing, and slashing from nonmagical attacks"
            />
          </div>

          <div>
            <Label htmlFor="damageImmunities">Damage Immunities</Label>
            <Input
              id="damageImmunities"
              value={formData.damageImmunities}
              onChange={(e) => updateField("damageImmunities", e.target.value)}
              placeholder="fire, poison"
            />
          </div>

          <div>
            <Label htmlFor="conditionImmunities">Condition Immunities</Label>
            <Input
              id="conditionImmunities"
              value={formData.conditionImmunities}
              onChange={(e) => updateField("conditionImmunities", e.target.value)}
              placeholder="charmed, frightened, paralyzed, poisoned"
            />
          </div>

          <div>
            <Label htmlFor="senses">Senses</Label>
            <Input
              id="senses"
              value={formData.senses}
              onChange={(e) => updateField("senses", e.target.value)}
              placeholder="darkvision 120 ft., passive Perception 24"
            />
          </div>

          <div>
            <Label htmlFor="languages">Languages</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => updateField("languages", e.target.value)}
              placeholder="Common, Draconic"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challenge">Challenge Rating *</Label>
              <Input
                id="challenge"
                value={formData.challenge}
                onChange={(e) => updateField("challenge", e.target.value)}
                placeholder="e.g., 5 (1,800 XP)"
                required
              />
            </div>
            <div>
              <Label htmlFor="proficiencyBonus">Proficiency Bonus</Label>
              <Input
                id="proficiencyBonus"
                value={formData.proficiencyBonus}
                onChange={(e) => updateField("proficiencyBonus", e.target.value)}
                placeholder="+3"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => updateField("features", e.target.value)}
              rows={5}
              placeholder="Feature Name: Description"
            />
          </div>

          <div>
            <Label htmlFor="actions">Actions (one per line)</Label>
            <Textarea
              id="actions"
              value={formData.actions}
              onChange={(e) => updateField("actions", e.target.value)}
              rows={5}
              placeholder="Action Name: Description"
            />
          </div>

          <div>
            <Label htmlFor="reactions">Reactions (optional)</Label>
            <Textarea
              id="reactions"
              value={formData.reactions}
              onChange={(e) => updateField("reactions", e.target.value)}
              rows={3}
              placeholder="Reaction Name: Description"
            />
          </div>

          <div>
            <Label htmlFor="legendaryActions">Legendary Actions (optional)</Label>
            <Textarea
              id="legendaryActions"
              value={formData.legendaryActions}
              onChange={(e) => updateField("legendaryActions", e.target.value)}
              rows={3}
              placeholder="Legendary Action Name: Description"
            />
          </div>

          <ImageUpload
            currentImageId={imageId}
            currentImageUrl={imageUrl}
            onImageUploaded={setImageId}
          />

          <PdfUpload
            onPdfChange={setPdfData}
            existingPdf={existingPdf || undefined}
          />

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="dragon, underdark, boss"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update Monster" : "Publish Monster")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MonsterForm;
