import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Layout from "@/components/Layout";
import { 
  Rocket, 
  Star,
  Users,
  BookOpen,
  Crown,
  Sword,
  Shield,
  Sparkles,
  Calendar,
  Target,
  Gift,
  Heart
} from "lucide-react";
import prelaunchBackground from "@/assets/backgrounds/prelaunch-bg.jpg";

const Prelaunch = () => {
  // Toggle this to switch between prelaunch and active campaign states
  const isKickstarterActive = false; // Set to true when campaign goes live
  
  const kickstarterUrl = "https://www.kickstarter.com/projects/featherpass/placeholder";
  
  const kickstarterHighlights = [
    {
      icon: Crown,
      title: "Elven Gods",
      description: "7 Table-ready Gods to inspire or terrify your players."
    },
    {
      icon: BookOpen,
      title: "80+ Page Self Contained Module",
      description: "Three complete elven cultures and religions with politics and conflicts ready for your campaigns."
    },
    {
      icon: Sword,
      title: "15+ Adversaries",
      description: "From terrifying Monsters to legendary Heroes and Vilains, each with unique abilities and rich lore."
    },
    {
      icon: Shield,
      title: "New Player Options",
      description: "Subraces, Subclasses, Spells, and Magic Items, native to the Elves of Ryon."
    }
  ];

  const rewardTiers = [
    {
      name: "Digital Explorer",
      price: "$35",
      description: "Complete digital edition + exclusive backer content",
      backers: 0,
      popular: false,
      limited: false 
    },
    {
      name: "Physical Adventurer",
      price: "$50",
      description: "Softcover book (Standard color Softcover) + digital edition",
      backers: 0,
      popular: true,
      limited: false 
    },
    {
      name: "Legendary Hero",
      price: "$80",
      description: "Collector's Edition Hardcover book (Deluxe color Hardcover) + digital edition + Early access to the next project",
      backers: 0,
      popular: false,
      limited: true 
    }
  ];

  const stretchGoals = [
    { goal: "$10K", title: "Bonus Magic Item Collection (6 Items)", unlocked: false },
    { goal: "$20K", title: "Bonus Adversaries (3 NPCs + 3 Monsters)", unlocked: false },
    { goal: "$30K", title: "Seven Holy Relics (Artifacts +)", unlocked: false },
    { goal: "$40K", title: "Seven Holy Champions (Legendary Allies or Foes)", unlocked: false }
  ];

  return (
    <Layout backgroundImage={prelaunchBackground} enableParallax overlayOpacity={0.8}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          {isKickstarterActive ? (
            <a 
              href={kickstarterUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block mb-6"
            >
              <Badge 
                variant="secondary" 
                className="text-xl px-8 py-3 font-cinzel animate-pulse-glow cursor-pointer hover:scale-105 transition-transform"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                Live Campaign !!!
              </Badge>
            </a>
          ) : (
            <Badge variant="secondary" className="mb-6 text-lg px-6 py-2 font-cinzel">
              <Rocket className="w-4 h-4 mr-2" />
              Launch March 2026
            </Badge>
          )}
          
          <h1 className="text-6xl font-cinzel font-bold mb-4 text-brushed-steel">
            Living Gods and Mythic Cultures
          </h1>
          <h2 className="text-3xl font-cinzel font-semibold text-logo-gold mb-8">
            Ehr'fen: The book of Elves
          </h2>
          
          <p className="text-xl text-muted-foreground font-crimson mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover the elven cultures and customs, their lyrical Gods, and the enchanted places of Ryon.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              variant="hero"
              disabled={!isKickstarterActive}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              asChild={isKickstarterActive}
            >
              {isKickstarterActive ? (
                <a href={kickstarterUrl} target="_blank" rel="noopener noreferrer">
                  <Rocket className="w-5 h-5 mr-2" />
                  Back on Kickstarter
                </a>
              ) : (
                <>
                  <Rocket className="w-5 h-5 mr-2" />
                  Back on Kickstarter
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              disabled={isKickstarterActive}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              asChild={!isKickstarterActive}
            >
              {!isKickstarterActive ? (
                <a href={kickstarterUrl} target="_blank" rel="noopener noreferrer">
                  <Calendar className="w-5 h-5 mr-2" />
                  Notify Me at Launch
                </a>
              ) : (
                <>
                  <Calendar className="w-5 h-5 mr-2" />
                  Notify Me at Launch
                </>
              )}
            </Button>
          </div>
        </section>

        {/* Campaign Progress */}
        <section className="mb-16">
          <Card className="bg-gradient-card border-border shadow-fantasy">
            <CardHeader className="text-center">
              <CardTitle className="font-cinzel text-2xl text-foreground mb-4">
                Campaign Progress
              </CardTitle>
              <div className="space-y-6">
                <div>
                  <div className="text-4xl font-cinzel font-bold text-secondary mb-2">
                    $0
                  </div>
                  <div className="text-muted-foreground font-crimson">
                    pledged of $3,000 goal
                  </div>
                </div>
                
                <Progress value={0} className="w-full h-3" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                  <div>
                    <div className="text-2xl font-cinzel font-bold text-foreground">0</div>
                    <div className="text-muted-foreground font-crimson text-sm">Backers</div>
                  </div>
                  <div>
                    <div className="text-2xl font-cinzel font-bold text-foreground">30</div>
                    <div className="text-muted-foreground font-crimson text-sm">Days to go</div>
                  </div>
                  <div>
                    <div className="text-2xl font-cinzel font-bold text-foreground">0%</div>
                    <div className="text-muted-foreground font-crimson text-sm">Funded</div>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        </section>

        {/* What You Get */}
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            What You'll Get
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {kickstarterHighlights.map((highlight, index) => {
              const Icon = highlight.icon;
              return (
                <Card key={index} className="bg-gradient-card border-border shadow-fantasy">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <Icon className="w-8 h-8 text-secondary" />
                      <CardTitle className="font-cinzel text-xl text-foreground">
                        {highlight.title}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground font-crimson">
                      {highlight.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Reward Tiers */}
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            Backer Rewards
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {rewardTiers.map((tier, index) => (
              <Card key={index} className={`bg-gradient-card border-border shadow-fantasy relative ${
                 tier.popular ? 'ring-2 ring-logo-gold' : ''
                 } ${
                  // Conditional class for the Limited Copies ring
                   tier.limited ? 'ring-2 ring-logo-steel' : ''
                 }`}>
                {tier.popular && (
                  <Badge 
                  variant="secondary"
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-logo-gold text-secondary-foreground">
                    Best Value
                  </Badge>
                )}
                {/* Badge for Limited Copies */}
                {tier.limited && (
                 <Badge 
                   variant="secondary" 
                   className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-logo-steel text-secondary-foreground">
                      Limited Copies
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="font-cinzel text-2xl text-foreground">
                    {tier.name}
                  </CardTitle>
                  <div className="text-3xl font-cinzel font-bold text-secondary">
                    {tier.price}
                  </div>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <CardDescription className="font-crimson text-muted-foreground">
                    {tier.description}
                  </CardDescription>
                  
                  {/*<div className="text-sm text-muted-foreground font-crimson">
                    <Users className="w-4 h-4 inline mr-1" />
                    {tier.backers.toLocaleString()} backers
                  </div>*/}
                  
                  <Button 
                    className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!isKickstarterActive}
                    asChild={isKickstarterActive}
                  >
                    {isKickstarterActive ? (
                      <a href={kickstarterUrl} target="_blank" rel="noopener noreferrer">
                        Select Reward
                      </a>
                    ) : (
                      <>Select Reward</>
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Stretch Goals */}
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            Stretch Goals
          </h2>
          
          <div className="space-y-4">
            {stretchGoals.map((goal, index) => (
              <Card key={index} className={`bg-gradient-card border-border ${
                goal.unlocked ? 'shadow-gold-glow' : 'shadow-fantasy'
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        goal.unlocked ? 'bg-secondary text-secondary-foreground' : 'bg-muted text-muted-foreground'
                      }`}>
                        {goal.unlocked ? <Star className="w-6 h-6" /> : <Target className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-cinzel font-semibold text-foreground">
                          {goal.title}
                        </div>
                        <div className="text-sm text-muted-foreground font-crimson">
                          {goal.goal} funding goal
                        </div>
                      </div>
                    </div>
                    
                    <Badge variant={goal.unlocked ? "unlocked" : "locked"}>
                      {goal.unlocked ? "Unlocked!" : "Locked"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Social Proof 
        <section className="mb-16 py-16 bg-gradient-hero rounded-lg text-center">
          <h2 className="text-4xl font-cinzel font-bold text-foreground mb-8">
            Join the Community
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-3xl font-cinzel font-bold text-secondary">10k+</div>
              <div className="text-muted-foreground font-crimson">Newsletter Subscribers</div>
            </div>
            <div>
              <div className="text-3xl font-cinzel font-bold text-secondary">50+</div>
              <div className="text-muted-foreground font-crimson">Playtesting Sessions</div>
            </div>
            <div>
              <div className="text-3xl font-cinzel font-bold text-secondary">50k+</div>
              <div className="text-muted-foreground font-crimson">Free Downloads</div>
            </div>
            <div>
              <div className="text-3xl font-cinzel font-bold text-secondary">4.2★</div>
              <div className="text-muted-foreground font-crimson">Community Rating</div>
            </div>
          </div>
          
          <p className="text-xl text-muted-foreground font-crimson mb-8 max-w-2xl mx-auto">
            "Featherpass has transformed our weekly game. The depth of lore and quality of content 
            is unmatched in the homebrew community."
          </p>
          
          <div className="text-muted-foreground font-crimson">
            - Sarah M., DM of 8 years
          </div>
        </section>*/}

        {/* Final CTA */}
        <section className="text-center">
          <h2 className="text-4xl font-cinzel font-bold text-foreground mb-6">
            Don't Miss Out
          </h2>
          <p className="text-xl text-muted-foreground font-crimson mb-8 max-w-2xl mx-auto">
            This campaign won't last forever. Join hundreds of DMs and players in making Ryon the ultimate campaign setting.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="hero"
              disabled={!isKickstarterActive}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
              asChild={isKickstarterActive}
            >
              {isKickstarterActive ? (
                <a href={kickstarterUrl} target="_blank" rel="noopener noreferrer">
                  <Heart className="w-5 h-5 mr-2" />
                  Back This Project
                </a>
              ) : (
                <>
                  <Heart className="w-5 h-5 mr-2" />
                  Back This Project
                </>
              )}
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
            >
              <a href={kickstarterUrl} target="_blank" rel="noopener noreferrer">
                <Gift className="w-5 h-5 mr-2" />
                Share with Friends
              </a>
            </Button>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Prelaunch;
