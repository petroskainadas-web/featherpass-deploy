import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { MessageCircleQuestion, FileText, ExternalLink, Copyright, ThumbsUp, ThumbsDown, PenTool } from "lucide-react";
import { Link } from "react-router-dom";
import aboutBackground from "@/assets/backgrounds/about-bg.jpg";

const Terms = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            Featherpass IP & User License
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-3xl mx-auto leading-relaxed">
            Your rights and obligations regarding our world, works, and creations
          </p>
          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-muted-foreground font-crimson text-lg leading-relaxed">
              The world of Ryon, content published by Featherpass, and the works you see here are our intellectual property. 
              This page explains how you may interact with, use, or incorporate our content, which parts are governed by open licenses, 
              and which rights we reserve.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none space-y-8">
              {/* Statement of Ownership */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Copyright className="w-8 h-8 mr-3 text-secondary" />
                  Our Ownership
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Featherpass owns the narrative world of Ryon, including all original characters, stories, setting elements, 
                    creative artworks, book titles, logos, and other trademarks associated with our works.
                  </p>
                  <p>
                    Ryon uses tabletop roleplaying game mechanics, some of which are built on open-licensed rules such as the 
                    System Reference Document 5.1. These underlying mechanics are distinct from our original creative expression. 
                    Unless a work or section is explicitly labeled as open-licensed, all text, images, layout, and setting material 
                    are proprietary and protected by copyright and trademark law.
                  </p>
                  <p>
                    This includes, without limitation, the world&apos;s history and cosmology, geography and locations, pantheons and deities, 
                    unique creatures, cultural details, character names and backstories, plot elements, and all visual artwork commissioned 
                    for or created by Featherpass.
                  </p>
                  <p>
                    Nothing on this page transfers ownership of the Ryon setting or Featherpass trademarks. You receive only the limited 
                    licenses described below.
                  </p>
                </div>
              </div>

              {/* Licensed Uses */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <ThumbsUp className="w-8 h-8 mr-3 text-secondary" />
                  What You Are Allowed to Do
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    This section describes the default ways you may use Featherpass content. Individual products or pages may include 
                    additional license notices that expand these permissions for specific material.
                  </p>

                  <h3 className="text-2xl font-cinzel font-semibold text-foreground mt-4">
                    At your table and in your community
                  </h3>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Personal Play:</strong> You may use our books, PDFs, and free online content in your own games, 
                      including modifying material for your group&apos;s needs.
                    </li>
                    <li>
                      <strong>Actual Play & Streams:</strong> You may run games in the world of Ryon on stream, in podcasts, or in 
                      recorded actual play, and you may monetise that content through platform tools such as ads, subscriptions, 
                      tips, or similar creator programs. Please include attribution as described in the section below.
                    </li>
                    <li>
                      <strong>Noncommercial Fan Creations:</strong> You may create and share noncommercial fan works based on Ryon, 
                      such as adventures, blog posts, maps, art, and fiction, as long as you:
                      <ul className="list-disc pl-6 space-y-2 mt-2">
                        <li>Do not charge money for access to the work (beyond incidental platform ads).</li>
                        <li>Do not reproduce large portions of our text or art verbatim.</li>
                        <li>Follow the attribution and disclaimer guidelines below.</li>
                      </ul>
                    </li>
                    <li>
                      <strong>Private Tools:</strong> You may type stat blocks, spells, and similar game data into private tools 
                      such as character managers or VTTs for your own games.
                    </li>
                  </ul>

                  <h3 className="text-2xl font-cinzel font-semibold text-foreground mt-6">
                    Open-licensed rules content (SRD 5.1 and similar)
                  </h3>
                  <p>
                    Some of our products include material identified as being derived from the System Reference Document 5.1 or other 
                    open rules. Where we clearly mark content as SRD 5.1 material or &quot;Open Game Content&quot; and provide the required attribution, 
                    that specific portion is made available under the Creative Commons Attribution 4.0 International License (CC BY 4.0), 
                    as provided by Wizards of the Coast.
                  </p>
                  <p>
                    For those clearly marked portions only, CC BY 4.0 allows you to:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Share:</strong> Copy and redistribute the licensed rules text in any medium or format.
                    </li>
                    <li>
                      <strong>Adapt:</strong> Remix, transform, and build upon the licensed rules for any purpose, including commercially.
                    </li>
                    <li>
                      <strong>Attribute:</strong> You must give appropriate credit, provide a link to the CC BY 4.0 license, and indicate 
                      if changes were made.
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground mt-4">
                    This open license applies only to the rules content that we expressly designate as such. Ryon&apos;s setting, story, characters, 
                    artwork, logos, and distinctive names are <em>not</em> licensed under CC BY 4.0 and remain fully protected.
                  </p>
                </div>
              </div>

              {/* Reserved Rights */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <ThumbsDown className="w-8 h-8 mr-3 text-secondary" />
                  What You Cannot Do Without Permission
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Except where a specific open license is clearly stated, you may <em>not</em> do the following without our express written permission:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      Reproduce, distribute, or resell our books, PDFs, or artwork, in whole or in substantial part.
                    </li>
                    <li>
                      Create and sell products (such as adventures, sourcebooks, novels, comics, video games, or apps) that primarily use the 
                      Ryon setting, its storylines, characters, or artwork as a core feature.
                    </li>
                    <li>
                      Use the titles &quot;Featherpass&quot; or &quot;Ryon&quot; as product or company names, or register them, our logos, or similar branding as trademarks.
                    </li>
                    <li>
                      Use our logos, trade dress, or visual identity in a way that suggests your work is an official Featherpass product or is endorsed by us.
                    </li>
                    <li>
                      Claim or imply that your work is &quot;official&quot; Featherpass content, or that we sponsor or approve your project, unless we have 
                      given you written permission.
                    </li>
                    <li>
                      Claim compatibility with &quot;Dungeons &amp; Dragons&quot; or other trademarked systems in ways that go beyond what is permitted by applicable 
                      open licenses and trademark guidelines.
                    </li>
                  </ul>
                  <p className="mt-4">
                    If you would like to create a commercial product that uses the Ryon setting or Featherpass branding, 
                    please contact us to discuss a license. We reserve the right to revoke any permission in cases of misuse, 
                    misrepresentation, or violation of these terms.
                  </p>
                </div>
              </div>

              {/* Attribution Guidelines */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <PenTool className="w-8 h-8 mr-3 text-secondary" />
                  How to Credit Us
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    When you use our content in the ways described above, please include clear attribution. Here is a recommended attribution 
                    that works for most fan projects and actual play content:
                  </p>
                  <div className="bg-background/50 p-6 rounded border border-border my-4">
                    <p className="font-mono text-base text-foreground">
                      Ryon and all associated setting material are © 2025 Featherpass. Used with permission. 
                      This is unofficial fan content and is not endorsed by Featherpass.
                    </p>
                  </div>
                  <p>
                    If your work also includes material derived from the System Reference Document 5.1, you should additionally include a notice such as:
                  </p>
                  <div className="bg-background/50 p-6 rounded border border-border my-4">
                    <p className="font-mono text-base text-foreground">
                      This work includes material derived from the System Reference Document 5.1 by Wizards of the Coast LLC, 
                      licensed under the Creative Commons Attribution 4.0 International License. SRD 5.1 material is licensed under CC BY 4.0. 
                      Original Ryon setting content is © 2025 Featherpass, all rights reserved.
                    </p>
                  </div>
                  <p>
                    <strong>For web content:</strong> Please include a hyperlink to our website (featherpass.com) and, where possible, 
                    a link to this license page.
                  </p>
                  <p>
                    <strong>For video or audio content:</strong> Include the attribution in your description and, if appropriate, in on-screen 
                    credits or show notes.
                  </p>
                  <p>
                    <strong>For PDF/print:</strong> Include the attribution in your credits or legal section. If you are unsure how to credit us 
                    for a particular project, you may contact us for guidance.
                  </p>
                </div>
              </div>

              {/* Licence Text */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-secondary" />
                  Full Licence Text
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Featherpass uses a combination of proprietary rights and open licenses:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Ryon setting and original IP:</strong> All Ryon setting material, story content, characters, artwork, 
                      layout, and branding are © Featherpass, all rights reserved. Your use of that content is governed by the terms on this page.
                    </li>
                    <li>
                      <strong>SRD 5.1 and other open rules:</strong> Portions of our products that are derived from the System Reference 
                      Document 5.1 are licensed to you under the Creative Commons Attribution 4.0 International License (CC BY 4.0), 
                      as specified in those products.
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground">
                    This page is a human-readable summary of how you may use our content. It is not legal advice and does not replace 
                    the full text of the Creative Commons license where that license applies.
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <MessageCircleQuestion className="w-8 h-8 mr-3 text-secondary" />
                  Frequently Asked Questions
                </h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      Can I translate one of your books and sell it?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      No, not by default. Translating and publishing one of our books is creating a derivative work of our copyrighted 
                      material and requires our express written permission. You may translate small excerpts for personal use or for 
                      noncommercial fan discussion, but you may not sell or distribute a full translation without a license from us.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      If I use your setting in my own homebrew, do I need to pay?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      For personal games at your table, no payment is required. You are encouraged to customise Ryon for your group. 
                      If you want to publish material that uses the Ryon setting, the answer depends on the project:
                    </p>
                    <ul className="list-disc pl-6 text-muted-foreground font-crimson text-lg space-y-2 mt-3">
                      <li>
                        Noncommercial fan creations are usually allowed under this policy as long as you credit us, do not reprint large 
                        portions of our text or art, and clearly mark the work as unofficial.
                      </li>
                      <li>
                        Commercial products that use the Ryon setting, its storylines, or its characters require a separate written license 
                        from Featherpass, unless you rely solely on rules content that we have explicitly marked as open-licensed.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      Can I adapt your characters for my own game?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      Yes, for personal play at your table or in actual play and noncommercial fan works, you may adapt our characters and 
                      NPCs to your stories, as long as you follow the attribution guidelines and do not claim to be official Featherpass content. 
                      For commercial products, our characters are part of our protected IP and you must obtain written permission before using 
                      them, even if you write your own rules or stat blocks.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      What if I am unsure whether my project is allowed?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      If you are uncertain whether your planned use fits within this policy, please reach out to us with a brief description 
                      of your project. We are happy to clarify what is permitted and, where appropriate, to discuss licensing options.
                    </p>
                  </div>
                </div>
              </div>

              {/* See Also */}
              <div className="bg-gradient-hero p-8 rounded-lg text-center">
                <h3 className="text-2xl font-cinzel font-bold text-foreground mb-4">
                  See Also
                </h3>
                <p className="text-muted-foreground font-crimson mb-6">
                  Learn about the open game licenses we use for system mechanics and rules.
                </p>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/licensing">
                    System Reference & Third-Party Licensing
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Terms;
