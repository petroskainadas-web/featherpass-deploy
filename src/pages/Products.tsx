import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import Layout from "@/components/Layout";
import { 
  BookOpen, 
  Crown, 
  Swords, 
  Shield, 
  Star,
  ShoppingCart,
  ExternalLink,
  Truck
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import backgroundImg from "@/assets/Backround.png";
import forgeBackground from "@/assets/backgrounds/forge-bg.jpg";

const Products = () => {
  const productLines = [
    {
      id: 1,
      title: "Living Gods & Mythic Cultures",
      description: "Nine self-contained books, each focused on a race, their Gods, and their cultures in the hidden world of Ryon",
      icon: BookOpen,
      products: [
        {
          id: 1,
          title: "Ehr'fen: The Book of Elves",
          description: "Discover the Elven cultures and customs, their lyrical Gods, and the enchanted places of Ryon.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "85% Complete",
          status: "Kickstarter March 2026",
          image: "/placeholder-book.jpg"
        },
        {
          id: 2,
          title: "Dor'vem: The Book of Dwarves",
          description: "Deep dive into Dwarven society, their forge-Gods, and the sacred mountains of Ryon.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "60% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 3,
          title: "Org'hak: The Book of Orcs",
          description: "Explore the honor-bound Orc clans, their war-Gods, and the contested borderlands.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "60% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 4,
          title: "Hem'nan: The Book of Humans",
          description: "The diverse Human kingdoms, their pantheon of Gods, and their endless adaptability.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "60% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 5,
          title: "Drag'khen: The Book of Dragonborn",
          description: "The proud Dragonborn empire, their ancient draconic Paragons, and traditions of honor.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "35% Complete",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 6,
          title: "Gen'gom: The Book of Gnomes",
          description: "Ingenious Gnome inventors, their tinkering Gods, and the clockwork cities.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "35% Complete",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 7,
          title: "Hayl'vin: The Book of Halflings",
          description: "Peaceful Halfling communities, their harvest Gods, and the green countryside.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "35% Complete",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 8,
          title: "Ash'mal: The Book of Angelborn",
          description: "The celestial Angelborn, their divine heritage, and their luminous Exemplars.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "35% Complete",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 9,
          title: "Tef'lith: The Book of Fiendspawn",
          description: "The complex Fiendspawn, their infernal origins, and their scheming Patrons.",
          prices: { pdf: "$??.??", standard: "$??.??", premium: "$??.??" },
          completion: "35% Complete",
          status: "Planned",
          image: "/placeholder-book.jpg"
        }
      ]
    },
    /* {
      id: 2,
      title: "The Ryon Chronicles",
      description: "Five epic books detailing Ryon's 5000-year history across distinct ages of power, faith, and destiny",
      icon: BookOpen,
      products: [
        {
          id: 10,
          title: "The Shattering",
          description: "Post-apocalyptic mayhem and gritty survival detailing the fall of mighty civilizations.",
          prices: { pdf: "$25.99", standard: "$37.99", premium: "$40.49" },
          completion: "50% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 11,
          title: "The Age of Despair",
          description: "1500 years of written history as mortals ascend from barbarism to forge new kingdoms.",
          prices: { pdf: "$34.99", standard: "$47.99", premium: "$51.99" },
          completion: "50% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 12,
          title: "The Age of Horrors",
          description: "2250 years of territorial wars, rediscovered knowledge, and the price of ambition.",
          prices: { pdf: "$34.99", standard: "$47.99", premium: "$51.99" },
          completion: "50% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 13,
          title: "The Age of Hope",
          description: "1237 years of progress, governance, and the mortal struggle against their lofty aspirations.",
          prices: { pdf: "$34.99", standard: "$47.99", premium: "$51.99" },
          completion: "50% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        },
        {
          id: 14,
          title: "The Revelations",
          description: "An epic continent-wide war where the fate of every mortal soul hangs in balance.",
          prices: { pdf: "$29.99", standard: "$41.99", premium: "$45.99" },
          completion: "50% Complete",
          status: "In Development",
          image: "/placeholder-book.jpg"
        }
      ]
    },
    {
      id: 3,
      title: "Ryon: The Awakening",
      description: "Core books for the Age of Enlightenment that tie everything together in the complete campaign setting",
      icon: BookOpen,
      products: [
        {
          id: 15,
          title: "The Shattered Realm",
          description: "The complete campaign setting book and map atlas for the Age of Enlightenment of Ryon.",
          prices: { pdf: "$59.99", standard: "$78.99", premium: "$83.99" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 16,
          title: "Adventure Forge",
          description: "The comprehensive Dungeon Master's Handbook for running campaigns in Ryon.",
          prices: { pdf: "$49.99", standard: "$65.99", premium: "$71.99" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 17,
          title: "Heroes and Legends",
          description: "The mortal Player's Guide with new options for adventuring in the world of Ryon.",
          prices: { pdf: "$49.99", standard: "$65.99", premium: "$71.99" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 18,
          title: "Gods and Immortals",
          description: "Divine and epic power play for high-level campaigns involving the Gods themselves.",
          prices: { pdf: "$69.99", standard: "$89.99", premium: "$95.49" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 19,
          title: "Creatures of Ryon",
          description: "The complete bestiary featuring all the unique creatures inhabiting the world of Ryon.",
          prices: { pdf: "$59.99", standard: "$78.99", premium: "$83.99" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        },
        {
          id: 20,
          title: "Treasures and Artifacts",
          description: "Magic items, legendary artifacts, and treasures from across Ryon's rich history.",
          prices: { pdf: "$39.99", standard: "$53.99", premium: "$59.99" },
          completion: "-",
          status: "Planned",
          image: "/placeholder-book.jpg"
        }
      ]
    },
    {
      id: 4,
      title: "Ryon Adventure Modules",
      description: "Standalone adventures perfect for one-shots or campaign integration across different ages",
      icon: Swords,
      products: [
        {
          id: 21,
          title: "The Cursed Library of Valdris",
          description: "Navigate a twisted library where books come alive and knowledge itself is a weapon.",
          prices: { pdf: "$19.99", standard: "$29.99", premium: "$32.99" },
          status: "Available",
          image: "/placeholder-book.jpg"
        },
        {
          id: 22,
          title: "Shadows of the Forge District",
          description: "Urban intrigue and political maneuvering in the industrial heart of the Gnomish capital.",
          prices: { pdf: "$19.99", standard: "$29.99", premium: "$32.99" },
          status: "Available",
          image: "/placeholder-book.jpg"
        },
        {
          id: 23,
          title: "The Voidtouched Caravan",
          description: "A caravan escort mission that becomes a race against cosmic horror. Levels 8-10.",
          prices: { pdf: "$25.99", standard: "$37.99", premium: "$40.49" },
          status: "Released",
          image: "/placeholder-book.jpg"
        }
      ]
    } */
  ];

  const getStatusBadgeVariant = (status: string) => {
    if (status.includes("Kickstarter")) return "product-kickstarter";
    
    switch (status) {
      case "Available": return "product-available";
      case "Released": return "product-released";
      case "In Development": return "product-development";
      case "Planned": return "product-planned";
      default: return "outline";
    }
  };

  const getCardGlowClass = (status: string) => {
    const variant = getStatusBadgeVariant(status);
    
    switch (variant) {
      case "product-available":
        return "hover:shadow-[0_10px_20px_-5px] hover:shadow-product-available/20";
      case "product-released":
        return "hover:shadow-[0_10px_20px_-5px] hover:shadow-product-released/20";
      case "product-kickstarter":
        return "hover:shadow-[0_10px_20px_-5px] hover:shadow-product-kickstarter/20";
      case "product-development":
        return "hover:shadow-[0_10px_20px_-5px] hover:shadow-product-development/20";
      case "product-planned":
        return "hover:shadow-[0_10px_20px_-5px] hover:shadow-product-planned/20";
      default:
        return "hover:shadow-deep";
    }
  };

  const getButtonText = (status: string) => {
    if (status === "Available") return "Order";
    if (status === "Released") return "Pre-order";
    if (status.includes("Kickstarter")) return "Notify Me";
    if (status === "In Development") return "Coming Soon";
    if (status === "Planned") return "To be Announced";
    return "Coming Soon";
  };

  return (
    <Layout backgroundImage={forgeBackground} enableParallax overlayOpacity={0.8}>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            Our Products
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-2xl mx-auto">
            Premium 5e+ compatible content crafted with care. From complete campaign settings 
            to standalone adventures, bring the hidden world of Ryon to your table.
          </p>
        </div>

        {/* Product Lines */}
        <div className="space-y-16">
          {productLines.map((line) => {
            const LineIcon = line.icon;
            return (
              <div key={line.id} className="space-y-8">
                {/* Product Line Header */}
                <div className="text-center">
                  <div className="flex items-center justify-center space-x-3 mb-4">
                    <LineIcon className="w-8 h-8 text-secondary" />
                    <h2 className="text-4xl font-cinzel font-bold text-brushed-steel">
                      {line.title}
                    </h2>
                  </div>
                  <p className="text-lg text-foreground font-crimson max-w-xl mx-auto">
                    {line.description}
                  </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {line.products.map((product) => (
                    <Card key={product.id} className={`bg-gradient-card border-border shadow-fantasy transition-all duration-300 hover:scale-105 relative ${getCardGlowClass(product.status)}`}>
                      <CardHeader>
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant={getStatusBadgeVariant(product.status)} className="pointer-events-none">
                            {product.status}
                          </Badge>
                          {product.status !== "Available" && 'completion' in product && (
                            <Badge variant="outline" className="text-xs">
                              {product.completion}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="font-cinzel text-xl text-foreground">
                          {product.title}
                        </CardTitle>
                        <div className="space-y-1 mt-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-secondary font-crimson">
                              {product.prices.pdf}
                            </span>
                            <span className="text-sm text-muted-foreground">(Print quality PDF)</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-secondary font-crimson">
                              {product.prices.standard}
                            </span>
                            <span className="text-sm text-muted-foreground">(Standard Color Softcover)</span>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-bold text-secondary font-crimson">
                              {product.prices.premium}
                            </span>
                            <span className="text-sm text-muted-foreground">(Premium Color Hardcover)</span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <CardDescription className="font-crimson text-muted-foreground mb-6">
                          {product.description}
                        </CardDescription>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="product"
                            className="flex-1"
                            disabled={product.status === "Planned" || product.status === "In Development"}
                            onClick={() => {
                              if (product.status === "Available") {
                                window.open('https://drivethrurpg.com/placeholder', '_blank');
                              } else if (product.status === "Released") {
                                window.open('https://drivethrurpg.com/placeholder', '_blank');
                              } else if (product.status.includes("Kickstarter")) {
                                window.open('https://kickstarter.com/placeholder', '_blank');
                              }
                            }}
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            {getButtonText(product.status)}
                          </Button>
                        
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="icon">
                                <ExternalLink className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <img
                                src={backgroundImg}
                                alt={`${product.title} cover`}
                                className="w-full h-auto rounded-lg"
                              />
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Delivery Info Panel */}
        <section className="text-center bg-gradient-hero p-12 rounded-lg mt-16">
          <div className="flex items-center justify-center mb-4">
            <Truck className="w-12 h-12 text-secondary" />
          </div>
          <h2 className="text-4xl font-cinzel font-bold text-foreground mb-4">
            We Deliver via DriveThruRPG
          </h2>
          <p className="text-xl text-muted-foreground font-crimson mb-8 max-w-2xl mx-auto">
            All our products are available through DriveThruRPG, the trusted marketplace for tabletop RPG content. 
            Get instant digital delivery and support independent creators.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="hero" onClick={() => window.open("https://drivethrurpg.com", "_blank")}>
              <ExternalLink className="w-5 h-5 mr-2" />
              Visit Our DriveThruRPG Store
            </Button>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center mt-16 p-8 bg-card rounded-lg border border-border">
          <h3 className="text-2xl font-cinzel font-bold text-foreground mb-4">
            Support Our Kickstarter
          </h3>
          <p className="text-muted-foreground font-crimson mb-6 max-w-2xl mx-auto">
            Get exclusive early access to new products, special edition covers, and backer-only content. 
            Join our community of fantasy enthusiasts bringing the hidden world of Ryon to life.
          </p>
          <Button size="lg" variant="hero">
            <Crown className="w-5 h-5 mr-2" />
            Back Our Kickstarter
          </Button>
        </div>

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
      </div>
    </Layout>
  );
};

export default Products;
