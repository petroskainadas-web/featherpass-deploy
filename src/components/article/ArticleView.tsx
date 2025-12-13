import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Layout from "@/components/Layout";
import { Clock, Heart, Eye, ArrowLeft, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DOMPurify from "dompurify";

const ArticleView = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  useEffect(() => {
    fetchArticle();
    incrementViewCount();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from("article_content")
        .select("*")
        .eq("id", parseInt(id!))
        .single();

      if (error) throw error;
      setArticle(data);

      // Check if user has liked this article via localStorage
      const LIKES_KEY = 'article_likes';
      const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
      setHasLiked(likes.includes(parseInt(id!)));
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load article",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const incrementViewCount = async () => {
    try {
      await supabase.rpc("increment_article_views", { article_id: parseInt(id!) });
    } catch (error) {
      console.error("Failed to increment view count:", error);
    }
  };

  const handleLike = async () => {
    // Phase 2: Anonymous likes with localStorage tracking
    const LIKES_KEY = 'article_likes';
    const LAST_LIKE_KEY = 'last_like_time';

    // Client-side throttling: max 1 action per 2 seconds
    const lastLikeTime = localStorage.getItem(LAST_LIKE_KEY);
    if (lastLikeTime && Date.now() - parseInt(lastLikeTime) < 2000) {
      toast({
        title: "Please wait",
        description: "You're doing that too quickly",
        variant: "destructive",
      });
      return;
    }

    const likes = JSON.parse(localStorage.getItem(LIKES_KEY) || '[]');
    const articleId = parseInt(id!);
    const hasLikedLocally = likes.includes(articleId);

    setIsLiking(true);
    try {
      if (hasLikedLocally) {
        // Unlike
        const { error } = await supabase
          .from("article_likes")
          .delete()
          .eq("article_id", articleId);

        if (error) throw error;

        // Update localStorage
        localStorage.setItem(
          LIKES_KEY,
          JSON.stringify(likes.filter((id: number) => id !== articleId))
        );
        localStorage.setItem(LAST_LIKE_KEY, Date.now().toString());

        setHasLiked(false);
        setArticle((prev: any) => ({ ...prev, like_count: prev.like_count - 1 }));
        toast({
          title: "Article unliked",
        });
      } else {
        // Like
        const { error } = await supabase
          .from("article_likes")
          .insert({
            article_id: articleId,
            user_id: null, // Anonymous like
          });

        if (error) throw error;

        // Update localStorage
        localStorage.setItem(
          LIKES_KEY,
          JSON.stringify([...likes, articleId])
        );
        localStorage.setItem(LAST_LIKE_KEY, Date.now().toString());

        setHasLiked(true);
        setArticle((prev: any) => ({ ...prev, like_count: prev.like_count + 1 }));
        toast({
          title: "Article liked!",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLiking(false);
    }
  };

  const getArticleBadgeVariant = (type: string) => {
    switch (type) {
      case "Design Notes": return "design-notes";
      case "Plot Crafting": return "lore-essays";
      case "Worldbuilding Tips": return "world-building";
      default: return "secondary";
    }
  };

  const getArticleColor = (type: string) => {
    switch (type) {
      case "Design Notes": return "article-design";
      case "Plot Crafting": return "lore-essays";
      case "Worldbuilding Tips": return "article-art";
      default: return "secondary";
    }
  };

  const getArticleGlow = (type: string) => {
    switch (type) {
      case "Design Notes": return "shadow-[0_10px_30px_-5px] shadow-article-design/30";
      case "Plot Crafting": return "shadow-[0_10px_30px_-5px] shadow-article-lore/30";
      case "Worldbuilding Tips": return "shadow-[0_10px_30px_-5px] shadow-article-art/30";
      default: return "shadow-fantasy";
    }
  };

  // Markdown component configuration for consistent rendering
  const markdownComponents = {
    h1: ({ ...props }: any) => <h1 className="text-3xl font-cinzel font-bold mt-10 mb-5" {...props} />,
    h2: ({ ...props }: any) => <h2 className="text-2xl font-cinzel font-bold mt-8 mb-4" {...props} />,
    h3: ({ ...props }: any) => <h3 className="text-xl font-cinzel font-bold mt-6 mb-3" {...props} />,
    h4: ({ ...props }: any) => <h4 className="text-lg font-cinzel font-bold mt-5 mb-2" {...props} />,
    p: ({ ...props }: any) => <p className="mb-4 leading-relaxed" {...props} />,
    strong: ({ ...props }: any) => <strong className="font-bold" {...props} />,
    em: ({ ...props }: any) => <em className="italic" {...props} />,
    ul: ({ ...props }: any) => <ul className="list-disc list-inside mb-4 space-y-1 ml-2" {...props} />,
    ol: ({ ...props }: any) => <ol className="list-decimal list-inside mb-4 space-y-1 ml-2" {...props} />,
    li: ({ ...props }: any) => <li className="ml-4" {...props} />,
    blockquote: ({ ...props }: any) => <blockquote className="border-l-4 border-primary/50 pl-4 italic my-4 text-muted-foreground" {...props} />,
    a: ({ ...props }: any) => <a className="text-primary underline hover:text-primary/80 transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
  code: ({ inline, ...props }: any) => inline 
    ? <code className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono" {...props} />
    : <code className="block bg-muted p-4 rounded-lg text-sm font-mono overflow-x-auto mb-4" {...props} />,
  pre: ({ ...props }: any) => <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
  hr: ({ ...props }: any) => <hr className="my-8 border-border" {...props} />,
  table: ({ ...props }: any) => (
    <div className="overflow-x-auto mb-6">
      <table className="w-full border-collapse border border-border" {...props} />
    </div>
  ),
  thead: ({ ...props }: any) => <thead className="bg-muted/50" {...props} />,
  tbody: ({ ...props }: any) => <tbody {...props} />,
  tr: ({ ...props }: any) => <tr className="border-b border-border" {...props} />,
  th: ({ ...props }: any) => <th className="px-4 py-2 text-left font-semibold border border-border" {...props} />,
  td: ({ ...props }: any) => <td className="px-4 py-2 border border-border" {...props} />,
};

  // Sanitize and render markdown safely
  const renderMarkdown = (text: string) => {
    const sanitizedText = DOMPurify.sanitize(text);
    return (
      <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
        {sanitizedText}
      </ReactMarkdown>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <p className="text-center text-muted-foreground">Loading article...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!article) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-cinzel font-bold mb-4">Article Not Found</h1>
            <Button asChild>
              <Link to="/articles">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Articles
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  // Calculate badge status
  const likePercentage = article.view_count > 0 ? (article.like_count / article.view_count) : 0;
  const showPopular = article.like_count >= 50 && likePercentage >= 0.10;
  const showViral = article.like_count >= 200 && likePercentage >= 0.15;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" asChild className="mb-6">
            <Link to="/articles">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Articles
            </Link>
          </Button>

          <article className={`bg-gradient-card border border-border rounded-lg p-8 ${getArticleGlow(article.article_type)}`}>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <Badge variant={getArticleBadgeVariant(article.article_type)}>
                  {article.article_type}
                </Badge>
                {showViral && (
                  <Badge variant="outline" className="border-secondary text-secondary">
                    Viral
                  </Badge>
                )}
                {showPopular && !showViral && (
                  <Badge variant="outline" className="border-secondary text-secondary">
                    Popular
                  </Badge>
                )}
              </div>

              <h1 className="text-4xl font-cinzel font-bold text-foreground mb-4">
                {article.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground font-crimson">
                <span className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(article.published_date).toLocaleDateString()}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.read_time} min read
                </span>
                <span className="flex items-center">
                  <Eye className="w-4 h-4 mr-1" />
                  {article.view_count} views
                </span>
                <span className="flex items-center">
                  <Heart className={`w-4 h-4 mr-1 ${hasLiked ? 'fill-current' : ''}`} />
                  {article.like_count} likes
                </span>
              </div>
            </div>

            <Separator className="my-6" />

            {/* TLDR */}
            <div className="bg-muted/30 border border-border rounded-lg p-6 mb-8">
              <h2 className="text-lg font-cinzel font-bold mb-2">TL;DR</h2>
              <p className="font-crimson text-foreground leading-relaxed">{article.tldr}</p>
            </div>

            {/* Main Body */}
            <div className="prose prose-invert max-w-none font-crimson text-foreground">
              {renderMarkdown(article.body)}
            </div>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <>
                <Separator className="my-8" />
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag: string, index: number) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </>
            )}

            {/* Like Button */}
            <Separator className="my-8" />
            <div className="flex justify-center">
              <Button
                onClick={handleLike}
                disabled={isLiking}
                variant={hasLiked ? "default" : "outline"}
                size="lg"
              >
                <Heart className={`w-5 h-5 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                {hasLiked ? "Liked" : "Like this article"}
              </Button>
            </div>
          </article>
        </div>
      </div>
    </Layout>
  );
};

export default ArticleView;