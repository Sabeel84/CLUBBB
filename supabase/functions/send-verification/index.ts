// supabase/functions/send-verification/index.ts
// Deploy with: supabase functions deploy send-verification
// Requires env var: RESEND_API_KEY (set in Supabase Dashboard → Settings → Edge Functions)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || "";
const FROM_EMAIL     = Deno.env.get("FROM_EMAIL") || "noreply@clubbb.ae";
const APP_URL        = Deno.env.get("APP_URL")    || "https://clubbb.vercel.app";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("[send-verification] RESEND_API_KEY not set");
      return new Response(
        JSON.stringify({ error: "Email service not configured. Set RESEND_API_KEY in Supabase Edge Function secrets." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { email, type, payload } = await req.json();

    if (!email || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: email, type" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Build email content based on registration type ──
    let subject: string;
    let html: string;

    if (type === "member") {
      const name = payload?.name || "there";
      subject = "Welcome to CLUBBB — Verify Your Account";
      html = memberEmailHtml(name, email, APP_URL);

    } else if (type === "club") {
      const adminName = payload?.user?.name || "there";
      const clubName  = payload?.club?.name || "your club";
      subject = `CLUBBB — Club Registration: ${clubName}`;
      html = clubEmailHtml(adminName, clubName, email, APP_URL);

    } else if (type === "test") {
      subject = "CLUBBB — Email Test ✅";
      html = testEmailHtml(APP_URL);

    } else {
      return new Response(
        JSON.stringify({ error: `Unknown type: ${type}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Send via Resend ──
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to:   [email],
        subject,
        html,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("[send-verification] Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: resendData }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`[send-verification] Email sent to ${email} (type: ${type}) id: ${resendData.id}`);
    return new Response(
      JSON.stringify({ ok: true, id: resendData.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[send-verification] Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// ── Email Templates ──────────────────────────────────────────────

function baseHtml(content: string, appUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<style>
  body { margin:0; padding:0; background:#f7f7f8; font-family:'Segoe UI',Arial,sans-serif; }
  .wrap { max-width:560px; margin:40px auto; background:#fff; border-radius:20px; overflow:hidden; box-shadow:0 4px 24px rgba(0,0,0,.08); }
  .header { background:linear-gradient(135deg,#fb923c,#fbbf24); padding:36px 40px; text-align:center; }
  .logo { font-size:28px; font-weight:900; color:#fff; letter-spacing:-1px; }
  .logo span { color:rgba(255,255,255,.7); }
  .tagline { font-size:13px; color:rgba(255,255,255,.85); margin-top:4px; letter-spacing:2px; text-transform:uppercase; }
  .body { padding:36px 40px; }
  .title { font-size:22px; font-weight:800; color:#1a1a1a; margin-bottom:12px; }
  .text { font-size:15px; color:#4a4a4a; line-height:1.7; margin-bottom:16px; }
  .highlight { background:#fff7ed; border:1px solid #fed7aa; border-radius:12px; padding:18px 24px; margin:24px 0; }
  .highlight-label { font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#ea580c; margin-bottom:6px; }
  .highlight-value { font-size:16px; font-weight:700; color:#1a1a1a; }
  .btn { display:inline-block; background:linear-gradient(135deg,#fb923c,#fbbf24); color:#fff; font-weight:700; font-size:15px; padding:14px 36px; border-radius:12px; text-decoration:none; margin:8px 0; }
  .divider { border:none; border-top:1px solid #f0f0f0; margin:28px 0; }
  .footer { padding:20px 40px 32px; text-align:center; font-size:12px; color:#9ca3af; line-height:1.6; }
  .footer a { color:#fb923c; text-decoration:none; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <div class="logo">CLUB<span>BB</span></div>
    <div class="tagline">Desert Driving Community</div>
  </div>
  <div class="body">${content}</div>
  <hr class="divider"/>
  <div class="footer">
    © 2026 CLUBBB · Desert Driving Platform<br/>
    <a href="${appUrl}">${appUrl}</a>
  </div>
</div>
</body>
</html>`;
}

function memberEmailHtml(name: string, email: string, appUrl: string): string {
  return baseHtml(`
    <div class="title">Welcome to CLUBBB, ${name}! 🏜️</div>
    <p class="text">Your member account has been registered successfully. You can now sign in and join your club's drives.</p>
    <div class="highlight">
      <div class="highlight-label">Your Account</div>
      <div class="highlight-value">${email}</div>
    </div>
    <p class="text">Use your email and the password you chose during registration to sign in.</p>
    <a href="${appUrl}" class="btn">OPEN CLUBBB →</a>
    <p class="text" style="margin-top:24px;font-size:13px;color:#9ca3af;">
      If you didn't register on CLUBBB, you can safely ignore this email.
    </p>
  `, appUrl);
}

function clubEmailHtml(adminName: string, clubName: string, email: string, appUrl: string): string {
  return baseHtml(`
    <div class="title">Club Registration Received 🚙</div>
    <p class="text">Hi ${adminName}, your club registration has been submitted and is pending review by the CLUBBB team.</p>
    <div class="highlight">
      <div class="highlight-label">Club Name</div>
      <div class="highlight-value">${clubName}</div>
      <div class="highlight-label" style="margin-top:12px;">Admin Email</div>
      <div class="highlight-value">${email}</div>
    </div>
    <p class="text">Once approved, your club will appear on CLUBBB and members can start joining. You'll receive a confirmation email when approved.</p>
    <a href="${appUrl}" class="btn">VIEW STATUS →</a>
    <p class="text" style="margin-top:24px;font-size:13px;color:#9ca3af;">
      Questions? Reply to this email or contact the App Admin.
    </p>
  `, appUrl);
}

function testEmailHtml(appUrl: string): string {
  return baseHtml(`
    <div class="title">Email Test Successful ✅</div>
    <p class="text">This is a test email from CLUBBB. If you're reading this, your Resend + Supabase Edge Function integration is working correctly.</p>
    <div class="highlight">
      <div class="highlight-label">Status</div>
      <div class="highlight-value">✅ Resend connected · Edge Function deployed</div>
    </div>
    <p class="text">You can now send verification emails to new members and club admins.</p>
    <a href="${appUrl}" class="btn">BACK TO CLUBBB →</a>
  `, appUrl);
}
