import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import Layout from "@/components/Layout";
import { MonsterView } from "@/components/library/MonsterView";
import { SpellView } from "@/components/library/SpellView";
import { MagicItemView } from "@/components/library/MagicItemView";
import { SubclassView } from "@/components/library/SubclassView";
import { SubraceView } from "@/components/library/SubraceView";
import { NpcView } from "@/components/library/NpcView";
import { FeatView } from "@/components/library/FeatView";
import { 
  Search, 
  Download, 
  Eye,
  BookOpen,
  Target,
  Swords,
  Gem,
  User,
  Users,
  Wand2,
  Award
} from "lucide-react";
import { handlePdfDownload } from "@/lib/downloadHelper";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import libraryBackground from "@/assets/backgrounds/library-bg.jpg";

const Library = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [libraryContent, setLibraryContent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{[key: string]: number}>({});
  const [displayCount, setDisplayCount] = useState(18);
  const [totalCount, setTotalCount] = useState(0);

  const handleViewContent = (content: any) => {
    setSelectedContent(content);
    setDialogOpen(true);
  };

  const handleDownload = async (content: any) => {
    if (!content.pdf_id) {
      toast({
        title: "No PDF available",
        description: "This content doesn't have a PDF file attached.",
        variant: "destructive",
      });
      return;
    }

    setDownloadingId(content.id);
    setDownloadProgress(prev => ({ ...prev, [content.id]: 0 }));
    
    try {
      await handlePdfDownload(content.id, (progress) => {
        setDownloadProgress(prev => ({ ...prev, [content.id]: progress }));
      });
      
      // Optimistically update download count
      setLibraryContent(prev => 
        prev.map(item => 
          item.id === content.id 
            ? { ...item, download_count: (item.download_count || 0) + 1 }
            : item
        )
      );
      
      toast({
        title: "Download complete",
        description: `${content.title} downloaded successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Download failed",
        description: error.message || "Failed to download PDF",
        variant: "destructive",
      });
    } finally {
      setDownloadingId(null);
      setDownloadProgress(prev => {
        const updated = { ...prev };
        delete updated[content.id];
        return updated;
      });
    }
  };

  const renderContentView = () => {
    if (!selectedContent) return null;

    switch (selectedContent.content_type) {
      case 'monster':
        return <MonsterView content={selectedContent} />;
      case 'spell':
        return <SpellView content={selectedContent} />;
      case 'magic_item':
        return <MagicItemView content={selectedContent} />;
      case 'subclass':
        return <SubclassView content={selectedContent} />;
      case 'subrace':
        return <SubraceView content={selectedContent} />;
      case 'npc':
        return <NpcView content={selectedContent} />;
      case 'feat':
        return <FeatView content={selectedContent} />;
      default:
        return <div>Content type not supported</div>;
    }
  };

  const contentTypes = [
    { value: "all", label: "All Content" },
    { value: "monster", label: "Monsters", icon: Target },
    { value: "subclass", label: "Subclasses", icon: Swords },
    { value: "spell", label: "Spells", icon: Wand2 },
    { value: "magic_item", label: "Magic Items", icon: Gem },
    { value: "npc", label: "NPCs", icon: User },
    { value: "subrace", label: "Subraces", icon: Users },
    { value: "feat", label: "Feats", icon: Award },
  ];

  useEffect(() => {
    fetchContent();
  }, [selectedType, sortOrder]);

  useEffect(() => {
    fetchTotalCount();
  }, [selectedType]);

  const fetchContent = async () => {
    setLoading(true);
    try {
      const itemsToFetch = selectedType === "all" ? 18 : 9;
      
      let query = supabase
        .from("library_content")
        .select(`
          id,
          title,
          content_type,
          level,
          rarity,
          tags,
          download_count,
          created_at,
          updated_at,
          content_data,
          pdf_id,
          image_id,
          images:image_id (
            large_path,
            medium_path,
            thumbnail_path,
            alt_text
          )
        `)
        .order("created_at", { ascending: sortOrder === "oldest" })
        .range(0, itemsToFetch - 1);

      if (selectedType !== "all") {
        query = query.eq("content_type", selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to add image URLs
      const contentWithImages = data?.map(item => {
        if (item.images) {
          const imagePath = item.images.large_path || item.images.medium_path || item.images.thumbnail_path;
          if (imagePath) {
            const { data: { publicUrl } } = supabase.storage
              .from('content-images')
              .getPublicUrl(imagePath);

            return {
              ...item,
              imageUrl: publicUrl,
              imageAlt: item.images.alt_text || item.title,
            };
          }
        }
        return { ...item, imageUrl: null, imageAlt: item.title };
      }) || [];

      setLibraryContent(contentWithImages);
      setDisplayCount(itemsToFetch);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to fetch library content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCount = async () => {
    try {
      let query = supabase
        .from("library_content")
        .select("id", { count: "exact", head: true });

      if (selectedType !== "all") {
        query = query.eq("content_type", selectedType);
      }

      const { count, error } = await query;

      if (error) throw error;
      setTotalCount(count || 0);
    } catch (error) {
      console.error("Error fetching count:", error);
    }
  };

  const handleLoadMore = async () => {
    try {
      const itemsToFetch = 9;
      const newStart = displayCount;
      const newEnd = newStart + itemsToFetch - 1;

      let query = supabase
        .from("library_content")
        .select(`
          id,
          title,
          content_type,
          level,
          rarity,
          tags,
          download_count,
          created_at,
          updated_at,
          content_data,
          pdf_id,
          images:image_id (
            large_path,
            medium_path,
            thumbnail_path
          )
        `)
        .order("created_at", { ascending: sortOrder === "oldest" })
        .range(newStart, newEnd);

      if (selectedType !== "all") {
        query = query.eq("content_type", selectedType);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to add image URLs
      const contentWithImages = data?.map(item => {
        if (item.images) {
          const imagePath = item.images.large_path || item.images.medium_path || item.images.thumbnail_path;
          if (imagePath) {
            const { data: { publicUrl } } = supabase.storage
              .from('content-images')
              .getPublicUrl(imagePath);
            return { ...item, imageUrl: publicUrl };
          }
        }
        return item;
      }) || [];

      setLibraryContent(prev => [...prev, ...contentWithImages]);
      setDisplayCount(prev => prev + itemsToFetch);
    } catch (error) {
      console.error("Error loading more content:", error);
      toast({
        title: "Error",
        description: "Failed to load more content",
        variant: "destructive",
      });
    }
  };

  const getTypeIcon = (type: string) => {
    const typeData = contentTypes.find(t => t.value === type);
    return typeData?.icon || BookOpen;
  };

  const filteredContent = libraryContent.filter(content => {
    const matchesSearch = content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         content.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <Layout backgroundImage={libraryBackground} enableParallax overlayOpacity={0.8}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            Free Content Library
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
            Discover homebrew monsters, subclasses, spells, and more. 
            All free, all ready for your campaigns.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading content...</p>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="col-span-full text-center py-12">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground mb-2">No content found matching "{searchTerm}"</p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>
                </>
              ) : selectedType !== "all" ? (
                <>
                  <p className="text-muted-foreground mb-2">No {selectedType}s available yet</p>
                  <p className="text-sm text-muted-foreground">Try selecting a different content type</p>
                </>
              ) : (
                <p className="text-muted-foreground">No content found matching your filters.</p>
              )}
            </div>
          ) : (
            filteredContent.map((content) => {
              const TypeIcon = getTypeIcon(content.content_type);
              
              // Get description based on content type
              let description = "No description available";
              if (content.content_type === 'monster') {
                description = content.content_data?.lore || description;
              } else if (content.content_type === 'npc') {
                description = content.content_data?.background || description;
              } else if (content.content_type === 'subclass') {
                description = content.content_data?.overview || description;
              } else if (content.content_type === 'feat') {
                description = content.content_data?.overview || description;
              } else {
                description = content.content_data?.description || 
                             content.content_data?.overview || 
                             content.content_data?.lore || 
                             description;
              }
              
              return (
                <Card key={content.id} className={`bg-gradient-card border-border shadow-fantasy transition-all duration-300 hover:scale-105 ${
                  content.content_type === 'monster'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--monster-color)/0.20)]'
                  : content.content_type === 'subclass'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--subclass-color)/0.20)]'
                  : content.content_type === 'spell'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--spell-color)/0.20)]'
                  : content.content_type === 'magic_item'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--item-color)/0.20)]'
                  : content.content_type === 'npc'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--npc-color)/0.20)]'
                  : content.content_type === 'subrace'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--subrace-color)/0.20)]'
                    : content.content_type === 'feat'
                    ? 'hover:shadow-[0_10px_20px_-5px_hsl(var(--feat-color)/0.20)]'
                  : 'hover:shadow-deep'
                }`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <TypeIcon className="w-4 h-4 text-secondary" />
                          <Badge variant={content.content_type as any} className="capitalize">
                            {content.content_type === "magic_item" ? "Magic Item" : content.content_type}
                          </Badge>
                        </div>
                        <CardTitle className="font-cinzel text-xl text-foreground">
                          {content.title}
                        </CardTitle>
                        
                        {/* Content-specific subtitle */}
                        {content.content_type === 'subclass' && content.content_data?.className && (
                          <div className="text-sm text-muted-foreground font-crimson">
                            {content.content_data.className}
                          </div>
                        )}
                        
                        {content.content_type === 'spell' && content.level && content.content_data?.school && (
                          <div className="text-sm text-muted-foreground font-crimson">
                            Level {content.level} {content.content_data.school}
                          </div>
                        )}
                        
                        {content.content_type === 'magic_item' && content.content_data?.itemType && content.rarity && (
                          <div className="text-sm font-crimson text-muted-foreground">
                            {content.content_data.itemType}, {content.rarity}
                          </div>
                        )}
                        
                        {(content.content_type === 'monster' || content.content_type === 'npc') && content.level && (
                          <div className="text-sm text-muted-foreground font-crimson">
                            CR: {content.level}
                          </div>
                        )}
                        
                        {content.content_type === 'subrace' && content.level && (
                          <div className="text-sm text-muted-foreground font-crimson">
                            {content.level}
                            </div>
                        )}
                        
                        {content.content_type === 'feat' && content.content_data?.category && (
                          <div className="text-sm text-muted-foreground font-crimson">
                            {content.content_data.category} Feat
                          </div>
                        )}
                      </div>
                      {content.imageUrl && (
                        <div className="w-24 h-24 rounded-lg overflow-hidden border border-border shadow-md flex-shrink-0">
                          <img
                            src={content.imageUrl}
                            alt={content.imageAlt || content.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-crimson text-muted-foreground mb-4 line-clamp-3">
                      {description}
                    </CardDescription>
                    
                    {content.tags && content.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {content.tags.slice(0, 3).map((tag: string, tagIndex: number) => (
                          <Badge key={tagIndex} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {content.tags.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{content.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground font-crimson">
                        <Download className="w-4 h-4 inline mr-1" />
                        {content.download_count?.toLocaleString() || 0}
                      </span>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => handleViewContent(content)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDownload(content)}
                          disabled={!content.pdf_id || downloadingId === content.id}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Load More */}
        <div className="text-center mt-12">
          <Button 
            size="lg" 
            variant="outline" 
            onClick={handleLoadMore}
            disabled={libraryContent.length >= totalCount}
          >
            {libraryContent.length >= totalCount ? "All Content Loaded" : "Load More Content"}
          </Button>
          <p className="text-sm text-muted-foreground font-crimson mt-4">
            Showing {libraryContent.length} of {totalCount} {selectedType === "all" ? "resources" : `${selectedType} resources`}
          </p>
        </div>
      </div>

      {/* View Content Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <ScrollArea className="max-h-[70vh] pr-4">
            {renderContentView()}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Legal Licensing Section */}
      <section className="mt-20 pt-12 border-t border-border">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 p-8 bg-card rounded-lg border border-border text-center">
          
          {/* Licensing */}
          <div>
            <h3 className="text-xl font-cinzel font-bold text-foreground mb-3">Licensing</h3>
            <p className="text-sm text-muted-foreground font-crimson mb-4">
              This content is licensed under open-licence terms. See our System Reference & Third-Party Licensing page.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/licensing">View Licensing Details</Link>
            </Button>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h3 className="text-xl font-cinzel font-bold text-foreground mb-3">Terms & Conditions</h3>
            <p className="text-sm text-muted-foreground font-crimson mb-4">
              Our world and works are © Featherpass. See our Featherpass IP & User License page.
            </p>
            <Button variant="outline" size="sm" asChild>
              <Link to="/terms">View Terms & Conditions</Link>
            </Button>
          </div>

        </div>
      </section>
    </Layout>
  );
};

export default Library;
