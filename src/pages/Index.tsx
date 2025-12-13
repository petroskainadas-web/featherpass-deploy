import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Layout from "@/components/Layout";
import heroBackground from "@/assets/hero-background.jpg";
import homeBottomBackground from "@/assets/backgrounds/home-bottom-bg.jpg";
import { BookOpen, Users, Zap, Sparkles, ArrowRight, Download, Heart, Library, Clock, PenTool, Shield, Eye, Target, Swords, Wand2, Gem, User as UserIcon } from "lucide-react";
const Index = () => {
  const [recentContent, setRecentContent] = useState<any[]>([]);
  const [recentArticles, setRecentArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecentData();
  }, []);

  const fetchRecentData = async () => {
    try {
      // Fetch 3 most recent library content
      const { data: contentData, error: contentError } = await supabase
        .from("library_content")
        .select(`
          *,
          images:image_id (
            large_path,
            medium_path,
            thumbnail_path
          )
        `)
        .order("created_at", { ascending: false })
        .limit(3);

      if (contentError) throw contentError;

      // Process content to add image URLs
      const contentWithImages = contentData?.map(item => {
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

      setRecentContent(contentWithImages);

      // Fetch 2 most recent articles
      const { data: articlesData, error: articlesError } = await supabase
        .from("article_content")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(2);

      if (articlesError) throw articlesError;
      setRecentArticles(articlesData || []);
    } catch (error) {
      console.error("Error fetching recent data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getContentBadgeVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case "monster": return "monster";
      case "subclass": return "subclass";
      case "spell": return "spell";
      case "magic_item": return "item";
      case "npc": return "npc";
      case "subrace": return "subrace";
      default: return "secondary";
    }
  };

  const getArticleBadgeVariant = (category: string) => {
    switch (category) {
      case "Design Notes": return "design-notes";
      case "Plot Crafting": return "lore-essays";
      case "Worldbuilding Tips": return "world-building";
      default: return "secondary";
    }
  };

  const getArticleGlow = (category: string) => {
    switch (category) {
      case "Design Notes": return "hover:shadow-[0_10px_20px_-5px] hover:shadow-article-design/20";
      case "Plot Crafting": return "hover:shadow-[0_10px_20px_-5px] hover:shadow-article-lore/20";
      case "Worldbuilding Tips": return "hover:shadow-[0_10px_20px_-5px] hover:shadow-article-art/20";
      default: return "hover:shadow-deep";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "monster": return Target;
      case "subclass": return Swords;
      case "spell": return Wand2;
      case "magic_item": return Gem;
      case "npc": return UserIcon;
      case "subrace": return Users;
      default: return BookOpen;
    }
  };
  const stats = [{
    icon: BookOpen,
    label: "Free Resources",
    value: "50+"
  }, {
    icon: Users,
    label: "Community Members",
    value: "1k+"
  }, {
    icon: Download,
    label: "Downloads",
    value: "500+"
  }, {
    icon: Shield,
    label: "Playtesting Sessions",
    value: "100+"
  }];
  return <Layout>
      {/* Hero Section */}
<section
  className="relative min-h-screen flex items-center justify-center bg-center bg-no-repeat bg-cover"
  // 1. Image as the sole background layer
  style={{ backgroundImage: `url(${heroBackground})` }}
>
  {/* Overlay Container: pointer-events-none ensures content remains clickable */}
  <div className="pointer-events-none absolute inset-0">
    
    {/* 🌟 NEW: Opacity Wrapper (Adjust the 'opacity-60' value as needed) 🌟 */}
    <div className="absolute inset-0 opacity-70"> 
      
      {/* Gradient Overlay: Applies the opaque --gradient-hero with mix-blend-overlay */}
      {/* The blend mode is applied to the opaque gradient, and the parent wrapper handles the transparency. */}
      <div 
        className="absolute inset-0 mix-blend-overlay"
        style={{ backgroundImage: `var(--gradient-hero)` }} 
      ></div>
      
    </div>
    
  </div>
  
  <div className="relative container mx-auto px-4 text-center">
    <div className="max-w-4xl mx-auto">

            {/*<a 
              href="https://www.kickstarter.com/projects/featherpass/placeholder" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mb-6 relative -translate-y-12 md:-translate-y-16"
            >
              <Badge 
                variant="secondary" 
                className="text-xl px-8 py-3 font-cinzel animate-pulse-glow cursor-pointer hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Kickstarter Live !!!
              </Badge>
            </a>*/}
            
            <h3 
              className="text-7xl md:text-9xl font-cinzel font-bold mb-4 text-brushed-steel-outlined"
              data-text="Featherpass"
            >
              Featherpass
            </h3>
            
            <p className="text-lg md:text-6xl font-tangerine mb-8 leading-relaxed max-w-3xl mx-auto bold text-logo-gold">
              Chart your Journey · Shape your Destiny
            </p>
            
            <p className="text-xl md:text-2xl text-foreground font-crimson mb-12 leading-relaxed max-w-2xl mx-auto">
              Discover epic homebrew content for your campaigns. From fearsome monsters to powerful subclasses, 
              dive into a world of limitless adventure.
            </p>
            
          
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
            const Icon = stat.icon;
            return <div key={index} className="text-center">
                  <Icon className="w-8 h-8 mx-auto mb-4 text-secondary" />
                  <div className="text-3xl font-cinzel font-bold text-foreground mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground font-crimson">
                    {stat.label}
                  </div>
                </div>;
          })}
          </div>
        </div>
      </section>

      {/* Recent Content & Articles - With Static Background */}
      <section 
        className="relative pt-20 pb-20 bg-center bg-no-repeat bg-cover"
        style={{ backgroundImage: `url(${homeBottomBackground})` }}
      >
        {/* Gradient Overlay */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-85">
            <div
              className="absolute inset-0 mix-blend-overlay"
              style={{ backgroundImage: 'var(--gradient-hero)' }}
            />
          </div>
        </div>
        
        <div className="relative container mx-auto px-4">
          {/* Recent Content */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cinzel font-bold text-logo-gold mb-4">
              Recent Content
            </h2>
            <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
              See our latest, ready-to-use homebrew content, all set to inspire or enhance your campaigns. 
            </p>
          </div>

          {loading ? (
            <p className="text-center text-muted-foreground">Loading recent content...</p>
          ) : recentContent.length === 0 ? (
            <p className="text-center text-muted-foreground">No content available yet</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentContent.map((content) => {
                const TypeIcon = getTypeIcon(content.content_type);
                
                // Get description based on content type
                let description = "No description available";
                if (content.content_type === 'monster') {
                  description = content.content_data?.lore || description;
                } else if (content.content_type === 'npc') {
                  description = content.content_data?.background || description;
                } else if (content.content_type === 'subclass') {
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
                        </div>
                        {content.imageUrl && (
                          <div className="w-24 h-24 rounded-lg overflow-hidden border border-border shadow-md flex-shrink-0">
                            <img 
                              src={content.imageUrl} 
                              alt={content.title}
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
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/library">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-1" />
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          <div className="text-center mt-12 mb-20">
            <Button size="lg" variant="outline" asChild><Link to="/library">
              <Library className="w-5 h-5 mr-2" />
              Browse Library
            </Link></Button>
          </div>

          {/* Recent Articles Section */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-cinzel font-bold text-logo-gold mb-8 text-center">
              Recent Articles
            </h2>
            <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
              Read our latest articles for insights on a variety of subjects. 
            </p>
          </div>
          
          {loading ? (
            <p className="text-center text-muted-foreground">Loading recent articles...</p>
          ) : recentArticles.length === 0 ? (
            <p className="text-center text-muted-foreground">No articles available yet</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {recentArticles.map((article) => (
                <Card 
                  key={article.id} 
                  className={`bg-gradient-card border-border shadow-fantasy transition-all duration-300 ${getArticleGlow(article.article_type)}`}
                >
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={getArticleBadgeVariant(article.article_type)} className="text-xs">
                        {article.article_type}
                      </Badge>
                    </div>
                    <CardTitle className="font-cinzel text-xl text-foreground hover:text-secondary transition-colors">
                      <Link to={`/articles/${article.id}`}>
                        {article.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="font-crimson text-muted-foreground mb-4 leading-relaxed">
                      {article.tldr}
                    </CardDescription>
                    
                    <Link 
                      to={`/articles/${article.id}`}
                      className="font-cinzel text-base text-secondary hover:text-secondary/80 transition-colors block mb-4"
                    >
                      Read more →
                    </Link>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground font-crimson">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {article.read_time} min read
                        </span>
                        <span className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          {article.view_count}
                        </span>
                        <span className="flex items-center">
                          <Heart className="w-4 h-4 mr-1" />
                          {article.like_count}
                        </span>
                      </div>
                      <span>{new Date(article.published_date).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          {/* Browse All Articles Button */}
          <div className="text-center mt-12">
            <Button size="lg" variant="outline" asChild><Link to="/articles">
              <PenTool className="w-5 h-5 mr-2" />
              Browse Journal
            </Link></Button>
          </div>
        </div>
      </section>
    
      {/* Newsletter CTA */}
      <section className="py-20 bg-gradient-hero">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <Zap className="w-16 h-16 mx-auto mb-6 text-secondary" />
            <h2 className="text-4xl font-cinzel font-bold text-foreground mb-4">
              Stay in the Loop
            </h2>
            <p className="text-xl text-muted-foreground font-crimson mb-8">
              Get exclusive previews, behind-the-scenes content, and be the first to know 
              about our Kickstarter launch.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button size="lg" variant="hero" className="flex-1" asChild><Link to="/newsletter">
                  Subscribe Now
                </Link></Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Index;
