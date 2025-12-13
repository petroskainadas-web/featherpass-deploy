import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { BookOpen, ExternalLink, FileText, Ban, MessageCircleQuestion, Cog, ThumbsUp } from "lucide-react";
import { Link } from "react-router-dom";

const Licensing = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">
            System Reference & Third-Party Licensing
          </h1>
          <p className="text-xl text-foreground font-crimson max-w-3xl mx-auto leading-relaxed">
            How we use D&amp;D System Reference Documents and open licences
          </p>
          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-muted-foreground font-crimson text-lg leading-relaxed">
              Featherpass builds compatible content using officially released System Reference Documents (SRDs) 
              from Wizards of the Coast and other open systems. This page explains which licences we rely on, 
              how we comply with them, and what that means for you as a creator or player.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none space-y-8">
              {/* What These Systems Are */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <BookOpen className="w-8 h-8 mr-3 text-secondary" />
                  What is the SRD and Why It Matters
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    A System Reference Document (SRD) is a collection of tabletop roleplaying game rules released 
                    under a public licence so that third-party publishers can create compatible material. Wizards of 
                    the Coast has released several SRDs over time.
                  </p>
                  <p>
                    For our homebrew 5e compatible products, we primarily rely on the 5th Edition System Reference 
                    Documents:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>SRD 5.1</strong> (2014 rules), available under the Creative Commons Attribution 4.0 
                      International License (CC BY 4.0).
                    </li>
                    <li>
                      <strong>SRD 5.2</strong> (2024 rules), also released under CC BY 4.0 for the updated 2024 ruleset.
                    </li>
                  </ul>
                  <p>
                    In some limited cases, we may reference older SRDs such as the 3.5 edition SRD, which remains 
                    available under the Open Game License (OGL) 1.0a. When we do so, those products will include the 
                    required OGL notice in their own legal text.
                  </p>
                  <p>
                    The SRDs provide the underlying mechanics. Featherpass then adds original setting content, lore, 
                    and presentation for the world of Ryon, which remain our intellectual property as described on 
                    our IP &amp; User License page.
                  </p>
                </div>
              </div>

              {/* Our Use of These Licenses */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Cog className="w-8 h-8 mr-3 text-secondary" />
                  How We Use SRDs and Open Content
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Featherpass is a third-party publisher. We are not affiliated with or endorsed by Wizards of the Coast. 
                    We comply with their published licences as follows:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Creative Commons (CC BY 4.0) for SRD 5.1 and SRD 5.2:</strong> Where our products include 
                      content taken from SRD 5.1 or SRD 5.2, we use that material under the Creative Commons Attribution 
                      4.0 International License. Those sections are clearly identified in each product and accompanied by 
                      the attribution text that Wizards requests.
                    </li>
                    <li>
                      <strong>Legacy OGL 1.0a content:</strong> If a specific product uses material from older SRDs that 
                      are only available under OGL 1.0a (such as the 3.5 edition SRD), that product will also reproduce 
                      the full OGL 1.0a licence and mark any Open Game Content (OGC) in accordance with that licence.
                    </li>
                    <li>
                      <strong>No use of Wizards&apos; Product Identity:</strong> We do not copy or use Wizards of the Coast&apos;s 
                      Product Identity, such as trademarks, setting-specific monsters and characters, or other 
                      non-SRD content. Creatures and terms explicitly excluded from the SRDs (for example, certain iconic 
                      monsters and settings) do not appear in our products as copied material.
                    </li>
                    <li>
                      <strong>Clear separation from our own IP:</strong> Ryon&apos;s original lore, characters, deities, factions, 
                      and other story elements are <em>not</em> part of any SRD and are not licensed as Open Game Content. 
                      They remain proprietary to Featherpass and are governed by our IP &amp; User License terms.
                    </li>
                  </ul>

                  <h3 className="text-2xl font-cinzel font-semibold text-foreground mt-6">
                    Example SRD Attribution Text
                  </h3>
                  <p>
                    In our books and PDFs, you will see attribution language similar to the following where SRD material is used:
                  </p>
                  <div className="bg-background/50 p-6 rounded border border-border my-4">
                    <p className="font-mono text-base text-foreground">
                      This work includes material taken from the System Reference Document 5.1 (&quot;SRD 5.1&quot;) and/or 
                      System Reference Document 5.2 (&quot;SRD 5.2&quot;) by Wizards of the Coast LLC, available at 
                      dnd.wizards.com/resources/systems-reference-document. The SRD 5.1 and SRD 5.2 are licensed under 
                      the Creative Commons Attribution 4.0 International License.
                    </p>
                  </div>
                </div>
              </div>

              {/* What You Can Do */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <ThumbsUp className="w-8 h-8 mr-3 text-secondary" />
                  What Can You Do With SRD-Based Content?
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Your rights to use D&amp;D SRD material come directly from the licences that Wizards of the Coast has applied 
                    to those SRDs, not from Featherpass. In practical terms:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      You may use the rules and game mechanics from SRD 5.1 and SRD 5.2 under the terms of the 
                      Creative Commons Attribution 4.0 International License (CC BY 4.0), including for commercial projects, 
                      as long as you follow that licence&apos;s attribution and other requirements.
                    </li>
                    <li>
                      If you work with legacy SRD 3.5 or other OGL content, you may use that material under the OGL 1.0a, 
                      provided you follow the terms of that licence, including correctly designating Open Game Content and 
                      Product Identity and reproducing the OGL text where required.
                    </li>
                    <li>
                      Our products combine SRD rules with original Ryon setting material. The <em>SRD portions</em> retain 
                      their original open licence, but our original text, names, lore, and artwork are not automatically 
                      open-licensed just because they appear next to SRD content.
                    </li>
                  </ul>
                  <p className="font-semibold text-foreground mt-4">
                    If you want to reuse SRD rules in your own work, the safest route is to draw directly from the official SRD 
                    documents and follow the Creative Commons (or OGL, where applicable) licence terms yourself.
                  </p>
                </div>
              </div>

              {/* Restrictions & Important Notes */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Ban className="w-8 h-8 mr-3 text-secondary" />
                  Restrictions &amp; Important Notes
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>No endorsement:</strong> Dungeons &amp; Dragons, D&amp;D, and all related trademarks are the property 
                      of Wizards of the Coast LLC. Featherpass and Ryon are not affiliated with, endorsed by, or sponsored by 
                      Wizards of the Coast.
                    </li>
                    <li>
                      <strong>No transfer of Wizards&apos; IP:</strong> Our use of the SRDs does not grant you any rights to Wizards&apos; 
                      proprietary characters, monsters, settings, or artwork that are not included in the SRDs.
                    </li>
                    <li>
                      <strong>No automatic licence to Ryon:</strong> The Ryon setting, its storylines, characters, pantheons, and 
                      artwork are not Open Game Content. To use Ryon material beyond what is allowed for personal or fan use, 
                      you must follow our IP &amp; User License or obtain written permission from Featherpass.
                    </li>
                    <li>
                      <strong>Accuracy of legal texts:</strong> This page is a human-readable explanation of how we approach open 
                      licences. In any conflict between this summary and the text of an official licence (such as CC BY 4.0 or 
                      OGL 1.0a), the official licence texts control.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Full Licence Texts */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <FileText className="w-8 h-8 mr-3 text-secondary" />
                  Full Licence Texts
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    If you intend to publish your own compatible material, you should review the full legal texts for the 
                    licences discussed here.
                  </p>
                  <div className="flex flex-wrap gap-4 mt-4">
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                    >
                      <a
                        href="https://creativecommons.org/licenses/by/4.0/legalcode"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View CC BY 4.0 Licence
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                    >
                      <a
                        href="https://www.d20srd.org/ogl.htm"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        View OGL 1.0a Text
                      </a>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      asChild
                    >
                      <a
                        href="https://dnd.wizards.com/resources/systems-reference-document"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Wizards SRD Resources
                      </a>
                    </Button>
                  </div>
                  <p className="mt-4">
                    Nothing on this page is legal advice. If you are planning a substantial commercial product, we encourage 
                    you to consult a qualified lawyer familiar with intellectual property and game publishing.
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
                      Is everything in your products under an open licence?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      No. Our products mix open-licensed rules material with original Ryon setting content. The parts taken 
                      from SRD 5.1 and SRD 5.2 are available under CC BY 4.0 as provided by Wizards of the Coast. Everything 
                      else, including our prose, setting details, artwork, and unique monsters, is © Featherpass and is not 
                      automatically open-licensed.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      Can I reuse your monsters or creatures in my own book?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      You are free to design your own monsters using the SRD rules. However, our specific named creatures, 
                      their lore, and our exact stat block text are part of our intellectual property unless we explicitly mark 
                      them as open content. For commercial projects, you should not copy our monsters or lore without written 
                      permission, even though you can freely use the same underlying SRD mechanics.
                    </p>
                  </div>
                  <div>
                    <h3 className="text-xl font-cinzel font-semibold text-foreground mb-2">
                      What happens if these licences change in the future?
                    </h3>
                    <p className="text-muted-foreground font-crimson text-lg">
                      SRD 5.1 and SRD 5.2 have been released under the Creative Commons Attribution 4.0 International License, 
                      which is designed to be irrevocable as long as its terms are followed. If Wizards updates their SRD 
                      offerings or publishes new guidance, we will review those changes and may update our products and this 
                      page, but our existing publications will continue to rely on the licences in place at the time of release.
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
                  Learn about how we license our own intellectual property and what rights you have regarding the world of Ryon.
                </p>
                <Button variant="hero" size="lg" asChild>
                  <Link to="/terms">
                    Featherpass IP & User License
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

export default Licensing;
