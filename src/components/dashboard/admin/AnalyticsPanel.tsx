import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3, FileText, Image, Mail, TrendingUp } from "lucide-react";
import { useAnalyticsStats } from "../hooks/useAnalyticsStats";

const AnalyticsPanel = () => {
  const {
    contentStatsQuery,
    articleStatsQuery,
    galleryStatsQuery,
    newsletterStatsQuery,
    overviewStatsQuery,
  } = useAnalyticsStats();

  const contentStats = contentStatsQuery.data;
  const articleStats = articleStatsQuery.data;
  const galleryStats = galleryStatsQuery.data;
  const newsletterStats = newsletterStatsQuery.data;
  const overviewStats = overviewStatsQuery.data;

  // Use content stats type distribution for library content in overview
  const overviewContentDistribution = contentStats?.typeDistribution?.map((item: any) => ({
    name: item.name,
    value:
      item.value ??
      item.count ??
      item.downloads ??
      item.download_count ??
      0,
  }));

  const contentTypeDistribution = contentStats?.typeDistribution?.map((item: any) => ({
    name: item.name,
    value:
      item.value ??
      item.count ??
      item.downloads ??
      item.download_count ??
      0,
  }));

  const isLoading =
    contentStatsQuery.isLoading ||
    articleStatsQuery.isLoading ||
    galleryStatsQuery.isLoading ||
    newsletterStatsQuery.isLoading ||
    overviewStatsQuery.isLoading;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-muted-foreground">Loading analytics...</p>
          </div>
        ) : (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="articles">Articles</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Library Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats?.totalLibraryItems || 0}</div>
                    <p className="text-xs text-muted-foreground">Total items published</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats?.totalArticles || 0}</div>
                    <p className="text-xs text-muted-foreground">Total articles published</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Gallery Images</CardTitle>
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats?.totalGalleryImages || 0}</div>
                    <p className="text-xs text-muted-foreground">Total images published</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Subscribers</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{overviewStats?.totalSubscribers || 0}</div>
                    <p className="text-xs text-muted-foreground">Newsletter subscribers</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Downloaded Content</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewStats?.mostDownloadedContent ? (
                      <div>
                        <p className="font-semibold">{overviewStats.mostDownloadedContent.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {overviewStats.mostDownloadedContent.download_count || 0} downloads
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Viewed Article</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewStats?.mostViewedArticle ? (
                      <div>
                        <p className="font-semibold">{overviewStats.mostViewedArticle.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {overviewStats.mostViewedArticle.view_count || 0} views • {" "}
                          {overviewStats.mostViewedArticle.like_count || 0} likes
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Most Viewed Image</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewStats?.mostViewedImage ? (
                      <div>
                        <p className="font-semibold">{overviewStats.mostViewedImage.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {overviewStats.mostViewedImage.view_count || 0} views
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Library Content Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {overviewContentDistribution && overviewContentDistribution.length > 0 ? (
                      <ChartContainer
                        config={{
                          value: { label: "Count", color: "hsl(var(--primary))" },
                        } satisfies ChartConfig}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={overviewContentDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Article Type Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {articleStats?.typeDistribution && articleStats.typeDistribution.length > 0 ? (
                      <ChartContainer
                        config={{
                          value: { label: "Count", color: "hsl(var(--accent))" },
                        } satisfies ChartConfig}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={articleStats.typeDistribution.map((item: any) => ({ name: item.name, value: item.count || 0 }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="value" fill="hsl(var(--accent))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats?.totalCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Items in library</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Downloads</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentStats?.totalDownloads || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all content</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Content Types</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contentTypeDistribution?.length || 0}</div>
                    <p className="text-xs text-muted-foreground">Types in library</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Downloads</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {contentStats?.totalCount ? Math.round((contentStats?.totalDownloads || 0) / contentStats.totalCount) : 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Per item</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Content Type Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  {contentTypeDistribution && contentTypeDistribution.length > 0 ? (
                    <ChartContainer
                      config={{
                        value: { label: "Count", color: "hsl(var(--primary))" },
                      } satisfies ChartConfig}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={contentTypeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Downloaded Items</CardTitle>
                </CardHeader>
                <CardContent>
                  {contentStats?.topDownloaded && contentStats.topDownloaded.length > 0 ? (
                    <div className="space-y-2">
                      {contentStats.topDownloaded.map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <span className="text-xs text-muted-foreground capitalize whitespace-nowrap">
                              {item.content_type?.replace(/_/g, " ") || ""}
                            </span>
                          </div>
                          <Badge variant="secondary" className="ml-2">{item.download_count ?? item.downloads ?? 0} downloads</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="articles" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Articles</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articleStats?.totalCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Published articles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articleStats?.totalViews || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all articles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{articleStats?.totalLikes || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all articles</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Avg Read Time</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{Math.round(articleStats?.avgReadTime || 0)}</div>
                    <p className="text-xs text-muted-foreground">Minutes</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Articles by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  {articleStats?.typeDistribution && articleStats.typeDistribution.length > 0 ? (
                    <ChartContainer
                      config={{
                        views: { label: "Views", color: "hsl(var(--primary))" },
                        likes: { label: "Likes", color: "hsl(var(--accent))" },
                      } satisfies ChartConfig}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={articleStats.typeDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar yAxisId="left" dataKey="views" fill="hsl(var(--primary))" name="Views" />
                          <Bar yAxisId="right" dataKey="likes" fill="hsl(var(--accent))" name="Likes" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 by Views</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {articleStats?.topByViews && articleStats.topByViews.length > 0 ? (
                      <div className="space-y-2">
                        {articleStats.topByViews.map((item: any, index: number) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                              <p className="font-medium text-sm truncate">{item.title}</p>
                            </div>
                            <Badge variant="secondary" className="ml-2">{item.view_count || 0} views</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top 10 by Likes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {articleStats?.topByLikes && articleStats.topByLikes.length > 0 ? (
                      <div className="space-y-2">
                        {articleStats.topByLikes.map((item: any, index: number) => (
                          <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                              <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                              <p className="font-medium text-sm truncate">{item.title}</p>
                            </div>
                            <Badge variant="secondary" className="ml-2">{item.like_count || 0} likes</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="gallery" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Images</CardTitle>
                    <Image className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{galleryStats?.totalCount || 0}</div>
                    <p className="text-xs text-muted-foreground">Images in gallery</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{galleryStats?.totalViews || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all images</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Views by Image Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {galleryStats?.typeDistribution && galleryStats.typeDistribution.length > 0 ? (
                      <ChartContainer
                        config={{
                          views: { label: "Views", color: "hsl(var(--primary))" },
                        } satisfies ChartConfig}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={galleryStats.typeDistribution}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                            <YAxis allowDecimals={false} />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="views" fill="hsl(var(--primary))" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Orientation Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {galleryStats?.orientationDistribution && galleryStats.orientationDistribution.length > 0 ? (
                      <ChartContainer
                        config={{
                          value: { label: "Count", color: "hsl(var(--primary))" },
                        } satisfies ChartConfig}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={galleryStats.orientationDistribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label
                            >
                              {galleryStats.orientationDistribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.2})`} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Top 10 Viewed Images</CardTitle>
                </CardHeader>
                <CardContent>
                  {galleryStats?.topViewed && galleryStats.topViewed.length > 0 ? (
                    <div className="space-y-2">
                      {galleryStats.topViewed.map((item: any, index: number) => (
                        <div key={item.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>
                            <p className="font-medium text-sm truncate">{item.title}</p>
                            <span className="text-xs text-muted-foreground whitespace-nowrap">{item.image_type}</span>
                          </div>
                          <Badge variant="secondary" className="ml-2">{item.view_count || 0} views</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">No data available</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="newsletter" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Subscribers</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{newsletterStats?.totalSubscribers || 0}</div>
                    <p className="text-xs text-muted-foreground">Confirmed subscribers</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Unsubscribed</CardTitle>
                    <Mail className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{newsletterStats?.totalUnsubscribed || 0}</div>
                    <p className="text-xs text-muted-foreground">Total unsubscribes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{newsletterStats?.pendingConfirmations || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Resubscriptions</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{newsletterStats?.totalResubscriptions || 0}</div>
                    <p className="text-xs text-muted-foreground">Total resubscribes</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Subscribers by Source</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsletterStats?.sourceDistribution && newsletterStats.sourceDistribution.length > 0 ? (
                      <ChartContainer
                        config={{
                          value: { label: "Subscribers", color: "hsl(var(--primary))" },
                        } satisfies ChartConfig}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={newsletterStats.sourceDistribution}
                              dataKey="value"
                              nameKey="name"
                              cx="50%"
                              cy="50%"
                              outerRadius={100}
                              label
                            >
                              {newsletterStats.sourceDistribution.map((entry: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={`hsl(var(--primary) / ${1 - index * 0.2})`} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No data available</p>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Unsubscribe Reasons</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {newsletterStats?.reasonsDistribution && newsletterStats.reasonsDistribution.length > 0 ? (
                      <div className="space-y-2">
                        {newsletterStats.reasonsDistribution.map((item: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-2 border rounded">
                            <p className="font-medium text-sm">{item.reason}</p>
                            <Badge variant="secondary">{item.count}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No unsubscribe reasons recorded</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>ConvertKit Sync Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Synced to ConvertKit</p>
                      <p className="text-2xl font-bold">{newsletterStats?.syncedCount || 0}</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <p className="text-sm text-muted-foreground">Not Synced</p>
                      <p className="text-2xl font-bold">{newsletterStats?.notSyncedCount || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsPanel;
