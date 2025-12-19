import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import MonsterForm from "@/components/editor/MonsterForm";
import SpellForm from "@/components/editor/SpellForm";
import MagicItemForm from "@/components/editor/MagicItemForm";
import SubraceForm from "@/components/editor/SubraceForm";
import NpcForm from "@/components/editor/NpcForm";
import SubclassForm from "@/components/editor/SubclassForm";
import FeatForm from "@/components/editor/FeatForm";
import { useDashboardContext } from "../context/DashboardContext";

const PublishContentPanel = () => {
  const {
    editingContent,
    finishContentEdit,
  } = useDashboardContext();
  const [activeTab, setActiveTab] = useState("monster");

  useEffect(() => {
    if (!editingContent) return;
    switch (editingContent.content_type) {
      case "monster":
        setActiveTab("monster");
        break;
      case "spell":
        setActiveTab("spell");
        break;
      case "magic_item":
        setActiveTab("magic_item");
        break;
      case "subrace":
        setActiveTab("subrace");
        break;
      case "npc":
        setActiveTab("npc");
        break;
      case "subclass":
        setActiveTab("subclass");
        break;
      case "feat":
        setActiveTab("feat");
        break;
      default:
        setActiveTab("monster");
    }
  }, [editingContent]);

  const handleSuccess = () => {
    finishContentEdit();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {editingContent ? "Edit Content" : "Publish New Content"}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {editingContent ? "Update the selected entry." : "Create a new entry for the library."}
            </p>
          </div>
          {editingContent && (
            <Button variant="outline" onClick={finishContentEdit}>
              Back to list
            </Button>
          )}
        </CardHeader>
        <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 gap-2">
            <TabsTrigger value="monster">Monster</TabsTrigger>
            <TabsTrigger value="spell">Spell</TabsTrigger>
            <TabsTrigger value="magic_item">Magic Item</TabsTrigger>
            <TabsTrigger value="subrace">Subrace</TabsTrigger>
            <TabsTrigger value="npc">NPC</TabsTrigger>
            <TabsTrigger value="subclass">Subclass</TabsTrigger>
            <TabsTrigger value="feat">Feat</TabsTrigger>
          </TabsList>
          <TabsContent value="monster" className="pt-6">
            <MonsterForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="spell" className="pt-6">
            <SpellForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="magic_item" className="pt-6">
            <MagicItemForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="subrace" className="pt-6">
            <SubraceForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="npc" className="pt-6">
            <NpcForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="subclass" className="pt-6">
             <SubclassForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
          <TabsContent value="feat" className="pt-6">
            <FeatForm editContent={editingContent} onSuccess={handleSuccess} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
    </div>
  );
};

export default PublishContentPanel;
