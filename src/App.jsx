import { useState, useEffect, useRef } from "react";

/* ═══ SUPABASE EDGE FUNCTION HELPERS ═══════════════════════════════
   Calls Supabase Edge Functions for email verification & notifications.
   Reads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from .env
   Set these in Vercel → Project → Settings → Environment Variables.
═══════════════════════════════════════════════════════════════════ */
const SUPA_URL  = import.meta.env.VITE_SUPABASE_URL  || "";
const SUPA_KEY  = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

async function invokeEdge(fnName, body) {
  if (!SUPA_URL || !SUPA_KEY) {
    console.warn(`[CLUBBB] Supabase not configured — skipping ${fnName}`);
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(`${SUPA_URL}/functions/v1/${fnName}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPA_KEY}`,
        "apikey": SUPA_KEY,
      },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) console.error(`[CLUBBB] ${fnName} error:`, data);
    return { ok: res.ok, data };
  } catch (err) {
    console.error(`[CLUBBB] ${fnName} fetch error:`, err);
    return { ok: false, reason: "network_error" };
  }
}

/** Send email verification for member or club registration */
async function sendVerificationEmail(email, type, payload) {
  return invokeEdge("send-verification", { email, type, payload });
}

/** Notify eligible members when a drive is posted */
async function notifyDrivePosted(drive) {
  return invokeEdge("notify-drive", { drive });
}

/* ═══ PASSWORD HASHING (SHA-256 via Web Crypto API) ════════════
   No npm package needed — uses the browser's built-in crypto.
   Passwords are never stored in plain text.
═══════════════════════════════════════════════════════════════ */
async function hashPassword(password) {
  const str = password + "clubbb_salt_2026";
  // Use Web Crypto API (requires HTTPS / secure context)
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", encoder.encode(str));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for non-secure contexts (HTTP dev, older browsers)
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = ((h << 5) - h) + str.charCodeAt(i); h |= 0; }
  return "fallback_" + Math.abs(h).toString(16).padStart(8, "0") + "_" + str.length;
}

async function verifyPassword(password, storedHash) {
  const hash = await hashPassword(password);
  return hash === storedHash;
}

function validatePassword(pw) {
  if (!pw || pw.length < 8) return "Password must be at least 8 characters.";
  if (!/[A-Z]/.test(pw)) return "Password must include at least one uppercase letter.";
  if (!/[0-9]/.test(pw)) return "Password must include at least one number.";
  return null; // valid
}


/* ═══════════════════════════════════════════════════════════════
   CLUBBB — Desert Driving Community Platform
   Modern White Theme: Plus Jakarta Sans + Syne
═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
html{font-size:16px;-webkit-text-size-adjust:100%;text-size-adjust:100%;overflow-x:hidden}
:root{
  --bg:#ffffff;
  --bg2:#fafafa;
  --bg3:#f4f4f5;
  --bg4:#ececee;
  --off:#f7f7f8;

  --ink:#09090b;
  --ink2:#18181b;
  --ink3:#3f3f46;
  --mid:#71717a;
  --mid2:#a1a1aa;
  --mid3:#d4d4d8;

  --line:#e4e4e7;
  --line2:#d4d4d8;
  --line3:#a1a1aa;

  --acc:#e8820c;
  --acc2:#f59e0b;
  --acc3:#fbbf24;
  --acc4:#fde68a;
  --acc-pale:rgba(232,130,12,.06);
  --acc-pale2:rgba(232,130,12,.1);
  --acc-pale3:rgba(232,130,12,.22);
  --acc-pale4:rgba(232,130,12,.04);

  --green:#16a34a;--green-pale:rgba(22,163,74,.08);
  --red:#dc2626;--red-pale:rgba(220,38,38,.08);
  --orange:#ea580c;--orange-pale:rgba(234,88,12,.08);
  --blue:#2563eb;--blue-pale:rgba(37,99,235,.08);
  --purple:#7c3aed;--purple-pale:rgba(124,58,237,.08);

  --sh-xs:0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03);
  --sh-sm:0 2px 8px rgba(0,0,0,.05),0 1px 3px rgba(0,0,0,.04);
  --sh-md:0 8px 28px rgba(0,0,0,.07),0 2px 8px rgba(0,0,0,.04);
  --sh-lg:0 20px 60px rgba(0,0,0,.09),0 6px 18px rgba(0,0,0,.05);
  --sh-xl:0 32px 80px rgba(0,0,0,.12),0 10px 28px rgba(0,0,0,.07);
  --sh-gold:0 6px 28px rgba(232,130,12,.3);
  --sh-gold-lg:0 12px 48px rgba(232,130,12,.38);

  --r-xs:6px;--r-sm:10px;--r-md:16px;--r-lg:20px;--r-xl:24px;--r-2xl:32px;
}

body{background:var(--off);color:var(--ink);font-family:'Plus Jakarta Sans',sans-serif;min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}
::-webkit-scrollbar{width:6px}
::-webkit-scrollbar-track{background:var(--bg2)}
::-webkit-scrollbar-thumb{background:var(--mid3);border-radius:6px}
::-webkit-scrollbar-thumb:hover{background:var(--mid2)}
.noise{display:none}
.wrap{position:relative;z-index:1;min-height:100vh}

/* ── KEYFRAMES ───────────────────────────────────────── */
@keyframes fadeUp{from{opacity:0;transform:translateY(28px)}to{opacity:1;transform:translateY(0)}}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
@keyframes scaleIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes floatA{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
@keyframes floatB{0%,100%{transform:translateY(0)}50%{transform:translateY(-13px)}}
@keyframes shimmerBg{0%{background-position:-400% 0}100%{background-position:400% 0}}
@keyframes goldPulse{0%,100%{box-shadow:var(--sh-gold)}50%{box-shadow:var(--sh-gold-lg)}}
@keyframes dotDance{0%,100%{transform:scale(1)}50%{transform:scale(1.35)}}
@keyframes tup{from{transform:translateY(14px) scale(.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}

/* ── NAV ─────────────────────────────────────────────── */
.nav{display:flex;align-items:center;justify-content:space-between;padding:0 40px;height:70px;background:rgba(255,255,255,.9);border-bottom:1px solid var(--line);backdrop-filter:blur(24px) saturate(1.8);-webkit-backdrop-filter:blur(24px) saturate(1.8);position:sticky;top:0;z-index:400;transition:box-shadow .2s}
.nav.scrolled{box-shadow:0 4px 24px rgba(0,0,0,.07)}
.nav-brand{display:flex;align-items:center;gap:12px;cursor:pointer;user-select:none}
.nav-logo-mark{width:44px;height:44px;background:var(--acc2);border-radius:14px;display:flex;align-items:center;justify-content:center;gap:1px;flex-shrink:0;box-shadow:var(--sh-gold);transition:transform .25s cubic-bezier(.34,1.56,.64,1),box-shadow .25s}
.nav-brand:hover .nav-logo-mark{transform:scale(1.1) rotate(-4deg);box-shadow:var(--sh-gold-lg)}
.nav-logo-mark span{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;line-height:1}
.nav-wordmark{font-family:'Syne',sans-serif;font-size:21px;font-weight:800;color:var(--ink);letter-spacing:-.5px}
.nav-links{display:flex;gap:2px;align-items:center}
.nbtn{padding:8px 16px;background:transparent;border:1.5px solid transparent;color:var(--mid);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s;border-radius:12px;white-space:nowrap}
.nbtn:hover{color:var(--ink);background:var(--bg3)}
.nbtn.on{color:var(--acc);background:var(--acc-pale2);border-color:var(--acc-pale3);font-weight:600}
.nbtn.kill{color:var(--red)}
.nbtn.kill:hover{background:var(--red-pale);border-color:rgba(220,38,38,.15)}
.nav-mob{display:none;background:var(--bg2);border:1.5px solid var(--line2);border-radius:12px;width:40px;height:40px;font-size:18px;cursor:pointer;color:var(--ink);transition:all .2s;align-items:center;justify-content:center;flex-shrink:0}
.nav-mob:hover{background:var(--acc-pale);border-color:var(--acc-pale3)}
.nav-mob:active{transform:scale(.92)}
@media(max-width:760px){.nav{padding:0 14px;height:58px}.nav-links .nbtn:not(.kill){display:none}.nav-mob{display:flex}}

/* ── MOBILE DRAWER ───────────────────────────────────── */
.mob-drawer{display:none;position:fixed;top:60px;left:0;right:0;background:#fff;border-bottom:1px solid var(--line);z-index:380;padding:0;box-shadow:0 20px 60px rgba(0,0,0,.12);transform:translateY(-12px);opacity:0;pointer-events:none;transition:all .28s cubic-bezier(.4,0,.2,1)}
.mob-drawer.open{transform:translateY(0);opacity:1;pointer-events:all}
@media(max-width:760px){.mob-drawer{display:block}}
.mob-drawer-inner{padding:16px 16px 20px}
.mob-drawer-section{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--mid3);padding:10px 14px 6px;display:block}
.mob-drawer .nbtn{display:flex;align-items:center;gap:12px;width:100%;padding:13px 16px;border-radius:14px;font-size:15px;font-weight:500;color:var(--ink2);border:none;background:transparent;text-align:left;transition:all .18s;margin-bottom:2px}
.mob-drawer .nbtn:hover{background:var(--bg3);color:var(--ink)}
.mob-drawer .nbtn.on{background:var(--acc-pale2);color:var(--acc);font-weight:700}
.mob-drawer .nbtn.kill{color:var(--red)}
.mob-drawer .nbtn.kill:hover{background:var(--red-pale)}
.mob-drawer-icon{width:34px;height:34px;border-radius:10px;background:var(--bg3);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;transition:all .18s}
.mob-drawer .nbtn.on .mob-drawer-icon{background:var(--acc-pale2)}
.mob-drawer .nbtn.kill .mob-drawer-icon{background:var(--red-pale)}
.mob-drawer-divider{height:1px;background:var(--line);margin:10px 14px}
.mob-drawer-footer{padding:14px 16px 6px;display:flex;align-items:center;gap:10px}
.mob-drawer-avatar{width:38px;height:38px;background:var(--acc2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:16px;font-weight:800;color:#0a0a0a;flex-shrink:0}
.mob-drawer-user{flex:1;min-width:0}
.mob-drawer-uname{font-size:14px;font-weight:700;color:var(--ink);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.mob-drawer-urole{font-size:11px;color:var(--mid2);font-weight:500;text-transform:capitalize}

/* ── BOTTOM NAV (mobile) ─────────────────────────────── */
.mobile-nav{display:none;position:fixed;bottom:0;left:0;right:0;z-index:390;background:rgba(255,255,255,.96);border-top:1px solid var(--line);backdrop-filter:blur(24px);padding:6px 0 max(10px,env(safe-area-inset-bottom));box-shadow:0 -4px 24px rgba(0,0,0,.07)}
.mobile-nav-inner{display:flex;align-items:stretch;justify-content:space-around;max-width:500px;margin:0 auto;padding:0 4px}
.mnav-btn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 4px 5px;background:transparent;border:none;cursor:pointer;transition:all .2s;border-radius:16px;min-width:0;position:relative}
.mnav-btn.on::before{content:'';position:absolute;top:0;left:50%;transform:translateX(-50%);width:24px;height:3px;background:linear-gradient(90deg,var(--acc2),var(--acc3));border-radius:0 0 6px 6px}
.mnav-icon{font-size:22px;line-height:1;transition:transform .22s cubic-bezier(.34,1.56,.64,1)}
.mnav-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:600;color:var(--mid2);transition:color .18s;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:60px}
.mnav-btn.on .mnav-icon{transform:scale(1.25)}
.mnav-btn.on .mnav-label{color:var(--acc);font-weight:700}
.mnav-btn:active{transform:scale(.9)}
@media(max-width:600px){.mobile-nav{display:block}.page{padding-bottom:96px!important}}

/* ── HERO ────────────────────────────────────────────── */
.hero{position:relative;overflow:hidden;padding:128px 60px 120px;text-align:center;background:#fff}
.hero-bg{position:absolute;inset:0;background:
  radial-gradient(ellipse 100% 70% at 50% -10%,rgba(251,191,36,.11) 0%,transparent 55%),
  radial-gradient(ellipse 55% 45% at 90% 85%,rgba(232,130,12,.07) 0%,transparent 55%),
  radial-gradient(ellipse 45% 55% at 5% 70%,rgba(245,158,11,.06) 0%,transparent 55%)}
.hero-grain{position:absolute;inset:0;opacity:.025;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");background-size:256px}
.hero-blob1{position:absolute;top:-80px;right:5%;width:420px;height:420px;background:radial-gradient(circle,rgba(251,191,36,.14) 0%,transparent 65%);border-radius:50%;animation:floatA 10s ease-in-out infinite;pointer-events:none}
.hero-blob2{position:absolute;bottom:-60px;left:2%;width:260px;height:260px;background:radial-gradient(circle,rgba(232,130,12,.09) 0%,transparent 65%);border-radius:50%;animation:floatB 13s ease-in-out infinite;pointer-events:none}
.hero-eyebrow{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:5px;text-transform:uppercase;color:var(--acc);margin-bottom:26px;position:relative;display:flex;align-items:center;justify-content:center;gap:12px;animation:fadeIn .9s ease both}
.hero-eyebrow::before,.hero-eyebrow::after{content:'';flex:0 0 28px;height:1.5px;background:linear-gradient(90deg,transparent,var(--acc2));border-radius:2px}
.hero-eyebrow::after{background:linear-gradient(90deg,var(--acc2),transparent)}
.hero-title{font-family:'Syne',sans-serif;font-size:clamp(42px,11vw,176px);font-weight:800;line-height:.88;color:var(--ink);position:relative;margin-bottom:8px;letter-spacing:-4px;animation:fadeUp .8s .08s ease both;text-align:center;white-space:normal;word-break:break-word}
.hero-title span{background:linear-gradient(135deg,var(--acc3),var(--acc2) 45%,var(--acc));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;position:relative}
.hero-sub{font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(14px,2vw,20px);font-weight:400;color:var(--mid);margin-bottom:48px;animation:fadeUp .8s .18s ease both;line-height:1.5}
.hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;animation:fadeUp .8s .28s ease both}
.hero-scroll-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.4;animation:fadeIn 1.2s .8s ease both}
.hero-scroll-hint span{font-size:10px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--mid)}
.hero-scroll-dot{width:6px;height:6px;background:var(--mid2);border-radius:50%;animation:dotDance 2s 1s ease-in-out infinite}
.hero-slash{display:none}
@media(max-width:600px){
  .hero{padding:48px 16px 56px;text-align:center}
  .hero-blob1,.hero-blob2{display:none}
  .hero-title{font-size:clamp(36px,12vw,56px)!important;letter-spacing:-1.5px!important;line-height:1!important;white-space:normal!important;text-align:center!important;width:100%!important;word-break:break-word!important;overflow-wrap:anywhere!important}
  .hero-eyebrow{font-size:10px;letter-spacing:3.5px;margin-bottom:18px;justify-content:center}
  .hero-sub{font-size:14px;margin-bottom:36px;text-align:center;padding:0 4px}
  .hero-ctas{flex-direction:row;flex-wrap:nowrap;justify-content:center;gap:10px;padding:0 4px}
  .hero-ctas .btn{flex:1;justify-content:center;padding:12px 10px;font-size:13px;min-width:0;white-space:nowrap}
  .hero-scroll-hint{display:none}
}
@media(max-width:400px){
  .hero-title{font-size:clamp(30px,10vw,44px)!important;letter-spacing:-1px!important}
}

/* ── BUTTONS ─────────────────────────────────────────── */
.btn{padding:14px 30px;font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .22s cubic-bezier(.4,0,.2,1);border:none;border-radius:14px;letter-spacing:-.01em;position:relative;overflow:hidden;display:inline-flex;align-items:center;gap:6px}
.btn.gold{background:linear-gradient(135deg,var(--acc3) 0%,var(--acc2) 45%,var(--acc) 100%);color:#fff;box-shadow:var(--sh-gold);animation:goldPulse 3s ease-in-out infinite}
.btn.gold:hover{box-shadow:var(--sh-gold-lg);transform:translateY(-2px) scale(1.02)}
.btn.ghost{background:transparent;color:var(--acc);border:2px solid var(--acc-pale3);border-radius:14px}
.btn.ghost:hover{background:var(--acc-pale);border-color:var(--acc);transform:translateY(-2px)}
.btn.sm{padding:9px 20px;font-size:13px;border-radius:10px}
.btn.xs{padding:6px 14px;font-size:12px;border-radius:9px;font-weight:600}
.btn.out-grn{background:transparent;color:var(--green);border:1.5px solid rgba(22,163,74,.25);border-radius:11px}
.btn.out-grn:hover{background:var(--green-pale)}
.btn.out-red{background:transparent;color:var(--red);border:1.5px solid rgba(220,38,38,.25);border-radius:11px}
.btn.out-red:hover{background:var(--red-pale)}
.btn.out{background:transparent;color:var(--acc);border:1.5px solid var(--acc-pale3);border-radius:11px}
.btn.out:hover{border-color:var(--acc);background:var(--acc-pale)}
.btn:active{transform:scale(.97)!important}
@media(max-width:600px){.btn{font-size:13px;padding:12px 20px;border-radius:12px}.btn.sm{padding:8px 14px;font-size:12px}.btn.xs{padding:6px 11px;font-size:11px}}

/* ── PAGE ────────────────────────────────────────────── */
.page{max-width:1180px;margin:0 auto;padding:60px 44px;animation:fadeUp .5s ease both}
@media(max-width:600px){.page{padding:16px 12px}}
@media(max-width:600px){.page{padding-bottom:96px!important}}

/* ── SECTION HEADER ──────────────────────────────────── */
.sh{margin-bottom:40px}
.sh-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:4.5px;text-transform:uppercase;color:var(--acc);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.sh-label::before{content:'';width:20px;height:2.5px;background:linear-gradient(90deg,var(--acc),var(--acc3));border-radius:3px;flex-shrink:0}
.sh-title{font-family:'Syne',sans-serif;font-size:clamp(24px,5vw,44px);font-weight:800;letter-spacing:-1.5px;color:var(--ink);line-height:1}
.sh-sub{font-size:14px;color:var(--mid);margin-top:12px;font-weight:400;line-height:1.6}
@media(max-width:600px){.sh{margin-bottom:20px}.sh-label{font-size:10px;letter-spacing:2.5px}.sh-title{font-size:clamp(22px,7vw,34px);letter-spacing:-1px}.sh-sub{font-size:12px;margin-top:8px}}

/* ── CARD ────────────────────────────────────────────── */
.card{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);padding:36px;margin-bottom:18px;position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:box-shadow .22s}
.card:hover{box-shadow:var(--sh-md)}
.card::before{content:'';position:absolute;top:0;left:28px;right:28px;height:1px;background:linear-gradient(90deg,transparent,var(--acc-pale3),transparent)}
.card-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--acc);margin-bottom:26px}
@media(max-width:600px){.card{padding:18px 14px;border-radius:18px;margin-bottom:12px}}

/* ── STATS ───────────────────────────────────────────── */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:36px}
.stat{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:28px 16px;text-align:center;position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:all .25s cubic-bezier(.4,0,.2,1);cursor:default}

@media(max-width:600px){.stats{gap:8px;margin-bottom:24px}.stat{padding:16px 8px;border-radius:14px}.stat-n{font-size:clamp(20px,6vw,36px)}.stat-l{font-size:10px}}
.stat::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,var(--acc-pale) 0%,transparent 70%);pointer-events:none}
.stat:hover{box-shadow:var(--sh-md);transform:translateY(-4px);border-color:var(--acc-pale3)}
.stat-n{font-family:'Syne',sans-serif;font-size:clamp(32px,7vw,68px);font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;letter-spacing:-2px}
.stat-l{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--mid2);margin-top:8px;line-height:1.3}
@media(max-width:520px){.stats{grid-template-columns:repeat(3,1fr);gap:10px}.stat{padding:20px 10px}.stat-n{font-size:clamp(26px,8vw,44px);letter-spacing:-1px}.stat-l{font-size:9px;letter-spacing:1px}}

/* ── BADGES ──────────────────────────────────────────── */
.bdg{display:inline-flex;align-items:center;padding:3px 9px;font-size:11px;font-weight:600;letter-spacing:.2px;border-radius:100px;white-space:nowrap}
.bdg.g{background:var(--green-pale);color:var(--green);border:1px solid rgba(22,163,74,.18)}
.bdg.r{background:var(--red-pale);color:var(--red);border:1px solid rgba(220,38,38,.18)}
.bdg.s{background:var(--acc-pale2);color:var(--acc);border:1px solid var(--acc-pale3)}
.bdg.d{background:var(--bg3);color:var(--mid);border:1px solid var(--line2)}
.bdg.o{background:var(--orange-pale);color:var(--orange);border:1px solid rgba(234,88,12,.18)}

/* ── FORM ────────────────────────────────────────────── */
.fg{margin-bottom:22px}
.fl{display:block;font-family:'Plus Jakarta Sans',sans-serif;font-size:12px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--mid);margin-bottom:10px}
.fi{width:100%;padding:14px 18px;background:var(--bg2);border:1.5px solid var(--line2);border-radius:var(--r-md);color:var(--ink);font-family:'Plus Jakarta Sans',sans-serif;font-size:15px;outline:none;transition:all .2s}
.fi:focus{border-color:var(--acc);background:var(--bg);box-shadow:0 0 0 4px var(--acc-pale)}
.fi::placeholder{color:var(--mid3)}
.fi-ta{resize:vertical;min-height:90px;line-height:1.6}
@media(max-width:600px){.fi{padding:11px 14px;font-size:14px;border-radius:11px}.fi-ta{min-height:80px}.fg{margin-bottom:16px}.fl{font-size:11px;margin-bottom:7px}}
.fi-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M0 0l5 7 5-7z' fill='%23e8820c'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;background-color:var(--bg2);cursor:pointer}

/* ── GRIDS ───────────────────────────────────────────── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:600px){.g2{grid-template-columns:1fr;gap:14px}}

/* ── TABS ────────────────────────────────────────────── */
.tabs{display:flex;border-bottom:2px solid var(--line);margin-bottom:28px;overflow-x:auto;gap:2px;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:10px 16px;background:transparent;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:var(--mid);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:500;cursor:pointer;transition:all .18s;white-space:nowrap;border-radius:12px 12px 0 0}
.tab:hover{color:var(--ink);background:var(--bg3)}
.tab.on{color:var(--acc);border-bottom-color:var(--acc);font-weight:700;background:var(--acc-pale)}

/* ── USER ROW ────────────────────────────────────────── */
.urow{display:flex;align-items:center;gap:16px;padding:18px 22px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);margin-bottom:10px;transition:all .2s;box-shadow:var(--sh-xs)}
.urow:hover{box-shadow:var(--sh-md);border-color:var(--acc-pale3);transform:translateY(-2px)}
.ava{width:48px;height:48px;background:var(--acc2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#0a0a0a;flex-shrink:0;box-shadow:0 3px 14px rgba(232,130,12,.3)}
.uname{font-size:15px;font-weight:700;color:var(--ink);letter-spacing:-.02em}
.umeta{font-size:12px;color:var(--mid2);margin-top:3px}

/* ── DRIVE CARD ──────────────────────────────────────── */
.dcard{background:var(--bg);border:1px solid var(--line);border-radius:20px;padding:0;margin-bottom:14px;position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:box-shadow .2s}
.dcard-accent{position:absolute;left:0;top:0;bottom:0;width:4px;background:linear-gradient(180deg,var(--acc3),var(--acc2) 55%,var(--acc));z-index:2;pointer-events:none}
.dcard-inner{padding:16px 16px 14px 20px;width:100%;box-sizing:border-box}
.dcard-img{width:100%;height:180px;object-fit:cover;display:block;border-radius:20px 20px 0 0}
.dcard-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-.3px;color:var(--ink);line-height:1.3;margin-bottom:4px;display:block;width:100%;word-break:break-word;overflow-wrap:anywhere}
.dcard-desc{font-size:13px;color:var(--mid);line-height:1.55;margin-bottom:10px;word-break:break-word}
.dcard-badges{display:flex;flex-wrap:wrap;gap:4px 6px;margin-bottom:8px;align-items:center}
.dcard-meta-grid{display:grid;grid-template-columns:1fr 1fr;gap:5px 8px;margin-bottom:8px}
.dcard-meta{display:flex;flex-wrap:wrap;gap:4px 10px;margin-bottom:8px;align-items:center}
.dm{font-size:12px;font-weight:500;color:var(--mid2);display:flex;align-items:center;gap:3px;overflow:hidden;max-width:100%}
.dm strong{color:var(--ink);font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%}
.capbar{height:4px;background:var(--bg3);border-radius:100px;margin:4px 0 8px;overflow:hidden}
.capfill{height:100%;background:linear-gradient(90deg,var(--acc3),var(--acc2));border-radius:100px;transition:width .4s ease}
.waitbdg{font-size:10px;font-weight:700;color:var(--orange);background:var(--orange-pale);border:1px solid rgba(234,88,12,.18);padding:2px 8px;border-radius:100px;white-space:nowrap}
.dcard-actions{display:flex;gap:5px;flex-wrap:wrap;align-items:center;padding-top:8px;border-top:1px solid var(--line)}
@media(max-width:600px){
  .dcard{border-radius:14px;margin-bottom:10px}
  .dcard-inner{padding:12px 12px 10px 16px}
  .dcard-img{height:120px;border-radius:14px 14px 0 0}
  .dcard-title{font-size:14px;letter-spacing:0;line-height:1.3;margin-bottom:3px}
  .dcard-desc{font-size:11.5px;margin-bottom:7px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
  .dcard-meta-grid{grid-template-columns:1fr;gap:3px;margin-bottom:6px}
  .dm{font-size:11px}
  .dcard-badges{gap:3px 5px;margin-bottom:6px}
  .dcard-actions{gap:4px;padding-top:6px}
}


/* ── VOTE CARD ───────────────────────────────────────── */
.vcard{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:26px 28px;margin-bottom:13px;box-shadow:var(--sh-sm);transition:box-shadow .18s}
.vcard:hover{box-shadow:var(--sh-md)}
.vcard-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--ink);margin-bottom:8px}

/* ── AD BANNER (legacy - kept for admin panel) ───────── */
.adbanner{background:linear-gradient(135deg,#fffdf5,#fff9ea);border:1px solid rgba(232,130,12,.18);border-left:4px solid var(--acc2);border-radius:var(--r-lg);padding:18px 22px;margin-bottom:14px;display:flex;align-items:center;gap:18px;position:relative;transition:box-shadow .18s}
.adbanner:hover{box-shadow:var(--sh-sm)}
.adbanner::after{content:'SPONSORED';position:absolute;top:10px;right:16px;font-size:9px;font-weight:800;letter-spacing:2px;color:var(--acc);text-transform:uppercase;opacity:.65}
.adicon{width:54px;height:44px;background:var(--acc-pale2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.adtitle{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:3px}
.adsub{font-size:13px;color:var(--mid)}

/* ── MODAL ───────────────────────────────────────────── */
.mover{position:fixed;inset:0;background:rgba(9,9,11,.55);z-index:600;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);animation:fadeIn .18s ease both}
.modal{background:var(--bg);border:1px solid var(--line);border-radius:24px;max-width:580px;width:100%;max-height:calc(100vh - 40px);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:36px 32px 32px;position:relative;box-shadow:var(--sh-xl);margin:auto}
.modal-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.6px;color:var(--ink);margin-bottom:22px;padding-right:44px;line-height:1.2;word-break:break-word}
.mclose{position:absolute;top:12px;right:12px;background:var(--bg2);border:1.5px solid var(--line2);border-radius:50%;width:34px;height:34px;display:flex;align-items:center;justify-content:center;font-size:11px;color:var(--mid);cursor:pointer;font-weight:800;transition:all .18s;z-index:10}
.mclose:hover{background:var(--red-pale);color:var(--red)}
@media(max-width:600px){
  .mover{padding:0!important;align-items:flex-end!important}
  .modal{position:fixed!important;bottom:0!important;left:0!important;right:0!important;top:0!important;border-radius:0!important;max-width:100%!important;width:100%!important;height:100%!important;max-height:100%!important;overflow-y:scroll!important;-webkit-overflow-scrolling:touch!important;padding:20px 16px 140px!important;margin:0!important;border:none!important;box-shadow:none!important;animation:none!important}
  .modal-title{font-size:17px;margin-bottom:16px;padding-right:38px;letter-spacing:0}
  .mclose{top:10px;right:10px;width:30px;height:30px;font-size:10px}
}
@keyframes slideUp{from{transform:translateY(100%);opacity:.4}to{transform:translateY(0);opacity:1}}


/* ── PROFILE HERO ────────────────────────────────────── */
.profile-hero{background:linear-gradient(135deg,#ffffff 0%,#fffdf5 60%,#fff8e8 100%);border:1px solid var(--acc-pale3);border-radius:var(--r-2xl);padding:28px;margin-bottom:24px;position:relative;overflow:hidden;box-shadow:var(--sh-md)}

@media(max-width:600px){.profile-hero{padding:18px 16px;border-radius:18px;margin-bottom:18px}.profile-hero-bg-text{font-size:90px}}
.profile-hero::before{content:'';position:absolute;top:-100px;right:-80px;width:380px;height:380px;background:radial-gradient(circle,rgba(251,191,36,.15) 0%,transparent 65%);pointer-events:none}
.profile-hero::after{content:'';position:absolute;bottom:-60px;left:-50px;width:240px;height:240px;background:radial-gradient(circle,rgba(232,130,12,.07) 0%,transparent 65%);pointer-events:none}
.profile-hero-bg-text{position:absolute;right:-10px;bottom:-30px;font-family:'Syne',sans-serif;font-size:150px;font-weight:800;color:rgba(232,130,12,.04);line-height:1;pointer-events:none;user-select:none;letter-spacing:-6px}

/* ── TABLE ───────────────────────────────────────────── */
.mtable{width:100%;border-collapse:separate;border-spacing:0}
.mtable thead tr{background:var(--bg3)}
.mtable thead th:first-child{border-radius:var(--r-sm) 0 0 0}
.mtable thead th:last-child{border-radius:0 var(--r-sm) 0 0}
.mtable thead th{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:var(--mid);padding:14px 18px;text-align:left;border-bottom:2px solid var(--line)}
.mtable tbody tr{transition:background .15s}
.mtable tbody tr:hover{background:var(--bg2)}
.mtable tbody td{padding:16px 18px;font-size:14px;color:var(--ink);vertical-align:middle;border-bottom:1px solid var(--line)}
.t-name{font-weight:700}
.t-meta{font-size:11px;color:var(--mid2);margin-top:3px}

/* ── RANK PILLS ──────────────────────────────────────── */
.rbdg{display:inline-flex;align-items:center;gap:5px;padding:4px 12px;font-size:11px;font-weight:700;letter-spacing:.5px;text-transform:uppercase;border:1.5px solid;border-radius:100px}
.rbdg-1{color:#0284c7;border-color:rgba(2,132,199,.25);background:rgba(2,132,199,.07)}
.rbdg-2{color:#b45309;border-color:rgba(180,83,9,.25);background:rgba(180,83,9,.07)}
.rbdg-3{color:#c2410c;border-color:rgba(194,65,12,.25);background:rgba(194,65,12,.07)}
.rbdg-4{color:#b91c1c;border-color:rgba(185,28,28,.25);background:rgba(185,28,28,.07)}
.rbdg-5{color:#6d28d9;border-color:rgba(109,40,217,.25);background:rgba(109,40,217,.07)}

/* ── ROLE PILLS ──────────────────────────────────────── */
.rolebdg{display:inline-block;padding:3px 12px;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;border-radius:100px}
.rolebdg-admin{color:var(--red);background:var(--red-pale);border:1px solid rgba(220,38,38,.18)}
.rolebdg-marshal{color:var(--orange);background:var(--orange-pale);border:1px solid rgba(234,88,12,.18)}
.rolebdg-member{color:var(--mid);background:var(--bg3);border:1px solid var(--line2)}
.rolebdg-support{color:var(--blue);background:var(--blue-pale);border:1px solid rgba(37,99,235,.18)}
.rolebdg-app_admin{color:var(--purple);background:var(--purple-pale);border:1px solid rgba(124,58,237,.18)}

/* ── IMAGE UPLOAD ────────────────────────────────────── */
.img-upload-zone{position:relative;cursor:pointer;border:2px dashed var(--line2);background:var(--bg2);border-radius:var(--r-lg);transition:all .22s;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;overflow:hidden}
.img-upload-zone:hover{border-color:var(--acc);background:var(--acc-pale)}
.upl-icon{font-size:28px}
.upl-label{font-size:13px;font-weight:700;color:var(--mid)}
.upl-sub{font-size:11px;color:var(--mid3)}
.img-preview{width:100%;height:100%;object-fit:cover;position:absolute;inset:0}
.img-preview-overlay{position:absolute;inset:0;background:rgba(0,0,0,.4);display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s;font-size:12px;font-weight:700;color:#fff;border-radius:var(--r-lg)}
.img-upload-zone:hover .img-preview-overlay{opacity:1}

/* ── TOAST ───────────────────────────────────────────── */
.toast{position:fixed;bottom:90px;right:24px;background:var(--ink);color:#fff;padding:14px 22px;border-radius:16px;font-size:14px;font-weight:600;z-index:999;animation:tup .3s cubic-bezier(.34,1.56,.64,1) both;box-shadow:var(--sh-xl);display:flex;align-items:center;gap:10px}
.toast::before{content:'✦';color:var(--acc3)}
@media(min-width:801px){.toast{bottom:28px}}

/* ── INFO BOX ────────────────────────────────────────── */
.ibox{padding:14px 16px;background:var(--acc-pale);border:1px solid var(--acc-pale3);border-left:3px solid var(--acc2);border-radius:var(--r-md);font-size:13px;color:var(--ink3);line-height:1.65}
@media(max-width:600px){.ibox{padding:12px 14px;font-size:12px}}

/* ── DIVIDER ─────────────────────────────────────────── */
.dvd{height:1px;background:linear-gradient(90deg,transparent,var(--line2),transparent);margin:24px 0}

/* ── RANK ROWS ───────────────────────────────────────── */
.rank-row{display:flex;align-items:center;gap:16px;padding:18px 22px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);margin-bottom:10px;box-shadow:var(--sh-xs);transition:all .2s}
.rank-row:hover{box-shadow:var(--sh-md);transform:translateY(-2px)}
.rank-num{font-family:'Syne',sans-serif;font-size:30px;font-weight:800;line-height:1;width:36px;text-align:center}

/* ── STEPS ───────────────────────────────────────────── */
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin:52px 0}
.step{padding:40px 32px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);position:relative;box-shadow:var(--sh-sm);transition:all .25s cubic-bezier(.4,0,.2,1);overflow:hidden}
.step:hover{box-shadow:var(--sh-lg);transform:translateY(-4px);border-color:var(--acc-pale3)}
.step::after{content:'';position:absolute;bottom:-60px;right:-40px;width:140px;height:140px;background:radial-gradient(circle,var(--acc-pale) 0%,transparent 65%);pointer-events:none}
.step-num{font-family:'Syne',sans-serif;font-size:72px;font-weight:800;color:var(--acc-pale2);line-height:1;margin-bottom:20px;letter-spacing:-4px}
.step-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;letter-spacing:-.5px;color:var(--ink);margin-bottom:10px}
.step-desc{font-size:14px;color:var(--mid);line-height:1.7}
@media(max-width:640px){.steps{grid-template-columns:1fr}}

/* ── CLUB TILES ──────────────────────────────────────── */
.clubs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px;margin-bottom:48px}
.club-tile{background:var(--bg);border:1px solid var(--line);border-radius:20px;position:relative;overflow:hidden;transition:all .22s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:var(--sh-sm)}
.club-tile:hover{box-shadow:var(--sh-md);transform:translateY(-4px)}
.club-tile-banner{width:100%;height:110px;object-fit:cover;display:block;flex-shrink:0}
.club-tile-placeholder{width:100%;height:90px;flex-shrink:0;background:linear-gradient(135deg,var(--bg3) 0%,var(--bg4) 100%);display:flex;align-items:center;justify-content:center;font-size:38px;position:relative;overflow:hidden}
.club-tile-placeholder::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(255,255,255,.5) 100%)}
.club-tile-body{padding:14px 14px 16px;flex:1;display:flex;flex-direction:column;gap:6px;position:relative}
.club-tile-logo-img{width:46px;height:46px;border:3px solid var(--bg);border-radius:14px;margin-top:-30px;position:relative;z-index:2;flex-shrink:0;object-fit:cover;box-shadow:var(--sh-md)}
.club-tile-logo-init{width:46px;height:46px;border:3px solid var(--bg);border-radius:14px;background:var(--acc2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:15px;font-weight:800;color:#0a0a0a;margin-top:-30px;position:relative;z-index:2;flex-shrink:0;box-shadow:var(--sh-gold)}
.club-tile-name{font-family:'Syne',sans-serif;font-size:15px;font-weight:800;letter-spacing:-.3px;color:var(--ink);line-height:1.2;word-break:break-word}
.club-tile-desc{font-size:12px;color:var(--mid);line-height:1.5;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.club-tile-foot{display:flex;align-items:center;justify-content:space-between;gap:6px;padding-top:10px;border-top:1px solid var(--line);margin-top:auto}
.club-tile-stat{display:flex;flex-direction:column;align-items:flex-start;gap:1px;min-width:0;overflow:hidden}
.club-tile-stat.right{align-items:flex-end}
.club-tile-stat-num{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;letter-spacing:-1px;line-height:1}
.club-tile-stat-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:8.5px;color:var(--mid2);letter-spacing:1px;font-weight:700;text-transform:uppercase;white-space:normal;word-break:break-word;max-width:80px;line-height:1.2}
.club-tile-badge{position:absolute;top:8px;right:8px;font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--acc3),var(--acc));padding:3px 9px;border-radius:100px;z-index:3;box-shadow:0 2px 10px rgba(232,130,12,.35)}
.club-tier-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 11px;font-size:10px;font-weight:800;letter-spacing:.5px;border-radius:100px;border:1.5px solid rgba(255,255,255,.4);white-space:nowrap;box-shadow:0 2px 12px var(--tier-glow,rgba(0,0,0,.15))}
.streak-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;font-size:11px;font-weight:800;background:linear-gradient(135deg,#ff6b35,#f7c59f);color:#7c2d12;border-radius:100px;border:1.5px solid rgba(255,107,53,.25);letter-spacing:.3px}
.leaderboard-row{display:flex;align-items:center;gap:12px;padding:12px 16px;background:var(--bg);border:1px solid var(--line);border-radius:14px;margin-bottom:8px;transition:all .2s}
.leaderboard-row:hover{box-shadow:var(--sh-sm);transform:translateX(2px)}
.leaderboard-rank{font-family:'Syne',sans-serif;font-size:22px;font-weight:800;min-width:36px;text-align:center;color:var(--mid)}
.leaderboard-rank.top1{background:linear-gradient(135deg,#f5c842,#e8a30c);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.leaderboard-rank.top2{background:linear-gradient(135deg,#c0c0c0,#a8a8a8);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.leaderboard-rank.top3{background:linear-gradient(135deg,#cd7f32,#a0522d);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.leaderboard-score{font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:var(--acc);margin-left:auto}
@media(max-width:600px){
  .clubs-grid{grid-template-columns:1fr 1fr;gap:10px;margin-bottom:32px}
  .club-tile{border-radius:16px}
  .club-tile-placeholder{height:80px;font-size:32px}
  .club-tile-banner{height:80px}
  .club-tile-body{padding:10px 10px 12px;gap:4px}
  .club-tile-logo-init,.club-tile-logo-img{width:38px;height:38px;font-size:13px;border-radius:11px;margin-top:-24px}
  .club-tile-name{font-size:13px;letter-spacing:-.2px}
  .club-tile-desc{font-size:11px;-webkit-line-clamp:2}
  .club-tile-foot{padding-top:8px;gap:4px}
  .club-tile-stat-num{font-size:17px;letter-spacing:-.5px}
  .club-tile-stat-label{font-size:9px;letter-spacing:.3px;max-width:60px}
}
@media(max-width:360px){
  .clubs-grid{grid-template-columns:1fr}
}

/* ── MARKETPLACE ─────────────────────────────────────── */
.mkt-cats{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:36px}
.mkt-cat{padding:8px 20px;background:var(--bg);border:1.5px solid var(--line2);color:var(--mid);font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;cursor:pointer;transition:all .2s cubic-bezier(.4,0,.2,1);border-radius:100px;box-shadow:var(--sh-xs)}
.mkt-cat:hover{border-color:var(--acc);color:var(--acc);background:var(--acc-pale);transform:translateY(-1px);box-shadow:var(--sh-sm)}
.mkt-cat.on{background:linear-gradient(135deg,var(--acc3) 0%,var(--acc2) 50%,var(--acc) 100%);color:#fff;border-color:transparent;box-shadow:var(--sh-gold)}
.mkt-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px;margin-bottom:56px}
.mkt-card{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);position:relative;display:flex;flex-direction:column;transition:all .25s cubic-bezier(.4,0,.2,1);overflow:hidden;cursor:pointer;box-shadow:var(--sh-sm)}
.mkt-card:hover{box-shadow:var(--sh-lg);transform:translateY(-6px)}
.mkt-card:hover .mkt-thumb-overlay{opacity:1}
.mkt-thumb{width:100%;height:180px;object-fit:cover;display:block;flex-shrink:0;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.mkt-thumb-placeholder{width:100%;height:180px;flex-shrink:0;background:linear-gradient(135deg,var(--bg3) 0%,var(--bg4) 100%);display:flex;align-items:center;justify-content:center;font-size:64px;position:relative;overflow:hidden;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.mkt-thumb-overlay{position:absolute;top:0;left:0;right:0;height:180px;background:linear-gradient(180deg,transparent 50%,rgba(0,0,0,.15) 100%);opacity:0;transition:opacity .22s;pointer-events:none;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.mkt-card-body{padding:22px 24px 18px;flex:1;display:flex;flex-direction:column;gap:8px}
.mkt-card-cat{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--acc)}
.mkt-card-title{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-.5px;color:var(--ink);line-height:1.15}
.mkt-card-desc{font-size:13px;color:var(--mid);line-height:1.6;flex:1;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.mkt-card-foot{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;border-top:1px solid var(--line);background:var(--bg2);border-radius:0 0 var(--r-2xl) var(--r-2xl)}
.mkt-sponsored{font-family:'Plus Jakarta Sans',sans-serif;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:var(--mid3)}
.mkt-featured-banner{position:absolute;top:0;left:0;right:0;height:4px;background:linear-gradient(90deg,var(--acc3),var(--acc2) 55%,var(--acc));z-index:2;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.mkt-featured-tag{position:absolute;top:12px;left:12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--acc3),var(--acc));padding:5px 13px;border-radius:100px;z-index:3;box-shadow:var(--sh-gold)}
.mkt-view-btn{font-family:'Plus Jakarta Sans',sans-serif;font-size:13px;font-weight:600;color:var(--acc);background:var(--acc-pale2);border:1.5px solid var(--acc-pale3);padding:8px 18px;cursor:pointer;border-radius:100px;transition:all .2s}
.mkt-view-btn:hover{background:linear-gradient(135deg,var(--acc3),var(--acc));color:#fff;border-color:transparent;box-shadow:var(--sh-gold);transform:translateY(-1px)}

/* ── AD DETAIL MODAL ─────────────────────────────────── */
.ad-modal-overlay{position:fixed;inset:0;background:rgba(9,9,11,.5);z-index:500;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(16px);animation:fadeIn .2s ease both}
.ad-modal{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);width:100%;max-width:660px;max-height:90vh;overflow-y:auto;position:relative;display:flex;flex-direction:column;box-shadow:var(--sh-xl)}
.ad-modal-thumb{width:100%;height:240px;object-fit:cover;display:block;flex-shrink:0;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.ad-modal-thumb-ph{width:100%;height:240px;flex-shrink:0;background:linear-gradient(135deg,var(--bg3),var(--bg4));display:flex;align-items:center;justify-content:center;font-size:80px;border-radius:var(--r-2xl) var(--r-2xl) 0 0;position:relative;overflow:hidden}
.ad-modal-thumb-ph::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(255,255,255,.6) 100%)}
.ad-modal-close{position:absolute;top:16px;right:16px;width:40px;height:40px;background:rgba(255,255,255,.92);border:1.5px solid var(--line2);border-radius:50%;color:var(--mid);font-size:15px;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:10;transition:all .18s;box-shadow:var(--sh-sm);font-weight:700}
.ad-modal-close:hover{background:var(--red-pale);color:var(--red);border-color:rgba(220,38,38,.25)}
.ad-modal-content{padding:32px 36px 40px;flex:1}
.ad-modal-cat{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--acc);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.ad-modal-title{font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,36px);font-weight:800;letter-spacing:-2px;color:var(--ink);line-height:1;margin-bottom:16px}
.ad-modal-desc{font-size:16px;color:var(--ink3);line-height:1.7;margin-bottom:24px;padding-bottom:24px;border-bottom:1px solid var(--line)}
.ad-modal-details{font-size:14px;color:var(--mid);line-height:1.9;white-space:pre-line;margin-bottom:30px;background:var(--bg2);padding:24px;border-radius:var(--r-lg);border:1px solid var(--line)}
.ad-modal-actions{display:flex;gap:14px;flex-wrap:wrap;align-items:center}

/* ── DASH AD STRIP ───────────────────────────────────── */
.dash-ad-strip{background:linear-gradient(135deg,#fffdf5,#fff9ea);border:1px solid rgba(232,130,12,.2);border-left:4px solid var(--acc2);border-radius:var(--r-xl);margin-bottom:32px;overflow:hidden;position:relative;box-shadow:var(--sh-xs);transition:box-shadow .18s}
.dash-ad-strip:hover{box-shadow:var(--sh-sm)}
.dash-ad-inner{padding:18px 24px;display:flex;align-items:center;gap:16px}
.dash-ad-icon{font-size:28px;flex-shrink:0}
.dash-ad-text{flex:1;min-width:0}
.dash-ad-title{font-size:15px;font-weight:700;color:var(--ink);margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-ad-sub{font-size:13px;color:var(--mid);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.dash-ad-label{position:absolute;top:8px;right:14px;font-size:8px;font-weight:800;letter-spacing:2.5px;color:var(--acc);text-transform:uppercase;opacity:.7}

/* ── RANK EDITOR ─────────────────────────────────────── */
.rank-editor-row{display:flex;align-items:center;gap:12px;padding:16px 20px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-lg);margin-bottom:8px;transition:all .18s;box-shadow:var(--sh-xs)}
.rank-editor-row:hover{box-shadow:var(--sh-md);border-color:var(--line2)}
.rank-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
.rank-editor-num{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;line-height:1;width:30px;text-align:center;flex-shrink:0}
.rank-name-input{flex:1;background:transparent;border:none;border-bottom:2px solid transparent;color:var(--ink);font-family:'Syne',sans-serif;font-size:16px;font-weight:700;letter-spacing:-.5px;outline:none;padding:4px 2px;transition:border-color .15s;min-width:0}
.rank-name-input:focus{border-bottom-color:var(--acc)}
.rank-arr-btn{background:var(--bg2);border:1.5px solid var(--line2);color:var(--mid);width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .18s;font-size:14px;flex-shrink:0}
.rank-arr-btn:hover:not(:disabled){background:var(--acc-pale2);color:var(--acc);border-color:var(--acc-pale3)}
.rank-arr-btn:disabled{opacity:.3;cursor:not-allowed}

@media(max-width:640px){.mkt-grid{grid-template-columns:1fr}.ad-modal-overlay{padding:0!important;align-items:flex-end!important}.ad-modal{position:fixed!important;bottom:0!important;left:0!important;right:0!important;top:0!important;border-radius:0!important;max-width:100%!important;width:100%!important;height:100%!important;max-height:100%!important;overflow-y:scroll!important;-webkit-overflow-scrolling:touch!important;margin:0!important;border:none!important;box-shadow:none!important;animation:none!important;display:flex!important;flex-direction:column!important}.ad-modal-content{padding:20px 16px 80px}.ad-modal-thumb{height:200px!important;flex-shrink:0!important}.ad-modal-thumb-ph{height:200px!important;flex-shrink:0!important}}

/* ── LIVE TRACKER ───────────────────────────────────────── */
.map-wrap{border-radius:var(--r-xl);overflow:hidden;border:1px solid var(--line);margin-bottom:18px;position:relative}
.map-frame{width:100%;height:360px;background:linear-gradient(160deg,#e8f0e8 0%,#d4e4c8 40%,#c8d8b8 100%);position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center}
.map-grid{position:absolute;inset:0;background-image:linear-gradient(rgba(0,0,0,.05) 1px,transparent 1px),linear-gradient(90deg,rgba(0,0,0,.05) 1px,transparent 1px);background-size:40px 40px}
.map-car{position:absolute;width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;cursor:pointer;transition:all .6s ease;filter:drop-shadow(0 3px 8px rgba(0,0,0,.3))}
.map-car-label{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);background:rgba(9,9,11,.85);color:#fff;font-size:10px;font-weight:700;padding:2px 8px;border-radius:100px;white-space:nowrap;letter-spacing:.3px}
.map-car.me{animation:mapPulse 2s ease-in-out infinite}
@keyframes mapPulse{0%,100%{filter:drop-shadow(0 3px 8px rgba(232,130,12,.4))}50%{filter:drop-shadow(0 3px 18px rgba(232,130,12,.8))}}
.map-legend{position:absolute;top:12px;right:12px;background:rgba(255,255,255,.92);border-radius:12px;padding:10px 14px;font-size:11px;font-weight:600;border:1px solid var(--line);backdrop-filter:blur(8px)}
.map-legend-row{display:flex;align-items:center;gap:6px;margin-bottom:4px;color:var(--ink2)}
.map-legend-row:last-child{margin-bottom:0}
.track-bar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:14px 18px;background:var(--bg2);border-top:1px solid var(--line)}
.track-sharing{display:flex;align-items:center;gap:8px;font-size:13px;font-weight:600;color:var(--green)}
.track-dot{width:8px;height:8px;border-radius:50%;background:var(--green);animation:mapPulse 1.5s infinite}
@media(max-width:600px){.map-frame{height:220px}}

/* ── SOS BUTTON ─────────────────────────────────────────── */
.sos-btn{background:linear-gradient(135deg,#dc2626,#b91c1c);color:#fff;font-family:'Syne',sans-serif;font-size:18px;font-weight:800;letter-spacing:1px;border:none;border-radius:20px;padding:18px 36px;cursor:pointer;box-shadow:0 6px 28px rgba(220,38,38,.5);transition:all .2s;display:flex;align-items:center;gap:10px;animation:sosPulse 2s ease-in-out infinite}
@keyframes sosPulse{0%,100%{box-shadow:0 6px 28px rgba(220,38,38,.5)}50%{box-shadow:0 6px 40px rgba(220,38,38,.85),0 0 0 8px rgba(220,38,38,.15)}}
.sos-btn:hover{transform:scale(1.04)}
.sos-btn:active{transform:scale(.97)}
.sos-active{background:rgba(220,38,38,.06);border:2px solid rgba(220,38,38,.3);border-radius:var(--r-xl);padding:20px 24px;margin-bottom:16px}
.sos-list-item{display:flex;align-items:center;gap:14px;padding:16px 20px;background:rgba(220,38,38,.04);border:1px solid rgba(220,38,38,.18);border-radius:var(--r-xl);margin-bottom:10px}
.sos-ping{width:10px;height:10px;border-radius:50%;background:var(--red);animation:sosPulse 1.5s infinite;flex-shrink:0}

/* ── PUSH NOTIFICATION ──────────────────────────────────── */
.notif-banner{position:fixed;top:80px;right:20px;z-index:9999;background:#fff;border:1px solid var(--line);border-radius:18px;padding:16px 20px;max-width:340px;box-shadow:var(--sh-xl);animation:tup .3s ease both;display:flex;align-items:flex-start;gap:12px}
.notif-icon{width:40px;height:40px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
.notif-icon.sos{background:var(--red-pale)}
.notif-icon.drive{background:var(--acc-pale2)}
.notif-icon.reg{background:var(--green-pale)}
.notif-title{font-size:13px;font-weight:700;color:var(--ink);margin-bottom:3px}
.notif-body{font-size:12px;color:var(--mid);line-height:1.5}
.notif-time{font-size:10px;color:var(--mid3);margin-top:4px;font-weight:600}
.notif-close{background:none;border:none;color:var(--mid2);cursor:pointer;font-size:16px;padding:0;margin-left:auto;flex-shrink:0;line-height:1}

/* ── CLUB CHAT ───────────────────────────────────────────── */
.chat-wrap{display:flex;flex-direction:column;height:520px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);overflow:hidden}
.chat-msgs{flex:1;overflow-y:auto;padding:20px 18px;display:flex;flex-direction:column;gap:10px}
.chat-msg{display:flex;gap:10px;align-items:flex-start;animation:fadeUp .2s ease both}
.chat-msg.me{flex-direction:row-reverse}
.chat-bubble{max-width:72%;padding:11px 16px;border-radius:18px;font-size:14px;line-height:1.55;color:var(--ink)}
.chat-bubble.them{background:var(--bg3);border:1px solid var(--line);border-bottom-left-radius:6px}
.chat-bubble.me{background:linear-gradient(135deg,var(--acc3),var(--acc2) 55%,var(--acc));color:#fff;border-bottom-right-radius:6px}
.chat-bubble.pinned{border-left:3px solid var(--acc);background:var(--acc-pale)}
.chat-meta{font-size:10px;color:var(--mid3);margin-top:4px;font-weight:600}
.chat-meta.me{text-align:right}
.chat-sender{font-size:11px;font-weight:700;color:var(--acc);margin-bottom:3px}
.chat-pin-badge{font-size:9px;font-weight:700;letter-spacing:1px;color:var(--acc);text-transform:uppercase;margin-bottom:4px;display:flex;align-items:center;gap:4px}
.chat-input-row{display:flex;gap:10px;padding:14px 16px;border-top:1px solid var(--line);background:var(--bg2);align-items:flex-end}
.chat-input{flex:1;padding:12px 16px;border-radius:14px;border:1.5px solid var(--line2);font-size:14px;font-family:'Plus Jakarta Sans',sans-serif;resize:none;min-height:44px;max-height:120px;background:var(--bg);transition:border-color .18s;line-height:1.5}
.chat-input:focus{outline:none;border-color:var(--acc)}
.chat-send{width:44px;height:44px;border-radius:14px;background:linear-gradient(135deg,var(--acc3),var(--acc));border:none;color:#fff;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .18s}
.chat-send:hover{transform:scale(1.06)}
@media(max-width:600px){.chat-wrap{height:360px}}

/* ── PRE-DRIVE CHECKLIST ────────────────────────────────── */
.check-item{display:flex;align-items:center;gap:14px;padding:16px 20px;border-radius:var(--r-xl);border:1.5px solid var(--line);margin-bottom:10px;cursor:pointer;transition:all .2s;background:var(--bg)}
.check-item.done{border-color:rgba(22,163,74,.3);background:rgba(22,163,74,.04)}
.check-item:hover{border-color:var(--acc-pale3);background:var(--acc-pale)}
.check-box{width:26px;height:26px;border-radius:8px;border:2px solid var(--line2);display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0;font-size:14px}
.check-item.done .check-box{background:var(--green);border-color:var(--green);color:#fff}
.check-label{font-size:15px;font-weight:600;color:var(--ink);flex:1}
.check-item.done .check-label{color:var(--mid);text-decoration:line-through}
.check-icon{font-size:22px;flex-shrink:0}
.checklist-progress{height:6px;background:var(--bg3);border-radius:100px;margin-bottom:20px;overflow:hidden}
.checklist-fill{height:100%;background:linear-gradient(90deg,var(--acc3),var(--green));border-radius:100px;transition:width .4s cubic-bezier(.4,0,.2,1)}
.marshal-check-row{display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:var(--r-xl);border:1px solid var(--line);margin-bottom:8px;background:var(--bg)}
.marshal-check-row.all-done{border-color:rgba(22,163,74,.25);background:rgba(22,163,74,.04)}

/* ── DRIVE RATING ───────────────────────────────────────── */
.stars-row{display:flex;gap:6px;margin-bottom:14px}
.star{font-size:32px;cursor:pointer;transition:transform .15s;line-height:1}
.star:hover{transform:scale(1.2)}
.star.lit{filter:drop-shadow(0 2px 6px rgba(245,158,11,.5))}
.rating-card{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:16px 18px;margin-bottom:10px;box-shadow:var(--sh-xs)}
.rating-stars{font-size:16px;letter-spacing:1px;margin-bottom:6px}
.rating-comment{font-size:13px;color:var(--mid);line-height:1.55;margin-bottom:6px}
.rating-meta{font-size:11px;color:var(--mid3);font-weight:600}
.avg-score{font-family:'Syne',sans-serif;font-size:56px;font-weight:800;letter-spacing:-3px;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}

/* ═══════════════════════════════════════════════
   GLOBAL MOBILE — applies to all screens ≤600px
═══════════════════════════════════════════════ */
@media(max-width:600px){
  /* page wrapper */
  .page{padding:14px 12px 96px;max-width:100%}
  /* headings & section header */
  .sh-title{font-size:clamp(20px,7.5vw,32px)!important;letter-spacing:-.8px!important}
  /* urow (member rows) */
  .urow{flex-wrap:wrap;gap:8px;padding:12px 10px}
  .uname{font-size:14px}
  .umeta{font-size:11px}
  /* vcard */
  .vcard{padding:18px 14px}
  /* card */
  .card{padding:16px 14px;border-radius:16px}
  /* tabs */
  .tabs{margin-bottom:20px;gap:0}
  .tab{padding:9px 12px;font-size:12px;letter-spacing:0}
  /* avg score rating */
  .avg-score{font-size:40px;letter-spacing:-2px}
  .stars-row{gap:4px}
  .star{font-size:26px}
  /* rank editor */
  .rank-editor-row{padding:12px 10px;gap:8px}
  .rank-name-input{font-size:14px}
  /* checklist */
  .check-item{padding:12px 14px;gap:10px}
  .check-label{font-size:14px}
  /* sos btn */
  .sos-btn{font-size:16px;padding:14px 28px;border-radius:16px}
  /* notif banner */
  .notif-banner{right:10px;left:10px;max-width:calc(100vw - 20px)}
  /* toast */
  .toast{right:10px;left:10px;bottom:80px;font-size:13px}
  /* map */
  .map-legend{display:none}
  /* marshal check row */
  .marshal-check-row{flex-wrap:wrap;gap:6px;padding:10px 12px}
  /* checklist progress */
  .checklist-progress{margin-bottom:14px}
  /* ibox */
  .ibox{font-size:12px;padding:11px 13px}
}
`

/* ─── CONSTANTS ─────────────────────────────────────────────── */
const RANK_COLORS = ["#8ab0c0","#d4a843","#e07820","#e03030","#a060d0"];
const RANK_META   = [
  {icon:"🌿",sym:"◌"},{icon:"🏜️",sym:"◈"},{icon:"🦊",sym:"◆"},
  {icon:"💀",sym:"⬟"},{icon:"👑",sym:"✦"},
];
const DEFAULT_RANKS = [
  {id:1,name:"Dune Wanderer",color:"#8ab0c0",level:1},
  {id:2,name:"Sand Rider",   color:"#d4a843",level:2},
  {id:3,name:"Desert Fox",   color:"#e07820",level:3},
  {id:4,name:"Dune Master",  color:"#e03030",level:4},
  {id:5,name:"Desert Legend",color:"#a060d0",level:5},
];

/* ═══ PERSISTENCE — Supabase real tables + localStorage cache ════
   Reads/writes directly to your existing Supabase tables:
   users, clubs, drives, ads, drive_registrations
   localStorage is used as instant cache so app loads fast.
   All devices share the same data via Supabase.
═══════════════════════════════════════════════════════════════ */
const STORAGE_KEY = "clubbb_state_v1";

const SB = {
  headers: () => ({
    "apikey": SUPA_KEY,
    "Authorization": `Bearer ${SUPA_KEY}`,
    "Content-Type": "application/json",
    "Prefer": "return=representation",
  }),
  get: async (table, query = "") => {
    if (!SUPA_URL || !SUPA_KEY) return [];
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, { headers: SB.headers() });
      if (!res.ok) { console.warn(`[SB] GET ${table} failed`, res.status); return []; }
      return await res.json();
    } catch (e) { console.warn(`[SB] GET ${table} error`, e); return []; }
  },
  upsert: async (table, data) => {
    if (!SUPA_URL || !SUPA_KEY) return null;
    try {
      const res = await fetch(`${SUPA_URL}/rest/v1/${table}`, {
        method: "POST",
        headers: { ...SB.headers(), "Prefer": "resolution=merge-duplicates,return=representation" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errText = await res.text();
        console.error(`[SB] UPSERT ${table} failed ${res.status}:`, errText, "| data:", JSON.stringify(data).slice(0, 200));
        return null;
      }
      const json = await res.json();
      return Array.isArray(json) ? json[0] : json;
    } catch (e) { console.error(`[SB] UPSERT ${table} error:`, e); return null; }
  },
  patch: async (table, match, data) => {
    if (!SUPA_URL || !SUPA_KEY) return;
    try {
      const query = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
      await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, {
        method: "PATCH", headers: SB.headers(), body: JSON.stringify(data),
      });
    } catch (e) { console.warn(`[SB] PATCH ${table} error`, e); }
  },
  del: async (table, match) => {
    if (!SUPA_URL || !SUPA_KEY) return;
    try {
      const query = Object.entries(match).map(([k,v]) => `${k}=eq.${encodeURIComponent(v)}`).join("&");
      await fetch(`${SUPA_URL}/rest/v1/${table}?${query}`, {
        method: "DELETE", headers: SB.headers(),
      });
    } catch (e) { console.warn(`[SB] DELETE ${table} error`, e); }
  },
};

/* ── Row mappers: Supabase ↔ app state ── */
function dbToUser(r) {
  return { id:r.id, name:r.name, email:r.email, phone:r.phone||"", role:r.role,
           rankId:r.rank_id||1, clubId:r.club_id||null, drives:r.drives_count||0,
           passwordHash:r.password_hash||"", suspended:r.suspended||false,
           emailVerified:r.email_verified||false };
}
function userToDb(u) {
  return { id:u.id, name:u.name, email:u.email, phone:u.phone||"", role:u.role,
           rank_id:u.rankId||1, club_id:u.clubId||null, drives_count:u.drives||0,
           password_hash:u.passwordHash||"", suspended:u.suspended||false,
           email_verified:u.emailVerified||false };
}
function dbToClub(r) {
  return { id:r.id, name:r.name, email:r.email, phone:r.phone||"", adminId:r.admin_id,
           logo:r.logo||"", banner:r.banner||"", description:r.description||"", terms:r.terms||"" };
}
function clubToDb(c) {
  return { id:c.id, name:c.name, email:c.email, phone:c.phone||"", admin_id:c.adminId||null,
           logo:c.logo||"", banner:c.banner||"", description:c.description||"", terms:c.terms||"" };
}
function dbToDrive(r, regs=[]) {
  return { id:r.id, clubId:r.club_id, postedBy:r.posted_by, title:r.title,
           description:r.description||"", location:r.location||"", coordinates:r.coordinates||"",
           mapLink:r.map_link||"", date:r.date||"", startTime:r.start_time||"",
           requiredRankId:r.required_rank_id||1, capacity:r.capacity||10,
           image:r.image||"", attendanceRecorded:r.attendance_recorded||false,
           registrations: regs.filter(x=>x.drive_id===r.id).map(x=>({
             userId:x.user_id, status:x.status, attended:x.attended||false })) };
}
function driveToDB(d) {
  const row = {
    club_id:             d.clubId,
    posted_by:           d.postedBy || null,
    title:               d.title,
    description:         d.description || "",
    location:            d.location || "",
    coordinates:         d.coordinates || "",
    map_link:            d.mapLink || "",
    date:                d.date || null,
    start_time:          d.startTime || null,
    required_rank_id:    Number(d.requiredRankId) || 1,
    capacity:            Number(d.capacity) || 10,
    attendance_recorded: d.attendanceRecorded || false,
    // Never include image — stored in local state only (too large for Supabase row)
  };
  // Only include id if it's a real Supabase serial (not a Date.now() temp)
  if (d.id && typeof d.id === "number" && d.id < 2000000000) row.id = d.id;
  return row;
}

/* ── Load all data from Supabase ── */
async function loadRemoteState() {
  if (!SUPA_URL || !SUPA_KEY) return null;
  try {
    const [users, clubs, drives, regs, ads] = await Promise.all([
      SB.get("users",               "select=*&order=created_at.asc"),
      SB.get("clubs",               "select=*&order=created_at.asc"),
      // Exclude image column — base64 images make response too large
      SB.get("drives",              "select=id,club_id,posted_by,title,description,location,coordinates,map_link,date,start_time,required_rank_id,capacity,attendance_recorded,created_at&order=date.desc"),
      SB.get("drive_registrations", "select=*"),
      SB.get("ads",                 "select=*&active=eq.true&order=created_at.desc"),
    ]);
    return {
      users:  users.map(dbToUser),
      clubs:  clubs.map(dbToClub),
      drives: drives.map(d => dbToDrive(d, regs)),
      // Map Supabase 'description' → app 'desc' for consistency
      ads: ads.map(a => ({...a, desc: a.description || a.desc || ""})),
    };
  } catch (e) { console.warn("[CLUBBB] loadRemoteState error:", e); return null; }
}

/* ── localStorage cache ── */
function loadLocalState() {
  try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : null; }
  catch(e) { return null; }
}
function saveLocalState(state) {
  try { const {liveTrack,...rest}=state; localStorage.setItem(STORAGE_KEY,JSON.stringify(rest)); }
  catch(e) {}
}

/* ─── INITIAL STATE — production clean, no demo data ────────── */
const BLANK_STATE = {
  page:"home",
  currentUser:null,
  clubRanks:{},
  users:[],
  clubs:[],
  drives:[],
  promos:[],
  chat:{},
  checklists:{},
  ratings:{},
  sos:[],
  liveTrack:{},
  ads:[],
};

// Start from localStorage cache immediately (fast), Supabase syncs after mount
const INIT = { ...BLANK_STATE, ...(loadLocalState() || {}), liveTrack:{} };


/* ─── UTILS ─────────────────────────────────────────────────── */
function getClubRanks(clubRanks, clubId) {
  if (clubRanks && clubId != null && clubRanks[clubId]) return clubRanks[clubId];
  return DEFAULT_RANKS;
}
function getRank(rankId, clubRanks, clubId) {
  const list = getClubRanks(clubRanks, clubId);
  return list.find(r => r.id === rankId) || list[0] || DEFAULT_RANKS[0];
}
function getUser(us, id)  { return us ? us.find(u => u.id === id)  : null; }
function getClub(cs, id)  { return cs ? cs.find(c => c.id === id)  : null; }
function fmtTime(t)       { if (!t) return null; const [h,m]=t.split(":"); const hr=Number(h); return `${hr===0?12:hr>12?hr-12:hr}:${m} ${hr<12?"AM":"PM"}`; }
function fmtDate(d)       { if (!d) return null; try { return new Date(d + "T00:00:00").toLocaleDateString("en-GB", {day:"numeric", month:"short", year:"numeric"}); } catch(e) { return d; } }

/* ─── CLUB TIER SYSTEM ──────────────────────────────────────────
   Score is calculated from real activity data.
   Tiers: Silver → Gold → Diamond → Platinum
─────────────────────────────────────────────────────────────── */
const CLUB_TIERS = [
  { name:"Platinum", icon:"👑", min:200, gradient:"linear-gradient(135deg,#e5e4e2,#a8a9ad,#d4d4d4)", glow:"rgba(168,169,173,.5)", color:"#6b7280" },
  { name:"Diamond",  icon:"💎", min:100, gradient:"linear-gradient(135deg,#a8d8ea,#7ec8e3,#b3e5fc)", glow:"rgba(126,200,227,.5)", color:"#0284c7" },
  { name:"Gold",     icon:"🥇", min:40,  gradient:"linear-gradient(135deg,#f5c842,#e8a30c,#f7d96c)", glow:"rgba(232,163,12,.5)", color:"#b45309" },
  { name:"Silver",   icon:"🥈", min:0,   gradient:"linear-gradient(135deg,#c0c0c0,#a8a8a8,#d8d8d8)", glow:"rgba(168,168,168,.4)", color:"#6b7280" },
];

function getClubScore(club, users, drives) {
  const members       = users.filter(u => u.clubId === club.id && u.role !== "app_admin");
  const clubDrives    = drives.filter(d => d.clubId === club.id);
  const completedDrives = clubDrives.filter(d => d.attendanceRecorded);
  const totalAttendance = completedDrives.reduce((s,d) =>
    s + d.registrations.filter(r => r.attended).length, 0);
  return (
    completedDrives.length * 10 +
    totalAttendance        * 5  +
    members.length         * 3  +
    clubDrives.filter(d => !d.attendanceRecorded).length * 2
  );
}

function getClubTier(score) {
  return CLUB_TIERS.find(t => score >= t.min) || CLUB_TIERS[CLUB_TIERS.length - 1];
}

/* ─── MEMBER STREAK ──────────────────────────────────────────────
   Counts consecutive most-recent drives attended.
   Streak breaks if a drive was recorded but user wasn't attended.
─────────────────────────────────────────────────────────────── */
function getMemberStreak(userId, drives) {
  // Get all completed drives sorted newest first
  const completed = drives
    .filter(d => d.attendanceRecorded && d.date)
    .sort((a, b) => b.date.localeCompare(a.date));

  let streak = 0;
  for (const d of completed) {
    const reg = d.registrations.find(r => r.userId === userId);
    if (reg && reg.attended) {
      streak++;
    } else if (reg && !reg.attended) {
      break; // registered but didn't attend — streak broken
    }
    // not registered at all → skip (doesn't break streak)
  }
  return streak;
}

/* ─── SHARED UI ─────────────────────────────────────────────── */
function RankBadge({ rankId, clubRanks, clubId }) {
  const r = getRank(rankId, clubRanks, clubId);
  if (!r) return null;
  return <span className="rnk" style={{color:r.color, borderColor:r.color+"44"}}>▸ {r.name}</span>;
}

function RankPill({ rankId, clubRanks, clubId }) {
  const r   = getRank(rankId, clubRanks, clubId);
  if (!r) return null;
  const lvl = Math.min(Math.max((r.level || 1), 1), 5);
  const m   = RANK_META[lvl - 1];
  return (
    <span className={`rbdg rbdg-${lvl}`}>
      <span style={{fontSize:12,lineHeight:1}}>{m.icon}</span> {m.sym} {r.name}
    </span>
  );
}

function RolePill({ role }) {
  const r = role || "member";
  return <span className={`rolebdg rolebdg-${r.replace(/\s/g,"_")}`}>{r.replace("_"," ").toUpperCase()}</span>;
}

function ClubTierBadge({ club, users, drives, size="sm" }) {
  const score = getClubScore(club, users, drives);
  const tier  = getClubTier(score);
  const pad   = size === "lg" ? "6px 16px" : "3px 10px";
  const fs    = size === "lg" ? 12 : 10;
  return (
    <span className="club-tier-badge" style={{
      background: tier.gradient,
      "--tier-glow": tier.glow,
      padding: pad, fontSize: fs, color: tier.color,
    }}>
      {tier.icon} {tier.name}
    </span>
  );
}

function StreakBadge({ userId, drives }) {
  const streak = getMemberStreak(userId, drives);
  if (streak < 2) return null;
  return (
    <span className="streak-badge">
      🔥 {streak} Drive Streak
    </span>
  );
}

/* ── Compress an image using Canvas before storing ──────────────
   maxW/maxH: resize to fit within these dimensions
   quality:   JPEG quality 0–1 (0.72 = good balance size/quality)
   Result is always a JPEG data URL, much smaller than the original
──────────────────────────────────────────────────────────────── */
function compressImage(file, maxW = 1200, maxH = 900, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = ev => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        // Calculate new dimensions keeping aspect ratio
        let { width, height } = img;
        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width  = Math.round(width  * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement("canvas");
        canvas.width  = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function ImageUpload({ value, onChange, height=160, label="Upload Image", hint="Optional · JPG, PNG, WEBP · Max 10MB" }) {
  const ref = useRef(null);
  const [compressing, setCompressing] = useState(false);

  async function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert("File too large (max 10MB)"); return; }
    e.target.value = "";
    setCompressing(true);
    try {
      const compressed = await compressImage(file);
      onChange(compressed);
    } catch(err) {
      console.error("Image compression failed, using original:", err);
      // Fallback to original if compression fails
      const reader = new FileReader();
      reader.onload = ev => onChange(ev.target.result);
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  }

  return (
    <div className="img-upload-zone" style={{height, opacity: compressing ? 0.7 : 1}}
      onClick={() => !compressing && ref.current && ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} />
      {compressing
        ? <>
            <div style={{width:28, height:28, border:"3px solid var(--acc2)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite", marginBottom:8}} />
            <div className="upl-label">Compressing...</div>
          </>
        : value
          ? <>
              <img src={value} alt="preview" className="img-preview" />
              <div className="img-preview-overlay">📷 Change Image</div>
            </>
          : <>
              <div className="upl-icon">📷</div>
              <div className="upl-label">{label}</div>
              <div className="upl-sub">{hint}</div>
            </>
      }
    </div>
  );
}

function Toast({ msg, done }) {
  useEffect(() => {
    const t = setTimeout(done, 3000);
    return () => clearTimeout(t);
  }, [done]);
  return <div className="toast">✦ {msg}</div>;
}

function Modal({ title, onClose, children }) {
  const isMob = window.innerWidth <= 768;

  if (isMob) {
    // On mobile: render as a full-screen overlay that sits on top of everything
    return (
      <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0,
        zIndex:1000, background:"var(--bg)",
        display:"flex", flexDirection:"column",
        overflowY:"scroll", WebkitOverflowScrolling:"touch",
      }}>
        {/* sticky header bar */}
        <div style={{
          position:"sticky", top:0, zIndex:10,
          background:"var(--bg)", borderBottom:"1px solid var(--line)",
          padding:"14px 16px", display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 2px 12px rgba(0,0,0,.06)", flexShrink:0,
        }}>
          <button onClick={onClose} style={{
            background:"var(--bg3)", border:"1.5px solid var(--line2)",
            borderRadius:12, width:36, height:36, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:16, cursor:"pointer", flexShrink:0, color:"var(--ink)",
          }}>←</button>
          <div style={{
            fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800,
            letterSpacing:"-.3px", color:"var(--ink)", flex:1,
            overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>{title}</div>
        </div>
        {/* scrollable content */}
        <div style={{ padding:"20px 16px 120px", flex:1 }}>
          {children}
        </div>
      </div>
    );
  }

  // Desktop: centered modal
  return (
    <div className="mover" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-title">{title}</div>
        <button className="mclose" onClick={onClose}>✕ CLOSE</button>
        {children}
      </div>
    </div>
  );
}

/* ─── HOME ──────────────────────────────────────────────────── */
function Home({ go, state }) {
  const clubs = state ? state.clubs : [];
  const users = state ? state.users : [];
  const drives = state ? state.drives : [];

  return (
    <div>
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-grain" />
        <div className="hero-blob1" />
        <div className="hero-blob2" />
        <div className="hero-eyebrow">Desert Driving Community Platform</div>
        <div className="hero-title">CLUB<wbr /><span>BB</span></div>
        <div className="hero-sub">Join the Pack. Master the Dunes.</div>
        <div className="hero-ctas">
          <button className="btn gold"  onClick={() => go("reg-member")}>Join a Club</button>
          <button className="btn ghost" onClick={() => go("reg-club")}>Register Club</button>
          <button className="btn ghost" onClick={() => go("login")}>Sign In</button>
        </div>
        <div className="hero-scroll-hint">
          <div className="hero-scroll-dot" />
          <span>Scroll</span>
        </div>
      </div>
      <div className="page">
        <div className="stats">
          {[
            [clubs.length || 0,           "Active Clubs"],
            [users.filter(u=>u.role!=="app_admin").length || 0, "Members"],
            [drives.filter(d=>d.attendanceRecorded).length || 0,"Drives Completed"],
          ].map(([n,l]) => (
            <div key={l} className="stat"><div className="stat-n">{n}</div><div className="stat-l">{l}</div></div>
          ))}
        </div>

        {/* All Clubs */}
        {clubs.length > 0 && <>
          <div className="sh">
            <div className="sh-label">Community</div>
            <div className="sh-title">ALL CLUBS</div>
            <div className="sh-sub">Every club registered on CLUBBB — find yours and join the dunes</div>
          </div>
          <div className="clubs-grid">
            {clubs.map(cl => {
              const memberCount    = users.filter(u => u.clubId === cl.id && u.role !== "app_admin").length;
              const todayStr      = new Date().toISOString().split("T")[0];
              const upcomingDrives = drives.filter(d => d.clubId === cl.id && !d.attendanceRecorded && d.date >= todayStr).length;
              const initials = (cl.name || "CL").slice(0, 2).toUpperCase();
              return (
                <div key={cl.id} className="club-tile">
                  {cl.banner
                    ? <img src={cl.banner} alt="" className="club-tile-banner" />
                    : <div className="club-tile-placeholder"><span style={{fontSize:40, position:"relative", zIndex:1}}>🏜️</span></div>
                  }
                  <div className="club-tile-body">
                    {cl.logo
                      ? <img src={cl.logo} alt="" className="club-tile-logo-img" />
                      : <div className="club-tile-logo-init">{initials}</div>
                    }
                    <div style={{display:"flex", alignItems:"center", gap:6, flexWrap:"wrap"}}>
                      <div className="club-tile-name">{cl.name}</div>
                      <ClubTierBadge club={cl} users={users} drives={drives} />
                    </div>
                    {cl.description && <div className="club-tile-desc">{cl.description}</div>}
                    <div className="club-tile-foot">
                      <div className="club-tile-stat">
                        <div className="club-tile-stat-num">{memberCount}</div>
                        <div className="club-tile-stat-label">Members</div>
                      </div>
                      <div className="club-tile-stat right">
                        <div className="club-tile-stat-num">{upcomingDrives}</div>
                        <div className="club-tile-stat-label">Upcoming Drives</div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>}

        <div className="sh"><div className="sh-label">How It Works</div><div className="sh-title">THREE STEPS TO THE DUNES</div></div>
        <div className="steps">
          {[
            ["01","REGISTER","Sign up and pick your club, or register your own to become Admin."],
            ["02","JOIN DRIVES","Browse upcoming drives, check your rank, and register your spot."],
            ["03","EARN RANK","Complete drives, build your record, get promoted by your admin."],
          ].map(([n,t,d]) => (
            <div key={n} className="step">
              <div className="step-num">{n}</div>
              <div className="step-title">{t}</div>
              <div className="step-desc">{d}</div>
            </div>
          ))}
        </div>
        <div className="sh" style={{marginTop:48}}>
          <div className="sh-label">Rank System</div>
          <div className="sh-title">FIVE RANKS. ONE LEGEND.</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {DEFAULT_RANKS.map((r, i) => (
            <div key={r.id} className="rank-row" style={{flex:"1 1 160px"}}>
              <div className="rank-num" style={{color:RANK_COLORS[i]}}>{r.level}</div>
              <div>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,letterSpacing:2,color:RANK_COLORS[i]}}>{r.name}</div>
                <div style={{fontSize:11,color:"var(--mid)",marginTop:2,fontFamily:"'Plus Jakarta Sans',sans-serif",letterSpacing:1}}>LEVEL {r.level}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── LOGIN ─────────────────────────────────────────────────── */
function Login({ users, onLogin, back }) {
  const [email,   setEmail]   = useState("");
  const [password,setPassword]= useState("");
  const [loading, setLoading] = useState(false);
  const [showPw,  setShowPw]  = useState(false);

  async function go() {
    const u = users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!u) { alert("No account found with that email."); return; }
    if (u.suspended) { alert("This account has been suspended. Please contact the App Admin."); return; }
    if (!password) { alert("Please enter your password."); return; }
    if (!u.passwordHash) { alert("Account setup incomplete. Please contact the App Admin."); return; }
    setLoading(true);
    const ok = await verifyPassword(password, u.passwordHash);
    setLoading(false);
    if (!ok) { alert("Incorrect password. Please try again."); setPassword(""); return; }
    onLogin(u);
  }

  return (
    <div className="page" style={{maxWidth:480}}>
      <button className="btn out sm" onClick={back} style={{marginBottom:32}}>← BACK</button>
      <div className="sh"><div className="sh-label">Access</div><div className="sh-title">SIGN IN</div></div>
      <div className="card">
        <div className="fg">
          <label className="fl">Email Address</label>
          <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && document.getElementById("pw-input")?.focus()} autoFocus />
        </div>
        <div className="fg">
          <label className="fl">Password</label>
          <div style={{position:"relative"}}>
            <input id="pw-input" className="fi" type={showPw ? "text" : "password"} value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Your password" onKeyDown={e => e.key === "Enter" && go()}
              style={{paddingRight:44}} />
            <button type="button" onClick={() => setShowPw(v => !v)}
              style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--mid)", padding:4}}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
        </div>
        <button className="btn gold" style={{width:"100%"}} onClick={go} disabled={loading}>
          {loading ? "SIGNING IN..." : "SIGN IN"}
        </button>
      </div>
    </div>
  );
}

/* ─── REGISTRATION ──────────────────────────────────────────── */
const CLUBBB_TERMS = `CLUBBB PLATFORM — TERMS & CONDITIONS FOR CLUB REGISTRATION

Last Updated: March 2026 | Version 1.0

By registering a club on CLUBBB, the Club Administrator agrees on behalf of themselves and all club members to these terms. This is a legally binding agreement between the Club Admin, members, and CLUBBB.

1. NATURE OF THE PLATFORM
CLUBBB is a social networking platform only. It is not an event organiser, tour operator, or safety authority. All drives are organised independently by clubs. CLUBBB bears no responsibility for planning, execution, safety, or outcome of any activity.

2. ACCIDENTS & PERSONAL INJURY
Desert and off-road driving is inherently dangerous. The Club Admin accepts full responsibility for the safety of all participants. CLUBBB expressly disclaims all liability for any personal injury, bodily harm, death, or medical emergency occurring during any drive or activity, whether or not advertised on CLUBBB. Members participate entirely at their own risk. All clubs and members are strongly advised to carry comprehensive personal accident and vehicle insurance suitable for off-road desert driving.

3. VEHICLE DAMAGE & PROPERTY CLAIMS
CLUBBB accepts no responsibility for any damage to, loss of, or destruction of any vehicle, equipment, or property arising from any club activity. Any damage claim between members is solely between those parties. CLUBBB will not mediate, arbitrate, or act as guarantor in any such dispute. Vehicle roadworthiness is solely the owner's responsibility.

4. CONDUCT, RACISM & DISCRIMINATION
Any form of racism, racial vilification, ethnic discrimination, religious intolerance, sexism, or harassment is strictly prohibited. Club Admins must immediately remove any offending member. CLUBBB reserves the right to permanently remove any club or member engaging in discriminatory behaviour. Any racial expression claim or discrimination allegation between members is solely the legal responsibility of those individuals and clubs.

5. MISCONDUCT & MEMBER BEHAVIOUR
Club Admins are solely responsible for member conduct. Misconduct includes reckless driving, altercations, threatening behaviour, fraud, impersonation, and criminal activity. Any resulting civil or criminal matter is entirely the responsibility of the individuals involved. CLUBBB's liability is expressly excluded.

6. PLATFORM LIABILITY LIMITATION
TO THE MAXIMUM EXTENT PERMITTED BY LAW, CLUBBB SHALL NOT BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES. CLUBBB's total aggregate liability shall not exceed AED 0 (zero), as the Platform is a free social community service.

7. DATA & PRIVACY
Registration constitutes consent to collection of name, email, phone, and activity data to operate the Platform. GPS data from the Live Tracker is visible only to same-drive members and not stored permanently. Personal data will not be sold to third parties.

8. SOS & EMERGENCY FEATURES
The SOS feature is a supplementary tool only — not a substitute for official emergency services (Police: 999, Ambulance: 998, Civil Defence: 997). CLUBBB does not guarantee SOS alert delivery and accepts no liability for failures.

9. INDEMNIFICATION
The Club Admin agrees to fully indemnify and hold harmless CLUBBB from all claims, damages, losses, liabilities, and expenses arising from any drive, injury, property damage, member conduct, or breach of these Terms.

10. GOVERNING LAW
These Terms are governed by the laws of the United Arab Emirates. All disputes are subject to UAE court jurisdiction. CLUBBB may amend these Terms at any time; continued use constitutes acceptance.

CLUBBB — Desert Driving Community Platform
contact@clubbb.ae | clubbb.ae`;

function Registration({ type, clubs, onReg, back }) {
  const [f, setF]               = useState({name:"", email:"", phone:"", clubId:""});
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [pwError,  setPwError]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [termsOpen, setTermsOpen]     = useState(false);
  const [clubTermsOpen, setClubTermsOpen] = useState(false);
  const [accepted, setAccepted]       = useState(false);
  const [clubAccepted, setClubAccepted] = useState(false);
  const s = k => e => { setF({...f, [k]: e.target.value}); if (k === "clubId") setClubAccepted(false); };

  const selectedClub = clubs.find(c => String(c.id) === String(f.clubId));
  const hasClubTerms = selectedClub && selectedClub.terms && selectedClub.terms.trim().length > 0;

  async function go() {
    if (!f.name || !f.email || !f.phone) { alert("Please fill all required fields"); return; }
    if (type === "club" && !f.clubName?.trim()) { alert("Please enter your club name"); return; }
    if (type === "member" && !f.clubId) { alert("Please select a club"); return; }
    if (type === "club" && !accepted) { alert("You must read and accept the CLUBBB Terms & Conditions to register a club"); return; }
    if (type === "member" && hasClubTerms && !clubAccepted) { alert(`You must accept ${selectedClub.name}'s Terms & Conditions to join`); return; }

    // ── Password validation ──
    const pwErr = validatePassword(password);
    if (pwErr) { setPwError(pwErr); return; }
    if (password !== confirmPw) { setPwError("Passwords do not match."); return; }
    setPwError("");

    setLoading(true);
    const passwordHash = await hashPassword(password);
    setLoading(false);

    onReg({...f, contactName: f.name, passwordHash});
  }

  return (
    <div className="page" style={{maxWidth:520}}>
      <button className="btn out sm" onClick={back} style={{marginBottom:32}}>← BACK</button>
      <div className="sh">
        <div className="sh-label">{type === "member" ? "Membership" : "Club Registration"}</div>
        <div className="sh-title">{type === "member" ? "JOIN A CLUB" : "REGISTER YOUR CLUB"}</div>
        <div className="sh-sub">{type === "member" ? "Become part of a desert driving family" : "Create your club — you'll be the Admin"}</div>
      </div>

      <div className="card">
        {type === "club" ? (
          <>
            <div className="fg"><label className="fl">Club Name *</label><input className="fi" value={f.clubName||""} onChange={e => setF({...f, clubName:e.target.value})} placeholder="Your Club Name" /></div>
            <div className="fg"><label className="fl">Your Name (Admin) *</label><input className="fi" value={f.name} onChange={s("name")} placeholder="Your full name" /></div>
          </>
        ) : (
          <div className="fg"><label className="fl">Full Name *</label><input className="fi" value={f.name} onChange={s("name")} placeholder="Your full name" /></div>
        )}
        <div className="fg"><label className="fl">Email Address *</label><input className="fi" type="email" value={f.email} onChange={s("email")} placeholder="email@example.com" /></div>
        <div className="fg"><label className="fl">Phone Number *</label><input className="fi" value={f.phone} onChange={s("phone")} placeholder="+971 50 123 4567" /></div>

        {/* ── PASSWORD FIELDS ── */}
        <div className="fg">
          <label className="fl">Password *</label>
          <div style={{position:"relative"}}>
            <input className="fi" type={showPw ? "text" : "password"} value={password}
              onChange={e => { setPassword(e.target.value); setPwError(""); }}
              placeholder="Min 8 chars, 1 uppercase, 1 number"
              style={{paddingRight:44}} />
            <button onClick={() => setShowPw(v => !v)} type="button"
              style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--mid)", padding:4}}>
              {showPw ? "🙈" : "👁️"}
            </button>
          </div>
          {/* Strength meter */}
          {password && (() => {
            const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
            const score = checks.filter(Boolean).length;
            const labels = ["","Weak","Fair","Good","Strong"];
            const colors = ["","#ef4444","#f59e0b","#84cc16","#22c55e"];
            return (
              <div style={{marginTop:6}}>
                <div style={{display:"flex", gap:4, marginBottom:4}}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{flex:1, height:4, borderRadius:4,
                      background: score >= i ? colors[score] : "var(--line2)",
                      transition:"background .2s"}} />
                  ))}
                </div>
                <div style={{fontSize:11, color: colors[score], fontWeight:600}}>{labels[score]}</div>
              </div>
            );
          })()}
        </div>
        <div className="fg">
          <label className="fl">Confirm Password *</label>
          <div style={{position:"relative"}}>
            <input className="fi" type={showPw ? "text" : "password"} value={confirmPw}
              onChange={e => { setConfirmPw(e.target.value); setPwError(""); }}
              placeholder="Re-enter your password"
              style={{paddingRight:44}} />
            {confirmPw && (
              <span style={{position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", fontSize:16}}>
                {confirmPw === password ? "✅" : "❌"}
              </span>
            )}
          </div>
        </div>
        {pwError && (
          <div style={{background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.3)",
            borderRadius:10, padding:"10px 14px", fontSize:13, color:"#dc2626", marginBottom:4}}>
            ⚠️ {pwError}
          </div>
        )}
        <div style={{fontSize:11, color:"var(--mid2)", marginBottom:4, lineHeight:1.5}}>
          🔒 8+ characters · at least 1 uppercase letter · at least 1 number
        </div>

        {type === "member" && (
          <>
            <div className="fg">
              <label className="fl">Select Club</label>
              <select className="fi fi-sel" value={f.clubId} onChange={s("clubId")}>
                <option value="">Choose your club...</option>
                {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            {/* Club T&C acceptance — shown only when a club with terms is selected */}
            {f.clubId && hasClubTerms && (
              <div style={{marginTop:4}}>
                <div style={{background:"var(--bg3)", border:"1.5px solid var(--line2)", borderRadius:"var(--r-xl)", padding:"14px 16px", marginBottom:12}}>
                  <div style={{fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--acc)", marginBottom:6}}>
                    📋 {selectedClub.name} — Club Terms
                  </div>
                  <div style={{fontSize:12, color:"var(--mid)", lineHeight:1.55, marginBottom:10}}>
                    This club has its own terms and conditions. You must read and accept them before joining.
                  </div>
                  <button className="btn out sm" style={{width:"100%"}} onClick={() => setClubTermsOpen(true)}>
                    📄 Read {selectedClub.name} Terms
                  </button>
                </div>

                <div onClick={() => setClubAccepted(a => !a)}
                  style={{display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", padding:"13px 15px",
                    background: clubAccepted ? "rgba(22,163,74,.05)" : "var(--bg)",
                    border:`1.5px solid ${clubAccepted ? "rgba(22,163,74,.3)" : "var(--line2)"}`,
                    borderRadius:"var(--r-xl)", transition:"all .2s"}}>
                  <div style={{width:22, height:22, borderRadius:7, border:`2px solid ${clubAccepted ? "var(--green)" : "var(--line2)"}`,
                    background: clubAccepted ? "var(--green)" : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"center",
                    flexShrink:0, marginTop:1, transition:"all .2s", fontSize:13, color:"#fff", fontWeight:800}}>
                    {clubAccepted ? "✓" : ""}
                  </div>
                  <div style={{fontSize:13, color:"var(--ink)", lineHeight:1.55}}>
                    I have read and accept{" "}
                    <span style={{color:"var(--acc)", fontWeight:700}}>{selectedClub.name}</span>'s Terms & Conditions and agree to follow all club rules.
                  </div>
                </div>
              </div>
            )}

            {/* No terms set — simple notice */}
            {f.clubId && !hasClubTerms && (
              <div style={{fontSize:12, color:"var(--mid2)", padding:"8px 4px"}}>
                ℹ️ This club hasn't set specific terms yet. You'll be bound by the CLUBBB platform terms.
              </div>
            )}
          </>
        )}

        {/* ── PLATFORM TERMS (club registration only) ── */}
        {type === "club" && (
          <div style={{marginTop:8}}>
            <div style={{background:"var(--bg3)", border:"1.5px solid var(--line2)", borderRadius:"var(--r-xl)", padding:"16px 18px", marginBottom:14}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--acc)", marginBottom:8}}>📋 Terms & Conditions</div>
              <div style={{fontSize:12, color:"var(--mid)", lineHeight:1.6, marginBottom:12}}>
                Before registering your club on CLUBBB, you must read and accept our Terms & Conditions covering safety, accidents, liability, conduct, and platform rules.
              </div>
              <button className="btn out sm" style={{width:"100%"}} onClick={() => setTermsOpen(true)}>📄 Read Full Terms & Conditions</button>
            </div>
            <div onClick={() => setAccepted(a => !a)}
              style={{display:"flex", alignItems:"flex-start", gap:12, cursor:"pointer", padding:"14px 16px",
                background: accepted ? "rgba(22,163,74,.05)" : "var(--bg)",
                border:`1.5px solid ${accepted ? "rgba(22,163,74,.3)" : "var(--line2)"}`,
                borderRadius:"var(--r-xl)", transition:"all .2s"}}>
              <div style={{width:22, height:22, borderRadius:7, border:`2px solid ${accepted ? "var(--green)" : "var(--line2)"}`,
                background: accepted ? "var(--green)" : "transparent",
                display:"flex", alignItems:"center", justifyContent:"center",
                flexShrink:0, marginTop:1, transition:"all .2s", fontSize:13, color:"#fff", fontWeight:800}}>
                {accepted ? "✓" : ""}
              </div>
              <div style={{fontSize:13, color:"var(--ink)", lineHeight:1.55}}>
                I have read and agree to the{" "}
                <span style={{color:"var(--acc)", fontWeight:700, textDecoration:"underline"}} onClick={e => { e.stopPropagation(); setTermsOpen(true); }}>CLUBBB Terms & Conditions</span>.
                I accept full responsibility for my club's activities and member conduct.
              </div>
            </div>
          </div>
        )}

        <button className="btn gold" style={{width:"100%", marginTop:16,
          opacity: (type === "club" && !accepted) || (type === "member" && hasClubTerms && !clubAccepted) ? .5 : 1}}
          onClick={go}>
          {type === "member" ? "JOIN CLUB NOW" : "REGISTER & BECOME ADMIN"}
        </button>
      </div>

      {/* ── PLATFORM TERMS MODAL ── */}
      {termsOpen && (
        <div className="mover" onClick={() => setTermsOpen(false)}>
          <div className="modal" style={{maxWidth:660, maxHeight:"88vh"}} onClick={e => e.stopPropagation()}>
            <button className="mclose" onClick={() => setTermsOpen(false)}>✕</button>
            <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
              <div style={{width:42, height:42, background:"var(--acc2)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:20, flexShrink:0}}>📋</div>
              <div>
                <div className="modal-title" style={{marginBottom:0, fontSize:20}}>Terms & Conditions</div>
                <div style={{fontSize:12, color:"var(--mid)"}}>CLUBBB Platform — Club Registration Agreement</div>
              </div>
            </div>
            <div style={{height:1, background:"var(--line)", margin:"16px 0"}} />
            <div style={{overflowY:"auto", maxHeight:"54vh", paddingRight:8, fontSize:12, lineHeight:1.75, color:"var(--ink2)", fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:"pre-wrap"}}>{CLUBBB_TERMS}</div>
            <div style={{height:1, background:"var(--line)", margin:"16px 0"}} />
            <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
              <button className="btn out sm" style={{flex:1}} onClick={() => setTermsOpen(false)}>Close</button>
              <button className="btn gold sm" style={{flex:2}} onClick={() => { setAccepted(true); setTermsOpen(false); }}>✓ I Accept These Terms</button>
            </div>
          </div>
        </div>
      )}

      {/* ── CLUB TERMS MODAL ── */}
      {clubTermsOpen && selectedClub && (
        <div className="mover" onClick={() => setClubTermsOpen(false)}>
          <div className="modal" style={{maxWidth:620, maxHeight:"88vh"}} onClick={e => e.stopPropagation()}>
            <button className="mclose" onClick={() => setClubTermsOpen(false)}>✕</button>
            <div style={{display:"flex", alignItems:"center", gap:12, marginBottom:6}}>
              <div style={{width:42, height:42, background:"var(--acc2)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontWeight:800, fontSize:16, color:"#0a0a0a", flexShrink:0}}>
                {selectedClub.name.slice(0,2).toUpperCase()}
              </div>
              <div>
                <div className="modal-title" style={{marginBottom:0, fontSize:20}}>{selectedClub.name}</div>
                <div style={{fontSize:12, color:"var(--mid)"}}>Club Terms & Conditions — Member Agreement</div>
              </div>
            </div>
            <div style={{height:1, background:"var(--line)", margin:"16px 0"}} />
            <div style={{overflowY:"auto", maxHeight:"52vh", paddingRight:8, fontSize:13, lineHeight:1.75, color:"var(--ink2)", fontFamily:"'Plus Jakarta Sans',sans-serif", whiteSpace:"pre-wrap"}}>{selectedClub.terms}</div>
            <div style={{height:1, background:"var(--line)", margin:"16px 0"}} />
            <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
              <button className="btn out sm" style={{flex:1}} onClick={() => setClubTermsOpen(false)}>Close</button>
              <button className="btn gold sm" style={{flex:2}} onClick={() => { setClubAccepted(true); setClubTermsOpen(false); }}>✓ I Accept {selectedClub.name}'s Terms</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ state, go, showToast }) {
  const { currentUser:cu, clubs:cs, drives:ds, ads, users:us, clubRanks } = state;
  const today    = new Date().toISOString().split("T")[0];
  const myCl     = cu.clubId ? getClub(cs, cu.clubId) : null;
  const rk       = getRank(cu.rankId, clubRanks, cu.clubId);
  // Upcoming: drives the user is registered for OR posted (for admins)
  const myDrives = ds.filter(d => {
    if (d.attendanceRecorded) return false;
    if (d.date && d.date < today) return false;
    const registered = d.registrations.find(r => r.userId === cu.id && r.status === "confirmed");
    const isOwner    = d.postedBy === cu.id || (d.clubId === cu.clubId && ["admin","marshal"].includes(cu.role));
    return registered || isOwner;
  });
  // Done = drives where attendance was recorded AND user was marked attended
  const done = ds.filter(d =>
    d.attendanceRecorded &&
    d.registrations.find(r => r.userId === cu.id && r.status === "confirmed" && r.attended)
  );
  const activeAds = ads.filter(a => a.active);

  return (
    <div className="page">

      {/* Profile */}
      <div className="profile-hero">
        <div className="profile-hero-bg-text">{(cu.name || "U").split(" ")[0].toUpperCase()}</div>
        <div style={{display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap", position:"relative"}}>
          <div className="ava" style={{width:64, height:64, fontSize:28, clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"}}>{(cu.name||"U")[0]}</div>
          <div>
            <div style={{fontFamily:"'Syne',sans-serif", fontSize:32, letterSpacing:3, color:"var(--ink2)"}}>{cu.name}</div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginTop:6}}>
              <RankBadge rankId={cu.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
              <span className={`bdg ${cu.role === "admin" || cu.role === "app_admin" ? "r" : cu.role === "marshal" ? "o" : "d"}`}>
                {(cu.role||"member").replace("_"," ").toUpperCase()}
              </span>
              {myCl && <span className="bdg d">{myCl.name}</span>}
              {myCl && <ClubTierBadge club={myCl} users={state.users} drives={ds} />}
              <StreakBadge userId={cu.id} drives={ds} />
            </div>
            <div style={{fontSize:12, color:"var(--mid)", marginTop:8}}>{cu.email} · {cu.phone}</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats" style={{marginBottom:36}}>
        <div className="stat"><div className="stat-n">{done.length}</div><div className="stat-l">Drives Done</div></div>
        <div className="stat"><div className="stat-n">{myDrives.length}</div><div className="stat-l">Upcoming</div></div>
        <div className="stat"><div className="stat-n">{rk ? rk.level : 0}</div><div className="stat-l">Rank Level</div></div>
      </div>

      {/* Featured ad strip */}
      {activeAds.filter(a => a.featured).length > 0 && (
        <>
          <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:12}}>
            <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, letterSpacing:3, color:"var(--acc2)", textTransform:"uppercase", display:"flex", alignItems:"center", gap:8}}>
              <span style={{width:16, height:2, background:"var(--acc2)", display:"inline-block"}} /> Featured Offer
            </div>
            <button className="btn out xs" onClick={() => go("market")}>VIEW MARKETPLACE</button>
          </div>
          {activeAds.filter(a => a.featured).map(ad => (
            <div key={ad.id} className="dash-ad-strip">
              <div className="dash-ad-label">SPONSORED</div>
              <div className="dash-ad-inner">
                <div className="dash-ad-icon">{ad.icon}</div>
                <div className="dash-ad-text">
                  <div className="dash-ad-title">{ad.title}</div>
                  <div className="dash-ad-sub">{ad.desc}</div>
                </div>
              </div>
            </div>
          ))}
        </>
      )}

      {/* My upcoming drives */}
      <div className="sh" style={{marginTop: activeAds.length > 0 ? 32 : 0}}>
        <div className="sh-label">Registered</div>
        <div className="sh-title">MY UPCOMING DRIVES</div>
      </div>
      {myDrives.length === 0
        ? <div style={{color:"var(--mid)", fontSize:14, marginBottom:32}}>
            No registered drives yet.{" "}
            <button className="btn out xs" onClick={() => go("drives")} style={{marginLeft:8}}>BROWSE DRIVES</button>
          </div>
        : myDrives.map(d => (
          <div key={d.id} className="dcard">
            <div className="dcard-accent" />
            {d.image && <img src={d.image} alt={d.title} className="dcard-img" />}
            <div className="dcard-inner">
              <div className="dcard-title">{d.title}</div>
              <div className="dcard-badges">
                <RankBadge rankId={d.requiredRankId} clubRanks={clubRanks} clubId={d.clubId} />
              </div>
              {d.description && <div className="dcard-desc">{d.description}</div>}
              <div className="dcard-meta-grid">
                {d.location  && <div className="dm">📍 <strong>{d.location}</strong></div>}
                {d.date      && <div className="dm">📅 <strong>{fmtDate(d.date)}</strong></div>}
                {d.startTime && <div className="dm">🕐 <strong>{fmtTime(d.startTime)}</strong></div>}
                {d.coordinates && <div className="dm">🗺 <strong>{d.coordinates}</strong></div>}
              </div>
            </div>
          </div>
        ))
      }

      {done.length > 0 && <>
        <div className="sh" style={{marginTop:32}}><div className="sh-label">History</div><div className="sh-title">COMPLETED DRIVES</div></div>
        {done.map(d => (
          <div key={d.id} className="dcard" style={{opacity:.7}}>
            <div className="dcard-accent" style={{background:"var(--green)"}} />
            <div className="dcard-inner">
              <div className="dcard-title">{d.title}</div>
              <div className="dcard-meta">
                <div className="dm">📅 <strong>{fmtDate(d.date)}</strong></div>
                <span className="bdg g">✓ COMPLETED</span>
              </div>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

/* ─── DRIVES ────────────────────────────────────────────────── */
/* ─── ATTENDANCE MODAL (proper component — avoids useState-in-render bug) ─── */
function AttendanceModal({ drive, state, onClose, onSave }) {
  const confirmedRegs = drive.registrations.filter(r => r.status === "confirmed");
  const [present, setPresent] = useState(() => {
    const init = {};
    confirmedRegs.forEach(r => { init[r.userId] = true; });
    return init;
  });
  const presentCount = Object.values(present).filter(Boolean).length;
  return (
    <Modal title="RECORD ATTENDANCE" onClose={onClose}>
      <div style={{fontSize:13, color:"var(--mid)", marginBottom:16}}>{drive.title} — tick who actually showed up.</div>
      {confirmedRegs.length === 0 && <div style={{fontSize:13, color:"var(--mid)"}}>No confirmed registrations.</div>}
      {confirmedRegs.map(reg => {
        const u = getUser(state.users, reg.userId);
        if (!u) return null;
        return (
          <div key={reg.userId} className="urow" style={{cursor:"pointer"}} onClick={() => setPresent(p => ({...p, [reg.userId]: !p[reg.userId]}))}>
            <div className="ava">{(u.name||"?")[0]}</div>
            <div style={{flex:1}}><div className="uname">{u.name}</div></div>
            <div style={{width:24, height:24, borderRadius:7, border:`2px solid ${present[reg.userId] ? "var(--green)" : "var(--line2)"}`,
              background: present[reg.userId] ? "var(--green)" : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, color:"#fff", fontWeight:800, transition:"all .15s", flexShrink:0}}>
              {present[reg.userId] ? "✓" : ""}
            </div>
          </div>
        );
      })}
      <div style={{fontSize:12, color:"var(--mid)", margin:"10px 0 4px"}}>{presentCount} / {confirmedRegs.length} members marked present</div>
      <button className="btn gold" style={{width:"100%", marginTop:12}}
        onClick={() => onSave(drive.id, present, presentCount)}>
        CONFIRM ATTENDANCE
      </button>
    </Modal>
  );
}

function Drives({ state, upd, showToast, pushNotif }) {
  const { currentUser:cu, drives:ds, clubs:cs, clubRanks } = state;
  const [createOpen, setCreate] = useState(false);
  const [waitM, setWaitM]       = useState(null);
  const [attM,  setAttM]        = useState(null);
  const [detailDrive, setDetail] = useState(null);
  const canCreate = ["admin","marshal","support"].includes(cu.role);
  const myRanks   = getClubRanks(clubRanks, cu.clubId);
  const uLevel    = getRank(cu.rankId, clubRanks, cu.clubId)?.level || 1;
  const list      = cu.role === "app_admin" ? ds : ds.filter(d => d.clubId === cu.clubId);

  function register(drive) {
    if (drive.registrations.find(r => r.userId === cu.id)) { showToast("Already registered"); return; }
    if (drive.cancelled) { showToast("This drive has been cancelled"); return; }
    if (drive.attendanceRecorded) { showToast("This drive has already taken place"); return; }
    const today = new Date().toISOString().split("T")[0];
    if (drive.date && drive.date < today) { showToast("This drive date has passed"); return; }
    const reqLevel = getRank(drive.requiredRankId, clubRanks, drive.clubId)?.level || 1;
    if (uLevel < reqLevel) { showToast("Your rank is too low for this drive"); return; }
    const confirmed = drive.registrations.filter(r => r.status === "confirmed").length;
    const status    = confirmed >= Number(drive.capacity) ? "waiting" : "confirmed";
    upd({ drives: ds.map(d => d.id === drive.id ? {...d, registrations:[...d.registrations, {userId:cu.id, status}]} : d) });
    showToast(status === "confirmed" ? "✓ Registered!" : "Added to waiting list");
  }

  return (
    <div className="page">
      <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:32, flexWrap:"wrap", gap:12}}>
        <div className="sh" style={{marginBottom:0}}>
          <div className="sh-label">Club Drives</div>
          <div className="sh-title">UPCOMING DRIVES</div>
          <div className="sh-sub">Register for upcoming desert drives</div>
        </div>
        {canCreate && <button className="btn gold sm" onClick={() => setCreate(true)}>+ POST DRIVE</button>}
      </div>

      {list.length === 0 && <div style={{color:"var(--mid)", fontSize:14, padding:"20px 0"}}>No drives posted yet.</div>}

      {list.map(drive => {
        const confirmed = drive.registrations.filter(r => r.status === "confirmed").length;
        const waiting   = drive.registrations.filter(r => r.status === "waiting").length;
        const myReg     = drive.registrations.find(r => r.userId === cu.id);
        const isOwner   = drive.postedBy === cu.id || cu.role === "admin" || cu.role === "marshal";
        const reqLevel  = getRank(drive.requiredRankId, clubRanks, drive.clubId)?.level || 1;
        const cl        = getClub(cs, drive.clubId);
        const pct       = drive.capacity > 0 ? Math.min(confirmed / drive.capacity * 100, 100) : 0;
        return (
          <div key={drive.id} className="dcard">
            <div className="dcard-accent" />
            {drive.image && <img src={drive.image} alt={drive.title} className="dcard-img" />}
            <div className="dcard-inner">
              <div className="dcard-title">{drive.title}</div>
              <div className="dcard-badges">
                <RankBadge rankId={drive.requiredRankId} clubRanks={clubRanks} clubId={drive.clubId} />
                {cl && <span className="bdg d">{cl.name}</span>}
                {drive.cancelled && <span className="bdg r">CANCELLED</span>}
              </div>
              {drive.description && <div className="dcard-desc">{drive.description}</div>}
              <div className="dcard-meta-grid">
                {drive.location  && <div className="dm">📍 <strong>{drive.location}</strong></div>}
                {drive.date      && <div className="dm">📅 <strong>{fmtDate(drive.date)}</strong></div>}
                {drive.startTime && <div className="dm">🕐 <strong>{fmtTime(drive.startTime)}</strong></div>}
                {drive.coordinates && <div className="dm">🗺 <strong>{drive.coordinates}</strong></div>}
                <div className="dm">👥 <strong>{confirmed}/{drive.capacity}</strong> confirmed</div>
                {waiting > 0 && <div className="dm"><span className="waitbdg">⏳ {waiting} waiting</span></div>}
              </div>
              <div className="capbar"><div className="capfill" style={{width:`${pct}%`}} /></div>
              {drive.attendanceRecorded && myReg && (
                <div style={{marginBottom:8}}>
                  <span className={`bdg ${myReg.attended ? "g" : "d"}`}>
                    {myReg.attended ? "✓ ATTENDED" : "✗ DID NOT ATTEND"}
                  </span>
                </div>
              )}
              <div className="dcard-actions">
                {myReg && <span className={`bdg ${myReg.status === "confirmed" ? "g" : "o"}`}>{myReg.status === "confirmed" ? "✓ CONFIRMED" : "⏳ WAITLIST"}</span>}
                {!myReg && uLevel >= reqLevel && <button className="btn gold xs" onClick={() => register(drive)}>REGISTER</button>}
                {!myReg && uLevel < reqLevel  && <span className="bdg d">RANK LOW</span>}
                {isOwner && waiting > 0 && <button className="btn out xs" onClick={() => setWaitM(drive)}>WAITLIST ({waiting})</button>}
                {isOwner && !drive.attendanceRecorded && confirmed > 0 && <button className="btn out-grn xs" onClick={() => setAttM(drive)}>ATTENDANCE</button>}
                <button className="btn out xs" style={{marginLeft:"auto"}} onClick={() => setDetail(drive)}>VIEW →</button>
              </div>
            </div>
          </div>
        );
      })}

      {createOpen && (
        <CreateDrive
          clubId={cu.clubId}
          ranks={myRanks}
          onClose={() => setCreate(false)}
          onSave={async d => {
            // Build the row to send to Supabase — no id, no image
            const row = {
              club_id:             cu.clubId,
              posted_by:           cu.id,
              title:               d.title,
              description:         d.description || "",
              location:            d.location    || "",
              coordinates:         d.coordinates || "",
              map_link:            d.mapLink     || "",
              date:                d.date        || null,
              start_time:          d.startTime   || null,
              required_rank_id:    Number(d.requiredRankId) || 1,
              capacity:            Number(d.capacity)       || 10,
              attendance_recorded: false,
            };

            console.log("[CLUBBB] Attempting drive save. row:", JSON.stringify(row));
            console.log("[CLUBBB] SUPA_URL:", SUPA_URL ? "SET" : "MISSING");
            console.log("[CLUBBB] SUPA_KEY:", SUPA_KEY ? "SET" : "MISSING");
            console.log("[CLUBBB] cu.clubId:", cu.clubId, "cu.id:", cu.id);

            // Save to Supabase first — get real serial ID back
            let realId = null;
            try {
              const res = await fetch(`${SUPA_URL}/rest/v1/drives`, {
                method: "POST",
                headers: {
                  "apikey":        SUPA_KEY,
                  "Authorization": `Bearer ${SUPA_KEY}`,
                  "Content-Type":  "application/json",
                  "Prefer":        "return=representation",
                },
                body: JSON.stringify(row),
              });
              const text = await res.text();
              console.log("[CLUBBB] Drive save response status:", res.status);
              console.log("[CLUBBB] Drive save response body:", text);
              if (res.ok) {
                const json = JSON.parse(text);
                realId = Array.isArray(json) ? json[0]?.id : json?.id;
                console.log("[CLUBBB] Drive saved ✅ realId:", realId);
              } else {
                console.error("[CLUBBB] Drive save FAILED:", res.status, text);
              }
            } catch(e) {
              console.error("[CLUBBB] Drive save exception:", e);
            }

            // Add to local state — use upd() since setS is not available here
            const newDrive = {
              ...d,
              id:                 realId || Date.now(),
              clubId:             cu.clubId,
              postedBy:           cu.id,
              registrations:      [],
              attendanceRecorded: false,
            };

            upd({ drives: [...state.drives, newDrive] });
            setCreate(false);
            showToast(realId ? "🚙 Drive posted!" : "🚙 Drive saved locally (Supabase sync failed — check console)");
            pushNotif && pushNotif({ type:"drive", title:"🚙 New Drive Posted", body:`${newDrive.title} — ${newDrive.location}` });
            notifyDrivePosted({ club_id: cu.clubId, title: newDrive.title, location: newDrive.location, date: newDrive.date, start_time: newDrive.startTime || "", description: newDrive.description || "", required_rank_id: newDrive.requiredRankId || 1 }).catch(() => {});
          }}
        />
      )}

      {detailDrive && (
        <DriveDetailModal
          drive={detailDrive}
          state={state}
          upd={upd}
          showToast={showToast}
          onClose={() => setDetail(null)}
        />
      )}

      {waitM && (() => {
        // Re-derive the drive from live ds so stale state is never shown after accepting members
        const liveDrive = ds.find(d => d.id === waitM.id) || waitM;
        const waitingList = liveDrive.registrations.filter(r => r.status === "waiting");
        return (
          <Modal title="WAITING LIST" onClose={() => setWaitM(null)}>
            <div style={{fontSize:13, color:"var(--mid)", marginBottom:20}}>{liveDrive.title}</div>
            {waitingList.length === 0 && <div style={{fontSize:13, color:"var(--mid)"}}>No one on the waiting list.</div>}
            {waitingList.map(reg => {
              const u = getUser(state.users, reg.userId);
              if (!u) return null;
              return (
                <div key={reg.userId} className="urow">
                  <div className="ava">{(u.name||"?")[0]}</div>
                  <div style={{flex:1}}>
                    <div className="uname">{u.name}</div>
                    <div className="umeta"><RankBadge rankId={u.rankId} clubRanks={clubRanks} clubId={u.clubId} /></div>
                  </div>
                  <button className="btn gold xs" onClick={() => {
                    const updatedDrives = ds.map(d => d.id === liveDrive.id
                      ? {...d, registrations: d.registrations.map(r => r.userId === reg.userId ? {...r, status:"confirmed"} : r)}
                      : d);
                    upd({ drives: updatedDrives });
                    // Keep modal open and update waitM reference so list refreshes
                    setWaitM(updatedDrives.find(d => d.id === liveDrive.id));
                    showToast(`${u.name} accepted!`);
                    pushNotif && pushNotif({ type:"reg", title:"✅ Member Accepted", body:`${u.name} confirmed for ${liveDrive.title}` });
                  }}>ACCEPT</button>
                </div>
              );
            })}
          </Modal>
        );
      })()}

      {attM && (
        <AttendanceModal
          drive={ds.find(d => d.id === attM.id) || attM}
          state={state}
          onClose={() => setAttM(null)}
          onSave={(driveId, presentMap, presentCount) => {
            upd({ drives: ds.map(d => d.id === driveId
              ? {...d, attendanceRecorded:true,
                 registrations: d.registrations.map(r => r.status === "confirmed"
                   ? {...r, attended: !!presentMap[r.userId]} : r)}
              : d) });
            setAttM(null);
            showToast(`Attendance recorded — ${presentCount} present`);
          }}
        />
      )}
    </div>
  );
}

function CreateDrive({ clubId, ranks, onClose, onSave }) {
  const [f, setF]       = useState({title:"", description:"", location:"", coordinates:"", mapLink:"", capacity:10, requiredRankId:1, clubId, date:"", startTime:"", image:""});
  const [saving, setSaving] = useState(false);
  const s = k => e => setF({...f, [k]: e.target.value});
  const rankList = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;

  async function submit() {
    if (!f.title || !f.location) { alert("Fill required fields: Drive Name and Location"); return; }
    if (!f.date)                 { alert("Please set a drive date"); return; }
    if (!f.startTime)            { alert("Please set a start time"); return; }
    setSaving(true);
    await onSave(f);
    setSaving(false);
  }

  return (
    <Modal title="POST NEW DRIVE" onClose={onClose}>
      <div className="fg">
        <label className="fl">Drive Cover Image</label>
        <ImageUpload value={f.image} onChange={v => setF({...f, image:v})} height={160} label="Upload Cover Photo" hint="Optional · JPG, PNG, WEBP · Max 10MB" />
      </div>
      <div className="fg"><label className="fl">Drive Name <span style={{color:"var(--red)"}}>*</span></label><input className="fi" value={f.title} onChange={s("title")} placeholder="Liwa Dunes Expedition" /></div>
      <div className="fg"><label className="fl">Description</label><textarea className="fi fi-ta" value={f.description} onChange={s("description")} /></div>
      <div className="g2">
        <div className="fg"><label className="fl">Location <span style={{color:"var(--red)"}}>*</span></label><input className="fi" value={f.location} onChange={s("location")} placeholder="Liwa Oasis" /></div>
        <div className="fg"><label className="fl">Date <span style={{color:"var(--red)"}}>*</span></label><input className="fi" type="date" value={f.date} onChange={s("date")} /></div>
      </div>
      <div className="fg">
        <label className="fl">Start Time <span style={{color:"var(--red)"}}>*</span></label>
        <input className="fi" type="time" value={f.startTime} onChange={s("startTime")} />
        {f.startTime && <div style={{fontSize:11, color:"var(--mid)", marginTop:5}}>
          Meetup: {(() => { const [h,m]=f.startTime.split(":"); const hr=Number(h); return `${hr===0?12:hr>12?hr-12:hr}:${m} ${hr<12?"AM":"PM"}`; })()}
        </div>}
      </div>
      <div className="fg"><label className="fl">GPS Coordinates</label><input className="fi" value={f.coordinates} onChange={s("coordinates")} placeholder="23.11° N, 53.77° E" /></div>
      <div className="fg"><label className="fl">Google Maps Link</label><input className="fi" value={f.mapLink} onChange={s("mapLink")} placeholder="https://goo.gl/maps/..." /></div>
      <div className="g2">
        <div className="fg"><label className="fl">Capacity</label><input className="fi" type="number" value={f.capacity} onChange={s("capacity")} min={1} /></div>
        <div className="fg">
          <label className="fl">Min Rank</label>
          <select className="fi fi-sel" value={f.requiredRankId} onChange={e => setF({...f, requiredRankId:Number(e.target.value)})}>
            {rankList.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </div>
      </div>
      <button className="btn gold" style={{width:"100%", marginTop:8}} disabled={saving} onClick={submit}>
        {saving ? "POSTING..." : "POST DRIVE"}
      </button>
    </Modal>
  );
}

/* ─── CLUB ADMIN ────────────────────────────────────────────── */
function ClubAdmin({ state, upd, showToast }) {
  const { currentUser:cu, clubs:cs, users:us, promos, clubRanks } = state;
  const cl      = getClub(cs, cu.clubId);
  const [tab, setTab]   = useState("profile");
  const [form, setForm] = useState(cl ? {...cl} : {logo:"", banner:"", description:"", terms:""});
  const s = k => e => setForm({...form, [k]: e.target.value});
  const members  = us.filter(u => u.clubId === cu.clubId && u.role !== "app_admin");
  const myPromos = promos.filter(p => p.clubId === cu.clubId);
  const myRanks  = getClubRanks(clubRanks, cu.clubId);
  const [editRanks, setEditRanks] = useState(myRanks.map(r => ({...r})));

  function moveRank(idx, dir) {
    const arr = [...editRanks];
    const si  = idx + dir;
    if (si < 0 || si >= arr.length) return;
    [arr[idx], arr[si]] = [arr[si], arr[idx]];
    setEditRanks(arr.map((r, i) => ({...r, level:i+1})));
  }

  if (!cl) return <div className="page"><div style={{color:"var(--mid)"}}>Club not found.</div></div>;

  return (
    <div className="page">
      <div className="sh">
        <div className="sh-label">Administration</div>
        <div className="sh-title">CLUB ADMIN</div>
        <div className="sh-sub">{cl.name}</div>
      </div>
      <div className="tabs">
        {[["profile","Club Profile"],["members","Members"],["drives","Drives"],["rankings","Rankings"],["promotions","Promotions"]].map(([id, l]) => (
          <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      {/* ── PROFILE TAB ── */}
      {tab === "profile" && (
        <div>
          <div className="card">
            <div className="card-label">Club Branding</div>
            <div className="fg">
              <label className="fl">Club Banner</label>
              <ImageUpload value={form.banner || ""} onChange={v => setForm({...form, banner:v})} height={180} label="Upload Banner Image" hint="1200×400px recommended · Max 5MB" />
            </div>
            <div className="g2" style={{marginTop:8}}>
              <div className="fg">
                <label className="fl">Club Logo</label>
                <ImageUpload value={form.logo || ""} onChange={v => setForm({...form, logo:v})} height={130} label="Upload Logo" hint="Square image preferred" />
              </div>
              <div className="fg">
                <label className="fl">Club Description</label>
                <textarea className="fi fi-ta" style={{height:130, resize:"none"}} value={form.description || ""} onChange={s("description")} />
              </div>
            </div>
            <button className="btn gold sm" style={{marginTop:4}} onClick={() => {
              upd({ clubs: cs.map(c => c.id === cl.id ? {...c, ...form} : c) });
              showToast("Club profile updated!");
            }}>SAVE PROFILE</button>
          </div>

          {/* ── CLUB TERMS EDITOR ── */}
          <div className="card" style={{marginTop:4}}>
            <div className="card-label">📋 Club Terms & Conditions</div>
            <div className="ibox" style={{marginBottom:18}}>
              These terms will be shown to every member who applies to join your club. Members <strong>must accept</strong> before their registration is processed. Write clearly — include safety requirements, gear rules, conduct expectations, and anything specific to your club.
            </div>

            {/* Quick-insert template buttons */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:8}}>Quick Insert Sections</div>
              <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
                {[
                  ["⚙️ Safety Rules",     "SAFETY REQUIREMENTS\n\n• All members must carry a full recovery kit on every drive.\n• Minimum tyre pressure and vehicle spec requirements apply.\n• Members must follow the convoy leader at all times.\n• No overtaking within the convoy without marshal approval.\n• All drivers must have valid UAE driving licence."],
                  ["🏴 Conduct Rules",    "MEMBER CONDUCT\n\n• Respectful behaviour towards all members is mandatory.\n• Zero tolerance for reckless driving endangering others.\n• Alcohol and substance use before or during drives is strictly prohibited.\n• Members are expected to assist fellow members in recovery situations."],
                  ["⚠️ Liability Waiver", "LIABILITY & RISK WAIVER\n\n• All drives are undertaken voluntarily and entirely at the member's own risk.\n• The club accepts no responsibility for personal injury, vehicle damage, or loss of property during any club activity.\n• Members are responsible for maintaining adequate vehicle and personal accident insurance.\n• The club reserves the right to refuse participation to any member deemed unfit or inadequately equipped."],
                  ["👥 Membership Rules", "MEMBERSHIP RULES\n\n• Club membership is subject to admin approval.\n• Members must maintain attendance standards to retain active status.\n• Membership may be revoked for repeated misconduct or extended inactivity.\n• Members must notify the admin in advance if unable to attend a confirmed drive."],
                ].map(([label, text]) => (
                  <button key={label} className="btn out xs" onClick={() => {
                    const cur = form.terms || "";
                    setForm({...form, terms: cur ? cur + "\n\n" + text : text});
                  }}>{label}</button>
                ))}
                <button className="btn out-red xs" onClick={() => { if(window.confirm("Clear all terms?")) setForm({...form, terms:""}); }}>🗑 Clear</button>
              </div>
            </div>

            <div className="fg">
              <label className="fl">Terms Text <span style={{fontWeight:400, color:"var(--mid2)"}}>(members will see this before joining)</span></label>
              <textarea
                className="fi fi-ta"
                style={{minHeight:280, fontFamily:"monospace", fontSize:12, lineHeight:1.7}}
                value={form.terms || ""}
                onChange={s("terms")}
                placeholder={"Write your club's terms and conditions here...\n\nTip: Be specific about:\n• Safety gear required\n• Driving standards expected\n• Conduct rules\n• Liability waiver\n• What happens if rules are broken"}
              />
            </div>

            {/* Preview */}
            {form.terms && (
              <div style={{background:"var(--bg3)", border:"1px solid var(--line)", borderRadius:"var(--r-xl)", padding:"16px 18px", marginTop:4}}>
                <div style={{fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--acc)", marginBottom:10}}>👁 Member Preview</div>
                <div style={{fontSize:12, color:"var(--ink2)", lineHeight:1.75, whiteSpace:"pre-wrap", maxHeight:200, overflowY:"auto"}}>{form.terms}</div>
              </div>
            )}

            <div style={{display:"flex", alignItems:"center", gap:10, marginTop:16, padding:"12px 16px", background:"var(--acc-pale)", border:"1px solid var(--acc-pale3)", borderRadius:"var(--r-xl)"}}>
              <span style={{fontSize:18}}>ℹ️</span>
              <div style={{fontSize:12, color:"var(--ink2)", lineHeight:1.55}}>
                Members joining your club will see these terms in a modal and must tick <strong>"I accept"</strong> before their membership is confirmed. You can update these terms at any time — existing members will be notified on next login.
              </div>
            </div>

            <button className="btn gold" style={{marginTop:16, width:"100%"}} onClick={() => {
              upd({ clubs: cs.map(c => c.id === cl.id ? {...c, ...form} : c) });
              showToast("✓ Club terms saved — members will accept on next join");
            }}>SAVE TERMS & CONDITIONS</button>
          </div>

          <div className="card" style={{marginTop:4}}>
            <div className="ibox">
              <strong>ROLE RULES</strong><br />
              Admin, Marshal & Support can post drives. To promote to Marshal, 2 marshals must vote YES.
            </div>
          </div>
        </div>
      )}

      {/* ── RANKINGS TAB ── */}
      {tab === "rankings" && (
        <div>
          <div className="ibox" style={{marginBottom:24}}>
            <strong style={{color:"var(--acc2)"}}>RANK EDITOR</strong><br />
            Rename ranks and reorder hierarchy using the arrows. Level 1 = lowest, Level 5 = highest. Changes apply to all members in your club.
          </div>
          <div style={{marginBottom:20}}>
            {editRanks.map((r, i) => (
              <div key={r.id} className="rank-editor-row">
                <div className="rank-editor-num" style={{color:RANK_COLORS[i]}}>{i + 1}</div>
                <div className="rank-dot" style={{background:RANK_COLORS[i]}} />
                <span style={{fontSize:16, flexShrink:0}}>{RANK_META[i]?.icon || "⬡"}</span>
                <input
                  className="rank-name-input"
                  value={r.name}
                  onChange={e => setEditRanks(editRanks.map((x, j) => j === i ? {...x, name:e.target.value} : x))}
                  placeholder={`Rank ${i + 1} name...`}
                />
                <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, letterSpacing:2, color:"var(--mid)", textTransform:"uppercase", flexShrink:0, width:56, textAlign:"right"}}>LVL {i + 1}</span>
                <button className="rank-arr-btn" onClick={() => moveRank(i, -1)} disabled={i === 0}>▲</button>
                <button className="rank-arr-btn" onClick={() => moveRank(i, 1)}  disabled={i === editRanks.length - 1}>▼</button>
              </div>
            ))}
          </div>
          <div style={{display:"flex", gap:12, flexWrap:"wrap", alignItems:"center"}}>
            <button className="btn gold sm" onClick={() => {
              const ranked = editRanks.map((r, i) => ({...r, level:i + 1}));
              upd({ clubRanks: {...clubRanks, [cu.clubId]: ranked} });
              showToast("Rank structure saved!");
            }}>SAVE RANK STRUCTURE</button>
            <button className="btn out sm" onClick={() => setEditRanks(DEFAULT_RANKS.map(r => ({...r})))}>RESET TO DEFAULTS</button>
          </div>
          <div className="dvd" />
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, letterSpacing:2, color:"var(--mid)", textTransform:"uppercase", marginBottom:12}}>Preview</div>
          <div style={{display:"flex", gap:8, flexWrap:"wrap"}}>
            {editRanks.map((r, i) => (
              <span key={r.id} className={`rbdg rbdg-${i + 1}`}>
                <span style={{fontSize:12}}>{RANK_META[i]?.icon}</span> {r.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── MEMBERS TAB ── */}
      {tab === "members" && (
        <div>
          {/* Search */}
          <input className="fi" placeholder="🔍  Search by name or email..."
            style={{marginBottom:20}}
            onChange={e => {
              const q = e.target.value.toLowerCase();
              document.querySelectorAll(".ca-mrow").forEach(r => {
                r.style.display = r.dataset.search.includes(q) ? "" : "none";
              });
            }}
          />
          {/* Rank legend */}
          <div style={{display:"flex", gap:8, flexWrap:"wrap", marginBottom:20, alignItems:"center"}}>
            <span style={{fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--mid2)", textTransform:"uppercase", marginRight:4}}>Ranks:</span>
            {myRanks.map((r, i) => (
              <span key={r.id} className={`rbdg rbdg-${r.level}`}>
                <span style={{fontSize:12}}>{RANK_META[i]?.icon}</span> {r.name}
              </span>
            ))}
          </div>
          {members.length === 0 && <div style={{color:"var(--mid)", fontSize:14}}>No members in your club yet.</div>}
          {members.map((u, i) => (
            <div key={u.id} className="ca-mrow"
              data-search={`${(u.name||"").toLowerCase()} ${(u.email||"").toLowerCase()}`}
              style={{display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background: u.suspended ? "rgba(234,88,12,.04)" : "var(--bg)", border:`1px solid ${u.suspended ? "rgba(234,88,12,.25)" : "var(--line)"}`, borderRadius:"var(--r-xl)", marginBottom:10, boxShadow:"var(--sh-xs)", flexWrap:"wrap", transition:"all .2s"}}>

              {/* Avatar + info */}
              <div className="ava" style={{flexShrink:0}}>{(u.name||"?")[0]}</div>
              <div style={{flex:1, minWidth:160}}>
                <div style={{fontSize:15, fontWeight:700, color:"var(--ink)", marginBottom:3}}>{u.name}</div>
                <div style={{fontSize:12, color:"var(--mid)", marginBottom:5}}>{u.email} · {u.phone}</div>
                <div style={{display:"flex", gap:6, flexWrap:"wrap", alignItems:"center"}}>
                  <RankPill rankId={u.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
                  <RolePill role={u.role} />
                  <span style={{fontSize:11, color:"var(--mid2)", fontWeight:600}}>🏁 {u.drives||0} drives</span>
                  {u.suspended && <span className="bdg o">⚠️ SUSPENDED</span>}
                </div>
              </div>

              {/* Rank selector */}
              {u.id !== cu.id && (
                <select
                  className="fi fi-sel"
                  style={{width:"auto", padding:"7px 32px 7px 12px", fontSize:12, fontWeight:600, minWidth:130, flexShrink:0}}
                  value={u.rankId}
                  onChange={e => {
                    const nId   = Number(e.target.value);
                    const nRank = getRank(nId, clubRanks, cu.clubId);
                    if (nRank && nRank.level >= 4) {
                      if (promos.find(p => p.userId === u.id && p.status === "voting")) { showToast("Promotion already pending"); return; }
                      upd({ promos: [...promos, {id:Date.now(), userId:u.id, rankId:nId, role:"marshal", clubId:cu.clubId, by:cu.id, status:"voting", votes:[], date:new Date().toISOString().split("T")[0]}] });
                      showToast("Promotion request created — awaiting 2 marshal votes");
                    } else {
                      upd({ users: us.map(x => x.id === u.id ? {...x, rankId:nId} : x) });
                      showToast("Rank updated!");
                    }
                  }}
                >
                  {myRanks.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              )}

              {/* Role selector */}
              {u.id !== cu.id && (
                <div style={{display:"flex", flexDirection:"column", gap:4, flexShrink:0}}>
                  <div style={{fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:2}}>Role</div>
                  <select
                    className="fi fi-sel"
                    style={{width:"auto", padding:"7px 32px 7px 12px", fontSize:12, fontWeight:600, minWidth:120, flexShrink:0,
                      borderColor: u.role==="admin" ? "rgba(220,38,38,.3)" : u.role==="marshal" ? "rgba(234,88,12,.3)" : u.role==="support" ? "rgba(37,99,235,.3)" : "var(--line2)",
                      color: u.role==="admin" ? "var(--red)" : u.role==="marshal" ? "var(--orange)" : u.role==="support" ? "var(--blue)" : "var(--ink)"
                    }}
                    value={u.role || "member"}
                    onChange={e => {
                      const newRole = e.target.value;
                      if (!window.confirm(`Change "${u.name}" role to ${newRole.toUpperCase()}?`)) return;
                      upd({ users: us.map(x => x.id === u.id ? {...x, role: newRole} : x) });
                      showToast(`${u.name} is now ${newRole.toUpperCase()}`);
                    }}
                  >
                    <option value="member">👤 Member</option>
                    <option value="marshal">🏴 Marshal</option>
                    <option value="admin">⚙️ Admin</option>
                    <option value="support">🛠 Support</option>
                  </select>
                </div>
              )}

              {/* Action buttons */}
              {u.id !== cu.id && (
                <div style={{display:"flex", flexDirection:"column", gap:6, flexShrink:0}}>
                  {u.suspended
                    ? <button className="btn out-grn xs" onClick={() => {
                        upd({ users: us.map(x => x.id === u.id ? {...x, suspended:false} : x) });
                        showToast(`${u.name} reinstated`);
                      }}>✓ REINSTATE</button>
                    : <button className="btn xs"
                        style={{background:"var(--orange-pale)", color:"var(--orange)", border:"1.5px solid rgba(234,88,12,.25)", borderRadius:9}}
                        onClick={() => {
                          if (!window.confirm(`Suspend "${u.name}"? They won't be able to sign in.`)) return;
                          upd({ users: us.map(x => x.id === u.id ? {...x, suspended:true} : x) });
                          showToast(`${u.name} suspended`);
                        }}>⏸ SUSPEND</button>
                  }
                  <button className="btn out-red xs" onClick={() => {
                    if (!window.confirm(`Remove "${u.name}" from your club? Their account stays active but they leave the club.`)) return;
                    upd({ users: us.map(x => x.id === u.id ? {...x, clubId:null, role:"member"} : x) });
                    showToast(`${u.name} removed from club`);
                  }}>REMOVE</button>
                  <button className="btn out-red xs" onClick={() => {
                    if (!window.confirm(`PERMANENTLY DELETE "${u.name}"? This cannot be undone.`)) return;
                    upd({ users: us.filter(x => x.id !== u.id) });
                    showToast(`${u.name} deleted`);
                  }}>🗑 DELETE</button>
                </div>
              )}
              {u.id === cu.id && (
                <span style={{fontSize:11, color:"var(--mid3)", fontStyle:"italic"}}>— YOU —</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── DRIVES TAB ── */}
      {tab === "drives" && (() => {
        const myDrives = state.drives.filter(d => d.clubId === cu.clubId);
        return (
          <div>
            <div className="ibox" style={{marginBottom:24}}>
              Manage all drives posted in your club. You can cancel or delete any drive regardless of who posted it.
            </div>
            {myDrives.length === 0 && <div style={{color:"var(--mid)", fontSize:14}}>No drives posted yet.</div>}
            {myDrives.map(d => {
              const confirmed = d.registrations.filter(r => r.status === "confirmed").length;
              const waiting   = d.registrations.filter(r => r.status === "waiting").length;
              const poster    = getUser(us, d.postedBy);
              return (
                <div key={d.id} className="dcard">
                  {d.image && <img src={d.image} alt={d.title} className="dcard-img" />}
                  <div className="dcard-accent" />
                  <div className="dcard-inner">
                    <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:10, marginBottom:10}}>
                      <div style={{flex:1}}>
                        <div className="dcard-title">{d.title}</div>
                        <div style={{fontSize:12, color:"var(--mid)", marginTop:3}}>
                          Posted by: <strong style={{color:"var(--ink)"}}>{poster ? poster.name : "Unknown"}</strong>
                        </div>
                      </div>
                      {d.cancelled && <span className="bdg r">CANCELLED</span>}
                    </div>
                    <div className="dcard-meta-grid">
                      {d.date      && <div className="dm">📅 <strong>{fmtDate(d.date)}</strong></div>}
                      {d.startTime && <div className="dm">🕐 <strong>{fmtTime(d.startTime)}</strong></div>}
                      {d.location  && <div className="dm">📍 <strong>{d.location}</strong></div>}
                      <div className="dm">👥 <strong>{confirmed}/{d.capacity||"∞"}</strong> confirmed</div>
                      {waiting > 0 && <div className="dm">⏳ <strong>{waiting}</strong> waiting</div>}
                    </div>
                    {/* Registered members list */}
                    {d.registrations.length > 0 && (
                      <div style={{marginBottom:14}}>
                        <div style={{fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:8}}>Registered Members</div>
                        <div style={{display:"flex", flexWrap:"wrap", gap:6}}>
                          {d.registrations.map(reg => {
                            const ru = getUser(us, reg.userId);
                            return ru ? (
                              <span key={reg.userId} className={`bdg ${reg.status === "confirmed" ? "g" : "d"}`}>
                                {ru.name} {reg.status === "waiting" ? "⏳" : "✓"}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {/* Action buttons */}
                    <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:10, paddingTop:14, borderTop:"1px solid var(--line)"}}>
                      {!d.cancelled && !d.attendanceRecorded && (
                        <button className="btn xs"
                          style={{background:"var(--orange-pale)", color:"var(--orange)", border:"1.5px solid rgba(234,88,12,.25)", borderRadius:9}}
                          onClick={() => {
                            if (!window.confirm(`Cancel drive "${d.title}"? Registered members will be notified.`)) return;
                            upd({ drives: state.drives.map(x => x.id === d.id ? {...x, cancelled:true} : x) });
                            showToast(`Drive "${d.title}" cancelled`);
                          }}>⏸ CANCEL DRIVE</button>
                      )}
                      <button className="btn out-red xs" onClick={() => {
                        if (!window.confirm(`PERMANENTLY DELETE drive "${d.title}"? This cannot be undone.`)) return;
                        upd({ drives: state.drives.filter(x => x.id !== d.id) });
                        showToast(`Drive deleted`);
                      }}>🗑 DELETE DRIVE</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {/* ── PROMOTIONS TAB ── */}
      {tab === "promotions" && (
        <div>
          <div className="ibox" style={{marginBottom:24}}>
            Two active marshals must vote YES before you can finalize a Marshal promotion.
          </div>
          {myPromos.length === 0 && <div style={{color:"var(--mid)", fontSize:14}}>No pending promotion requests.</div>}
          {myPromos.map(req => {
            const target = getUser(us, req.userId);
            const yes    = req.votes.filter(v => v.vote === "yes").length;
            const no     = req.votes.filter(v => v.vote === "no").length;
            return (
              <div key={req.id} className="vcard">
                <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, marginBottom:12}}>
                  <div>
                    <div className="vcard-name">{target ? target.name : "Unknown"}</div>
                    <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginTop:4}}>
                      <span style={{fontSize:12, color:"var(--mid)"}}>Promote to:</span>
                      <RankBadge rankId={req.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
                    </div>
                  </div>
                  <span className={`bdg ${req.status === "approved" ? "g" : "o"}`}>{req.status.toUpperCase()}</span>
                </div>
                <div style={{display:"flex", gap:24, marginBottom:12}}>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14}}>✅ YES: <span style={{color:"var(--green)"}}>{yes}</span>/2</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontWeight:700, fontSize:14}}>❌ NO: <span style={{color:"var(--red)"}}>{no}</span></div>
                </div>
                {req.votes.map(v => {
                  const vtr = getUser(us, v.voterId);
                  return (
                    <div key={v.voterId} style={{fontSize:12, color:"var(--mid)", marginBottom:3}}>
                      <strong style={{color:"var(--ink2)"}}>{vtr ? vtr.name : "Unknown"}</strong>:{" "}
                      <span style={{color: v.vote === "yes" ? "var(--green)" : "var(--red)", fontWeight:700}}>{v.vote.toUpperCase()}</span>
                      {v.comment && ` — ${v.comment}`}
                    </div>
                  );
                })}
                {req.status === "voting" && yes >= 2 && (
                  <button className="btn gold sm" style={{marginTop:14}} onClick={() => {
                    upd({
                      users:  us.map(u => u.id === req.userId ? {...u, rankId:req.rankId, role:"marshal"} : u),
                      promos: promos.map(p => p.id === req.id ? {...p, status:"approved"} : p),
                    });
                    showToast("Member promoted to Marshal!");
                  }}>FINALIZE PROMOTION TO MARSHAL</button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── MARSHAL PANEL ─────────────────────────────────────────── */
function MarshalPanel({ state, upd, showToast }) {
  const { currentUser:cu, promos, users:us, clubRanks } = state;
  const reqs = promos.filter(p => p.clubId === cu.clubId && p.status === "voting");
  const [comments, setComments] = useState({});
  return (
    <div className="page">
      <div className="sh">
        <div className="sh-label">Marshal Panel</div>
        <div className="sh-title">PROMOTION VOTES</div>
        <div className="sh-sub">Cast your votes on pending promotion requests</div>
      </div>
      {reqs.length === 0 && <div style={{color:"var(--mid)", fontSize:14, padding:"20px 0"}}>No pending votes at this time.</div>}
      {reqs.map(req => {
        const target   = getUser(us, req.userId);
        const hasVoted = req.votes.find(v => v.voterId === cu.id);
        const isOwnPromo = req.userId === cu.id;
        const yes      = req.votes.filter(v => v.vote === "yes").length;
        return (
          <div key={req.id} className="vcard">
            <div style={{marginBottom:14}}>
              <div className="vcard-name">{target ? target.name : "Unknown"}</div>
              <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop:6}}>
                <span style={{fontSize:12, color:"var(--mid)"}}>Current:</span>
                <RankBadge rankId={target ? target.rankId : 1} clubRanks={clubRanks} clubId={cu.clubId} />
                <span style={{fontSize:12, color:"var(--mid)"}}>→ Proposed:</span>
                <RankBadge rankId={req.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, letterSpacing:2, color:"var(--mid)", marginBottom:8}}>VOTES CAST ({req.votes.length})</div>
              {req.votes.map(v => {
                const vtr = getUser(us, v.voterId);
                return (
                  <div key={v.voterId} style={{fontSize:13, marginBottom:4, color:"var(--mid)"}}>
                    <strong style={{color:"var(--ink2)"}}>{vtr ? vtr.name : "Unknown"}</strong>:{" "}
                    <span style={{color: v.vote === "yes" ? "var(--green)" : "var(--red)", fontWeight:700}}>{v.vote.toUpperCase()}</span>
                    {v.comment && ` — ${v.comment}`}
                  </div>
                );
              })}
            </div>
            {hasVoted
              ? <span className="bdg d">YOUR VOTE: {hasVoted.vote.toUpperCase()}</span>
              : isOwnPromo
              ? <span className="bdg o">⚠️ You cannot vote on your own promotion</span>
              : <div>
                  <div className="fg">
                    <label className="fl">Your Comment (optional)</label>
                    <input className="fi" value={comments[req.id] || ""} onChange={e => setComments({...comments, [req.id]: e.target.value})} placeholder="Reason for your vote..." />
                  </div>
                  <div style={{display:"flex", gap:10}}>
                    <button className="btn out-grn sm" onClick={() => {
                      upd({ promos: state.promos.map(p => p.id === req.id ? {...p, votes:[...p.votes, {voterId:cu.id, vote:"yes", comment:comments[req.id]||""}]} : p) });
                      showToast("✓ Voted YES!");
                    }}>✓ VOTE YES</button>
                    <button className="btn out-red sm" onClick={() => {
                      upd({ promos: state.promos.map(p => p.id === req.id ? {...p, votes:[...p.votes, {voterId:cu.id, vote:"no", comment:comments[req.id]||""}]} : p) });
                      showToast("✗ Voted NO");
                    }}>✗ VOTE NO</button>
                  </div>
                </div>
            }
          </div>
        );
      })}
    </div>
  );
}

/* ─── APP ADMIN ─────────────────────────────────────────────── */
/* ─── EMAIL TESTER — used in App Admin settings tab ─────────── */
function EmailTester() {
  const [to,      setTo]      = useState("");
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);

  async function test() {
    if (!to.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch(`${SUPA_URL}/functions/v1/send-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPA_KEY}`,
          "apikey": SUPA_KEY,
        },
        body: JSON.stringify({ email: to.trim(), type: "test", payload: {} }),
      });
      const data = await res.json().catch(() => ({}));
      setResult(res.ok
        ? { ok: true,  msg: "✅ Email sent successfully — check your inbox." }
        : { ok: false, msg: `❌ Error: ${data?.error || data?.message || res.status}` }
      );
    } catch (e) {
      setResult({ ok: false, msg: `❌ Network error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{fontSize:13, color:"var(--mid)", marginBottom:14, lineHeight:1.6}}>
        Send a test email via the <strong>send-verification</strong> Edge Function to verify Resend is working correctly.
      </div>
      <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end"}}>
        <div className="fg" style={{flex:1, marginBottom:0}}>
          <label className="fl">Test Recipient Email</label>
          <input className="fi" type="email" value={to} onChange={e => setTo(e.target.value)}
            placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && test()} />
        </div>
        <button className="btn gold sm" onClick={test} disabled={loading || !to.trim()} style={{flexShrink:0, marginBottom:0}}>
          {loading ? "SENDING..." : "SEND TEST"}
        </button>
      </div>
      {result && (
        <div style={{marginTop:12, padding:"10px 14px", background: result.ok ? "rgba(22,163,74,.08)" : "rgba(220,38,38,.08)",
          border:`1px solid ${result.ok ? "rgba(22,163,74,.25)" : "rgba(220,38,38,.25)"}`, borderRadius:10,
          fontSize:13, color: result.ok ? "var(--green)" : "var(--red)", fontWeight:600}}>
          {result.msg}
        </div>
      )}
    </div>
  );
}

/* ─── CHANGE PASSWORD — used in App Admin settings tab ──────── */
function ChangePassword({ state, upd, showToast }) {
  const { currentUser:cu, users:us } = state;
  const [current,  setCurrent]  = useState("");
  const [next,     setNext]     = useState("");
  const [confirm2, setConfirm2] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [err,      setErr]      = useState("");

  async function save() {
    setErr("");
    if (!current || !next || !confirm2) { setErr("All fields are required."); return; }
    const pwErr = validatePassword(next);
    if (pwErr) { setErr(pwErr); return; }
    if (next !== confirm2) { setErr("New passwords do not match."); return; }
    setLoading(true);
    const currentOk = await verifyPassword(current, cu.passwordHash);
    if (!currentOk) { setErr("Current password is incorrect."); setLoading(false); return; }
    const passwordHash = await hashPassword(next);
    setLoading(false);
    upd({ users: us.map(u => u.id === cu.id ? { ...u, passwordHash } : u),
          currentUser: { ...cu, passwordHash } });
    showToast("✅ Password changed successfully");
    setCurrent(""); setNext(""); setConfirm2("");
  }

  return (
    <div>
      {["Current Password","New Password","Confirm New Password"].map((label, i) => {
        const val     = [current, next, confirm2][i];
        const setter  = [setCurrent, setNext, setConfirm2][i];
        return (
          <div key={label} className="fg">
            <label className="fl">{label} *</label>
            <div style={{position:"relative"}}>
              <input className="fi" type={showPw ? "text" : "password"} value={val}
                onChange={e => { setter(e.target.value); setErr(""); }}
                placeholder={label} style={{paddingRight:44}} />
              {i === 0 && (
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                    background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--mid)", padding:4}}>
                  {showPw ? "🙈" : "👁️"}
                </button>
              )}
            </div>
          </div>
        );
      })}
      {err && (
        <div style={{background:"rgba(220,38,38,.08)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10,
          padding:"10px 14px", fontSize:13, color:"var(--red)", marginBottom:12}}>⚠️ {err}</div>
      )}
      <button className="btn gold sm" onClick={save} disabled={loading}>
        {loading ? "SAVING..." : "CHANGE PASSWORD"}
      </button>
    </div>
  );
}

function AppAdmin({ state, upd, showToast }) {
  const { ads, clubs:cs, users:us, clubRanks } = state;
  const [tab, setTab]   = useState("ads");
  const [form, setForm] = useState({title:"", desc:"", details:"", icon:"🚙", category:"Gear", link:"", featured:false, thumbnail:""});
  const s = k => e => setForm({...form, [k]: e.target.value});
  const AD_CATS = ["Vehicles","Gear","Tech","Services","Apparel","Other"];
  return (
    <div className="page">
      <div className="sh">
        <div className="sh-label">Platform</div>
        <div className="sh-title">APP ADMIN</div>
        <div className="sh-sub">Global platform management</div>
      </div>
      <div className="tabs">
        {[["ads","Marketplace Ads"],["clubs","All Clubs"],["leaderboard","🏆 Leaderboard"],["users","All Users"],["settings","⚙️ Settings"]].map(([id, l]) => (
          <button key={id} className={`tab ${tab === id ? "on" : ""}`} onClick={() => setTab(id)}>{l}</button>
        ))}
      </div>

      {tab === "ads" && (
        <div>
          <div className="card">
            <div className="card-label">Post New Advertisement</div>
            <div className="fg">
              <label className="fl">Thumbnail Image</label>
              <ImageUpload value={form.thumbnail} onChange={v => setForm({...form, thumbnail:v})} height={150} label="Upload Ad Thumbnail" hint="Recommended 800×450px · JPG, PNG · Max 5MB" />
            </div>
            <div className="g2">
              <div className="fg"><label className="fl">Headline <span style={{color:"var(--red)"}}>*</span></label><input className="fi" value={form.title} onChange={s("title")} placeholder="Ad headline..." /></div>
              <div className="fg">
                <label className="fl">Category</label>
                <select className="fi fi-sel" value={form.category} onChange={s("category")}>
                  {AD_CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="fg"><label className="fl">Short Description</label><textarea className="fi fi-ta" style={{minHeight:60, resize:"none"}} value={form.desc} onChange={s("desc")} placeholder="Brief teaser shown on the card..." /></div>
            <div className="fg"><label className="fl">Full Offer Details</label><textarea className="fi fi-ta" style={{minHeight:120, resize:"vertical"}} value={form.details} onChange={s("details")} placeholder={"Include pricing, promo codes, validity dates, contact info...\n\nUse newlines for structured info."} /></div>
            <div className="g2">
              <div className="fg"><label className="fl">Icon / Emoji</label><input className="fi" value={form.icon} onChange={s("icon")} placeholder="🚙" /></div>
              <div className="fg"><label className="fl">Link URL (optional)</label><input className="fi" value={form.link} onChange={s("link")} placeholder="https://..." /></div>
            </div>
            <div style={{display:"flex", alignItems:"center", gap:12, margin:"8px 0 16px"}}>
              <input type="checkbox" id="featured-chk" checked={form.featured} onChange={e => setForm({...form, featured:e.target.checked})} style={{width:16, height:16, accentColor:"var(--acc2)", cursor:"pointer"}} />
              <label htmlFor="featured-chk" style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, color:"var(--ink2)", cursor:"pointer"}}>
                ⭐ Feature on member dashboards
              </label>
            </div>
            <button className="btn gold sm" onClick={() => {
              if (!form.title) { showToast("Headline is required"); return; }
              upd({ ads: [...ads, {...form, id:Date.now(), active:true}] });
              setForm({title:"", desc:"", details:"", icon:"🚙", category:"Gear", link:"", featured:false, thumbnail:""});
              showToast("Ad posted to Marketplace!");
            }}>POST TO MARKETPLACE</button>
          </div>

          <div style={{fontFamily:"'Syne',sans-serif", fontSize:18, letterSpacing:2, color:"var(--ink2)", marginBottom:14}}>ACTIVE ADS</div>
          {ads.filter(a => a.active).length === 0 && <div style={{color:"var(--mid)", fontSize:13, marginBottom:20}}>No active ads yet.</div>}
          {ads.filter(a => a.active).map(ad => (
            <div key={ad.id} className="adbanner" style={{alignItems:"flex-start", gap:14}}>
              {ad.thumbnail
                ? <img src={ad.thumbnail} alt="" style={{width:64, height:48, objectFit:"cover", flexShrink:0, clipPath:"polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)"}} />
                : <div className="adicon" style={{marginTop:2}}>{ad.icon}</div>
              }
              <div style={{flex:1}}>
                <div style={{display:"flex", gap:8, alignItems:"center", flexWrap:"wrap", marginBottom:4}}>
                  <div className="adtitle" style={{margin:0}}>{ad.title}</div>
                  {ad.featured && <span className="bdg r">⭐ FEATURED</span>}
                  {ad.category && <span className="bdg d">{ad.category}</span>}
                </div>
                <div className="adsub">{ad.desc}</div>
                {ad.link && <div style={{fontSize:11, color:"var(--acc3)", marginTop:4, fontFamily:"'Plus Jakarta Sans',sans-serif"}}>{ad.link}</div>}
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:6, flexShrink:0}}>
                <button className="btn xs" style={{background: ad.featured ? "var(--acc3)" : "transparent", color: ad.featured ? "var(--ink)" : "var(--mid)", border:"1px solid var(--acc3)", clipPath:"none", fontSize:10, letterSpacing:1, padding:"4px 10px"}}
                  onClick={() => { upd({ ads: ads.map(a => a.id === ad.id ? {...a, featured:!a.featured} : a) }); showToast(ad.featured ? "Removed from featured" : "Pinned to dashboards!"); }}>
                  {ad.featured ? "UNFEATURE" : "⭐ FEATURE"}
                </button>
                <button className="btn out-red xs" onClick={() => { upd({ ads: ads.map(a => a.id === ad.id ? {...a, active:false} : a) }); showToast("Ad removed"); }}>REMOVE</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === "clubs" && (
        <div>
          {cs.length === 0 && <div style={{color:"var(--mid)", fontSize:14}}>No clubs registered yet.</div>}
          {cs.map(c => {
            const adm     = getUser(us, c.adminId);
            const members = us.filter(u => u.clubId === c.id && u.role !== "app_admin");
            const cnt     = members.length;
            return (
              <div key={c.id} className="card" style={{borderLeft:"4px solid var(--line2)"}}>
                {/* Club header */}
                <div style={{display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12, marginBottom:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, letterSpacing:-.5, color:"var(--ink)", marginBottom:5}}>{c.name}</div>
                    <div style={{fontSize:13, color:"var(--mid)", marginBottom:3}}>📧 {c.email} · 📞 {c.phone}</div>
                    <div style={{fontSize:13, color:"var(--mid)"}}>👤 Admin: <strong style={{color:"var(--ink)"}}>{adm ? adm.name : "—"}</strong></div>
                    {c.description && <div style={{fontSize:13, color:"var(--mid)", marginTop:6, lineHeight:1.5}}>{c.description}</div>}
                  </div>
                  <div style={{display:"flex", flexDirection:"column", alignItems:"flex-end", gap:8, flexShrink:0}}>
                    <span className="bdg d">{cnt} MEMBERS</span>
                    <button className="btn out-red xs" onClick={() => {
                      if (!window.confirm(`DELETE club "${c.name}" and all ${cnt} of its members? This cannot be undone.`)) return;
                      upd({
                        clubs: cs.filter(x => x.id !== c.id),
                        users: us.filter(u => u.clubId !== c.id),
                        drives: state.drives.filter(d => d.clubId !== c.id),
                      });
                      showToast(`Club "${c.name}" deleted`);
                    }}>🗑 DELETE CLUB</button>
                  </div>
                </div>

                {/* Members list inside club card */}
                {members.length > 0 && (
                  <div style={{borderTop:"1px solid var(--line)", paddingTop:14, marginTop:4}}>
                    <div style={{fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:10}}>Members</div>
                    {members.map(u => (
                      <div key={u.id} style={{display:"flex", alignItems:"center", gap:12, padding:"10px 0", borderBottom:"1px solid var(--line)"}}>
                        <div className="ava" style={{width:36, height:36, fontSize:14, borderRadius:10}}>{(u.name||"?")[0]}</div>
                        <div style={{flex:1}}>
                          <div style={{fontSize:14, fontWeight:700, color:"var(--ink)"}}>{u.name}</div>
                          <div style={{fontSize:12, color:"var(--mid)"}}>{u.email}</div>
                        </div>
                        <span className={`bdg ${u.role === "admin" ? "r" : u.role === "marshal" ? "o" : u.role === "support" ? "s" : "d"}`}>{(u.role||"member").toUpperCase()}</span>
                        <button className="btn out-red xs" onClick={() => {
                          if (!window.confirm(`Remove member "${u.name}" from this club?`)) return;
                          upd({ users: us.map(x => x.id === u.id ? {...x, clubId:null, role:"member"} : x) });
                          showToast(`${u.name} removed from club`);
                        }}>REMOVE</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "leaderboard" && (() => {
        const { drives: ds } = state;
        const ranked = cs
          .map(c => ({ club:c, score: getClubScore(c, us, ds), tier: getClubTier(getClubScore(c, us, ds)) }))
          .sort((a, b) => b.score - a.score);

        // Top member streaks across all clubs
        const memberStreaks = us
          .filter(u => u.role !== "app_admin")
          .map(u => ({ user:u, streak: getMemberStreak(u.id, ds) }))
          .filter(x => x.streak > 0)
          .sort((a, b) => b.streak - a.streak)
          .slice(0, 10);

        return (
          <div>
            {/* Club Leaderboard */}
            <div className="sh" style={{marginTop:8}}>
              <div className="sh-label">Rankings</div>
              <div className="sh-title">CLUB LEADERBOARD</div>
              <div className="sh-sub">Ranked by activity score — drives completed, attendance, members</div>
            </div>
            {ranked.length === 0 && <div style={{color:"var(--mid)", fontSize:14, marginBottom:24}}>No clubs registered yet.</div>}
            {ranked.map(({ club:c, score, tier }, i) => {
              const members = us.filter(u => u.clubId === c.id && u.role !== "app_admin").length;
              const completed = ds.filter(d => d.clubId === c.id && d.attendanceRecorded).length;
              return (
                <div key={c.id} className="leaderboard-row">
                  <div className={`leaderboard-rank ${i===0?"top1":i===1?"top2":i===2?"top3":""}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                  </div>
                  <div className="club-tile-logo-init" style={{width:38, height:38, fontSize:13, margin:0, borderRadius:10, flexShrink:0}}>
                    {(c.name||"CL").slice(0,2).toUpperCase()}
                  </div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontFamily:"'Syne',sans-serif", fontSize:15, fontWeight:800, color:"var(--ink)", letterSpacing:-.3}}>{c.name}</div>
                    <div style={{fontSize:11, color:"var(--mid)", marginTop:2, display:"flex", gap:10, flexWrap:"wrap"}}>
                      <span>👥 {members} members</span>
                      <span>🏁 {completed} drives</span>
                    </div>
                  </div>
                  <ClubTierBadge club={c} users={us} drives={ds} size="sm" />
                  <div className="leaderboard-score">{score} pts</div>
                </div>
              );
            })}

            {/* Score breakdown info */}
            <div className="card" style={{marginTop:8, background:"var(--acc-pale)", border:"1px solid var(--acc-pale3)"}}>
              <div style={{fontSize:11, fontWeight:700, letterSpacing:2, color:"var(--acc2)", textTransform:"uppercase", marginBottom:10}}>How Points Are Earned</div>
              <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:8}}>
                {[["🏁 Drive completed","10 pts"],["👤 Member attends","5 pts"],["🧑‍🤝‍🧑 New member joins","3 pts"],["📅 Upcoming drive","2 pts"]].map(([l,v]) => (
                  <div key={l} style={{display:"flex", justifyContent:"space-between", fontSize:12, padding:"6px 10px", background:"var(--bg)", borderRadius:8, border:"1px solid var(--line)"}}>
                    <span style={{color:"var(--ink2)"}}>{l}</span>
                    <span style={{fontWeight:700, color:"var(--acc)"}}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:11, color:"var(--mid)", marginTop:10, lineHeight:1.6}}>
                🥈 Silver: 0+ pts &nbsp;·&nbsp; 🥇 Gold: 40+ pts &nbsp;·&nbsp; 💎 Diamond: 100+ pts &nbsp;·&nbsp; 👑 Platinum: 200+ pts
              </div>
            </div>

            {/* Member Streak Leaderboard */}
            {memberStreaks.length > 0 && <>
              <div className="sh" style={{marginTop:32}}>
                <div className="sh-label">Members</div>
                <div className="sh-title">🔥 DRIVE STREAKS</div>
                <div className="sh-sub">Members with the longest consecutive drive attendance</div>
              </div>
              {memberStreaks.map(({ user:u, streak }, i) => {
                const club = cs.find(c => c.id === u.clubId);
                return (
                  <div key={u.id} className="leaderboard-row">
                    <div className={`leaderboard-rank ${i===0?"top1":i===1?"top2":i===2?"top3":""}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                    </div>
                    <div className="ava" style={{width:38, height:38, fontSize:15, borderRadius:10, flexShrink:0}}>{(u.name||"?")[0]}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14, fontWeight:700, color:"var(--ink)"}}>{u.name}</div>
                      <div style={{fontSize:11, color:"var(--mid)"}}>{club ? club.name : "No club"}</div>
                    </div>
                    <span className="streak-badge">🔥 {streak}</span>
                  </div>
                );
              })}
            </>}
          </div>
        );
      })()}

      {tab === "settings" && (
        <div>
          {/* ── Supabase / Resend connection status ── */}
          <div className="card">
            <div className="card-label">🔌 Integration Status</div>
            <div style={{display:"flex", flexDirection:"column", gap:12}}>
              {[
                {
                  name: "Supabase",
                  desc: "Database & Edge Functions",
                  env: "VITE_SUPABASE_URL",
                  ok: !!SUPA_URL,
                  value: SUPA_URL ? SUPA_URL.replace(/https?:\/\//, "").split(".")[0] + ".supabase.co" : "Not set",
                },
                {
                  name: "Supabase Anon Key",
                  desc: "API authentication",
                  env: "VITE_SUPABASE_ANON_KEY",
                  ok: !!SUPA_KEY,
                  value: SUPA_KEY ? SUPA_KEY.slice(0,12) + "..." : "Not set",
                },
              ].map(item => (
                <div key={item.name} style={{display:"flex", alignItems:"center", gap:14, padding:"14px 18px", background: item.ok ? "rgba(22,163,74,.04)" : "rgba(220,38,38,.04)", border:`1px solid ${item.ok ? "rgba(22,163,74,.2)" : "rgba(220,38,38,.18)"}`, borderRadius:"var(--r-xl)"}}>
                  <div style={{fontSize:22, flexShrink:0}}>{item.ok ? "✅" : "❌"}</div>
                  <div style={{flex:1, minWidth:0}}>
                    <div style={{fontSize:14, fontWeight:700, color:"var(--ink)"}}>{item.name}</div>
                    <div style={{fontSize:12, color:"var(--mid)", marginTop:2}}>{item.desc}</div>
                    <div style={{fontSize:11, color: item.ok ? "var(--green)" : "var(--red)", marginTop:3, fontFamily:"monospace"}}>{item.value}</div>
                  </div>
                  <span className={`bdg ${item.ok ? "g" : "r"}`}>{item.ok ? "CONNECTED" : "NOT SET"}</span>
                </div>
              ))}
            </div>
            {(!SUPA_URL || !SUPA_KEY) && (
              <div className="ibox" style={{marginTop:16}}>
                <strong>To connect Supabase:</strong> Go to Vercel → Your Project → Settings → Environment Variables and add:<br/>
                <code style={{fontSize:11, background:"var(--bg3)", padding:"2px 6px", borderRadius:4, display:"inline-block", marginTop:4}}>VITE_SUPABASE_URL</code> and <code style={{fontSize:11, background:"var(--bg3)", padding:"2px 6px", borderRadius:4}}>VITE_SUPABASE_ANON_KEY</code><br/>
                Then redeploy. Without these, email verification and notifications are disabled — all other features work normally.
              </div>
            )}
          </div>

          {/* ── Email test ── */}
          {SUPA_URL && SUPA_KEY && (
            <div className="card">
              <div className="card-label">📧 Test Email (Resend via Edge Function)</div>
              <EmailTester />
            </div>
          )}

          {/* ── App Admin change password ── */}
          <div className="card">
            <div className="card-label">🔑 Change App Admin Password</div>
            <ChangePassword state={state} upd={upd} showToast={showToast} />
          </div>

          {/* ── Danger zone ── */}
          <div className="card" style={{border:"1px solid rgba(220,38,38,.25)"}}>
            <div className="card-label" style={{color:"var(--red)"}}>⚠️ Danger Zone</div>
            <div style={{fontSize:13, color:"var(--mid)", marginBottom:14, lineHeight:1.6}}>
              Reset all app data and wipe localStorage. This cannot be undone. You will need to run the setup wizard again.
            </div>
            <button className="btn out-red sm" onClick={() => {
              if (window.confirm("⚠️ This will DELETE all users, clubs, drives and all data.\n\nThis cannot be undone. Are you absolutely sure?")) {
                localStorage.removeItem("clubbb_state_v1");
                window.location.reload();
              }
            }}>🗑️ RESET ALL DATA</button>
          </div>
        </div>
      )}

      {tab === "users" && (
        <div>
          {/* Search bar */}
          <input className="fi" placeholder="🔍  Search by name or email..." style={{marginBottom:20}}
            onChange={e => {
              const q = e.target.value.toLowerCase();
              const rows = document.querySelectorAll(".admin-urow");
              rows.forEach(r => { r.style.display = r.dataset.search.includes(q) ? "" : "none"; });
            }}
          />
          {us.filter(u => u.role !== "app_admin").map(u => {
            const cl = u.clubId ? getClub(cs, u.clubId) : null;
            return (
              <div key={u.id} className="admin-urow" data-search={`${(u.name||"").toLowerCase()} ${(u.email||"").toLowerCase()}`}
                style={{display:"flex", alignItems:"center", gap:14, padding:"16px 20px", background:"var(--bg)", border:"1px solid var(--line)", borderRadius:"var(--r-xl)", marginBottom:10, boxShadow:"var(--sh-xs)", transition:"all .2s", flexWrap:"wrap"}}>
                <div className="ava">{(u.name||"?")[0]}</div>
                <div style={{flex:1, minWidth:0}}>
                  <div className="uname">{u.name}</div>
                  <div style={{fontSize:12, color:"var(--mid)", marginTop:2}}>{u.email} · {u.phone}</div>
                  <div style={{display:"flex", gap:6, flexWrap:"wrap", marginTop:6}}>
                    <RankBadge rankId={u.rankId} clubRanks={clubRanks} clubId={u.clubId} />
                    <span className={`bdg ${u.role === "admin" ? "r" : u.role === "marshal" ? "o" : u.role === "support" ? "s" : "d"}`}>{(u.role||"member").toUpperCase()}</span>
                    {cl && <span className="bdg d">🏴 {cl.name}</span>}
                  </div>
                </div>
                {/* Actions */}
                <div style={{display:"flex", flexDirection:"column", gap:6, flexShrink:0}}>
                  {/* Suspend / unsuspend */}
                  {u.suspended
                    ? <button className="btn out-grn xs" onClick={() => {
                        upd({ users: us.map(x => x.id === u.id ? {...x, suspended:false} : x) });
                        showToast(`${u.name} reinstated`);
                      }}>✓ REINSTATE</button>
                    : <button className="btn xs" style={{background:"var(--orange-pale)", color:"var(--orange)", border:"1.5px solid rgba(234,88,12,.25)", borderRadius:9}} onClick={() => {
                        if (!window.confirm(`Suspend "${u.name}"? They won't be able to use the app.`)) return;
                        upd({ users: us.map(x => x.id === u.id ? {...x, suspended:true} : x) });
                        showToast(`${u.name} suspended`);
                      }}>⏸ SUSPEND</button>
                  }
                  {/* Remove from club */}
                  {u.clubId && <button className="btn out xs" onClick={() => {
                    if (!window.confirm(`Remove "${u.name}" from their club?`)) return;
                    upd({ users: us.map(x => x.id === u.id ? {...x, clubId:null, role:"member"} : x) });
                    showToast(`${u.name} removed from club`);
                  }}>REMOVE FROM CLUB</button>}
                  {/* Permanently delete */}
                  <button className="btn out-red xs" onClick={() => {
                    if (!window.confirm(`PERMANENTLY DELETE "${u.name}"? This cannot be undone.`)) return;
                    upd({ users: us.filter(x => x.id !== u.id) });
                    showToast(`${u.name} deleted`);
                  }}>🗑 DELETE</button>
                </div>
                {u.suspended && (
                  <div style={{width:"100%", background:"var(--orange-pale)", border:"1px solid rgba(234,88,12,.2)", borderRadius:8, padding:"6px 12px", fontSize:12, color:"var(--orange)", fontWeight:700, marginTop:4}}>
                    ⚠️ This account is currently suspended
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── AD DETAIL MODAL ───────────────────────────────────────── */
function AdDetail({ ad, onClose }) {
  const isMob = window.innerWidth <= 768;

  if (isMob) {
    return (
      <div style={{
        position:"fixed", top:0, left:0, right:0, bottom:0,
        zIndex:1000, background:"var(--bg)",
        display:"flex", flexDirection:"column",
        overflowY:"scroll", WebkitOverflowScrolling:"touch",
      }}>
        {/* sticky close bar */}
        <div style={{
          position:"sticky", top:0, zIndex:10,
          background:"var(--bg)", borderBottom:"1px solid var(--line)",
          padding:"14px 16px", display:"flex", alignItems:"center", gap:12,
          boxShadow:"0 2px 12px rgba(0,0,0,.06)", flexShrink:0,
        }}>
          <button onClick={onClose} style={{
            background:"var(--bg3)", border:"1.5px solid var(--line2)",
            borderRadius:12, width:36, height:36, display:"flex",
            alignItems:"center", justifyContent:"center",
            fontSize:16, cursor:"pointer", flexShrink:0, color:"var(--ink)",
          }}>←</button>
          <div style={{
            fontFamily:"'Syne',sans-serif", fontSize:16, fontWeight:800,
            color:"var(--ink)", flex:1, overflow:"hidden",
            textOverflow:"ellipsis", whiteSpace:"nowrap",
          }}>{ad.title}</div>
        </div>
        {/* thumbnail */}
        {ad.thumbnail
          ? <img src={ad.thumbnail} alt={ad.title} style={{width:"100%", height:220, objectFit:"cover", display:"block", flexShrink:0}} />
          : <div style={{width:"100%", height:180, background:"linear-gradient(135deg,var(--bg3),var(--bg4))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:64, flexShrink:0}}>{ad.icon}</div>
        }
        {/* content */}
        <div style={{padding:"20px 16px 100px"}}>
          {ad.featured && (
            <div style={{display:"inline-flex", alignItems:"center", gap:6, background:"var(--acc2)", color:"var(--ink)", fontSize:9, fontWeight:800, letterSpacing:2, textTransform:"uppercase", padding:"3px 10px", marginBottom:14, borderRadius:4}}>
              ⭐ FEATURED OFFER
            </div>
          )}
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--acc)", marginBottom:8, display:"flex", alignItems:"center", gap:8}}>
            <span style={{width:14, height:2, background:"var(--acc3)", display:"inline-block"}} />
            {ad.category || "Promotion"}
          </div>
          <div style={{fontFamily:"'Syne',sans-serif", fontSize:24, fontWeight:800, letterSpacing:-1, color:"var(--ink)", lineHeight:1.1, marginBottom:12}}>{ad.title}</div>
          <div style={{fontSize:15, color:"var(--ink3)", lineHeight:1.7, marginBottom:20, paddingBottom:20, borderBottom:"1px solid var(--line)"}}>{ad.desc}</div>
          {ad.details && (
            <>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--acc2)", marginBottom:10}}>Offer Details</div>
              <div style={{fontSize:13, color:"var(--mid)", lineHeight:1.9, whiteSpace:"pre-line", marginBottom:24, background:"var(--bg2)", padding:16, borderRadius:12, border:"1px solid var(--line)"}}>{ad.details}</div>
            </>
          )}
          <div style={{display:"flex", gap:12, flexWrap:"wrap"}}>
            {ad.link
              ? <a href={ad.link} target="_blank" rel="noreferrer" className="btn gold sm" style={{textDecoration:"none", flex:1, justifyContent:"center"}}>VISIT OFFER PAGE →</a>
              : <span style={{fontSize:12, color:"var(--mid)"}}>Contact the advertiser for more information.</span>
            }
            <button className="btn out sm" onClick={onClose} style={{flex:1, justifyContent:"center"}}>CLOSE</button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop
  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal">
        <button className="ad-modal-close" onClick={onClose}>✕</button>
        {ad.thumbnail
          ? <img src={ad.thumbnail} alt={ad.title} className="ad-modal-thumb" />
          : <div className="ad-modal-thumb-ph"><span style={{position:"relative", zIndex:1}}>{ad.icon}</span></div>
        }
        <div className="ad-modal-content">
          {ad.featured && (
            <div style={{display:"inline-flex", alignItems:"center", gap:6, background:"var(--acc2)", color:"var(--ink)", fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:9, fontWeight:800, letterSpacing:2, textTransform:"uppercase", padding:"3px 10px", marginBottom:14}}>
              ⭐ FEATURED OFFER
            </div>
          )}
          <div className="ad-modal-cat">
            <span style={{width:14, height:2, background:"var(--acc3)", display:"inline-block"}} />
            {ad.category || "Promotion"}
          </div>
          <div className="ad-modal-title">{ad.title}</div>
          <div className="ad-modal-desc">{ad.desc}</div>
          {ad.details && (
            <>
              <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--acc2)", marginBottom:12, display:"flex", alignItems:"center", gap:8}}>
                <span style={{width:16, height:2, background:"var(--acc2)", display:"inline-block"}} />
                Offer Details
              </div>
              <div className="ad-modal-details">{ad.details}</div>
            </>
          )}
          <div className="ad-modal-actions">
            {ad.link
              ? <a href={ad.link} target="_blank" rel="noreferrer" className="btn gold sm" style={{textDecoration:"none"}}>VISIT OFFER PAGE →</a>
              : <span style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:12, color:"var(--mid)"}}>Contact the advertiser for more information.</span>
            }
            <button className="btn out sm" onClick={onClose}>CLOSE</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MARKETPLACE ───────────────────────────────────────────── */
function Marketplace({ state }) {
  const { ads } = state;
  const active = ads.filter(a => a.active);
  const categories = ["All", ...Array.from(new Set(active.map(a => a.category).filter(Boolean)))];
  const [cat, setCat]       = useState("All");
  const [selected, setSelected] = useState(null);
  const list = cat === "All" ? active : active.filter(a => a.category === cat);
  const featured = active.filter(a => a.featured);

  return (
    <div className="page">
      {selected && <AdDetail ad={selected} onClose={() => setSelected(null)} />}

      <div className="sh">
        <div className="sh-label">CLUBBB</div>
        <div className="sh-title">MARKETPLACE</div>
        <div className="sh-sub">Exclusive offers, gear deals & partner promotions for CLUBBB members</div>
      </div>

      {/* Featured strip */}
      {featured.length > 0 && (
        <>
          <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, letterSpacing:3, color:"var(--acc2)", textTransform:"uppercase", marginBottom:14, display:"flex", alignItems:"center", gap:10}}>
            <span style={{width:20, height:2, background:"var(--acc2)", display:"inline-block"}} />
            Featured Promotions
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16, marginBottom:40}}>
            {featured.map(ad => (
              <div key={ad.id} onClick={() => setSelected(ad)} style={{background:"linear-gradient(135deg,var(--bg3),var(--bg4))", border:"1px solid var(--acc3)", position:"relative", overflow:"hidden", cursor:"pointer", borderRadius:16, WebkitTapHighlightColor:"transparent"}}>
                <div style={{position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--acc2),var(--acc3))"}} />
                {ad.thumbnail
                  ? <img src={ad.thumbnail} alt={ad.title} style={{width:"100%", height:130, objectFit:"cover", display:"block"}} />
                  : <div style={{width:"100%", height:130, background:"linear-gradient(135deg,var(--ink3),var(--ink3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44}}>{ad.icon}</div>
                }
                <div style={{padding:"16px 18px 18px"}}>
                  <div style={{position:"absolute", top:ad.thumbnail ? 112 : 118, right:10, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:9, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color:"var(--ink)", background:"var(--acc2)", padding:"3px 8px"}}>⭐ FEATURED</div>
                  <div style={{fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:"var(--acc3)", marginBottom:5}}>{ad.category}</div>
                  <div style={{fontFamily:"'Syne',sans-serif", fontSize:17, letterSpacing:2, color:"var(--ink)", lineHeight:1.1, marginBottom:6}}>{ad.title}</div>
                  <div style={{fontSize:12, color:"var(--mid)", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{ad.desc}</div>
                  <div style={{marginTop:12, fontFamily:"'Plus Jakarta Sans',sans-serif", fontSize:11, fontWeight:700, letterSpacing:1.5, color:"var(--acc2)"}}>VIEW DETAILS →</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Category filter */}
      <div className="mkt-cats">
        {categories.map(c => (
          <button key={c} className={`mkt-cat ${cat === c ? "on" : ""}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {/* All offers grid */}
      {list.length === 0
        ? <div style={{color:"var(--mid)", fontSize:14, padding:"24px 0"}}>No offers in this category yet.</div>
        : <div className="mkt-grid">
            {list.map(ad => (
              <div key={ad.id} className="mkt-card" onClick={() => setSelected(ad)}>
                {ad.featured && <div className="mkt-featured-banner" />}
                {ad.featured && <div className="mkt-featured-tag">⭐ FEATURED</div>}

                {/* Thumbnail */}
                <div style={{position:"relative"}}>
                  {ad.thumbnail
                    ? <img src={ad.thumbnail} alt={ad.title} className="mkt-thumb" />
                    : <div className="mkt-thumb-placeholder">{ad.icon}</div>
                  }
                  <div className="mkt-thumb-overlay" />
                </div>

                {/* Body */}
                <div className="mkt-card-body">
                  <div className="mkt-card-cat">{ad.category || "Promotion"}</div>
                  <div className="mkt-card-title">{ad.title}</div>
                  <div className="mkt-card-desc">{ad.desc}</div>
                </div>

                {/* Footer */}
                <div className="mkt-card-foot">
                  <span className="mkt-sponsored">Sponsored</span>
                  <button className="mkt-view-btn" onClick={e => { e.stopPropagation(); setSelected(ad); }}>VIEW DETAILS</button>
                </div>
              </div>
            ))}
          </div>
      }
    </div>
  );
}

/* ═══ ROOT ══════════════════════════════════════════════════════ */
/* ════════════════════════════════════════════════════════
   FEATURE 1 — LIVE DRIVE TRACKER
════════════════════════════════════════════════════════ */
function LiveTracker({ drive, state, upd, showToast }) {
  const { currentUser:cu, users:us, liveTrack = {} } = state;
  const driveTrack = liveTrack[drive.id] || {};
  const isSharing  = driveTrack[cu.id]?.sharing || false;
  const [watchId, setWatchId] = useState(null);

  // Cleanup GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation && navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // Only show members who are actively sharing their real GPS location
  const positions = Object.entries(driveTrack)
    .filter(([, pos]) => pos.sharing)
    .map(([uid, pos]) => {
      const u = getUser(us, Number(uid) || uid);
      return { ...pos, user: u, isMe: (Number(uid) || uid) === cu.id };
    });

  function startSharing() {
    if (!navigator.geolocation) { showToast("GPS not available on this device"); return; }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        upd({ liveTrack: { ...liveTrack, [drive.id]: { ...driveTrack, [cu.id]: { lat, lng, ts: Date.now(), sharing: true } } } });
      },
      () => {
        showToast("⚠️ GPS unavailable — enable location access in your browser settings");
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    setWatchId(id);
    showToast("📡 Live location sharing started");
  }

  function stopSharing() {
    if (watchId) navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    const updated = { ...driveTrack };
    if (updated[cu.id]) updated[cu.id] = { ...updated[cu.id], sharing: false };
    upd({ liveTrack: { ...liveTrack, [drive.id]: updated } });
    showToast("Location sharing stopped");
  }

  // Map rendering — only real sharing members
  const allPos = positions;
  const sharingCount = positions.length;

  return (
    <div>
      <div className="map-wrap">
        <div className="map-frame">
          <div className="map-grid" />
          {/* Render member dots */}
          {allPos.map((p, i) => {
            const x = 15 + ((i + 1) / (allPos.length + 1)) * 70;
            const y = 20 + (i % 3) * 25;
            return (
              <div key={i} className={`map-car${p.isMe ? " me" : ""}`}
                style={{ left: `${x}%`, top: `${y}%` }}>
                <div style={{ width:36, height:36, borderRadius:"50%", background: p.isMe ? "var(--acc2)" : "var(--ink)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, border: p.isMe ? "3px solid var(--acc)" : "3px solid #fff" }}>
                  🚙
                </div>
                <div className="map-car-label">{p.isMe ? "YOU" : (p.user?.name?.split(" ")[0] || "?")}</div>
              </div>
            );
          })}
          {allPos.length === 0 && (
            <div style={{ textAlign:"center", zIndex:2, position:"relative" }}>
              <div style={{ fontSize:48, marginBottom:8 }}>🏜️</div>
              <div style={{ fontSize:13, color:"var(--mid)", fontWeight:600 }}>Start sharing to appear on map</div>
            </div>
          )}
          <div className="map-legend">
            <div className="map-legend-row">🚙 {sharingCount} member{sharingCount !== 1 ? "s" : ""} live</div>
            <div className="map-legend-row">📍 {drive.location}</div>
          </div>
        </div>
        <div className="track-bar">
          {isSharing
            ? <div className="track-sharing"><div className="track-dot" /><span>Sharing your location</span></div>
            : <div style={{ fontSize:13, color:"var(--mid)", fontWeight:500 }}>Your location is private</div>
          }
          <div style={{ marginLeft:"auto", display:"flex", gap:8 }}>
            {!isSharing
              ? <button className="btn gold sm" onClick={startSharing}>📡 Share My Location</button>
              : <button className="btn out-red sm" onClick={stopSharing}>⏹ Stop Sharing</button>
            }
          </div>
        </div>
      </div>
      <div className="ibox" style={{ fontSize:12 }}>
        📌 Location is only shared with members of this drive. Sharing stops automatically when you close the app.
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FEATURE 2 — SOS EMERGENCY
════════════════════════════════════════════════════════ */
function SOSPanel({ state, upd, showToast, pushNotif }) {
  const { currentUser:cu, users:us, clubs:cs, sos = [] } = state;
  const myClub    = cu.clubId ? getClub(cs, cu.clubId) : null;
  const marshals  = us.filter(u => u.clubId === cu.clubId && ["marshal","admin"].includes(u.role) && u.id !== cu.id);
  const myActive  = sos.find(s => s.userId === cu.id && !s.resolved);
  const clubSOS   = sos.filter(s => {
    const u = getUser(us, s.userId);
    return u?.clubId === cu.clubId && !s.resolved;
  });

  function triggerSOS() {
    if (!window.confirm("🚨 SEND SOS?\n\nThis will alert all marshals and the club admin with your location.")) return;
    navigator.geolocation?.getCurrentPosition(
      pos => sendSOS(pos.coords.latitude, pos.coords.longitude),
      ()  => sendSOS(23.1118 + (Math.random()-.5)*.02, 53.7766 + (Math.random()-.5)*.02)
    );
  }

  function sendSOS(lat, lng) {
    const entry = { id: Date.now(), userId: cu.id, lat, lng, ts: Date.now(), resolved: false };
    upd({ sos: [...sos, entry] });
    marshals.forEach(m => pushNotif({ type:"sos", title:"🚨 SOS ALERT", body:`${cu.name} needs help at ${lat.toFixed(4)}°N ${lng.toFixed(4)}°E`, to: m.id }));
    showToast("🚨 SOS sent to " + marshals.length + " marshal(s)!");
  }

  function resolveAlert(id) {
    upd({ sos: sos.map(s => s.id === id ? { ...s, resolved: true } : s) });
    showToast("✓ SOS marked as resolved");
  }

  return (
    <div>
      {/* Active SOS alerts visible to marshals/admins */}
      {["marshal","admin","support"].includes(cu.role) && clubSOS.length > 0 && (
        <div style={{ marginBottom:24 }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--red)", marginBottom:12 }}>⚠️ Active SOS Alerts</div>
          {clubSOS.map(s => {
            const u = getUser(us, s.userId);
            return (
              <div key={s.id} className="sos-list-item">
                <div className="sos-ping" />
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700, fontSize:15, color:"var(--ink)", marginBottom:3 }}>{u?.name || "Unknown"}</div>
                  <div style={{ fontSize:12, color:"var(--mid)" }}>📍 {s.lat.toFixed(5)}°N, {s.lng.toFixed(5)}°E</div>
                  <div style={{ fontSize:11, color:"var(--mid3)", marginTop:2 }}>{new Date(s.ts).toLocaleTimeString()}</div>
                </div>
                <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                  <a href={`https://www.google.com/maps?q=${s.lat},${s.lng}`} target="_blank" rel="noreferrer" className="btn out xs">🗺 Open Map</a>
                  <button className="btn out-grn xs" onClick={() => resolveAlert(s.id)}>✓ Resolved</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SOS button for members */}
      {myActive ? (
        <div className="sos-active">
          <div style={{ fontWeight:700, fontSize:16, color:"var(--red)", marginBottom:6 }}>🚨 SOS Active</div>
          <div style={{ fontSize:13, color:"var(--mid)", marginBottom:14 }}>Your distress signal is live. Marshals have been notified and can see your location.</div>
          <button className="btn out-grn sm" onClick={() => { upd({ sos: sos.map(s => s.id === myActive.id ? {...s, resolved:true} : s) }); showToast("SOS cancelled"); }}>
            ✓ I'm Safe — Cancel SOS
          </button>
        </div>
      ) : (
        <div style={{ textAlign:"center", padding:"32px 20px" }}>
          <div style={{ fontSize:13, color:"var(--mid)", marginBottom:24, lineHeight:1.6 }}>
            Press only in a genuine emergency. This will immediately alert <strong>{marshals.length} marshal{marshals.length !== 1 ? "s" : ""}</strong> in {myClub?.name || "your club"} with your GPS coordinates.
          </div>
          <button className="sos-btn" onClick={triggerSOS}>
            🚨 SEND SOS
          </button>
          <div style={{ fontSize:11, color:"var(--mid3)", marginTop:16 }}>
            Only use in a real emergency situation
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FEATURE 3 — PUSH NOTIFICATIONS
════════════════════════════════════════════════════════ */
function useNotifications() {
  const [notifs, setNotifs] = useState([]);
  function push(n) {
    const id = Date.now();
    const ts = new Date().toLocaleTimeString();
    setNotifs(q => [...q.slice(-4), { ...n, id, ts }]);
    setTimeout(() => setNotifs(q => q.filter(x => x.id !== id)), 5000);
  }
  function dismiss(id) { setNotifs(q => q.filter(x => x.id !== id)); }
  return { notifs, push, dismiss };
}

function NotifBanner({ notifs, dismiss }) {
  if (!notifs.length) return null;
  return (
    <>
      {notifs.map((n, i) => (
        <div key={n.id} className="notif-banner" style={{ top: 80 + i * 90 }}>
          <div className={`notif-icon ${n.type}`}>
            {n.type === "sos" ? "🚨" : n.type === "drive" ? "🚙" : n.type === "reg" ? "✅" : "🔔"}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="notif-title">{n.title}</div>
            <div className="notif-body">{n.body}</div>
            <div className="notif-time">{n.ts}</div>
          </div>
          <button className="notif-close" onClick={() => dismiss(n.id)}>✕</button>
        </div>
      ))}
    </>
  );
}

/* ════════════════════════════════════════════════════════
   FEATURE 4 — CLUB CHAT
════════════════════════════════════════════════════════ */
function ClubChat({ state, upd, showToast, forcedClubId }) {
  const { currentUser:cu, users:us, clubs:cs, chat = {} } = state;
  const clubId   = forcedClubId || cu.clubId;
  if (!clubId) return <div style={{padding:"20px 0", color:"var(--mid)", fontSize:14}}>You must be a club member to access chat.</div>;
  const msgs     = chat[clubId] || [];
  const [text, setText] = useState("");
  const endRef   = useRef(null);
  const isAdmin  = ["admin","marshal","support"].includes(cu.role);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:"smooth" }); }, [msgs.length]);

  function send() {
    const t = text.trim();
    if (!t) return;
    const msg = { id: Date.now(), userId: cu.id, text: t, ts: Date.now(), pinned: false };
    upd({ chat: { ...chat, [clubId]: [...msgs, msg] } });
    setText("");
  }

  function pin(id) {
    upd({ chat: { ...chat, [clubId]: msgs.map(m => m.id === id ? { ...m, pinned: !m.pinned } : m) } });
  }

  function del(id) {
    upd({ chat: { ...chat, [clubId]: msgs.filter(m => m.id !== id) } });
  }

  const pinned = msgs.filter(m => m.pinned);

  return (
    <div>
      {/* Pinned announcements */}
      {pinned.length > 0 && (
        <div style={{ marginBottom:16 }}>
          {pinned.map(m => {
            const u = getUser(us, m.userId);
            return (
              <div key={m.id} style={{ display:"flex", gap:10, padding:"12px 16px", background:"var(--acc-pale)", border:"1.5px solid var(--acc-pale3)", borderRadius:"var(--r-xl)", marginBottom:8 }}>
                <span style={{ fontSize:16 }}>📌</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:11, fontWeight:700, color:"var(--acc)", letterSpacing:1, textTransform:"uppercase", marginBottom:3 }}>Pinned by {u?.name?.split(" ")[0]}</div>
                  <div style={{ fontSize:13, color:"var(--ink)", lineHeight:1.55 }}>{m.text}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="chat-wrap">
        <div className="chat-msgs">
          {msgs.length === 0 && (
            <div style={{ textAlign:"center", margin:"auto", color:"var(--mid2)", fontSize:13 }}>
              <div style={{ fontSize:40, marginBottom:10 }}>💬</div>
              No messages yet. Say hello to your club!
            </div>
          )}
          {msgs.map(m => {
            const u   = getUser(us, m.userId);
            const isMe = m.userId === cu.id;
            return (
              <div key={m.id} className={`chat-msg${isMe ? " me" : ""}`}>
                {!isMe && <div className="ava" style={{ width:32, height:32, fontSize:13, borderRadius:10, flexShrink:0 }}>{(u?.name||"?")[0]}</div>}
                <div style={{ maxWidth:"72%" }}>
                  {!isMe && <div className="chat-sender">{u?.name?.split(" ")[0] || "?"}</div>}
                  {m.pinned && <div className="chat-pin-badge">📌 Pinned</div>}
                  <div className={`chat-bubble ${isMe ? "me" : "them"}${m.pinned ? " pinned" : ""}`}>{m.text}</div>
                  <div className={`chat-meta ${isMe ? "me" : ""}`}>
                    {new Date(m.ts).toLocaleTimeString([], { hour:"2-digit", minute:"2-digit" })}
                    {(isAdmin || isMe) && (
                      <span style={{ marginLeft:8 }}>
                        {isAdmin && <button onClick={() => pin(m.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--mid2)", padding:"0 4px" }}>{m.pinned ? "unpin" : "📌 pin"}</button>}
                        {(isMe || isAdmin) && <button onClick={() => del(m.id)} style={{ background:"none", border:"none", cursor:"pointer", fontSize:11, color:"var(--red)", padding:"0 4px" }}>del</button>}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={endRef} />
        </div>
        <div className="chat-input-row">
          <textarea
            className="chat-input"
            placeholder="Message your club..."
            value={text}
            rows={1}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
          />
          <button className="chat-send" onClick={send}>↑</button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FEATURE 5 — PRE-DRIVE CHECKLIST
════════════════════════════════════════════════════════ */
const CHECKLIST_ITEMS = [
  { id:"fuel",   label:"Fuel tank full",              icon:"⛽" },
  { id:"tyres",  label:"Tyre pressure checked",       icon:"🔧" },
  { id:"gear",   label:"Recovery gear loaded",        icon:"⛏️" },
  { id:"spare",  label:"Spare tyre on board",         icon:"🔩" },
  { id:"water",  label:"Water supply (min 5L)",       icon:"💧" },
  { id:"comms",  label:"Radio / phone charged",       icon:"📻" },
];

function DriveChecklist({ drive, state, upd, showToast }) {
  const { currentUser:cu, users:us, checklists = {}, clubs:cs } = state;
  const driveChecks  = checklists[drive.id] || {};
  const myCheck      = driveChecks[cu.id]   || {};
  const isAdmin      = ["admin","marshal","support"].includes(cu.role);
  const confirmed    = drive.registrations.filter(r => r.status === "confirmed");

  // Combine base items with drive-specific custom items
  const customItems  = drive.checklistItems || [];
  const allItems     = [...CHECKLIST_ITEMS, ...customItems];

  const done    = allItems.filter(i => myCheck[i.id]).length;
  const pct     = allItems.length ? Math.round(done / allItems.length * 100) : 0;
  const allDone = done === allItems.length;

  // Custom item editor state (admin only)
  const [newLabel, setNewLabel] = useState("");
  const [newIcon,  setNewIcon]  = useState("✅");
  const ICON_OPTS = ["✅","🔦","🪖","🧯","🩹","🧰","🛞","📡","🗺","⛺","🪢","🔋","🧲","🪝"];

  function toggle(itemId) {
    const updated = { ...myCheck, [itemId]: !myCheck[itemId], ts: Date.now() };
    upd({ checklists: { ...checklists, [drive.id]: { ...driveChecks, [cu.id]: updated } } });
    if (!myCheck[itemId] && done + 1 === allItems.length) showToast("✅ All checks done — you're ready!");
  }

  function addCustomItem() {
    const label = newLabel.trim();
    if (!label) { showToast("Enter a label for the checklist item"); return; }
    const id = "custom_" + Date.now();
    const item = { id, label, icon: newIcon, custom: true };
    const updatedItems = [...customItems, item];
    upd({ drives: state.drives.map(d => d.id === drive.id ? {...d, checklistItems: updatedItems} : d) });
    setNewLabel("");
    showToast("✓ Checklist item added");
  }

  function removeCustomItem(id) {
    upd({ drives: state.drives.map(d => d.id === drive.id ? {...d, checklistItems: customItems.filter(i => i.id !== id)} : d) });
    showToast("Item removed");
  }

  return (
    <div>
      {/* My checklist */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>My Vehicle Checklist</div>
          <span style={{ fontSize:13, fontWeight:700, color: allDone ? "var(--green)" : "var(--mid)" }}>
            {done}/{allItems.length} {allDone ? "✅ Ready!" : ""}
          </span>
        </div>
        <div className="checklist-progress"><div className="checklist-fill" style={{ width:`${pct}%` }} /></div>

        {/* Base items */}
        {CHECKLIST_ITEMS.map(item => (
          <div key={item.id} className={`check-item${myCheck[item.id] ? " done" : ""}`} onClick={() => toggle(item.id)}>
            <span className="check-icon">{item.icon}</span>
            <span className="check-label">{item.label}</span>
            <div className="check-box">{myCheck[item.id] ? "✓" : ""}</div>
          </div>
        ))}

        {/* Custom items */}
        {customItems.length > 0 && (
          <>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--acc)", margin:"16px 0 8px", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ width:16, height:1.5, background:"var(--acc)", display:"inline-block" }} />
              Club Custom Checks
              <span style={{ width:16, height:1.5, background:"var(--acc)", display:"inline-block" }} />
            </div>
            {customItems.map(item => (
              <div key={item.id} className={`check-item${myCheck[item.id] ? " done" : ""}`}
                style={{ borderColor: myCheck[item.id] ? "rgba(22,163,74,.3)" : "var(--acc-pale3)", background: myCheck[item.id] ? "rgba(22,163,74,.04)" : "var(--acc-pale4)" }}
                onClick={() => toggle(item.id)}>
                <span className="check-icon">{item.icon}</span>
                <span className="check-label">{item.label}</span>
                {isAdmin && (
                  <button onClick={e => { e.stopPropagation(); removeCustomItem(item.id); }}
                    style={{ background:"none", border:"none", cursor:"pointer", color:"var(--mid3)", fontSize:14, padding:"0 4px", marginRight:4 }}>✕</button>
                )}
                <div className="check-box">{myCheck[item.id] ? "✓" : ""}</div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Admin: add custom item */}
      {isAdmin && (
        <div className="card" style={{ marginBottom:24, padding:"18px 20px" }}>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--acc)", marginBottom:12 }}>➕ Add Custom Check Item</div>
          <div style={{ display:"flex", gap:8, flexWrap:"wrap", alignItems:"flex-end" }}>
            {/* Icon picker */}
            <div style={{ display:"flex", flexDirection:"column", gap:4 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--mid2)" }}>Icon</label>
              <select value={newIcon} onChange={e => setNewIcon(e.target.value)}
                className="fi fi-sel" style={{ width:70, padding:"9px 8px", fontSize:16, textAlign:"center" }}>
                {ICON_OPTS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
            </div>
            {/* Label input */}
            <div style={{ flex:1, display:"flex", flexDirection:"column", gap:4, minWidth:160 }}>
              <label style={{ fontSize:11, fontWeight:600, color:"var(--mid2)" }}>Checklist Item Label</label>
              <input className="fi" value={newLabel} onChange={e => setNewLabel(e.target.value)}
                placeholder='e.g. "Sand flag attached"'
                onKeyDown={e => { if (e.key === "Enter") addCustomItem(); }}
                style={{ padding:"9px 14px" }} />
            </div>
            <button className="btn gold sm" onClick={addCustomItem} style={{ flexShrink:0 }}>Add Item</button>
          </div>
          {customItems.length > 0 && (
            <div style={{ fontSize:11, color:"var(--mid2)", marginTop:10 }}>
              {customItems.length} custom item{customItems.length !== 1 ? "s" : ""} added · Click ✕ on any item to remove it
            </div>
          )}
        </div>
      )}

      {/* Marshal view — see all members status */}
      {isAdmin && confirmed.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:12 }}>Member Readiness</div>
          {confirmed.map(reg => {
            const u      = getUser(us, reg.userId);
            const uCheck = driveChecks[reg.userId] || {};
            const uDone  = allItems.filter(i => uCheck[i.id]).length;
            const ready  = uDone === allItems.length;
            return (
              <div key={reg.userId} className={`marshal-check-row${ready ? " all-done" : ""}`}>
                <div className="ava" style={{ width:34, height:34, fontSize:13, borderRadius:10 }}>{(u?.name||"?")[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{u?.name}</div>
                  <div style={{ fontSize:11, color:"var(--mid2)", marginTop:2 }}>{uDone}/{allItems.length} items checked</div>
                </div>
                <span className={`bdg ${ready ? "g" : "d"}`}>{ready ? "✅ READY" : `${uDone}/${allItems.length}`}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   FEATURE 6 — DRIVE RATING
════════════════════════════════════════════════════════ */
function DriveRating({ drive, state, upd, showToast }) {
  const { currentUser:cu, users:us, ratings = {} } = state;
  const driveRatings = ratings[drive.id] || [];
  const myRating     = driveRatings.find(r => r.userId === cu.id);
  const [hover, setHover]     = useState(0);
  const [stars, setStars]     = useState(myRating?.stars || 0);
  const [comment, setComment] = useState(myRating?.comment || "");
  const wasAttendee = drive.registrations.find(r => r.userId === cu.id && r.status === "confirmed" && r.attended);

  const avg = driveRatings.length ? (driveRatings.reduce((s, r) => s + r.stars, 0) / driveRatings.length).toFixed(1) : null;

  function submitRating() {
    if (!stars) { showToast("Please select a star rating"); return; }
    const entry = { userId: cu.id, stars, comment: comment.trim(), ts: Date.now() };
    const updated = myRating
      ? driveRatings.map(r => r.userId === cu.id ? entry : r)
      : [...driveRatings, entry];
    upd({ ratings: { ...ratings, [drive.id]: updated } });
    showToast("⭐ Rating submitted!");
  }

  return (
    <div>
      {/* Summary */}
      {driveRatings.length > 0 && (
        <div style={{ display:"flex", gap:24, alignItems:"center", marginBottom:28, padding:"20px 24px", background:"var(--bg)", border:"1px solid var(--line)", borderRadius:"var(--r-xl)" }}>
          <div style={{ textAlign:"center" }}>
            <div className="avg-score">{avg}</div>
            <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginTop:4 }}>Avg Rating</div>
          </div>
          <div style={{ flex:1 }}>
            {[5,4,3,2,1].map(s => {
              const cnt = driveRatings.filter(r => r.stars === s).length;
              const pct = driveRatings.length ? cnt / driveRatings.length * 100 : 0;
              return (
                <div key={s} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ fontSize:11, color:"var(--mid2)", width:8 }}>{s}</span>
                  <div style={{ flex:1, height:6, background:"var(--bg3)", borderRadius:100, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:"linear-gradient(90deg,var(--acc3),var(--acc2))", borderRadius:100, transition:"width .4s" }} />
                  </div>
                  <span style={{ fontSize:11, color:"var(--mid2)", width:16 }}>{cnt}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Submit rating (attendees only, after drive) */}
      {drive.attendanceRecorded && wasAttendee && (
        <div className="card" style={{ marginBottom:24 }}>
          <div className="card-label">{myRating ? "Update Your Rating" : "Rate This Drive"}</div>
          <div className="stars-row">
            {[1,2,3,4,5].map(s => (
              <span key={s} className={`star${(hover||stars) >= s ? " lit" : ""}`}
                onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                onClick={() => setStars(s)}>
                {(hover||stars) >= s ? "⭐" : "☆"}
              </span>
            ))}
          </div>
          <div className="fg">
            <label className="fl">Comments (optional)</label>
            <textarea className="fi fi-ta" style={{ minHeight:80 }} value={comment}
              onChange={e => setComment(e.target.value)} placeholder="How was the route, organisation, difficulty..." />
          </div>
          <button className="btn gold sm" style={{ marginTop:8 }} onClick={submitRating}>
            {myRating ? "Update Rating" : "Submit Rating"}
          </button>
        </div>
      )}
      {drive.attendanceRecorded && !wasAttendee && (
        <div className="ibox" style={{ marginBottom:20 }}>Only confirmed attendees can rate this drive.</div>
      )}
      {!drive.attendanceRecorded && (
        <div className="ibox" style={{ marginBottom:20 }}>Rating opens once the marshal records attendance.</div>
      )}

      {/* All ratings */}
      {driveRatings.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:12 }}>All Reviews ({driveRatings.length})</div>
          {driveRatings.map((r, i) => {
            const u = getUser(us, r.userId);
            return (
              <div key={i} className="rating-card">
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <div className="ava" style={{ width:32, height:32, fontSize:13, borderRadius:10 }}>{(u?.name||"?")[0]}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{u?.name || "Member"}</div>
                  </div>
                  <div className="rating-stars">{"⭐".repeat(r.stars)}{"☆".repeat(5 - r.stars)}</div>
                </div>
                {r.comment && <div className="rating-comment">{r.comment}</div>}
                <div className="rating-meta">{new Date(r.ts).toLocaleDateString()}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   DRIVE DETAIL MODAL — combines tracker, checklist, rating
════════════════════════════════════════════════════════ */
function DriveDetailModal({ drive, state, upd, showToast, onClose }) {
  const [tab, setTab] = useState("info");
  const { currentUser:cu } = state;
  const tabs = [
    { id:"info",      label:"Info" },
    { id:"tracker",   label:"🗺 Live Map" },
    { id:"sos",       label:"🚨 SOS" },
    { id:"checklist", label:"✅ Checklist" },
    { id:"chat",      label:"💬 Chat" },
    { id:"rating",    label:"⭐ Rate" },
  ];
  return (
    <Modal title={drive.title} onClose={onClose}>
      <div className="tabs" style={{ marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t.id} className={`tab ${tab === t.id ? "on" : ""}`} onClick={() => setTab(t.id)} style={{ fontSize:12, padding:"7px 12px" }}>{t.label}</button>
        ))}
      </div>
      {tab === "info" && (
        <div>
          {drive.description && <p style={{ fontSize:14, color:"var(--mid)", lineHeight:1.65, marginBottom:16 }}>{drive.description}</p>}
          <div className="dcard-meta" style={{ flexDirection:"column", gap:10 }}>
            {drive.location  && <div className="dm">📍 <strong>{drive.location}</strong></div>}
            {drive.coordinates && <div className="dm">🗺 <strong>{drive.coordinates}</strong></div>}
            {drive.date      && <div className="dm">📅 <strong>{fmtDate(drive.date)}</strong></div>}
            {drive.startTime && <div className="dm">🕐 <strong>{fmtTime(drive.startTime)}</strong></div>}
            {drive.mapLink   && <a href={drive.mapLink} target="_blank" rel="noreferrer" className="btn out sm" style={{ marginTop:8 }}>🗺 Open in Google Maps</a>}
          </div>
        </div>
      )}
      {tab === "tracker"   && <LiveTracker   drive={drive} state={state} upd={upd} showToast={showToast} />}
      {tab === "sos"       && <SOSPanel      state={state} upd={upd} showToast={showToast} pushNotif={showToast} />}
      {tab === "checklist" && <DriveChecklist drive={drive} state={state} upd={upd} showToast={showToast} />}
      {tab === "chat"      && <ClubChat      state={state} upd={upd} showToast={showToast} forcedClubId={drive.clubId} />}
      {tab === "rating"    && <DriveRating   drive={drive} state={state} upd={upd} showToast={showToast} />}
    </Modal>
  );
}

/* ─── FIRST-TIME SETUP WIZARD ───────────────────────────────────
   Shown when there are zero users (fresh install).
   Creates the App Admin account — the only way to get app_admin role.
   After setup, this screen is gone forever.
───────────────────────────────────────────────────────────────── */
function SetupWizard({ onComplete }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [err,      setErr]      = useState("");

  async function create() {
    setErr("");
    if (!name.trim() || !email.trim() || !password) { setErr("All fields are required."); return; }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(email.trim())) { setErr("Enter a valid email address."); return; }
    const pwErr = validatePassword(password);
    if (pwErr) { setErr(pwErr); return; }
    if (password !== confirm) { setErr("Passwords do not match."); return; }

    setLoading(true);

    // ── Step 1: Hash password ──
    let passwordHash;
    try {
      passwordHash = await hashPassword(password);
    } catch (e) {
      setErr("An unexpected error occurred. Please try again.");
      console.error("[CLUBBB] hashPassword failed:", e);
      setLoading(false);
      return;
    }

    // ── Step 2: Build admin user object ──
    const adminUser = {
      id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      role: "app_admin",
      rankId: 5,
      clubId: null,
      drives: 0,
      passwordHash,
    };

    // ── Step 3: Complete ──
    setLoading(false);
    onComplete(adminUser);
  }

  return (
    <div style={{minHeight:"100vh", background:"var(--off)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px"}}>
      <div style={{width:"100%", maxWidth:480}}>
        {/* Logo */}
        <div style={{textAlign:"center", marginBottom:40}}>
          <div style={{width:64, height:64, background:"var(--acc2)", borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", boxShadow:"var(--sh-gold)"}}>
            <span style={{fontFamily:"'Syne',sans-serif", fontSize:26, fontWeight:800, color:"#0a0a0a", letterSpacing:1}}>CB</span>
          </div>
          <div style={{fontFamily:"'Syne',sans-serif", fontSize:28, fontWeight:800, letterSpacing:-1, color:"var(--ink)"}}>CLUB<span style={{color:"var(--acc)"}}>BB</span></div>
          <div style={{fontSize:13, color:"var(--mid)", marginTop:6}}>First-Time Setup</div>
        </div>

        <div className="card">
          <div style={{fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--acc)", marginBottom:6}}>Step 1 of 1</div>
          <div style={{fontFamily:"'Syne',sans-serif", fontSize:20, fontWeight:800, color:"var(--ink)", marginBottom:8, letterSpacing:-0.5}}>Create App Admin Account</div>
          <div style={{fontSize:13, color:"var(--mid)", marginBottom:24, lineHeight:1.6}}>
            This is the master administrator account for CLUBBB. Keep these credentials private — this account can manage all clubs, users, and platform settings.
          </div>

          <div className="fg">
            <label className="fl">Full Name *</label>
            <input className="fi" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="fg">
            <label className="fl">Email Address *</label>
            <input className="fi" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@yourdomain.com" />
          </div>
          <div className="fg">
            <label className="fl">Phone Number</label>
            <input className="fi" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+971 50 000 0000" />
          </div>
          <div className="fg">
            <label className="fl">Password *</label>
            <div style={{position:"relative"}}>
              <input className="fi" type={showPw ? "text" : "password"} value={password}
                onChange={e => { setPassword(e.target.value); setErr(""); }}
                placeholder="Min 8 chars, 1 uppercase, 1 number"
                style={{paddingRight:44}} />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", cursor:"pointer", fontSize:16, color:"var(--mid)", padding:4}}>
                {showPw ? "🙈" : "👁️"}
              </button>
            </div>
            {password && (() => {
              const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
              const score  = checks.filter(Boolean).length;
              const labels = ["","Weak","Fair","Good","Strong"];
              const colors = ["","#ef4444","#f59e0b","#84cc16","#22c55e"];
              return (
                <div style={{marginTop:6}}>
                  <div style={{display:"flex", gap:4, marginBottom:3}}>
                    {[1,2,3,4].map(i => (
                      <div key={i} style={{flex:1, height:4, borderRadius:4, background: score >= i ? colors[score] : "var(--line2)", transition:"background .2s"}} />
                    ))}
                  </div>
                  <div style={{fontSize:11, color:colors[score], fontWeight:600}}>{labels[score]}</div>
                </div>
              );
            })()}
          </div>
          <div className="fg">
            <label className="fl">Confirm Password *</label>
            <div style={{position:"relative"}}>
              <input className="fi" type={showPw ? "text" : "password"} value={confirm}
                onChange={e => { setConfirm(e.target.value); setErr(""); }}
                placeholder="Re-enter password" style={{paddingRight:36}} />
              {confirm && (
                <span style={{position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", fontSize:15}}>
                  {confirm === password ? "✅" : "❌"}
                </span>
              )}
            </div>
          </div>

          {err && (
            <div style={{background:"rgba(220,38,38,.08)", border:"1px solid rgba(220,38,38,.25)", borderRadius:10, padding:"10px 14px", fontSize:13, color:"var(--red)", marginBottom:12}}>
              ⚠️ {err}
            </div>
          )}

          <button className="btn gold" style={{width:"100%"}} onClick={create} disabled={loading}>
            {loading ? "CREATING ACCOUNT..." : "CREATE APP ADMIN & LAUNCH →"}
          </button>

          <div style={{marginTop:16, padding:"12px 14px", background:"var(--acc-pale)", border:"1px solid var(--acc-pale3)", borderRadius:12, fontSize:12, color:"var(--ink2)", lineHeight:1.6}}>
            🔒 <strong>Keep this safe.</strong> This is the only App Admin account. You can change the password later from your dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [S, setS]           = useState(INIT);
  const [toast, setToast]   = useState(null);
  const [mobOpen, setMob]   = useState(false);
  const [sbReady, setSbReady] = useState(!SUPA_URL || !SUPA_KEY); // true immediately if no Supabase
  const { notifs, push: pushNotif, dismiss } = useNotifications();

  // ALL hooks must come before any conditional returns (Rules of Hooks)
  useEffect(() => {
    let vp = document.querySelector('meta[name="viewport"]');
    if (!vp) { vp = document.createElement('meta'); vp.name = 'viewport'; document.head.prepend(vp); }
    vp.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
    let tc = document.querySelector('meta[name="theme-color"]');
    if (!tc) { tc = document.createElement('meta'); tc.name='theme-color'; document.head.appendChild(tc); }
    tc.content = '#ffffff';
    document.title = 'CLUBBB — Desert Driving Club';
    Object.assign(document.body.style, { margin:'0', padding:'0', overflowX:'hidden', background:'#f7f7f8' });
  }, []);

  // ── On mount: pull all data from Supabase, THEN decide wizard vs app ──
  useEffect(() => {
    loadRemoteState().then(remote => {
      if (remote) {
        // Supabase is the source of truth — always use its data, even if empty
        setS(s => ({
          ...s,
          users:  remote.users,
          clubs:  remote.clubs,
          drives: remote.drives,
          ads:    remote.ads,
        }));
        saveLocalState({ ...remote });
      }
      setSbReady(true);
    }).catch(() => setSbReady(true));
  }, []);

  // ── On every state change: update localStorage cache ──
  useEffect(() => {
    saveLocalState(S);
  }, [S]);

  // ── Wait for Supabase before rendering anything ──
  if (!sbReady) {
    return (
      <>
        <style>{CSS}</style>
        <div style={{minHeight:"100vh", background:"var(--off)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16}}>
          <div style={{width:56, height:56, background:"var(--acc2)", borderRadius:16, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"var(--sh-gold)"}}>
            <span style={{fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"#0a0a0a"}}>CB</span>
          </div>
          <div style={{fontFamily:"'Syne',sans-serif", fontSize:22, fontWeight:800, color:"var(--ink)", letterSpacing:-0.5}}>CLUB<span style={{color:"var(--acc)"}}>BB</span></div>
          <div style={{width:36, height:36, border:"3px solid var(--acc2)", borderTopColor:"transparent", borderRadius:"50%", animation:"spin 0.8s linear infinite"}} />
          <div style={{fontSize:13, color:"var(--mid)"}}>Loading...</div>
        </div>
      </>
    );
  }

  // ── First-time setup: show wizard when no users exist ──
  // This is AFTER all hooks so it doesn't violate Rules of Hooks
  if (S.users.length === 0) {
    return (
      <>
        <style>{CSS}</style>
        <SetupWizard onComplete={adminUser => {
          setS(s => ({ ...s, users: [adminUser], currentUser: adminUser, page: "app-admin" }));
          SB.upsert("users", userToDb(adminUser))
            .then(r => r ? console.log("[CLUBBB] App admin saved to Supabase ✅", r) : console.error("[CLUBBB] App admin save failed ❌"));
        }} />
        {toast && <Toast msg={toast} done={() => setToast(null)} />}
      </>
    );
  }

  const showToast = msg => setToast(msg);
  const upd = patch => {
    // ── Sync users ──
    if (patch.users) {
      const cur = S.users;
      patch.users.forEach(u => {
        const old = cur.find(o => o.id === u.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(u))
          SB.upsert("users", userToDb(u)).catch(e => console.error("[SB] user sync:", e));
      });
      // Deleted users
      cur.forEach(o => {
        if (!patch.users.find(u => u.id === o.id))
          SB.del("users", { id: o.id }).catch(() => {});
      });
    }
    // ── Sync clubs ──
    if (patch.clubs) {
      const cur = S.clubs;
      patch.clubs.forEach(c => {
        const old = cur.find(o => o.id === c.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(c))
          SB.upsert("clubs", clubToDb(c)).catch(e => console.error("[SB] club sync:", e));
      });
      cur.forEach(o => {
        if (!patch.clubs.find(c => c.id === o.id))
          SB.del("clubs", { id: o.id }).catch(() => {});
      });
    }
    // ── Sync drives ──
    if (patch.drives) {
      const cur = S.drives;
      patch.drives.forEach(d => {
        const old = cur.find(o => o.id === d.id);
        if (!old) return; // NEW drive — already saved directly to Supabase in onSave, skip
        if (JSON.stringify(old) !== JSON.stringify(d)) {
          // This is an UPDATE (cancel, attendance, registration change)
          SB.upsert("drives", driveToDB(d)).catch(e => console.error("[SB] drive update:", e));
          if (d.registrations) {
            d.registrations.forEach(r =>
              SB.upsert("drive_registrations", {
                drive_id: d.id, user_id: r.userId,
                status: r.status || "confirmed", attended: r.attended || false,
              }).catch(() => {})
            );
          }
        }
      });
      // Deleted drives
      cur.forEach(o => {
        if (!patch.drives.find(d => d.id === o.id))
          SB.del("drives", { id: o.id }).catch(() => {});
      });
    }
    // ── Sync ads ──
    if (patch.ads) {
      const cur = S.ads;
      patch.ads.forEach(a => {
        const old = cur.find(o => o.id === a.id);
        if (!old || JSON.stringify(old) !== JSON.stringify(a)) {
          // Map app field 'desc' → Supabase field 'description'
          const row = {
            title:       a.title       || "",
            description: a.desc        || a.description || "",
            details:     a.details     || "",
            icon:        a.icon        || "🚙",
            thumbnail:   a.thumbnail   || null,
            category:    a.category    || "General",
            link:        a.link        || "",
            featured:    a.featured    || false,
            active:      a.active !== false,
          };
          // Only include id if it's a real Supabase serial (not Date.now temp)
          if (a.id && typeof a.id === "number" && a.id < 2000000000) row.id = a.id;
          SB.upsert("ads", row)
            .then(saved => {
              // Swap temp id for real Supabase id
              if (saved?.id && saved.id !== a.id) {
                setS(s => ({...s, ads: s.ads.map(x => x.id === a.id ? {...x, id: saved.id} : x)}));
              }
            })
            .catch(e => console.error("[SB] ad sync:", e));
        }
      });
      // Deleted/removed ads
      cur.forEach(o => {
        if (!patch.ads.find(a => a.id === o.id))
          SB.del("ads", { id: o.id }).catch(() => {});
      });
    }
    setS(s => ({...s, ...patch}));
  };
  const go   = page  => { setS(s => ({...s, page})); setMob(false); };
  const login  = u   => { setS(s => ({...s, currentUser:u, page:"dashboard"})); setMob(false); };
  const logout = ()  => { setS(s => ({...s, currentUser:null, page:"home"})); setMob(false); };

  async function reg(type, form) {
    const emailExists = S.users.find(u => u.email.toLowerCase() === form.email.toLowerCase());
    if (emailExists) { alert("An account with this email already exists. Please sign in instead."); return; }

    // ── Always create the account locally first (instant) ──
    if (type === "member") {
      const u = { id: crypto.randomUUID?.() || String(Date.now()),
                  name:form.name, email:form.email, phone:form.phone||"",
                  role:"member", rankId:1, clubId:Number(form.clubId), drives:0,
                  passwordHash:form.passwordHash||"", emailVerified:false };
      setS(s => ({...s, users:[...s.users, u], currentUser:u, page:"dashboard"}));
      // Persist to Supabase
      SB.upsert("users", userToDb(u))
        .then(r => r ? console.log("[CLUBBB] Member saved ✅") : console.error("[CLUBBB] Member save failed ❌"))
        .catch(e => console.error("[CLUBBB] Member upsert error:", e));

    } else {
      const adminName = form.contactName || form.name;
      const clubName  = form.clubName  || form.name;
      const userId = crypto.randomUUID?.() || String(Date.now());

      // Create club in Supabase first to get the real auto-generated ID
      const clubRow = { name:clubName, email:form.email, phone:form.phone||"",
                        logo:"", banner:"", description:"", terms:"" };

      showToast("Creating club...");
      let savedClub = null;
      if (SUPA_URL && SUPA_KEY) {
        savedClub = await SB.upsert("clubs", clubRow);
      }

      // Use Supabase-returned ID or fallback to timestamp
      const cid = savedClub?.id || (Math.max(0, ...S.clubs.map(c => c.id)) + 1);

      const u = { id: userId, name:adminName, email:form.email, phone:form.phone||"",
                  role:"admin", rankId:5, clubId:cid, drives:0,
                  passwordHash:form.passwordHash||"", emailVerified:false };
      const c = { id:cid, name:clubName, email:form.email, phone:form.phone||"",
                  adminId:userId, logo:"", banner:"", description:"", terms:"" };

      // Update club with admin_id now that we have the user ID
      if (savedClub) {
        SB.upsert("clubs", { ...clubToDb(c) }).catch(e => console.error("[SB] club admin update failed:", e));
      }
      // Save user
      SB.upsert("users", userToDb(u)).catch(e => console.error("[SB] user upsert failed:", e));

      setS(s => ({...s, users:[...s.users,u], clubs:[...s.clubs,c],
                  currentUser:u, page:"club-admin",
                  clubRanks:{...s.clubRanks,[cid]:DEFAULT_RANKS.map(r=>({...r}))}}));
    }
    showToast("✅ Welcome to CLUBBB!");

    // ── Fire-and-forget welcome email ──
    if (SUPA_URL && SUPA_KEY) {
      const payload = type === "member"
        ? { name:form.name, email:form.email, phone:form.phone }
        : { user:{name:form.contactName||form.name, email:form.email},
            club:{name:form.clubName||form.name} };
      sendVerificationEmail(form.email, type, payload)
        .then(r => { if (r.ok) showToast("📧 Welcome email sent to " + form.email); })
        .catch(() => {});
    }
  }

  const { currentUser:cu, page } = S;

  const navItems = cu ? [
    {id:"dashboard",  label:"Dashboard"},
    {id:"drives",     label:"Drives",        hide: cu.role === "app_admin"},
    {id:"chat",       label:"💬 Chat",        hide: !cu.clubId},
    {id:"market",     label:"Marketplace"},
    {id:"club-admin", label:"Club Admin",    hide: cu.role !== "admin"},
    {id:"marshal",    label:"Marshal Panel", hide: !["marshal","support"].includes(cu.role)},
    {id:"app-admin",  label:"App Admin",     hide: cu.role !== "app_admin"},
  ].filter(i => !i.hide) : [];

  return (
    <div style={{minHeight:"100vh", background:"var(--off)"}}>
      <style>{CSS}</style>
      <div className="wrap">
        <nav className="nav">
          <div className="nav-brand" onClick={() => go(cu ? "dashboard" : "home")}>
            <div className="nav-logo-mark">
                <span style={{color:"#0a0a0a", letterSpacing:.5}}>C</span>
                <span style={{color:"#0a0a0a", letterSpacing:.5}}>B</span>
              </div>
            <div className="nav-wordmark">CLUB<span style={{color:"var(--acc)"}}>BB</span></div>
          </div>
          <div className="nav-links">
            {navItems.map(i => (
              <button key={i.id} className={`nbtn ${page === i.id ? "on" : ""}`} onClick={() => go(i.id)}>{i.label}</button>
            ))}
            {cu
              ? <button className="nbtn kill" onClick={logout}>Sign Out</button>
              : <>
                  <button className="nbtn" onClick={() => go("login")}>Sign In</button>
                  <button className="nbtn on" onClick={() => go("reg-member")}>Join</button>
                </>
            }
          </div>
          <button className="nav-mob" onClick={() => setMob(o => !o)}>
            {mobOpen ? "✕" : "☰"}
          </button>
        </nav>

        {/* ── STYLISH MOBILE DRAWER ── */}
        <div className={`mob-drawer${mobOpen ? " open" : ""}`}>
          <div className="mob-drawer-inner">
            {/* User info strip if logged in */}
            {cu && (
              <>
                <div className="mob-drawer-footer" style={{paddingTop:6, paddingBottom:14}}>
                  <div className="mob-drawer-avatar">{(cu.name||"?")[0]}</div>
                  <div className="mob-drawer-user">
                    <div className="mob-drawer-uname">{cu.name}</div>
                    <div className="mob-drawer-urole">{(cu.role||"member").replace("_"," ")}</div>
                  </div>
                </div>
                <div className="mob-drawer-divider" />
              </>
            )}

            {/* Nav items */}
            {cu && <span className="mob-drawer-section">Navigation</span>}
            {navItems.map(i => {
              const icons = {dashboard:"🏠", drives:"🚙", chat:"💬", market:"🛍", "club-admin":"⚙️", marshal:"🏴", "app-admin":"🔐"};
              return (
                <button key={i.id} className={`nbtn ${page === i.id ? "on" : ""}`} onClick={() => go(i.id)}>
                  <span className="mob-drawer-icon">{icons[i.id] || "•"}</span>
                  {i.label}
                </button>
              );
            })}

            {/* Auth actions */}
            <div className="mob-drawer-divider" />
            {cu ? (
              <button className="nbtn kill" onClick={logout}>
                <span className="mob-drawer-icon" style={{background:"var(--red-pale)"}}>🚪</span>
                Sign Out
              </button>
            ) : (
              <>
                <button className="nbtn" onClick={() => go("login")}>
                  <span className="mob-drawer-icon">🔑</span>
                  Sign In
                </button>
                <button className="nbtn on" onClick={() => go("reg-member")}>
                  <span className="mob-drawer-icon" style={{background:"var(--acc-pale2)"}}>✨</span>
                  Join a Club
                </button>
              </>
            )}
          </div>
        </div>

        {page === "home"       && <Home go={go} state={S} />}
        {page === "login"      && <Login users={S.users} onLogin={login} back={() => go("home")} />}
        {page === "reg-member" && <Registration type="member" clubs={S.clubs} onReg={f => reg("member", f)} back={() => go("home")} />}
        {page === "reg-club"   && <Registration type="club"   clubs={S.clubs} onReg={f => reg("club",   f)} back={() => go("home")} />}
        {page === "dashboard"  && cu && <Dashboard   state={S} go={go} showToast={showToast} />}
        {page === "drives"     && cu && <Drives       state={S} upd={upd} showToast={showToast} pushNotif={pushNotif} />}
        {page === "chat"       && cu && cu.clubId && (
          <div className="page">
            <div className="sh"><div className="sh-label">Club</div><div className="sh-title">CLUB CHAT</div><div className="sh-sub">Talk to your club members</div></div>
            <ClubChat state={S} upd={upd} showToast={showToast} />
          </div>
        )}
        {page === "market"     && cu && <Marketplace state={S} go={go} />}
        {page === "club-admin" && cu && cu.role === "admin"     && <ClubAdmin    state={S} upd={upd} showToast={showToast} />}
        {page === "marshal"    && cu && ["marshal","support"].includes(cu.role) && <MarshalPanel state={S} upd={upd} showToast={showToast} />}
        {page === "app-admin"  && cu && cu.role === "app_admin" && <AppAdmin     state={S} upd={upd} showToast={showToast} />}
      </div>
      {toast && <Toast msg={toast} done={() => setToast(null)} />}
      <NotifBanner notifs={notifs} dismiss={dismiss} />
      {/* ── BOTTOM MOBILE NAV ── */}
      {cu && (
        <div className="mobile-nav">
          <div className="mobile-nav-inner">
            {[
              {id:"dashboard", label:"Home",      icon:"🏠"},
              {id:"drives",    label:"Drives",     icon:"🚙", hide: cu.role === "app_admin"},
              {id:"chat",      label:"Chat",       icon:"💬", hide: !cu.clubId},
              {id:"market",    label:"Market",     icon:"🛍"},
              cu.role === "admin"
                ? {id:"club-admin", label:"Admin", icon:"⚙️"}
                : cu.role === "app_admin"
                  ? {id:"app-admin", label:"Admin", icon:"🔐"}
                  : cu.role === "marshal" || cu.role === "support"
                    ? {id:"marshal", label:"Marshal", icon:"🏴"}
                    : null,
            ].filter(Boolean).filter(i => !i.hide).map(i => (
              <button key={i.id} className={`mnav-btn ${page === i.id ? "on" : ""}`} onClick={() => go(i.id)}>
                <span className="mnav-icon">{i.icon}</span>
                <span className="mnav-label">{i.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
