# Original Dashboard Key Excerpts

These snippets capture the prior monolithic dashboard layout and UI features that need to be mirrored in the refactored panels.

## Mode Switch Layout
```tsx
{isAdmin && (
  <div className="flex flex-wrap gap-4">
    <Button variant={mode === "system-management" ? "default" : "outline"}>System Management</Button>
    <Button variant={mode === "system-health" ? "default" : "outline"}>System Health</Button>
    <Button variant={mode === "data-management" ? "default" : "outline"}>Data Management</Button>
    <Button variant={mode === "analytics" ? "default" : "outline"}>
      <BarChart3 className="mr-2 h-4 w-4" />
      Analytics
    </Button>
  </div>
)}
{isAdmin && isEditor && (
  <div className="relative py-2">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-border"></div>
    </div>
  </div>
)}
{isEditor && (
  <div className="flex flex-wrap gap-4">
    <Button variant={mode === "publish-content" ? "default" : "outline"}>Publish Content</Button>
    <Button variant={mode === "modify-content" ? "default" : "outline"}>Modify Content</Button>
    <Button variant={mode === "publish-article" ? "default" : "outline"}>Publish Article</Button>
    <Button variant={mode === "modify-article" ? "default" : "outline"}>Modify Article</Button>
    <Button variant={mode === "publish-image" ? "default" : "outline"}>Publish Image</Button>
    <Button variant={mode === "modify-image" ? "default" : "outline"}>Modify Image</Button>
  </div>
)}
```

## Modify Content Listing
```tsx
<CardTitle>Modify Library Content</CardTitle>
<Badge variant="secondary">{content.content_type}</Badge>
<p className="text-sm text-muted-foreground">
  Created: {new Date(content.created_at).toLocaleDateString()}
</p>
```

## Modify Articles Listing
```tsx
<CardTitle>Modify Published Articles</CardTitle>
<Badge variant="secondary">{article.article_type}</Badge>
<p className="text-sm text-muted-foreground">
  Published: {new Date(article.published_date).toLocaleDateString()} • {article.view_count} views • {article.like_count} likes
</p>
```

## Modify Gallery Listing and Filters
```tsx
<CardTitle>Modify Gallery Images</CardTitle>
<Button variant={galleryFilterType === "Realm Landscapes" ? "default" : "outline"}>Realm Landscapes</Button>
<Button variant={galleryFilterType === "Cartography & Battle Maps" ? "default" : "outline"}>Maps</Button>
<Button variant={galleryFilterType === "Heroes & Allies" ? "default" : "outline"}>Heroes</Button>
<Button variant={galleryFilterType === "Monsters & Adversaries" ? "default" : "outline"}>Monsters</Button>
<Button variant={galleryFilterType === "Relics & Items" ? "default" : "outline"}>Relics</Button>
<Button variant={galleryFilterType === "Concept Art" ? "default" : "outline"}>Concept Art</Button>
<p className="text-sm text-muted-foreground">
  Published: {new Date(image.published_date).toLocaleDateString()} • {image.view_count} views
</p>
```

## Analytics Overview Highlights and Content List Context
```tsx
<CardTitle className="text-base">Most Downloaded Content</CardTitle>
<p className="text-sm text-muted-foreground">
  {overviewStats.mostDownloadedContent.download_count || 0} downloads
</p>
<CardTitle className="text-base">Most Viewed Article</CardTitle>
<p className="text-sm text-muted-foreground">
  {overviewStats.mostViewedArticle.view_count || 0} views • {overviewStats.mostViewedArticle.like_count || 0} likes
</p>
<CardTitle className="text-base">Most Viewed Image</CardTitle>
<p className="text-sm text-muted-foreground">
  {overviewStats.mostViewedImage.view_count || 0} views
</p>

// Top downloaded content rows
<p className="text-xs text-muted-foreground capitalize">
  {item.content_type.replace(/_/g, ' ')}
</p>
```

## System Management User Table Metadata
```tsx
<div className="grid grid-cols-5 gap-4 p-4 border-b font-semibold bg-muted">
  <div>Email</div>
  <div>Full Name</div>
  <div>Roles</div>
  <div>Created</div>
  <div>Actions</div>
</div>
<div className="text-sm text-muted-foreground">
  {new Date(user.created_at).toLocaleDateString()}
</div>
```
