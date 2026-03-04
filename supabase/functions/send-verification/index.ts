import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const { email, type, payload } = await req.json()
    const token = crypto.randomUUID()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Store token in database
    const { error: dbError } = await supabase
      .from("verification_tokens")
      .insert({ email, token, type, payload })

    if (dbError) throw dbError

    const appUrl    = Deno.env.get("APP_URL") || "https://your-app.vercel.app"
    const verifyUrl = `${appUrl}/verify?token=${token}&type=${type}`
    const isClub    = type === "club"
    const label     = isClub ? "Club Registration" : "Membership Registration"
    const roleText  = isClub ? "Club Admin" : "Member"

    // Send email via Resend
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `CLUBBB <noreply@${Deno.env.get("EMAIL_DOMAIN") || "resend.dev"}>`,
        to: email,
        subject: `Verify your email — CLUBBB ${label}`,
        html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#fbbf24,#f59e0b,#e8820c);padding:36px 32px;border-radius:20px 20px 0 0;text-align:center">
          <div style="font-size:40px;margin-bottom:10px">🏜️</div>
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:30px;font-weight:900;color:#ffffff;letter-spacing:-1px">CLUBBB</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);margin-top:4px;letter-spacing:1px">DESERT DRIVING COMMUNITY</div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:40px 36px;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.08)">
          <h2 style="font-size:22px;font-weight:800;color:#09090b;margin:0 0 12px">Verify your email address</h2>
          <p style="font-size:15px;color:#71717a;line-height:1.65;margin:0 0 10px">
            You registered as a <strong style="color:#09090b">${roleText}</strong> on CLUBBB.
          </p>
          <p style="font-size:15px;color:#71717a;line-height:1.65;margin:0 0 32px">
            Click the button below to verify your email and activate your account. This link expires in <strong style="color:#09090b">24 hours</strong>.
          </p>

          <div style="text-align:center;margin-bottom:36px">
            <a href="${verifyUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#e8820c);color:#ffffff;font-weight:700;font-size:16px;padding:16px 44px;border-radius:14px;text-decoration:none;box-shadow:0 4px 24px rgba(232,130,12,0.4)">
              Verify Email Address →
            </a>
          </div>

          <div style="background:#f9f9f9;border-radius:12px;padding:16px 20px;margin-bottom:24px">
            <p style="font-size:12px;color:#a1a1aa;margin:0 0 6px;font-weight:600;letter-spacing:1px;text-transform:uppercase">Or copy this link</p>
            <p style="font-size:12px;color:#71717a;word-break:break-all;margin:0">${verifyUrl}</p>
          </div>

          <p style="font-size:12px;color:#a1a1aa;margin:0;line-height:1.6">
            If you didn't register for CLUBBB, you can safely ignore this email.<br>
            This link will expire automatically after 24 hours.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center">
          <p style="font-size:12px;color:#a1a1aa;margin:0">
            © ${new Date().getFullYear()} CLUBBB — Desert Driving Community Platform
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
        `,
      }),
    })

    if (!resendRes.ok) {
      const resendErr = await resendRes.text()
      throw new Error(`Resend error: ${resendErr}`)
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...cors, "Content-Type": "application/json" },
    })

  } catch (err) {
    console.error("send-verification error:", err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...cors, "Content-Type": "application/json" },
    })
  }
})
