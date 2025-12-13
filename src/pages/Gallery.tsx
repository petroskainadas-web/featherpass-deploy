import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import galleryBackground from "@/assets/backgrounds/gallery-bg.jpg";

const Gallery = () => {
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");

  // Pagination for each orientation
  const [landscapeCount, setLandscapeCount] = useState(6); // 2 rows × 3 cols
  const [portraitCount, setPortraitCount] = useState(8); // 2 rows × 4 cols
  const [squareCount, setSquareCount] = useState(8); // 2 rows × 4 cols

  // Total counts
  const [landscapeTotal, setLandscapeTotal] = useState(0);
  const [portraitTotal, setPortraitTotal] = useState(0);
  const [squareTotal, setSquareTotal] = useState(0);

  useEffect(() => {
    fetchGalleryImages();
  }, [filterType, sortOrder]);

  // Phase 4: Use thumbnails for gallery grid view
  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      let landscapeQuery = supabase
        .from("gallery_images")
        .select(
          `
          id,
          title,
          image_type,
          orientation,
          image_description,
          published_date,
          gallery_image_files (
            thumbnail_path,
            large_path
          )
        `,
        )
        .eq("orientation", "landscape")
        .order("published_date", { ascending: sortOrder === "oldest" })
        .range(0, 5);

      let portraitQuery = supabase
        .from("gallery_images")
        .select(
          `
          id,
          title,
          image_type,
          orientation,
          image_description,
          published_date,
          gallery_image_files (
            thumbnail_path,
            large_path
          )
        `,
        )
        .eq("orientation", "portrait")
        .order("published_date", { ascending: sortOrder === "oldest" })
        .range(0, 7);

      let squareQuery = supabase
        .from("gallery_images")
        .select(
          `
          id,
          title,
          image_type,
          orientation,
          image_description,
          published_date,
          gallery_image_files (
            thumbnail_path,
            large_path
          )
        `,
        )
        .eq("orientation", "square")
        .order("published_date", { ascending: sortOrder === "oldest" })
        .range(0, 7);

      // Add type filter if not "all"
      if (filterType !== "all") {
        landscapeQuery = landscapeQuery.eq("image_type", filterType).range(0, 8); // 3 rows when filtered
        portraitQuery = portraitQuery.eq("image_type", filterType).range(0, 11); // 3 rows when filtered
        squareQuery = squareQuery.eq("image_type", filterType).range(0, 11); // 3 rows when filtered
      }

      const [landscapeResult, portraitResult, squareResult] = await Promise.all([
        landscapeQuery,
        portraitQuery,
        squareQuery,
      ]);

      if (landscapeResult.error) throw landscapeResult.error;
      if (portraitResult.error) throw portraitResult.error;
      if (squareResult.error) throw squareResult.error;

      // Fetch total counts
      await fetchTotalCounts();

      // Get public URLs for all images - use thumbnails for grid, large for modal
      const processImages = async (images: any[]) => {
        const processed = await Promise.all(
          (images || []).map(async (image) => {
            if (image.gallery_image_files) {
              const thumbnailPath = image.gallery_image_files.thumbnail_path;
              const largePath = image.gallery_image_files.large_path || thumbnailPath;

              // Skip images with null paths (legacy records)
              if (!thumbnailPath || !largePath) {
                return null;
              }

              const {
                data: { publicUrl: imageUrl },
              } = supabase.storage.from("gallery-images").getPublicUrl(thumbnailPath);

              const {
                data: { publicUrl: originalUrl },
              } = supabase.storage.from("gallery-images").getPublicUrl(largePath);

              return {
                ...image,
                imageUrl: imageUrl, // Use thumbnail for grid
                originalUrl: originalUrl, // Use large for modal/full view
              };
            }
            return null;
          }),
        );
        // Filter out null entries (legacy records without paths)
        return processed.filter((img) => img !== null);
      };

      const [landscapeImages, portraitImages, squareImages] = await Promise.all([
        processImages(landscapeResult.data),
        processImages(portraitResult.data),
        processImages(squareResult.data),
      ]);

      setGalleryImages([...landscapeImages, ...portraitImages, ...squareImages]);

      // Reset counts based on filter
      if (filterType !== "all") {
        setLandscapeCount(9);
        setPortraitCount(12);
        setSquareCount(12);
      } else {
        setLandscapeCount(6);
        setPortraitCount(8);
        setSquareCount(8);
      }
    } catch (error: any) {
      console.error("Error fetching gallery images:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTotalCounts = async () => {
    try {
      const baseFilter = filterType !== "all" ? { image_type: filterType } : {};

      const [landscapeCountResult, portraitCountResult, squareCountResult] = await Promise.all([
        supabase
          .from("gallery_images")
          .select("id", { count: "exact", head: true })
          .eq("orientation", "landscape")
          .match(baseFilter),
        supabase
          .from("gallery_images")
          .select("id", { count: "exact", head: true })
          .eq("orientation", "portrait")
          .match(baseFilter),
        supabase
          .from("gallery_images")
          .select("id", { count: "exact", head: true })
          .eq("orientation", "square")
          .match(baseFilter),
      ]);

      setLandscapeTotal(landscapeCountResult.count || 0);
      setPortraitTotal(portraitCountResult.count || 0);
      setSquareTotal(squareCountResult.count || 0);
    } catch (error) {
      console.error("Error fetching counts:", error);
    }
  };

  const handleLoadMoreSection = async (orientation: "landscape" | "portrait" | "square") => {
    try {
      const currentCount =
        orientation === "landscape" ? landscapeCount : orientation === "portrait" ? portraitCount : squareCount;
      const itemsPerRow = orientation === "landscape" ? 3 : 4;
      const rowsToAdd = filterType !== "all" ? 2 : 1;
      const newItems = itemsPerRow * rowsToAdd;
      const newStart = currentCount;
      const newEnd = newStart + newItems - 1;

      let query = supabase
        .from("gallery_images")
        .select(
          `
          id,
          title,
          image_type,
          orientation,
          image_description,
          published_date,
          gallery_image_files (
            thumbnail_path,
            large_path
          )
        `,
        )
        .eq("orientation", orientation)
        .order("published_date", { ascending: sortOrder === "oldest" })
        .range(newStart, newEnd);

      if (filterType !== "all") {
        query = query.eq("image_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      const processedImages = await Promise.all(
        (data || []).map(async (image) => {
          if (image.gallery_image_files) {
            const thumbnailPath = image.gallery_image_files.thumbnail_path;
            const largePath = image.gallery_image_files.large_path || thumbnailPath;

            // Skip images with null paths (legacy records)
            if (!thumbnailPath || !largePath) {
              return null;
            }

            const {
              data: { publicUrl: imageUrl },
            } = supabase.storage.from("gallery-images").getPublicUrl(thumbnailPath);

            const {
              data: { publicUrl: originalUrl },
            } = supabase.storage.from("gallery-images").getPublicUrl(largePath);

            return {
              ...image,
              imageUrl: imageUrl,
              originalUrl: originalUrl,
            };
          }
          return null;
        }),
      );

      // Filter out null entries (legacy records without paths)
      const validImages = processedImages.filter((img) => img !== null);
      setGalleryImages((prev) => [...prev, ...validImages]);

      if (orientation === "landscape") setLandscapeCount((prev) => prev + newItems);
      if (orientation === "portrait") setPortraitCount((prev) => prev + newItems);
      if (orientation === "square") setSquareCount((prev) => prev + newItems);
    } catch (error) {
      console.error(`Error loading more ${orientation} images:`, error);
    }
  };

  const filteredImages = galleryImages.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.image_description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags?.some((tag: string) => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  const landscapeImages = filteredImages.filter((img) => img.orientation === "landscape").slice(0, landscapeCount);
  const portraitImages = filteredImages.filter((img) => img.orientation === "portrait").slice(0, portraitCount);
  const squareImages = filteredImages.filter((img) => img.orientation === "square").slice(0, squareCount);

  const getFrameStyles = (orientation: string) => {
    const baseStyle =
      "group relative overflow-hidden rounded-lg border-4 border-double transition-all duration-300 hover:scale-105";
    if (orientation === "landscape") {
      return `${baseStyle} border-amber-700/40 hover:border-amber-600/60 hover:shadow-[0_0_30px_-5px] hover:shadow-amber-500/30`;
    } else if (orientation === "portrait") {
      return `${baseStyle} border-amber-800/40 hover:border-amber-700/60 hover:shadow-[0_0_30px_-5px] hover:shadow-amber-600/30`;
    }
    return `${baseStyle} border-amber-600/40 hover:border-amber-500/60 hover:shadow-[0_0_30px_-5px] hover:shadow-amber-400/30`;
  };

  return (
    <Layout backgroundImage={galleryBackground} enableParallax overlayOpacity={0.85}>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-cinzel font-bold mb-4 text-gradient bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Art Gallery
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
            Explore breathtaking visuals from the realms of Ryon
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-12 flex flex-col md:flex-row gap-4 items-center justify-center">
          <div className="relative md:w-[250px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Search images..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="md:w-[250px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Realm Landscapes">Realm Landscapes</SelectItem>
              <SelectItem value="Cartography & Battle Maps">Cartography & Battle Maps</SelectItem>
              <SelectItem value="Heroes & Allies">Heroes & Allies</SelectItem>
              <SelectItem value="Monsters & Adversaries">Monsters & Adversaries</SelectItem>
              <SelectItem value="Relics & Items">Relics & Items</SelectItem>
              <SelectItem value="Concept Art">Concept Art</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="md:w-[250px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {loading ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Landscape Section */}
            {(filterType === "all" ||
              filterType === "Realm Landscapes" ||
              filterType === "Cartography & Battle Maps") &&
              landscapeImages.length > 0 && (
                <section>
                  <h2 className="text-3xl font-cinzel font-bold mb-6 text-secondary text-center">Landscape & Maps</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {landscapeImages.map((image) => (
                      <Link key={image.id} to={`/gallery/${image.id}`} className="block">
                        <Card className={getFrameStyles("landscape")}>
                          <CardContent className="p-0">
                            <div className="aspect-video overflow-hidden">
                              <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="p-4 bg-gradient-to-t from-background/95 to-background/80">
                              <h3 className="font-cinzel font-semibold text-center text-sm">{image.title}</h3>
                              {image.image_description && (
                                <p className="text-xs text-muted-foreground text-center mt-2 line-clamp-2">
                                  {image.image_description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <div className="text-right mt-4">
                    <button
                      onClick={() => handleLoadMoreSection("landscape")}
                      disabled={landscapeImages.length >= landscapeTotal}
                      className={`font-cinzel font-bold transition-colors ${
                        landscapeImages.length >= landscapeTotal
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-logo-gold hover:text-logo-gold/80"
                      }`}
                    >
                      {landscapeImages.length >= landscapeTotal ? "All Loaded" : "See More"}
                    </button>
                    <span className="text-xs text-muted-foreground ml-3 font-crimson">
                      {landscapeImages.length} of {landscapeTotal}
                    </span>
                  </div>
                </section>
              )}

            {/* Portrait Section */}
            {(filterType === "all" || filterType === "Heroes & Allies" || filterType === "Monsters & Adversaries") &&
              portraitImages.length > 0 && (
                <section>
                  <h2 className="text-3xl font-cinzel font-bold mb-6 text-secondary text-center">Allies & Foes</h2>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    {portraitImages.map((image) => (
                      <Link key={image.id} to={`/gallery/${image.id}`} className="block">
                        <Card className={getFrameStyles("portrait")}>
                          <CardContent className="p-0">
                            <div className="aspect-[3/4] overflow-hidden">
                              <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="p-3 bg-gradient-to-t from-background/95 to-background/80">
                              <h3 className="font-cinzel font-semibold text-center text-sm">{image.title}</h3>
                              {image.image_description && (
                                <p className="text-xs text-muted-foreground text-center mt-2 line-clamp-2">
                                  {image.image_description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <div className="text-right mt-4">
                    <button
                      onClick={() => handleLoadMoreSection("portrait")}
                      disabled={portraitImages.length >= portraitTotal}
                      className={`font-cinzel font-bold transition-colors ${
                        portraitImages.length >= portraitTotal
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-logo-gold hover:text-logo-gold/80"
                      }`}
                    >
                      {portraitImages.length >= portraitTotal ? "All Loaded" : "See More"}
                    </button>
                    <span className="text-xs text-muted-foreground ml-3 font-crimson">
                      {portraitImages.length} of {portraitTotal}
                    </span>
                  </div>
                </section>
              )}

            {/* Square Section */}
            {(filterType === "all" || filterType === "Relics & Items" || filterType === "Concept Art") &&
              squareImages.length > 0 && (
                <section>
                  <h2 className="text-3xl font-cinzel font-bold mb-6 text-secondary text-center">Items & Concept Art</h2>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                    {squareImages.map((image) => (
                      <Link key={image.id} to={`/gallery/${image.id}`} className="block">
                        <Card className={getFrameStyles("square")}>
                          <CardContent className="p-0">
                            <div className="aspect-square overflow-hidden">
                              <img
                                src={image.imageUrl}
                                alt={image.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                            </div>
                            <div className="p-3 bg-gradient-to-t from-background/95 to-background/80">
                              <h3 className="font-cinzel font-semibold text-center text-sm">{image.title}</h3>
                              {image.image_description && (
                                <p className="text-xs text-muted-foreground text-center mt-2 line-clamp-2">
                                  {image.image_description}
                                </p>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                  <div className="text-right mt-4">
                    <button
                      onClick={() => handleLoadMoreSection("square")}
                      disabled={squareImages.length >= squareTotal}
                      className={`font-cinzel font-bold transition-colors ${
                        squareImages.length >= squareTotal
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-logo-gold hover:text-logo-gold/80"
                      }`}
                    >
                      {squareImages.length >= squareTotal ? "All Loaded" : "See More"}
                    </button>
                    <span className="text-xs text-muted-foreground ml-3 font-crimson">
                      {squareImages.length} of {squareTotal}
                    </span>
                  </div>
                </section>
              )}

            {filteredImages.length === 0 && (
              <p className="text-center text-muted-foreground py-12">No images found matching your criteria</p>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Gallery;
