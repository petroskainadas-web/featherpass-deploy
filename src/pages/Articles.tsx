import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { 
  Clock, 
  Heart,
  Eye,
  BookOpen,
  Lightbulb,
  Earth,
  Search,
} from "lucide-react";
import articlesBackground from "@/assets/backgrounds/articles-bg.jpg";

const Articles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [displayCount, setDisplayCount] = useState(6);

  const [typeCounts, setTypeCounts] = useState({
    "Design Notes": 0,
    "Plot Crafting": 0,
    "Worldbuilding Tips": 0,
  });

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      // Fetch only needed columns, not full article bodies
      const { data, error } = await supabase
        .from("article_content")
        .select("id, title, article_type, tldr, tags, read_time, view_count, like_count, published_date")
        .order("published_date", { ascending: false });

      if (error) throw error;
      setArticles(data || []);

      // Calculate type counts
      const counts = {
        "Design Notes": data?.filter((a) => a.article_type === "Design Notes").length || 0,
        "Plot Crafting": data?.filter((a) => a.article_type === "Plot Crafting").length || 0,
        "Worldbuilding Tips": data?.filter((a) => a.article_type === "Worldbuilding Tips").length || 0,
      };
      setTypeCounts(counts);
    } catch (error: any) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
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

  const getCategoryGlow = (categoryName: string) => {
    switch (categoryName) {
      case "Design Notes": return "hover:shadow-[0_0_30px_-5px] hover:shadow-article-design/30";
      case "Plot Crafting": return "hover:shadow-[0_0_30px_-5px] hover:shadow-article-lore/30";
      case "Worldbuilding Tips": return "hover:shadow-[0_0_30px_-5px] hover:shadow-article-art/30";
      default: return "hover:shadow-deep";
    }
  };

  const articleCategories = [
    { name: "Design Notes", icon: Lightbulb, count: typeCounts["Design Notes"], color: "article-design" },
    { name: "Plot Crafting", icon: BookOpen, count: typeCounts["Plot Crafting"], color: "article-lore" },
    { name: "Worldbuilding Tips", icon: Earth, count: typeCounts["Worldbuilding Tips"], color: "article-art" },
  ];

  // Filter articles (sorting already handled by database query)
  const filteredArticles = articles.filter((article) => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.tldr.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || article.article_type === selectedType;
    return matchesSearch && matchesType;
  });

  const displayedArticles = filteredArticles.slice(0, displayCount);

  // Calculate popular/viral status
  const getArticleStatus = (article: any) => {
    const likePercentage = article.view_count > 0 ? (article.like_count / article.view_count) : 0;
    if (article.like_count >= 30 && likePercentage >= 0.60) return "viral";
    if (article.like_count >= 10 && likePercentage >= 0.30) return "popular";
    return null;
  };

  return (
    <Layout backgroundImage={articlesBackground} enableParallax overlayOpacity={0.80}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            Articles & Insights
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
            Deep dives into game design, worldbuilding, and the creative process behind the World of Ryon
          </p>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
        {articleCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card 
                key={index} 
                className={`bg-gradient-card border-border transition-all duration-300 cursor-pointer ${getCategoryGlow(category.name)}`}
              >
                <CardContent className="p-6 text-center">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <h3 className="font-cinzel font-semibold text-foreground mb-1">
                    {category.name}
                  </h3>
                  <p className="text-sm text-muted-foreground font-crimson">
                    {category.count} articles
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Search and Filters */}
        <div className="mb-8 p-6 bg-card rounded-lg border border-border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Article Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Articles</SelectItem>
                <SelectItem value="Design Notes">Design Notes</SelectItem>
                <SelectItem value="Plot Crafting">Plot Crafting</SelectItem>
                <SelectItem value="Worldbuilding Tips">Worldbuilding Tips</SelectItem>
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

        {/* Featured Articles */}
        <section className="mb-8">
          <h2 className="text-3xl font-cinzel font-bold text-foreground mb-8">Featured Articles</h2>
          
          {loading ? (
            <p className="text-center text-muted-foreground">Loading articles...</p>
          ) : displayedArticles.length === 0 ? (
            <div className="text-center py-12">
              {searchTerm ? (
                <>
                  <p className="text-muted-foreground mb-2">No articles found matching "{searchTerm}"</p>
                  <Button variant="link" onClick={() => setSearchTerm("")}>Clear search</Button>
                </>
              ) : selectedType !== "all" ? (
                <>
                  <p className="text-muted-foreground mb-2">No {selectedType} articles available yet</p>
                  <p className="text-sm text-muted-foreground">Try selecting a different article type</p>
                </>
              ) : (
                <p className="text-muted-foreground">No articles found</p>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {displayedArticles.map((article) => {
                  const status = getArticleStatus(article);
                  return (
                    <Card 
                      key={article.id} 
                      className={`bg-gradient-card border-border shadow-fantasy transition-all duration-300 ${getArticleGlow(article.article_type)}`}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getArticleBadgeVariant(article.article_type)} className="text-xs">
                            {article.article_type}
                          </Badge>
                          {status && (
                            <Badge variant="outline" className="text-xs border-secondary text-secondary">
                              {status === "viral" ? "Viral" : "Popular"}
                            </Badge>
                          )}
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
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground font-crimson mb-4">
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
                  );
                })}
              </div>

              {/* Load More Button */}
              <div className="text-center">
                <Button 
                  onClick={() => setDisplayCount(prev => prev + 6)}
                  variant="outline"
                  size="lg"
                  disabled={displayedArticles.length >= filteredArticles.length}
                >
                  {displayedArticles.length >= filteredArticles.length ? "All Articles Loaded" : "Load More Articles"}
                </Button>
                <p className="text-sm text-muted-foreground mt-2 font-crimson">
                  Showing {displayedArticles.length} of {filteredArticles.length} {selectedType === "all" ? "articles" : `${selectedType} articles`}
                </p>
              </div>
            </>
          )}
        </section>

        {/* Newsletter CTA */}
        <section className="mt-16 p-8 bg-gradient-hero rounded-lg text-center">
          <h2 className="text-3xl font-cinzel font-bold text-foreground mb-4">
            Never Miss an Update
          </h2>
          <p className="text-xl text-muted-foreground font-crimson mb-6 max-w-2xl mx-auto">
            Get notified when we publish new design insights, dev diaries, and behind-the-scenes content.
          </p>
          <Button size="lg" variant="hero" asChild>
            <Link to="/newsletter">
              Subscribe to Newsletter
            </Link>
          </Button>
        </section>
      </div>
    </Layout>
  );
};

export default Articles;
