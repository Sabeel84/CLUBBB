import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors })

  try {
    const { token } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Look up token — must be unused and not expired
    const { data, error } = await supabase
      .from("verification_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !data) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired verification link" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      )
    }

    // Mark token as used immediately (prevents double-use)
    await supabase
      .from("verification_tokens")
      .update({ used: true })
      .eq("id", data.id)

    // Create the user/club record in the database
    if (data.type === "member") {
      const { error: insertErr } = await supabase
        .from("users")
        .insert({
          name:           data.payload.name,
          email:          data.payload.email,
          phone:          data.payload.phone,
          role:           "member",
          rank_id:        1,
          club_id:        Number(data.payload.clubId),
          email_verified: true,
        })

      if (insertErr && insertErr.code !== "23505") { // ignore duplicate
        throw insertErr
      }

    } else if (data.type === "club") {
      // Create club first
      const { data: club, error: clubErr } = await supabase
        .from("clubs")
        .insert({
          name:           data.payload.name,
          email:          data.payload.email,
          phone:          data.payload.phone,
          email_verified: true,
        })
        .select()
        .single()

      if (clubErr && clubErr.code !== "23505") throw clubErr

      // Create the admin user linked to that club
      if (club) {
        const { error: userErr } = await supabase
          .from("users")
          .insert({
            name:           data.payload.name,
            email:          data.payload.email,
            phone:          data.payload.phone,
            role:           "admin",
            rank_id:        5,
            club_id:        club.id,
            email_verified: true,
          })

        if (userErr && userErr.code !== "23505") throw userErr

        // Link admin back to club
        await supabase
          .from("clubs")
          .update({ admin_id: club.id })
          .eq("id", club.id)
      }
    }

    return new Response(
      JSON.stringify({ success: true, type: data.type }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    )

  } catch (err) {
    console.error("verify-token error:", err)
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
    )
  }
})
