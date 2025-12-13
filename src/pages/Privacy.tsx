import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Shield, Eye, Mail, PanelLeftOpen, Lock, Server, Cookie, UserCheck, History } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="text-center mb-16">
          <h1 className="text-5xl font-cinzel font-bold text-logo-gold mb-4">Privacy Policy</h1>
          <p className="text-xl text-foreground font-crimson max-w-3xl mx-auto leading-relaxed">
            Your privacy matters. We believe in transparency and minimal data collection.
          </p>
          <div className="mt-6 max-w-3xl mx-auto">
            <p className="text-muted-foreground font-crimson text-lg leading-relaxed">
              Featherpass respects your privacy and does not sell your personal information. This page explains what
              data we collect, how we use it, and the rights you have in relation to it.
            </p>
          </div>
        </section>

        {/* Main Content */}
        <section className="mb-16">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-lg max-w-none space-y-8">
              {/* Introduction */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-secondary" />
                  Introduction
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    At Featherpass (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;), we are committed to protecting
                    your privacy and handling your personal data with care and respect. This Privacy Policy explains
                    what information we collect, why we collect it, how we use it, and your choices and rights.
                  </p>
                  <p>
                    We operate on a principle of minimal data collection: we only gather the information that is
                    necessary to provide our services, communicate with you, and keep our website secure and functional.
                  </p>
                  <p className="font-semibold text-foreground">
                    We do not sell, rent, or share your personal information with third parties for their own marketing
                    purposes.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This policy is for general information only and does not constitute legal advice.
                  </p>
                </div>
              </div>

              {/* Information We Collect */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Eye className="w-8 h-8 mr-3 text-secondary" />
                  Information We Collect
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <h3 className="text-xl font-cinzel font-semibold text-foreground">Contact Forms and Email</h3>
                  <p>
                    When you contact us through a form or directly by email, we collect the information you choose to
                    provide, such as your name, email address, and the content of your message. We use this information
                    only to respond to your inquiry and keep a record of our correspondence where reasonably necessary.
                  </p>

                  <h3 className="text-xl font-cinzel font-semibold text-foreground mt-6">Newsletter Subscriptions</h3>
                  <p>
                    If you subscribe to our newsletter, we collect and store your email address (and, optionally, your
                    name) to send you updates about our content, products, and campaigns (for example, Kickstarter
                    launches). You can unsubscribe at any time using the link provided in every newsletter email.
                  </p>

                  <h3 className="text-xl font-cinzel font-semibold text-foreground mt-6">Technical and Usage Data</h3>
                  <p>
                    Our hosting and infrastructure providers may automatically collect limited technical information
                    when you visit our website, such as your IP address, browser type, operating system, device
                    information, pages viewed, and the date and time of your visit. This data is used for security (for
                    example, detecting abuse), performance monitoring, and basic usage statistics.
                  </p>
                </div>
              </div>

              {/* How We Use Information / Legal Bases */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <PanelLeftOpen className="w-8 h-8 mr-3 text-secondary" />
                  How We Use Your Information
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>We use the information we collect for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Communication:</strong> To respond to your messages, inquiries, and support requests.
                    </li>
                    <li>
                      <strong>Newsletters:</strong> To send you updates, new content announcements, and campaign news,
                      only if you have subscribed or otherwise given your consent.
                    </li>
                    <li>
                      <strong>Service Delivery:</strong> To operate, maintain, and improve our website and services,
                      including ensuring that content is displayed correctly on your device.
                    </li>
                    <li>
                      <strong>Security and Abuse Prevention:</strong> To protect our website, infrastructure, and users
                      from malicious activity (for example, preventing spam or unauthorized access).
                    </li>
                    <li>
                      <strong>Compliance:</strong> To comply with legal obligations, enforce our terms, and respond to
                      lawful requests from public authorities where required.
                    </li>
                  </ul>
                  <p className="mt-4">
                    We do not use your data for automated decision-making or profiling that produces legal or similarly
                    significant effects for you.
                  </p>

                  <h3 className="text-xl font-cinzel font-semibold text-foreground mt-6">Legal Bases (EEA/UK Users)</h3>
                  <p className="text-muted-foreground font-crimson text-lg">
                    If you are located in the European Economic Area or the United Kingdom, we process your personal
                    data under one or more of the following legal bases:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Consent:</strong> For example, when you subscribe to our newsletter or choose optional
                      communications. You may withdraw your consent at any time.
                    </li>
                    <li>
                      <strong>Legitimate Interests:</strong> For example, to maintain the security of our website,
                      respond to your inquiries, and understand basic usage of our services, provided these interests
                      are not overridden by your rights and interests.
                    </li>
                    <li>
                      <strong>Legal Obligation:</strong> Where we need to retain certain information to comply with
                      applicable law.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Data Storage & Security */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Lock className="w-8 h-8 mr-3 text-secondary" />
                  Data Storage &amp; Security
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    We take appropriate technical and organizational measures to protect your personal data against
                    accidental or unlawful destruction, loss, alteration, unauthorized disclosure, or access.
                  </p>
                  <p>
                    Our primary infrastructure is powered by Supabase, which offers secure
                    database and hosting services, and by reputable email and newsletter providers. We select
                    third-party services that implement industry-standard security practices.
                  </p>
                  <p>
                    All data transmitted between your browser and our website is encrypted using HTTPS/SSL where
                    supported. Access to personal data is limited to people who need it to perform their work and who
                    are bound by confidentiality obligations.
                  </p>
                  <p>
                    We retain your personal data only for as long as necessary to fulfill the purposes described in this
                    policy (for example, as long as you remain subscribed to our newsletter or until we have resolved
                    your inquiry), unless a longer retention period is required or permitted by law.
                  </p>
                </div>
              </div>

              {/* Third-Party Services */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Server className="w-8 h-8 mr-3 text-secondary" />
                  Third-Party Services &amp; International Transfers
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    We rely on carefully selected third-party service providers to operate our website and communicate
                    with you. These providers act as data processors on our behalf and may process limited personal data
                    as needed to deliver their services.
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Supabase:</strong> Provides backend infrastructure, database,
                      authentication, and file storage. They process data necessary for site functionality and apply
                      robust security measures.
                    </li>
                    <li>
                      <strong>Resend:</strong> Handles transactional email delivery (such as contact form responses and
                      system emails). They process your email address and message content only as required to send
                      emails on our behalf.
                    </li>
                    <li>
                      <strong>Kit:</strong> We use Kit for newsletter and email campaign
                      management. If you subscribe, your email address (and any optional fields) will be stored and
                      processed by Kit solely for sending you communications you have opted into.
                    </li>
                  </ul>
                  <p>
                    Some of these providers may be located outside your country, including outside the European Economic
                    Area or the UK. Where such international transfers occur, we rely on appropriate safeguards (such as
                    standard contractual clauses) or other lawful transfer mechanisms as required by applicable data
                    protection laws.
                  </p>
                </div>
              </div>

              {/* Newsletter & Email Communications */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Mail className="w-8 h-8 mr-3 text-secondary" />
                  Newsletter &amp; Email Communications
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    When you subscribe to our newsletter, we collect and store your email address to send you updates
                    about new content, exclusive homebrew releases, and special announcements.
                  </p>

                  <h3 className="text-xl font-cinzel font-bold text-foreground mt-6 mb-3">Your Rights</h3>

                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Unsubscribe:</strong> Every newsletter email includes an unsubscribe link at the bottom.
                      You can unsubscribe at any time with one click.
                    </li>
                    <li>
                      <strong>Data Retention:</strong> When you unsubscribe, your email is marked as unsubscribed but
                      retained in our system to prevent accidental re-subscription. Your data is never shared with
                      third parties.
                    </li>
                    <li>
                      <strong>Resubscribe:</strong> If you change your mind after unsubscribing, you can always
                      resubscribe by resubmitting your email.
                    </li>
                  </ul>

                  <p className="mt-4">
                    To manage your newsletter preferences or unsubscribe, visit our{" "}
                    <a href="/newsletter" className="text-secondary hover:underline font-semibold">
                      Newsletter Page
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Cookies & Analytics */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Cookie className="w-8 h-8 mr-3 text-secondary" />
                  Cookies &amp; Analytics
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    We use cookies to enhance your experience and understand how visitors interact with our website. You
                    have full control over which cookies you accept.
                  </p>

                  <h3 className="text-xl font-cinzel font-bold text-foreground mt-6 mb-3">Types of Cookies We Use</h3>

                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Strictly Necessary Cookies:</strong> These cookies are essential for the website to
                      function. They include authentication tokens (to keep you logged in), UI preferences (like sidebar
                      state), and features that prevent abuse (like rate limiting for article likes). These cannot be
                      disabled as they are required for core functionality.
                    </li>
                    <li>
                      <strong>Analytics Cookies (Optional):</strong> With your consent, we use Google Analytics 4 to
                      understand how visitors use our website. This helps us improve our content and user experience. We
                      have configured Google Analytics with:
                      <ul className="list-circle pl-6 mt-2 space-y-1">
                        <li>IP anonymization enabled</li>
                        <li>No advertising features</li>
                        <li>No cross-site tracking</li>
                        <li>Consent Mode V2 for GDPR compliance</li>
                      </ul>
                      Analytics cookies include: _ga (2 years), _gid (24 hours), and _gat (1 minute).
                    </li>
                    <li>
                      <strong>Marketing &amp; Preference Cookies (Optional):</strong> We do not currently use marketing
                      or advertising cookies. If this changes in the future, we will request your explicit consent
                      before setting such cookies.
                    </li>
                  </ul>

                  <h3 className="text-xl font-cinzel font-bold text-foreground mt-6 mb-3">
                    Managing Your Cookie Preferences
                  </h3>

                  <p>
                    You can manage your cookie preferences at any time by visiting our{" "}
                    <a href="/cookies" className="text-secondary hover:underline font-semibold">
                      Cookie Settings page
                    </a>
                    . Changes to your preferences take effect immediately. Analytics cookies are turned on by default.
                  </p>

                  <p>
                    Please note that disabling necessary cookies may affect the functionality of the website, including
                    your ability to log in or use certain features.
                  </p>

                  <h3 className="text-xl font-cinzel font-bold text-foreground mt-6 mb-3">Third-Party Services</h3>

                  <p>
                    Google Analytics is provided by Google LLC. For information on how Google processes data, please see
                    Google's Privacy Policy at{" "}
                    <a
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-secondary hover:underline"
                    >
                      https://policies.google.com/privacy
                    </a>
                    .
                  </p>
                </div>
              </div>

              {/* Your Rights */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <UserCheck className="w-8 h-8 mr-3 text-secondary" />
                  Your Rights
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Depending on where you live, you may have certain rights regarding your personal data. If you are in
                    the European Economic Area or the UK, these rights typically include:
                  </p>
                  <ul className="list-disc pl-6 space-y-3">
                    <li>
                      <strong>Access:</strong> The right to request confirmation of whether we process your personal
                      data and to receive a copy of that data.
                    </li>
                    <li>
                      <strong>Correction:</strong> The right to request that inaccurate or incomplete personal data be
                      corrected.
                    </li>
                    <li>
                      <strong>Deletion:</strong> The right to request deletion of your personal data, subject to certain
                      exceptions.
                    </li>
                    <li>
                      <strong>Restriction:</strong> The right to request that we temporarily restrict processing of your
                      data in specific circumstances.
                    </li>
                    <li>
                      <strong>Objection:</strong> The right to object to processing based on our legitimate interests,
                      and the right to object at any time to processing for direct marketing.
                    </li>
                    <li>
                      <strong>Data Portability:</strong> The right to request a copy of your personal data in a
                      structured, commonly used, and machine-readable format, where technically feasible.
                    </li>
                    <li>
                      <strong>Withdraw Consent:</strong> Where processing is based on your consent (for example,
                      newsletters), the right to withdraw that consent at any time, without affecting the lawfulness of
                      processing before withdrawal.
                    </li>
                  </ul>
                  <p className="mt-4">
                    You also have the right to lodge a complaint with your local data protection authority if you
                    believe your rights have been infringed. We encourage you to contact us first so that we can try to
                    resolve any concerns.
                  </p>
                  <p className="mt-4">
                    To exercise any of these rights, please contact us using the details below. We will respond as soon
                    as reasonably possible and within any timeframes required by applicable law.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <Mail className="w-8 h-8 mr-3 text-secondary" />
                  Contact
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    Featherpass is the controller of your personal data in connection with this website. If you have any
                    questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please
                    contact us:
                  </p>
                  <p className="mt-2">
                    Email:{" "}
                    <a href="mailto:info@featherpass.com" className="text-secondary hover:underline">
                      info@featherpass.com
                    </a>
                  </p>
                  <div className="mt-4">
                    <Button variant="outline" size="lg" asChild>
                      <Link to="/about">
                        <Mail className="w-4 h-4 mr-2" />
                        Contact Us
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>

              {/* Effective Date & Updates */}
              <div className="bg-gradient-card p-8 rounded-lg border border-border shadow-fantasy mb-8">
                <h2 className="text-3xl font-cinzel font-bold text-logo-gold mb-6 flex items-center">
                  <History className="w-8 h-8 mr-3 text-secondary" />
                  Effective Date &amp; Updates
                </h2>
                <div className="text-muted-foreground font-crimson text-lg leading-relaxed space-y-4">
                  <p>
                    <strong>Effective Date:</strong> December 2025
                  </p>
                  <p>
                    <strong>Last Updated:</strong> December 2025
                  </p>
                  <p className="mt-4">
                    We may update this Privacy Policy from time to time to reflect changes in our services, our use of
                    third-party providers, or applicable legal requirements. When we make changes, we will update the
                    &quot;Last Updated&quot; date at the top of this page. In the case of material changes, we may also
                    provide a more prominent notice on the website.
                  </p>
                  <p>
                    We encourage you to review this Privacy Policy periodically. Your continued use of our website after
                    any updates are posted will signify that you have read and understood the updated policy.
                  </p>
                </div>
              </div>

              {/* See Also */}
              <div className="bg-gradient-hero p-8 rounded-lg text-center">
                <h3 className="text-2xl font-cinzel font-bold text-foreground mb-4">Related Legal Information</h3>
                <p className="text-muted-foreground font-crimson mb-6">
                  Learn more about our intellectual property rights and licensing terms.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button variant="hero" size="lg" asChild>
                    <Link to="/terms">IP & User License</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/licensing">System Licensing</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default Privacy;
