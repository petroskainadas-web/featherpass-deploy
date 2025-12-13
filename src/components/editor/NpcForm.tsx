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

interface NpcFormProps {
  editContent?: any;
  onSuccess?: () => void;
}

const NpcForm = ({ editContent, onSuccess }: NpcFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [imageId, setImageId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<PdfUploadData | null>(null);
  const [existingPdf, setExistingPdf] = useState<{fileName: string; fileSize: number; description?: string} | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    background: "",
    race: "",
    subrace: "",
    class: "",
    subclass: "",
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

  const races = ["Angelborn", "Dragonborn", "Dwarf", "Elf", "Fiendspawn", "Gnome", "Halfling", "Human", "Orc"];
  const classes = ["Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"];
  const alignments = ["LG", "NG", "CG", "LN", "N", "CN", "LE", "NE", "CE"];

  useEffect(() => {
    if (editContent) {
      const data = editContent.content_data;
      setFormData({
        name: editContent.title,
        background: data.background || "",
        race: data.race || "",
        subrace: data.subrace || "",
        class: data.class || "",
        subclass: data.subclass || "",
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
        background: formData.background,
        race: formData.race,
        subrace: formData.subrace,
        class: formData.class,
        subclass: formData.subclass,
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
        toast({ title: "Success!", description: "NPC updated successfully" });
      } else {
        const { error } = await supabase.from("library_content").insert({
          title: formData.name,
          content_type: "npc",
          level: formData.challenge,
          content_data: contentData,
          tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : [],
          created_by: user.id,
          image_id: imageId,
          pdf_id: pdfId,
        });

        if (error) throw error;
        toast({ title: "Success!", description: "NPC added to library" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          name: "",
          background: "",
          race: "",
          subrace: "",
          class: "",
          subclass: "",
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
        <CardTitle>{editContent ? "Edit NPC" : "Add New NPC"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">NPC Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="background">Background & Agenda</Label>
            <Textarea
              id="background"
              value={formData.background}
              onChange={(e) => updateField("background", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="race">Race *</Label>
              <Select value={formData.race} onValueChange={(value) => updateField("race", value)} required>
                <SelectTrigger id="race">
                  <SelectValue placeholder="Select race" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Angelborn">Angelborn</SelectItem>
                  <SelectItem value="Dragonborn">Dragonborn</SelectItem>
                  <SelectItem value="Dwarf">Dwarf</SelectItem>
                  <SelectItem value="Elf">Elf</SelectItem>
                  <SelectItem value="Fiendspawn">Fiendspawn</SelectItem>
                  <SelectItem value="Gnome">Gnome</SelectItem>
                  <SelectItem value="Halfling">Halfling</SelectItem>
                  <SelectItem value="Human">Human</SelectItem>
                  <SelectItem value="Orc">Orc</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="class">Class *</Label>
              <Select value={formData.class} onValueChange={(value) => updateField("class", value)} required>
                <SelectTrigger id="class">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Artificer">Artificer</SelectItem>
                  <SelectItem value="Barbarian">Barbarian</SelectItem>
                  <SelectItem value="Bard">Bard</SelectItem>
                  <SelectItem value="Cleric">Cleric</SelectItem>
                  <SelectItem value="Druid">Druid</SelectItem>
                  <SelectItem value="Fighter">Fighter</SelectItem>
                  <SelectItem value="Monk">Monk</SelectItem>
                  <SelectItem value="Paladin">Paladin</SelectItem>
                  <SelectItem value="Ranger">Ranger</SelectItem>
                  <SelectItem value="Rogue">Rogue</SelectItem>
                  <SelectItem value="Sorcerer">Sorcerer</SelectItem>
                  <SelectItem value="Warlock">Warlock</SelectItem>
                  <SelectItem value="Wizard">Wizard</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="alignment">Alignment</Label>
              <Select value={formData.alignment} onValueChange={(value) => updateField("alignment", value)}>
                <SelectTrigger id="alignment">
                  <SelectValue placeholder="Select alignment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LG">LG</SelectItem>
                  <SelectItem value="NG">NG</SelectItem>
                  <SelectItem value="CG">CG</SelectItem>
                  <SelectItem value="LN">LN</SelectItem>
                  <SelectItem value="N">N</SelectItem>
                  <SelectItem value="CN">CN</SelectItem>
                  <SelectItem value="LE">LE</SelectItem>
                  <SelectItem value="NE">NE</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subrace">Subrace</Label>
              <Input
                id="subrace"
                value={formData.subrace}
                onChange={(e) => updateField("subrace", e.target.value)}
                placeholder="e.g., Mountain Dwarf"
              />
            </div>
            <div>
              <Label htmlFor="subclass">Subclass</Label>
              <Input
                id="subclass"
                value={formData.subclass}
                onChange={(e) => updateField("subclass", e.target.value)}
                placeholder="e.g., Battle Master"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="ac">AC *</Label>
              <Input
                id="ac"
                value={formData.ac}
                onChange={(e) => updateField("ac", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="acType">AC Type</Label>
              <Input
                id="acType"
                value={formData.acType}
                onChange={(e) => updateField("acType", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="hp">HP *</Label>
              <Input
                id="hp"
                value={formData.hp}
                onChange={(e) => updateField("hp", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="hitDice">Hit Dice</Label>
              <Input
                id="hitDice"
                value={formData.hitDice}
                onChange={(e) => updateField("hitDice", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="speed">Speed *</Label>
            <Input
              id="speed"
              value={formData.speed}
              onChange={(e) => updateField("speed", e.target.value)}
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
                required
              />
            </div>
            <div>
              <Label htmlFor="dex">DEX *</Label>
              <Input
                id="dex"
                value={formData.dex}
                onChange={(e) => updateField("dex", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="con">CON *</Label>
              <Input
                id="con"
                value={formData.con}
                onChange={(e) => updateField("con", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="int">INT *</Label>
              <Input
                id="int"
                value={formData.int}
                onChange={(e) => updateField("int", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="wis">WIS *</Label>
              <Input
                id="wis"
                value={formData.wis}
                onChange={(e) => updateField("wis", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="cha">CHA *</Label>
              <Input
                id="cha"
                value={formData.cha}
                onChange={(e) => updateField("cha", e.target.value)}
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
              placeholder="e.g., Str +5, Dex +3"
            />
          </div>

          <div>
            <Label htmlFor="skills">Skills</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => updateField("skills", e.target.value)}
              placeholder="e.g., Perception +4, Stealth +6"
            />
          </div>

          <div>
            <Label htmlFor="damageResistances">Damage Resistances</Label>
            <Input
              id="damageResistances"
              value={formData.damageResistances}
              onChange={(e) => updateField("damageResistances", e.target.value)}
              placeholder="e.g., Fire, Cold"
            />
          </div>

          <div>
            <Label htmlFor="damageImmunities">Damage Immunities</Label>
            <Input
              id="damageImmunities"
              value={formData.damageImmunities}
              onChange={(e) => updateField("damageImmunities", e.target.value)}
              placeholder="e.g., Poison, Psychic"
            />
          </div>

          <div>
            <Label htmlFor="conditionImmunities">Condition Immunities</Label>
            <Input
              id="conditionImmunities"
              value={formData.conditionImmunities}
              onChange={(e) => updateField("conditionImmunities", e.target.value)}
              placeholder="e.g., Charmed, Frightened"
            />
          </div>

          <div>
            <Label htmlFor="senses">Senses</Label>
            <Input
              id="senses"
              value={formData.senses}
              onChange={(e) => updateField("senses", e.target.value)}
              placeholder="e.g., Darkvision 60 ft., passive Perception 14"
            />
          </div>

          <div>
            <Label htmlFor="languages">Languages</Label>
            <Input
              id="languages"
              value={formData.languages}
              onChange={(e) => updateField("languages", e.target.value)}
              placeholder="e.g., Common, Elvish"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="challenge">Challenge Rating</Label>
              <Input
                id="challenge"
                value={formData.challenge}
                onChange={(e) => updateField("challenge", e.target.value)}
                placeholder="e.g., CR 5"
              />
            </div>
            <div>
              <Label htmlFor="proficiencyBonus">Proficiency Bonus</Label>
              <Input
                id="proficiencyBonus"
                value={formData.proficiencyBonus}
                onChange={(e) => updateField("proficiencyBonus", e.target.value)}
                placeholder="e.g., +3"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={formData.features}
              onChange={(e) => updateField("features", e.target.value)}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="actions">Actions (one per line)</Label>
            <Textarea
              id="actions"
              value={formData.actions}
              onChange={(e) => updateField("actions", e.target.value)}
              rows={4}
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
              placeholder="quest giver, merchant, ally"
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? (editContent ? "Updating..." : "Publishing...") : (editContent ? "Update NPC" : "Publish NPC")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default NpcForm;
