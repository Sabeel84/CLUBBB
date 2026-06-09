// supabase/functions/send-push/index.ts
// Deploy: supabase functions deploy send-push

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VAPID_PUBLIC  = Deno.env.get("VAPID_PUBLIC_KEY")  || "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") || "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT")     || "mailto:admin@clubbb.ae";
const SUPA_URL      = Deno.env.get("SUPABASE_URL")      || "";
const SUPA_KEY      = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function base64urlToUint8Array(base64url: string): Uint8Array {
  const padding = "=".repeat((4 - base64url.length % 4) % 4);
  const base64 = (base64url + padding).replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function buildVapidJWT(audience: string): Promise<string> {
  const header  = { alg: "ES256", typ: "JWT" };
  const payload = { aud: audience, exp: Math.floor(Date.now() / 1000) + 43200, sub: VAPID_SUBJECT };
  const encode  = (obj: object) =>
    btoa(JSON.stringify(obj)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const unsigned = `${encode(header)}.${encode(payload)}`;
  const key = await crypto.subtle.importKey(
    "raw", base64urlToUint8Array(VAPID_PRIVATE),
    { name: "ECDSA", namedCurve: "P-256" }, false, ["sign"]
  );
  const sig = await crypto.subtle.sign({ name:"ECDSA", hash:"SHA-256" }, key, new TextEncoder().encode(unsigned));
  return `${unsigned}.${btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"")}`;
}

async function sendWebPush(subscription: any, payload: object): Promise<boolean> {
  try {
    const endpoint = subscription.endpoint;
    const jwt = await buildVapidJWT(new URL(endpoint).origin);
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Authorization": `vapid t=${jwt},k=${VAPID_PUBLIC}`,
        "Content-Type":  "application/json",
        "TTL":           "86400",
      },
      body: JSON.stringify(payload),
    });
    return res.ok || res.status === 201;
  } catch(e) { return false; }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { user_ids, title, body, url, tag } = await req.json();

    if (!user_ids?.length || !title) {
      return new Response(JSON.stringify({ error: "Missing user_ids or title" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supa = createClient(SUPA_URL, SUPA_KEY);

    // Get push subscriptions ONLY for specified user_ids (drive marshals/admins)
    const { data: subs } = await supa
      .from("push_subscriptions")
      .select("subscription")
      .in("user_id", user_ids);

    if (!subs?.length) {
      return new Response(JSON.stringify({ sent: 0, message: "No subscribers in this drive" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const pushPayload = { title, body, url: url || "/", tag: tag || "clubbb" };
    let sent = 0;
    await Promise.all(subs.map(async (row: any) => {
      try {
        const ok = await sendWebPush(JSON.parse(row.subscription), pushPayload);
        if (ok) sent++;
      } catch(e) {}
    }));

    return new Response(JSON.stringify({ sent, total: subs.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch(e) {
    return new Response(JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
