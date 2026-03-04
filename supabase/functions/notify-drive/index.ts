import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function fmtTime(t: string): string {
  if (!t) return ""
  const [h, m] = t.split(":")
  const hr = Number(h)
  return `${hr === 0 ? 12 : hr > 12 ? hr - 12 : hr}:${m} ${hr < 12 ? "AM" : "PM"}`
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const { drive } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get all eligible members:
    // same club + rank >= drive's required rank + email verified
    const { data: members, error } = await supabase
      .from("users")
      .select("id, name, email, rank_id")
      .eq("club_id", drive.clubId || drive.club_id)
      .eq("email_verified", true)
      .gte("rank_id", drive.requiredRankId || drive.required_rank_id || 1)
      .not("role", "eq", "app_admin")

    if (error) throw error
    if (!members || members.length === 0) {
      return new Response(
        JSON.stringify({ sent: 0, message: "No eligible members found" }),
        { headers: { ...cors, "Content-Type": "application/json" } }
      )
    }

    const appUrl     = Deno.env.get("APP_URL") || "https://your-app.vercel.app"
    const fromDomain = Deno.env.get("EMAIL_DOMAIN") || "resend.dev"
    const driveDate  = drive.date  || ""
    const driveTime  = drive.startTime ? fmtTime(drive.startTime) : ""

    // Build one email per member
    const emails = members.map((member) => ({
      from: `CLUBBB <noreply@${fromDomain}>`,
      to:   member.email,
      subject: `New Drive: ${drive.title} 🏜️`,
      html: `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f8;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#fbbf24,#f59e0b,#e8820c);padding:28px 32px;border-radius:20px 20px 0 0;text-align:center">
          <div style="font-size:32px;margin-bottom:8px">🏜️</div>
          <div style="font-size:13px;color:rgba(255,255,255,0.85);font-weight:700;letter-spacing:3px;text-transform:uppercase">New Drive Posted</div>
          <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-size:26px;font-weight:900;color:#ffffff;margin-top:6px;letter-spacing:-0.5px">
            ${drive.title}
          </div>
        </td></tr>

        <!-- Body -->
        <tr><td style="background:#ffffff;padding:36px;border-radius:0 0 20px 20px;box-shadow:0 8px 40px rgba(0,0,0,0.08)">

          <p style="font-size:15px;color:#71717a;line-height:1.65;margin:0 0 24px">
            Hi <strong style="color:#09090b">${member.name}</strong>,<br>
            A new drive has been posted that you're eligible for. Don't miss your spot!
          </p>

          <!-- Drive details card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f9f9;border-radius:14px;padding:0;margin-bottom:28px;overflow:hidden">
            <tr><td style="padding:20px 24px">
              ${drive.description ? `
              <p style="font-size:14px;color:#71717a;line-height:1.6;margin:0 0 18px;padding-bottom:18px;border-bottom:1px solid #e4e4e7">
                ${drive.description}
              </p>` : ""}
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#71717a;width:50%">
                    📍 <strong style="color:#09090b">Location</strong>
                  </td>
                  <td style="padding:6px 0;font-size:14px;color:#09090b;font-weight:600">
                    ${drive.location}
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#71717a">
                    📅 <strong style="color:#09090b">Date</strong>
                  </td>
                  <td style="padding:6px 0;font-size:14px;color:#09090b;font-weight:600">
                    ${driveDate}
                  </td>
                </tr>
                ${driveTime ? `
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#71717a">
                    🕐 <strong style="color:#09090b">Start Time</strong>
                  </td>
                  <td style="padding:6px 0;font-size:14px;color:#09090b;font-weight:600">
                    ${driveTime}
                  </td>
                </tr>` : ""}
                ${drive.capacity ? `
                <tr>
                  <td style="padding:6px 0;font-size:14px;color:#71717a">
                    👥 <strong style="color:#09090b">Capacity</strong>
                  </td>
                  <td style="padding:6px 0;font-size:14px;color:#09090b;font-weight:600">
                    ${drive.capacity} members
                  </td>
                </tr>` : ""}
              </table>
            </td></tr>
          </table>

          <!-- CTA -->
          <div style="text-align:center;margin-bottom:28px">
            <a href="${appUrl}"
               style="display:inline-block;background:linear-gradient(135deg,#fbbf24,#e8820c);color:#ffffff;font-weight:700;font-size:15px;padding:15px 40px;border-radius:14px;text-decoration:none;box-shadow:0 4px 20px rgba(232,130,12,0.4)">
              Register for this Drive →
            </a>
          </div>

          <p style="font-size:12px;color:#a1a1aa;margin:0;line-height:1.6;text-align:center">
            Spots fill up fast — sign in to CLUBBB to secure your place.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:24px 0;text-align:center">
          <p style="font-size:12px;color:#a1a1aa;margin:0 0 4px">
            © ${new Date().getFullYear()} CLUBBB — Desert Driving Community Platform
          </p>
          <p style="font-size:11px;color:#d4d4d8;margin:0">
            You received this because you're an eligible member of this club.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
    }))

    // Use Resend batch API (sends all at once)
    const resendRes = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify(emails),
    })

    if (!resendRes.ok) {
      const resendErr = await resendRes.text()
      throw new Error(`Resend batch error: ${resendErr}`)
    }

    return new Response(
      JSON.stringify({ success: true, sent: members.length }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("notify-drive error:", err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    )
  }
})
