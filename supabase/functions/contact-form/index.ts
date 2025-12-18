import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { enforceIpLimit, enforceValueLimit, limiters } from "../_shared/ratelimiter.ts";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const sanitizeText = (text: string, maxLength?: number): string => {
  let sanitized = text
    .trim()
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[<>]/g, ''); // Remove < and > to prevent basic HTML injection

  if (maxLength && sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Rate Limit---------------------------------------------
  const limitedIp = await enforceIpLimit({
   req,
   limiter: limiters.contactIp,
   key: "contact-form",
   corsHeaders,
   mode: "json",
  });
  if (limitedIp) return limitedIp;

  try {
    const { name, email, subject, message }: ContactRequest = await req.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ error: "All fields are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Sanitize inputs
    const sanitizedName = sanitizeText(name, 100);
    const sanitizedEmail = sanitizeText(email.trim().toLowerCase(), 255);
    const sanitizedSubject = sanitizeText(subject, 200);
    const sanitizedMessage = sanitizeText(message, 2000);

    // Rate Limit---------------------------------------------
    const limitedEmail = await enforceValueLimit({
     limiter: limiters.contactEmail,
     key: "contact-form",
     label: "email",
     value: sanitizedEmail,
     corsHeaders,
     mode: "json",
   });
   if (limitedEmail) return limitedEmail;

    // Validate subject is one of the allowed values
    const allowedSubjects = ["General Feedback", "Sales Inquiry", "Collaboration"];
    if (!allowedSubjects.includes(sanitizedSubject)) {
      return new Response(
        JSON.stringify({ error: "Invalid subject selection" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Format email body
    const emailHtml = `
      <div style="font-family: 'Crimson Pro', Georgia, serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f5f1; border: 1px solid #d4af37; border-radius: 8px;">
        <h1 style="font-family: 'Cinzel', serif; color: #d4af37; border-bottom: 2px solid #d4af37; padding-bottom: 10px;">
          New Contact Form Submission
        </h1>
        
        <div style="background-color: #ffffff; padding: 20px; margin: 20px 0; border-radius: 4px; border-left: 4px solid #d4af37;">
          <h2 style="font-family: 'Cinzel', serif; color: #2d1f0f; margin-top: 0;">
            Subject: ${sanitizedSubject}
          </h2>
          
          <div style="margin: 15px 0;">
            <strong style="color: #5c3d1f;">From:</strong> ${sanitizedName}<br>
            <strong style="color: #5c3d1f;">Email:</strong> <a href="mailto:${sanitizedEmail}" style="color: #d4af37;">${sanitizedEmail}</a>
          </div>
          
          <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5dcc8;">
            <strong style="color: #5c3d1f;">Message:</strong>
            <p style="white-space: pre-wrap; line-height: 1.6; color: #2d1f0f; margin-top: 10px;">
              ${sanitizedMessage}
            </p>
          </div>
        </div>
        
        <div style="margin-top: 20px; padding: 15px; background-color: #fef9f1; border-radius: 4px; text-align: center; font-size: 12px; color: #8b7355;">
          <p style="margin: 0;">
            This message was sent via the Featherpass contact form<br>
            Reply directly to this email to respond to ${sanitizedName}
          </p>
        </div>
      </div>
    `;

    const emailText = `
New Contact Form Submission

Subject: ${sanitizedSubject}

From: ${sanitizedName}
Email: ${sanitizedEmail}

Message:
${sanitizedMessage}

---
This message was sent via the Featherpass contact form.
Reply directly to this email to respond to ${sanitizedName}.
    `;

    // Send email via Resend
    const emailResponse = await resend.emails.send({
      from: "Featherpass Contact <contact@system.featherpass.com>",
      to: ["info@featherpass.com"],
      replyTo: sanitizedEmail,
      subject: `[Contact Form] ${sanitizedSubject}`,
      html: emailHtml,
      text: emailText,
    });

    console.log(`Contact form submission from ${sanitizedEmail} (${sanitizedSubject})`);
    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Your message has been sent successfully!",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in contact-form function:", error);
    return new Response(
      JSON.stringify({
        error: error.message || "Failed to send message. Please try again later.",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
});