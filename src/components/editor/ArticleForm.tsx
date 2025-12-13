import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Bold, Italic, Heading1, Heading2, Heading3, Heading4, List, ListOrdered, Quote, Link, Minus } from "lucide-react";

// Validation schema
const articleSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  article_type: z.enum(["Design Notes", "Plot Crafting", "Worldbuilding Tips"]),
  read_time: z.number().min(1, "Read time must be at least 1 minute").max(120, "Read time must be less than 120 minutes"),
  tldr: z.string().min(1, "TLDR is required").refine(
    (val) => val.trim().split(/\s+/).length <= 150,
    "TLDR must be 150 words or less"
  ),
  body: z.string().min(1, "Article body is required").refine(
    (val) => val.trim().split(/\s+/).length <= 4000,
    "Article body must be 4000 words or less"
  ),
  tags: z.array(z.string()).optional(),
});

interface ArticleFormProps {
  editContent?: any;
  editArticle?: any;
  onSuccess?: () => void;
}

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

const ArticleForm = ({ editContent, editArticle, onSuccess }: ArticleFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const articleTypes = ["Design Notes", "Plot Crafting", "Worldbuilding Tips"];

  const resolvedArticle = editArticle || editContent;

  const [formData, setFormData] = useState({
    title: "",
    article_type: "",
    read_time: "",
    tldr: "",
    body: "",
    tags: "",
  });

  useEffect(() => {
    if (resolvedArticle) {
      setFormData({
        title: resolvedArticle.title || "",
        article_type: resolvedArticle.article_type || "",
        read_time: resolvedArticle.read_time?.toString() || "",
        tldr: resolvedArticle.tldr || "",
        body: resolvedArticle.body || "",
        tags: resolvedArticle.tags?.join(", ") || "",
      });
    }
  }, [resolvedArticle]);

  // Insert markdown syntax at cursor position
  const insertMarkdown = (prefix: string, suffix: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.body;
    const selectedText = text.substring(start, end) || placeholder;

    const newText = text.substring(0, start) + prefix + selectedText + suffix + text.substring(end);
    updateField("body", newText);

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Toolbar actions
  const toolbarActions = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "bold text"), title: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "italic text"), title: "Italic" },
    { icon: Heading1, action: () => insertMarkdown("\n# ", "\n", "Heading 1"), title: "Heading 1" },
    { icon: Heading2, action: () => insertMarkdown("\n## ", "\n", "Heading 2"), title: "Heading 2" },
    { icon: Heading3, action: () => insertMarkdown("\n### ", "\n", "Heading 3"), title: "Heading 3" },
    { icon: Heading4, action: () => insertMarkdown("\n#### ", "\n", "Heading 4"), title: "Heading 4" },
    { icon: List, action: () => insertMarkdown("\n- ", "\n", "list item"), title: "Bullet List" },
    { icon: ListOrdered, action: () => insertMarkdown("\n1. ", "\n", "list item"), title: "Numbered List" },
    { icon: Quote, action: () => insertMarkdown("\n> ", "\n", "quote"), title: "Blockquote" },
    { icon: Link, action: () => insertMarkdown("[", "](url)", "link text"), title: "Link" },
    { icon: Minus, action: () => insertMarkdown("\n---\n", "", ""), title: "Horizontal Rule" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Sanitize content
      const sanitizedTldr = DOMPurify.sanitize(formData.tldr);
      const sanitizedBody = DOMPurify.sanitize(formData.body);

      // Validate data
      const validatedData = articleSchema.parse({
        title: formData.title,
        article_type: formData.article_type,
        read_time: parseInt(formData.read_time),
        tldr: sanitizedTldr,
        body: sanitizedBody,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
      });

      const articleData = {
        title: validatedData.title,
        article_type: validatedData.article_type,
        read_time: validatedData.read_time,
        tldr: validatedData.tldr,
        body: validatedData.body,
        tags: validatedData.tags || [],
      };

      if (resolvedArticle) {
        const { error } = await supabase
          .from("article_content")
          .update(articleData)
          .eq("id", resolvedArticle.id);

        if (error) throw error;
        toast({ title: "Success!", description: "Article updated successfully" });
      } else {
        const { error } = await supabase
          .from("article_content")
          .insert({
            ...articleData,
            created_by: user.id,
          });

        if (error) throw error;
        toast({ title: "Success!", description: "Article published successfully" });
      }

      if (onSuccess) {
        onSuccess();
      } else {
        setFormData({
          title: "",
          article_type: "",
          read_time: "",
          tldr: "",
          body: "",
          tags: "",
        });
      }
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast({
          title: "Validation Error",
          description: firstError.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Calculate word counts
  const tldrWordCount = formData.tldr.trim() ? formData.tldr.trim().split(/\s+/).length : 0;
  const bodyWordCount = formData.body.trim() ? formData.body.trim().split(/\s+/).length : 0;

  // Render preview
  const renderPreview = () => {
    const sanitizedBody = DOMPurify.sanitize(formData.body);
    return (
      <div className="prose prose-invert max-w-none font-crimson text-foreground min-h-[300px] p-4 bg-muted/20 rounded-lg border border-border">
        {formData.body ? (
          <ReactMarkdown components={markdownComponents} remarkPlugins={[remarkGfm]}>
            {sanitizedBody}
          </ReactMarkdown>
        ) : (
          <p className="text-muted-foreground italic">Start writing to see preview...</p>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{editContent ? "Edit Article" : "Publish New Article"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => updateField("title", e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="article_type">Type *</Label>
            <Select value={formData.article_type} onValueChange={(value) => updateField("article_type", value)} required>
              <SelectTrigger>
                <SelectValue placeholder="Select article type" />
              </SelectTrigger>
              <SelectContent>
                {articleTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="read_time">Read Time (minutes) *</Label>
            <Input
              id="read_time"
              type="number"
              min="1"
              value={formData.read_time}
              onChange={(e) => updateField("read_time", e.target.value)}
              placeholder="8"
              required
            />
          </div>

          <div>
            <Label htmlFor="tldr">
              TLDR * ({tldrWordCount}/150 words)
            </Label>
            <Textarea
              id="tldr"
              value={formData.tldr}
              onChange={(e) => updateField("tldr", e.target.value)}
              rows={3}
              placeholder="Brief summary of the article..."
              required
              className={tldrWordCount > 150 ? "border-destructive" : ""}
            />
            {tldrWordCount > 150 && (
              <p className="text-sm text-destructive mt-1">TLDR exceeds 150 words</p>
            )}
          </div>

          <div>
            <Label htmlFor="body">
              Main Body * ({bodyWordCount}/4000 words)
            </Label>
            
            {/* Markdown Toolbar */}
            <div className="flex flex-wrap gap-1 mb-2 p-2 bg-muted/30 rounded-t-lg border border-b-0 border-border">
              {toolbarActions.map(({ icon: Icon, action, title }) => (
                <Button
                  key={title}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={action}
                  title={title}
                  className="h-8 w-8 p-0"
                >
                  <Icon className="h-4 w-4" />
                </Button>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full grid grid-cols-2">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="mt-0">
                <Textarea
                  ref={textareaRef}
                  id="body"
                  value={formData.body}
                  onChange={(e) => updateField("body", e.target.value)}
                  rows={15}
                  placeholder="Article content with markdown support...

# Heading 1
## Heading 2
### Heading 3
#### Heading 4

**bold text** and *italic text*

- Bullet list item
- Another item

1. Numbered list
2. Second item

> Blockquote

[Link text](https://example.com)

---

`inline code`"
                  required
                  className={`rounded-t-none ${bodyWordCount > 4000 ? "border-destructive" : ""}`}
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0">
                {renderPreview()}
              </TabsContent>
            </Tabs>
            
            {bodyWordCount > 4000 && (
              <p className="text-sm text-destructive mt-1">Body exceeds 4000 words</p>
            )}
          </div>

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => updateField("tags", e.target.value)}
              placeholder="game design, combat, balancing"
            />
          </div>

          <Button type="submit" disabled={loading || tldrWordCount > 150 || bodyWordCount > 4000}>
            {loading ? "Processing..." : editContent ? "Update Article" : "Publish Article"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ArticleForm;