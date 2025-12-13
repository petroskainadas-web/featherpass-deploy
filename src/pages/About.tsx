import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Heart, Target, Users, BookOpen, Mail, Coffee, Facebook, Instagram, SquareArrowUpRight, Gamepad2, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { ContactFormDialog } from "@/components/ContactFormDialog";
import aboutBackground from "@/assets/backgrounds/about-bg.jpg";
import bluesky from "@/assets/bluesky.svg"
const About = () => {
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  return <Layout backgroundImage={aboutBackground} enableParallax overlayOpacity={0.9}>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">About Featherpass</h1>
          <p className="text-xl text-foreground font-crimson max-w-3xl mx-auto leading-relaxed">
            I am a passionate homebrew creator dedicated to bringing epic adventures and unforgettable characters 
            to your role-playing table. Every monster, spell, and story crafted is aimed to inspire wonder and create lasting memories.
          </p>
        </section>

        {/* Mission & Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-gradient-card border-border shadow-fantasy text-center">
            <CardHeader>
              <Heart className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <CardTitle className="font-cinzel text-xl text-foreground">
                Passion-Driven
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-crimson">
                Every piece of content created comes from genuine love for the game and respect for the stories we tell together.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-fantasy text-center">
            <CardHeader>
              <Target className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <CardTitle className="font-cinzel text-xl text-foreground">
                Quality First
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-crimson">
                All content is meticulously playtested and refined before release, ensuring balanced, engaging options for your table.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-card border-border shadow-fantasy text-center">
            <CardHeader>
              <Users className="w-12 h-12 mx-auto mb-4 text-secondary" />
              <CardTitle className="font-cinzel text-xl text-foreground">
                Community Focused
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground font-crimson">
                Your feedback is valued as the way to create better content, and a chance to grow alongside the amazing TTRPG community.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* The Story */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-cinzel font-bold text-logo-gold text-center mb-8">
              The Story
            </h2>
            
            <div className="prose prose-lg max-w-none">
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h3 className="text-2xl font-cinzel font-semibold text-foreground mb-6">My Journey</h3>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  I have been rolling dice since 1997, raised on the wonder of 2nd edition and the laughter of crowded tables. In 2005 I stepped behind the screen as a Game Master for the very first time and something lit that never went out. I began forging the world of Ryon for the people across from me, not for a market, not for a trend. I wanted gods that felt ancient and alive, faiths that could crack a heart open, stories that rang with consequence, and tools that let a Game Master move with confidence.
                </p>
                
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  It started as a living toolkit for my own tables, written with 3.5 in mind. There was no formal canon at first, only a makeshift map, a handful of epic NPC's, and the vision of the next campaign. I kept notes, I kept continuity, and I kept pushing the world to breathe with its own logic sometimes struggling to even understand it myself.
                </p>
                
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  From 2016 to 2019 I overhauled everything into the 5e ecosystem. That is when the canon of the world was set, its deep history outlined, and its theology given muscle and heartbeat. My goal was simple, make my own GMing sharper, faster, and less demanding, not publish. The work was my personal psychotherapy, meant to be shared with a table of good friends.
                </p>
                
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  By early 2020, like many of us, I was cooped up at home with a lot of time on my hands and sitting on fifteen years of scribbles and scattered pages, so I began digitizing the lot trying to channel my inner monk to impose some sort of order to the chaos. Friends and players urged me to publish but I feared the enormity of the task, my own weird combo of procrastination and perfectionism, and frankly sharing something that to me was so intimate.
                </p>
                
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  In late 2023 I looked up and realized the tools finally existed to bring this world to your table without losing what makes it personal. So supported by my loving companion and a few good friends, I made a decision, not to chase a trend, but to share a life's work.
                </p>

                <h4 className="text-xl font-cinzel font-semibold text-foreground mb-4">Why I make this</h4>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  The thing is, I'm a geek. I like it when the details are lively and consistent. I enjoy exploring new angles on old tropes. And I like my fantasy resonating with plausibility, especially when it is me behind the screen. So for this endeavor, I wanted cultures that breathed, beliefs that evolved, faiths that meant something beyond +1 bonuses, and legendary Gods to shake the firmament. But I also wanted it to be practical, modular, usable at any table, not just a mythic thesis for a setting no one plays.
                </p>

                <h4 className="text-xl font-cinzel font-semibold text-foreground mb-4">A one person workshop</h4>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  There is no team here, only me. Every idea began in my notebooks, then survived table scrutiny, revision, and time. I use AI tools because they make this possible at the scale and quality I demand. They help me organize, refine, simulate, and illustrate when that serves the work. That is assistance, not authorship. The concepts, the lore, the mechanics, the voice, these are mine and have been mine since the beginning. The hours are real, the effort is vast, and the fingerprints are human.
                </p>

                <h4 className="text-xl font-cinzel font-semibold text-foreground mb-4">My stance on AI</h4>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  I know the conversation is heated. It should be. Artists deserve respect, and credit matters. My position is simple, use the tools ethically and be transparent about it. Never use AI to imitate another person's work or style, there's room enough to find your own. Draw the line between AI generated content and AI assisted work, then honor it. When I use assistance, it is to sharpen what already exists, never to replace the heart that put it there.
                </p>

                <h4 className="text-xl font-cinzel font-semibold text-foreground mb-4">What you will find here</h4>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  This is the home of Ryon. You will (eventually) find living religions and legendary gods, histories with teeth, and practical game material tuned for real tables. You will find full fledged products, free resources, candid notes from the workshop, and a variety of articles on roleplaying, worldbuilding, and game design. The content has been made with Ryon in mind but it is also designed to be modular and easily reskinable, so you can tweak it for your own table and needs.
                </p>
                
                <h4 className="text-xl font-cinzel font-semibold text-foreground mb-4">Sound your horns and raise your banners</h4>
                <p className="text-muted-foreground font-crimson text-lg leading-relaxed mb-6">
                  If you care about craft, if you care about honesty, if you care about the kind of fantasy that hums with consequence, you are in the right place. Pull up a chair. Let us write epic sagas worthy of your table together!
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Stats 
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-foreground text-center mb-12">
            By the Numbers
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-cinzel font-bold text-secondary mb-2">50+</div>
              <div className="text-muted-foreground font-crimson">Free Resources Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-cinzel font-bold text-secondary mb-2">100+</div>
              <div className="text-muted-foreground font-crimson">Playtesting Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-cinzel font-bold text-secondary mb-2">1k+</div>
              <div className="text-muted-foreground font-crimson">Community Members</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-cinzel font-bold text-secondary mb-2">500+</div>
              <div className="text-muted-foreground font-crimson">Content Downloads</div>
            </div>
          </div>
        </section>*/}

        {/* What We're Working On */}
        <section className="mb-16">
          <h2 className="text-4xl font-cinzel font-bold text-logo-gold text-center mb-8">
            What I am Working On
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           	<Card className="bg-gradient-card border-border shadow-fantasy">
	            <CardHeader className="flex flex-row items-center gap-6"> 
	             <BookOpen className="w-8 h-8 text-foreground" /> 
	              <CardTitle className="font-cinzel text-3xl text-foreground">
	                Living Gods and Mythic Cultures
	              </CardTitle>
	            </CardHeader>
              <CardContent className="flex flex-col justify-between">
	             <CardContent>
	              <p className="text-lg text-muted-foreground font-crimson mb-4">
	               The first Featherpass product line, focused around cultures and religions complete with Gods, monsters, player options, and rich lore.
	              </p>
              <div className="flex justify-end">
	             <Link to="/products">
	              <Button variant="outline" size="sm">
	                Learn More
	              </Button>
	             </Link>
              </div>
             </CardContent>
	          </CardContent>
	         </Card>

          	<Card className="bg-gradient-card border-border shadow-fantasy">
	            <CardHeader className="flex flex-row items-center gap-6"> 
	             <Coffee className="w-8 h-8 text-foreground" /> 
	              <CardTitle className="font-cinzel text-3xl text-foreground">
	                Weekly Free Releases
	              </CardTitle>
	            </CardHeader>
              <CardContent className="flex flex-col justify-between">
	             <CardContent>
	              <p className="text-lg text-muted-foreground font-crimson mb-4">
	               New free content is released every week, from simple magic items to new subclasses, mostly focused around religion, lore, and culture.
	              </p>
              <div className="flex justify-end">
	             <Link to="/library">
	              <Button variant="outline" size="sm">
	                Browse Library
	              </Button>
	             </Link>
              </div>
             </CardContent>
	          </CardContent>
	         </Card>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-hero p-12 rounded-lg">
          <h2 className="text-4xl font-cinzel font-bold text-foreground mb-4">
            Let's Connect
          </h2>
          <p className="text-xl text-muted-foreground font-crimson mb-8 max-w-2xl mx-auto">
            Have questions about our content? Want to collaborate? Or just want to share how our homebrew 
            enhanced your latest session? We'd love to hear from you.
          </p>
          <div className="flex flex-col items-center gap-6">
            <Button size="lg" variant="hero" onClick={() => setContactDialogOpen(true)}>
              <Mail className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
            <p className="text-xs text-muted-foreground font-crimson">
              By sending, you agree to our{" "}
              <Link to="/privacy" className="text-secondary hover:underline">
                Privacy Policy
              </Link>
              .
            </p>
            <h2 className="text-3xl font-cinzel font-bold text-foreground mb-4">
            Follow us on
            </h2>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={() => window.open('https://www.facebook.com/profile.php?id=61583593630212', '_blank')}>
                <Facebook className="w-5 h-5 mr-2" />
                Facebook
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.open('https://www.instagram.com/featherpassofficial', '_blank')}>
                <Instagram className="w-5 h-5 mr-2" />
                Instagram
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.open('https://imgur.com/user/Featherpass', '_blank')}>
                <SquareArrowUpRight className="w-5 h-5 mr-2" />
                Imgur
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.open('https://discord.com', '_blank')}>
                <Gamepad2 className="w-5 h-5 mr-2" />
                Discord
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.open('https://x.com/featherpass_ofc', '_blank')}>
                <Twitter className="w-5 h-5 mr-2" />
                X
              </Button>
              <Button size="lg" variant="secondary" onClick={() => window.open('https://bsky.app/profile/featherpass.bsky.social', '_blank')}>
                <img src={bluesky} className="w-4 h-4 mr-2" />
                Bluesky
              </Button>
            </div>
          </div>
        </section>
      </div>

      <ContactFormDialog open={contactDialogOpen} onOpenChange={setContactDialogOpen} />
    </Layout>;
};
export default About;
