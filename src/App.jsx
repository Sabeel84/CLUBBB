import { useState, useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════════════
   CLUBBB — Desert Driving Community Platform
   Modern White Theme: Plus Jakarta Sans + Syne
═══════════════════════════════════════════════════════════════ */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Syne:wght@700;800&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
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
@media(max-width:800px){.nav{padding:0 16px;height:60px}.nav-links .nbtn:not(.kill){display:none}.nav-mob{display:flex}}

/* ── MOBILE DRAWER ───────────────────────────────────── */
.mob-drawer{display:none;position:fixed;top:60px;left:0;right:0;background:#fff;border-bottom:1px solid var(--line);z-index:380;padding:0;box-shadow:0 20px 60px rgba(0,0,0,.12);transform:translateY(-12px);opacity:0;pointer-events:none;transition:all .28s cubic-bezier(.4,0,.2,1)}
.mob-drawer.open{transform:translateY(0);opacity:1;pointer-events:all}
@media(max-width:800px){.mob-drawer{display:block}}
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
@media(max-width:800px){.mobile-nav{display:block}.page{padding-bottom:100px!important}}

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
.hero-title{font-family:'Syne',sans-serif;font-size:clamp(42px,11vw,176px);font-weight:800;line-height:.88;color:var(--ink);position:relative;margin-bottom:8px;letter-spacing:-4px;animation:fadeUp .8s .08s ease both;white-space:nowrap}
.hero-title span{background:linear-gradient(135deg,var(--acc3),var(--acc2) 45%,var(--acc));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;position:relative}
.hero-sub{font-family:'Plus Jakarta Sans',sans-serif;font-size:clamp(14px,2vw,20px);font-weight:400;color:var(--mid);margin-bottom:48px;animation:fadeUp .8s .18s ease both;line-height:1.5}
.hero-ctas{display:flex;gap:14px;justify-content:center;flex-wrap:wrap;animation:fadeUp .8s .28s ease both}
.hero-scroll-hint{position:absolute;bottom:32px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:8px;opacity:.4;animation:fadeIn 1.2s .8s ease both}
.hero-scroll-hint span{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:var(--mid)}
.hero-scroll-dot{width:6px;height:6px;background:var(--mid2);border-radius:50%;animation:dotDance 2s 1s ease-in-out infinite}
.hero-slash{display:none}
@media(max-width:760px){
  .hero{padding:72px 20px 80px}
  .hero-blob1,.hero-blob2{display:none}
  .hero-title{font-size:clamp(38px,16.5vw,80px);letter-spacing:-2px;line-height:.9;white-space:nowrap}
  .hero-eyebrow{font-size:10px;letter-spacing:4px;margin-bottom:20px}
  .hero-sub{font-size:15px;margin-bottom:40px}
  .hero-ctas{flex-direction:row;flex-wrap:nowrap;justify-content:center;gap:10px;padding:0 4px}
  .hero-ctas .btn{flex:1;justify-content:center;padding:13px 10px;font-size:13px;min-width:0;white-space:nowrap}
  .hero-scroll-hint{display:none}
}
@media(max-width:400px){.hero-title{font-size:13vw;letter-spacing:-1.5px}}

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
@media(max-width:800px){.btn{font-size:14px;padding:13px 24px}.btn.sm{padding:9px 16px;font-size:13px}}

/* ── PAGE ────────────────────────────────────────────── */
.page{max-width:1180px;margin:0 auto;padding:60px 44px;animation:fadeUp .5s ease both}
@media(max-width:800px){.page{padding:24px 16px}}
@media(max-width:800px){.page{padding-bottom:110px!important}}

/* ── SECTION HEADER ──────────────────────────────────── */
.sh{margin-bottom:40px}
.sh-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:4.5px;text-transform:uppercase;color:var(--acc);margin-bottom:12px;display:flex;align-items:center;gap:10px}
.sh-label::before{content:'';width:20px;height:2.5px;background:linear-gradient(90deg,var(--acc),var(--acc3));border-radius:3px;flex-shrink:0}
.sh-title{font-family:'Syne',sans-serif;font-size:clamp(24px,5vw,44px);font-weight:800;letter-spacing:-1.5px;color:var(--ink);line-height:1}
.sh-sub{font-size:14px;color:var(--mid);margin-top:12px;font-weight:400;line-height:1.6}
@media(max-width:800px){.sh{margin-bottom:28px}.sh-label{font-size:10px;letter-spacing:3px}.sh-title{letter-spacing:-1px}.sh-sub{font-size:13px}}

/* ── CARD ────────────────────────────────────────────── */
.card{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);padding:36px;margin-bottom:18px;position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:box-shadow .22s}
.card:hover{box-shadow:var(--sh-md)}
.card::before{content:'';position:absolute;top:0;left:28px;right:28px;height:1px;background:linear-gradient(90deg,transparent,var(--acc-pale3),transparent)}
.card-label{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;font-weight:700;letter-spacing:3.5px;text-transform:uppercase;color:var(--acc);margin-bottom:26px}
@media(max-width:800px){.card{padding:22px 18px;border-radius:var(--r-xl)}}

/* ── STATS ───────────────────────────────────────────── */
.stats{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:48px}
.stat{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:28px 16px;text-align:center;position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:all .25s cubic-bezier(.4,0,.2,1);cursor:default}
.stat::before{content:'';position:absolute;inset:0;background:radial-gradient(ellipse 80% 60% at 50% 0%,var(--acc-pale) 0%,transparent 70%);pointer-events:none}
.stat:hover{box-shadow:var(--sh-md);transform:translateY(-4px);border-color:var(--acc-pale3)}
.stat-n{font-family:'Syne',sans-serif;font-size:clamp(32px,7vw,68px);font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;letter-spacing:-2px}
.stat-l{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;font-weight:700;letter-spacing:1.5px;text-transform:uppercase;color:var(--mid2);margin-top:8px;line-height:1.3}
@media(max-width:520px){.stats{grid-template-columns:repeat(3,1fr);gap:10px}.stat{padding:20px 10px}.stat-n{font-size:clamp(26px,8vw,44px);letter-spacing:-1px}.stat-l{font-size:9px;letter-spacing:1px}}

/* ── BADGES ──────────────────────────────────────────── */
.bdg{display:inline-flex;align-items:center;padding:3px 11px;font-size:11px;font-weight:600;letter-spacing:.2px;border-radius:100px;white-space:nowrap}
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
.fi-sel{appearance:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='7'%3E%3Cpath d='M0 0l5 7 5-7z' fill='%23e8820c'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 16px center;background-color:var(--bg2);cursor:pointer}

/* ── GRIDS ───────────────────────────────────────────── */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:22px}
@media(max-width:680px){.g2{grid-template-columns:1fr}}

/* ── TABS ────────────────────────────────────────────── */
.tabs{display:flex;border-bottom:2px solid var(--line);margin-bottom:36px;overflow-x:auto;gap:4px;scrollbar-width:none}
.tabs::-webkit-scrollbar{display:none}
.tab{padding:12px 22px;background:transparent;border:none;border-bottom:3px solid transparent;margin-bottom:-2px;color:var(--mid);font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;font-weight:500;cursor:pointer;transition:all .18s;white-space:nowrap;border-radius:12px 12px 0 0}
.tab:hover{color:var(--ink);background:var(--bg3)}
.tab.on{color:var(--acc);border-bottom-color:var(--acc);font-weight:700;background:var(--acc-pale)}

/* ── USER ROW ────────────────────────────────────────── */
.urow{display:flex;align-items:center;gap:16px;padding:18px 22px;background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);margin-bottom:10px;transition:all .2s;box-shadow:var(--sh-xs)}
.urow:hover{box-shadow:var(--sh-md);border-color:var(--acc-pale3);transform:translateY(-2px)}
.ava{width:48px;height:48px;background:var(--acc2);border-radius:16px;display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:20px;font-weight:800;color:#0a0a0a;flex-shrink:0;box-shadow:0 3px 14px rgba(232,130,12,.3)}
.uname{font-size:15px;font-weight:700;color:var(--ink);letter-spacing:-.02em}
.umeta{font-size:12px;color:var(--mid2);margin-top:3px}

/* ── DRIVE CARD ──────────────────────────────────────── */
.dcard{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);padding:0;margin-bottom:18px;position:relative;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1);box-shadow:var(--sh-sm)}
.dcard:hover{box-shadow:var(--sh-lg);transform:translateY(-5px)}
.dcard-accent{position:absolute;left:0;top:0;bottom:0;width:5px;background:linear-gradient(180deg,var(--acc3),var(--acc2) 55%,var(--acc));border-radius:5px 0 0 5px;z-index:1}
.dcard-inner{padding:24px 24px 22px 32px}
.dcard-img{width:100%;height:220px;object-fit:cover;display:block;border-radius:var(--r-2xl) var(--r-2xl) 0 0}
.dcard-title{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--ink);line-height:1.15;word-break:break-word;margin-bottom:6px}
.dcard-desc{font-size:13px;color:var(--mid);line-height:1.6;margin-bottom:16px}
.dcard-meta-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px 20px;margin-bottom:14px}
.dm{font-size:13px;font-weight:500;color:var(--mid2);display:flex;align-items:center;gap:5px;min-width:0;overflow:hidden}
.dm strong{color:var(--ink);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.capbar{height:6px;background:var(--bg3);border-radius:100px;margin:10px 0 12px;overflow:hidden}
.capfill{height:100%;background:linear-gradient(90deg,var(--acc3),var(--acc2));border-radius:100px;transition:width .5s cubic-bezier(.4,0,.2,1)}
.waitbdg{font-size:11px;font-weight:700;color:var(--orange);background:var(--orange-pale);border:1px solid rgba(234,88,12,.18);padding:3px 11px;border-radius:100px;white-space:nowrap}
@media(max-width:800px){
  .dcard-inner{padding:18px 16px 18px 24px}
  .dcard-img{height:170px}
  .dcard-title{font-size:17px}
  .dcard-meta-grid{grid-template-columns:1fr;gap:6px}
  .dm{font-size:12px}
}

/* ── VOTE CARD ───────────────────────────────────────── */
.vcard{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:26px 28px;margin-bottom:13px;box-shadow:var(--sh-sm);transition:box-shadow .18s}
.vcard:hover{box-shadow:var(--sh-md)}
.vcard-name{font-family:'Syne',sans-serif;font-size:20px;font-weight:800;letter-spacing:-.5px;color:var(--ink);margin-bottom:8px}

/* ── AD BANNER (legacy - kept for admin panel) ───────── */
.adbanner{background:linear-gradient(135deg,#fffdf5,#fff9ea);border:1px solid rgba(232,130,12,.18);border-left:4px solid var(--acc2);border-radius:var(--r-lg);padding:18px 22px;margin-bottom:14px;display:flex;align-items:center;gap:18px;position:relative;transition:box-shadow .18s}
.adbanner:hover{box-shadow:var(--sh-sm)}
.adbanner::after{content:'SPONSORED';position:absolute;top:10px;right:16px;font-size:8px;font-weight:800;letter-spacing:2.5px;color:var(--acc);text-transform:uppercase;opacity:.65}
.adicon{width:54px;height:44px;background:var(--acc-pale2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0}
.adtitle{font-size:14px;font-weight:700;color:var(--ink);margin-bottom:3px}
.adsub{font-size:13px;color:var(--mid)}

/* ── MODAL ───────────────────────────────────────────── */
.mover{position:fixed;inset:0;background:rgba(9,9,11,.48);z-index:300;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(12px);animation:fadeIn .18s ease both}
.modal{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);max-width:540px;width:100%;max-height:90vh;overflow-y:auto;padding:48px;position:relative;box-shadow:var(--sh-xl);animation:scaleIn .22s ease both}
.modal-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;letter-spacing:-1.2px;color:var(--ink);margin-bottom:30px}
.mclose{position:absolute;top:20px;right:20px;background:var(--bg2);border:1.5px solid var(--line2);border-radius:50%;width:40px;height:40px;display:flex;align-items:center;justify-content:center;font-size:16px;color:var(--mid);cursor:pointer;font-weight:700;transition:all .18s}
.mclose:hover{background:var(--red-pale);color:var(--red);border-color:rgba(220,38,38,.25)}
@media(max-width:800px){
  .mover{padding:0;align-items:flex-end}
  .modal{border-radius:var(--r-2xl) var(--r-2xl) 0 0;max-width:100%;max-height:92vh;padding:32px 20px 36px}
  .modal-title{font-size:22px;margin-bottom:22px}
}

/* ── PROFILE HERO ────────────────────────────────────── */
.profile-hero{background:linear-gradient(135deg,#ffffff 0%,#fffdf5 60%,#fff8e8 100%);border:1px solid var(--acc-pale3);border-radius:var(--r-2xl);padding:40px;margin-bottom:36px;position:relative;overflow:hidden;box-shadow:var(--sh-md)}
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
.ibox{padding:16px 20px;background:var(--acc-pale);border:1px solid var(--acc-pale3);border-left:3px solid var(--acc2);border-radius:var(--r-md);font-size:13px;color:var(--ink3);line-height:1.65}

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
.clubs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(288px,1fr));gap:24px;margin-bottom:56px}
.club-tile{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);position:relative;overflow:hidden;transition:all .25s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;box-shadow:var(--sh-sm)}
.club-tile:hover{box-shadow:var(--sh-lg);transform:translateY(-6px)}
.club-tile-banner{width:100%;height:130px;object-fit:cover;display:block;flex-shrink:0}
.club-tile-placeholder{width:100%;height:130px;flex-shrink:0;background:linear-gradient(135deg,var(--bg3) 0%,var(--bg4) 100%);display:flex;align-items:center;justify-content:center;font-size:48px;position:relative;overflow:hidden}
.club-tile-placeholder::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 40%,rgba(255,255,255,.5) 100%)}
.club-tile-body{padding:20px 22px 24px;flex:1;display:flex;flex-direction:column;gap:10px;position:relative}
.club-tile-logo-img{width:56px;height:56px;border:3px solid var(--bg);border-radius:18px;margin-top:-38px;position:relative;z-index:2;flex-shrink:0;object-fit:cover;box-shadow:var(--sh-md)}
.club-tile-logo-init{width:56px;height:56px;border:3px solid var(--bg);border-radius:18px;background:var(--acc2);display:flex;align-items:center;justify-content:center;font-family:'Syne',sans-serif;font-size:18px;font-weight:800;color:#0a0a0a;margin-top:-38px;position:relative;z-index:2;flex-shrink:0;box-shadow:var(--sh-gold);letter-spacing:-0.5px}
.club-tile-name{font-family:'Syne',sans-serif;font-size:17px;font-weight:800;letter-spacing:-.5px;color:var(--ink);line-height:1.1}
.club-tile-desc{font-size:13px;color:var(--mid);line-height:1.55;flex:1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.club-tile-foot{display:flex;align-items:center;justify-content:space-between;padding-top:14px;border-top:1px solid var(--line);margin-top:auto}
.club-tile-count{font-family:'Syne',sans-serif;font-size:26px;font-weight:800;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;display:flex;align-items:baseline;gap:5px;letter-spacing:-1px}
.club-tile-count span{font-family:'Plus Jakarta Sans',sans-serif;font-size:10px;color:var(--mid2);letter-spacing:1.5px;font-weight:700;text-transform:uppercase;-webkit-text-fill-color:var(--mid2)}
.club-tile-badge{position:absolute;top:12px;right:12px;font-size:10px;font-weight:700;color:#fff;background:linear-gradient(135deg,var(--acc3),var(--acc));padding:4px 12px;border-radius:100px;z-index:3;box-shadow:0 2px 12px rgba(232,130,12,.4)}
@media(max-width:640px){.clubs-grid{grid-template-columns:1fr 1fr}}
@media(max-width:400px){.clubs-grid{grid-template-columns:1fr}}

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
.ad-modal{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-2xl);width:100%;max-width:660px;max-height:90vh;overflow-y:auto;position:relative;display:flex;flex-direction:column;box-shadow:var(--sh-xl);animation:scaleIn .25s ease both}
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

@media(max-width:640px){.mkt-grid{grid-template-columns:1fr}.ad-modal{max-height:95vh;border-radius:var(--r-2xl) var(--r-2xl) 0 0;position:fixed;bottom:0;left:0;right:0;max-width:100%}.ad-modal-content{padding:24px 20px 30px}}

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
@media(max-width:800px){.map-frame{height:260px}}

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
@media(max-width:800px){.chat-wrap{height:420px}}

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
.rating-card{background:var(--bg);border:1px solid var(--line);border-radius:var(--r-xl);padding:18px 20px;margin-bottom:10px;box-shadow:var(--sh-xs)}
.rating-stars{font-size:16px;letter-spacing:1px;margin-bottom:6px}
.rating-comment{font-size:13px;color:var(--mid);line-height:1.55;margin-bottom:6px}
.rating-meta{font-size:11px;color:var(--mid3);font-weight:600}
.avg-score{font-family:'Syne',sans-serif;font-size:56px;font-weight:800;letter-spacing:-3px;background:linear-gradient(135deg,var(--acc),var(--acc2));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1}
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

/* ─── INITIAL STATE ─────────────────────────────────────────── */
const INIT = {
  page:"home",
  currentUser:null,
  clubRanks:{
    1: DEFAULT_RANKS.map(r=>({...r})),
    2: DEFAULT_RANKS.map(r=>({...r})),
  },
  users:[
    {id:1,  name:"Ahmed Al Rashid",    email:"ahmed@email.com",    phone:"+971501234567", role:"admin",    rankId:5, clubId:1, drives:24},
    {id:2,  name:"Khalid Al Mansoori", email:"khalid@email.com",   phone:"+971502345678", role:"marshal",  rankId:4, clubId:1, drives:18},
    {id:3,  name:"Saeed Al Zaabi",     email:"saeed@email.com",    phone:"+971503456789", role:"marshal",  rankId:4, clubId:1, drives:15},
    {id:4,  name:"Mohammed Al Hamdan", email:"mohammed@email.com", phone:"+971504567890", role:"member",   rankId:2, clubId:1, drives:6},
    {id:5,  name:"Omar Al Nuaimi",     email:"omar@email.com",     phone:"+971505678901", role:"member",   rankId:3, clubId:1, drives:10},
    {id:6,  name:"Faisal Al Qassimi",  email:"faisal@email.com",   phone:"+971506789012", role:"member",   rankId:1, clubId:2, drives:2},
    {id:7,  name:"Yousef Al Dhaheri",  email:"yousef@email.com",   phone:"+971507890123", role:"admin",    rankId:5, clubId:2, drives:30},
    {id:"app",name:"App Administrator",email:"admin@clubbb.ae",    phone:"+971500000001", role:"app_admin",rankId:5, clubId:null, drives:0},
  ],
  clubs:[
    {id:1, name:"Al Ain Desert Raiders", email:"info@alainraiders.ae", phone:"+97137001234", adminId:1, logo:"", banner:"", description:"The premier desert driving club in Al Ain, founded 2018.", terms:"All members must follow safety guidelines. Recovery gear mandatory on every drive."},
    {id:2, name:"Dubai Dune Blazers",    email:"info@duneblazer.ae",   phone:"+97144009999", adminId:7, logo:"", banner:"", description:"Dubai's elite off-road driving community.", terms:"Experienced drivers only. Marshal sign-off required before first drive."},
  ],
  drives:[
    {id:1, clubId:1, image:"", title:"Liwa Mega Dunes Expedition",  description:"Full day drive through massive Liwa dunes. Challenging terrain for experienced drivers.", location:"Liwa Oasis",   coordinates:"23.1118° N, 53.7766° E", mapLink:"", capacity:10, requiredRankId:3, postedBy:1, date:"2025-03-15", startTime:"06:00", registrations:[{userId:2,status:"confirmed"},{userId:3,status:"confirmed"},{userId:5,status:"confirmed"},{userId:4,status:"waiting"}], attendanceRecorded:false},
    {id:2, clubId:1, image:"", title:"Fossil Rock Morning Run",      description:"Easy sunrise drive to Fossil Rock, perfect for all skill levels.",                         location:"Sharjah Desert", coordinates:"25.2085° N, 55.7554° E", mapLink:"", capacity:15, requiredRankId:1, postedBy:2, date:"2025-03-22", startTime:"07:30", registrations:[{userId:4,status:"confirmed"}], attendanceRecorded:false},
    {id:3, clubId:2, image:"", title:"Big Red Classic Challenge",    description:"The legendary Big Red climb. The ultimate test of skill and nerve.",                        location:"Al Qudra, Dubai",coordinates:"24.9872° N, 55.3232° E", mapLink:"", capacity:8,  requiredRankId:2, postedBy:7, date:"2025-03-20", startTime:"05:30", registrations:[], attendanceRecorded:false},
  ],
  promos:[
    {id:1, userId:5, rankId:4, role:"marshal", clubId:1, by:1, status:"voting", votes:[], date:"2025-02-20"},
  ],
  chat:{},         // { clubId: [{id, userId, text, ts, pinned}] }
  checklists:{},   // { driveId: { userId: {fuel,tyres,gear,spare,ts} } }
  ratings:{},      // { driveId: [{userId, stars, comment, ts}] }
  sos:[],          // [{id, userId, lat, lng, ts, resolved}]
  liveTrack:{},    // { driveId: { userId: {lat,lng,ts,sharing} } }
  ads:[
    {id:1, title:"Toyota GR Sport — Born for the Dunes", desc:"Unmatched capability, legendary reliability. Book your test drive today at your nearest Toyota dealership.", details:"The Toyota GR Sport is engineered for the harshest desert conditions. With a reinforced chassis, adaptive suspension, and 4WD terrain modes, it handles everything from Liwa mega dunes to rocky wadis.\n\n✅ Offer: Free accessory package (value AED 8,000) with every test drive booking.\n✅ Valid until: 31 May 2025\n✅ Locations: All UAE Toyota dealerships\n✅ Contact: Call 800-TOYOTA or book via app\n\nExclusive CLUBBB member perk: Priority test drive slots on weekends.", icon:"🚙", thumbnail:"", active:true, featured:true,  category:"Vehicles", link:""},
    {id:2, title:"Desert Recovery Gear — 20% Off",       desc:"Premium sand ladders, snatch blocks & full recovery kits. Use code DUNES20 at checkout.",                 details:"Get fully equipped for any desert situation. This exclusive CLUBBB member discount covers the complete SandMaster recovery range:\n\n🔧 MaxTrax Sand Ladders (pair) — AED 720 → AED 576\n🔧 Snatch Block Kit — AED 340 → AED 272\n🔧 Full Recovery Bag (10-piece) — AED 980 → AED 784\n\n✅ Code: DUNES20 at checkout\n✅ Free shipping on orders over AED 500\n✅ Valid for CLUBBB members only — limited stock\n\nShop at desertrecoverygear.ae or visit their Dubai Al Quoz showroom.", icon:"⛏️", thumbnail:"", active:true, featured:false, category:"Gear",     link:""},
    {id:3, title:"DuneCam Pro X — Mount & Record",       desc:"Capture every dune in 4K. Waterproof, dustproof, shockproof. Built for the desert.",                     details:"The DuneCam Pro X is the only action camera purpose-built for desert environments. Sand-sealed lens, heat-resistant body, and a magnetic roll-bar mount system that attaches in seconds.\n\n📸 Specs:\n• 4K60fps video / 20MP stills\n• 140° ultra-wide lens\n• Battery life: 3.5 hrs continuous\n• Operating temp: up to 65°C\n• Dustproof: IP6X rated\n\n✅ CLUBBB Member Price: AED 1,299 (retail AED 1,599)\n✅ Includes: Camera + mount kit + 64GB card\n✅ Order at dunecam.ae — use code CLUBBB at checkout", icon:"📷", thumbnail:"", active:true, featured:false, category:"Tech",     link:""},
  ],
};

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

function ImageUpload({ value, onChange, height=160, label="Upload Image", hint="JPG, PNG, WEBP · Max 5MB" }) {
  const ref = useRef(null);
  function handleFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert("File too large (max 5MB)"); return; }
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
    e.target.value = "";
  }
  return (
    <div className="img-upload-zone" style={{height}} onClick={() => ref.current && ref.current.click()}>
      <input ref={ref} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}} />
      {value
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
  }, []); // eslint-disable-line
  return <div className="toast">✦ {msg}</div>;
}

function Modal({ title, onClose, children }) {
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
        <div className="hero-title">CLUB<span>BB</span></div>
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
          {[["12+","Active Clubs"],["240+","Members"],["180+","Drives Completed"]].map(([n,l]) => (
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
              const upcomingDrives = drives.filter(d => d.clubId === cl.id && !d.attendanceRecorded).length;
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
                    <div className="club-tile-name">{cl.name}</div>
                    {cl.description && <div className="club-tile-desc">{cl.description}</div>}
                    <div className="club-tile-foot">
                      <div className="club-tile-count">{memberCount}<span>Members</span></div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:16, color:"var(--chalk3)"}}>{upcomingDrives}</div>
                        <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:1.5, color:"var(--chalk3)", textTransform:"uppercase"}}>Upcoming Drives</div>
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
                <div style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,letterSpacing:2,color:RANK_COLORS[i]}}>{r.name}</div>
                <div style={{fontSize:11,color:"var(--chalk3)",marginTop:2,fontFamily:"'Barlow Condensed',sans-serif",letterSpacing:1}}>LEVEL {r.level}</div>
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
  const [email, setEmail] = useState("");
  function go() {
    const u = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!u) { alert("Not found. Try:\nahmed@email.com (Admin)\nkhalid@email.com (Marshal)\nmohammed@email.com (Member)\nadmin@clubbb.ae (App Admin)"); return; }
    if (u.suspended) { alert("⚠️ This account has been suspended. Please contact the App Admin."); return; }
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
            placeholder="your@email.com" onKeyDown={e => e.key === "Enter" && go()} />
        </div>
        <div className="ibox" style={{marginBottom:20}}>
          Demo accounts:<br/>
          <strong style={{color:"var(--sand)"}}>ahmed@email.com</strong> (Admin) ·{" "}
          <strong style={{color:"var(--sand)"}}>khalid@email.com</strong> (Marshal) ·{" "}
          <strong style={{color:"var(--sand)"}}>mohammed@email.com</strong> (Member) ·{" "}
          <strong style={{color:"var(--sand)"}}>admin@clubbb.ae</strong> (App Admin)
        </div>
        <button className="btn gold" style={{width:"100%"}} onClick={go}>SIGN IN</button>
      </div>
    </div>
  );
}

/* ─── REGISTRATION ──────────────────────────────────────────── */
function Registration({ type, clubs, onReg, back }) {
  const [f, setF] = useState({name:"", email:"", phone:"", clubId:""});
  const s = k => e => setF({...f, [k]: e.target.value});
  function go() {
    if (!f.name || !f.email || !f.phone) { alert("Fill all required fields"); return; }
    if (type === "member" && !f.clubId) { alert("Select a club"); return; }
    onReg(f);
  }
  return (
    <div className="page" style={{maxWidth:500}}>
      <button className="btn out sm" onClick={back} style={{marginBottom:32}}>← BACK</button>
      <div className="sh">
        <div className="sh-label">{type === "member" ? "Membership" : "Club Registration"}</div>
        <div className="sh-title">{type === "member" ? "JOIN A CLUB" : "REGISTER YOUR CLUB"}</div>
        <div className="sh-sub">{type === "member" ? "Become part of a desert driving family" : "Create your club — you'll be the Admin"}</div>
      </div>
      <div className="card">
        <div className="fg"><label className="fl">{type === "club" ? "Club Name" : "Full Name"}</label><input className="fi" value={f.name} onChange={s("name")} placeholder={type === "club" ? "Al Ain Desert Raiders" : "Your full name"} /></div>
        <div className="fg"><label className="fl">Email Address</label><input className="fi" type="email" value={f.email} onChange={s("email")} placeholder="email@example.com" /></div>
        <div className="fg"><label className="fl">Phone Number</label><input className="fi" value={f.phone} onChange={s("phone")} placeholder="+971 50 123 4567" /></div>
        {type === "member" && (
          <div className="fg">
            <label className="fl">Select Club</label>
            <select className="fi fi-sel" value={f.clubId} onChange={s("clubId")}>
              <option value="">Choose your club...</option>
              {clubs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <button className="btn gold" style={{width:"100%", marginTop:8}} onClick={go}>
          {type === "member" ? "JOIN CLUB NOW" : "REGISTER & BECOME ADMIN"}
        </button>
      </div>
    </div>
  );
}

/* ─── DASHBOARD ─────────────────────────────────────────────── */
function Dashboard({ state, go, showToast }) {
  const { currentUser:cu, clubs:cs, drives:ds, ads, users:us, clubRanks } = state;
  const myCl     = cu.clubId ? getClub(cs, cu.clubId) : null;
  const rk       = getRank(cu.rankId, clubRanks, cu.clubId);
  const myDrives = ds.filter(d => d.registrations.find(r => r.userId === cu.id && r.status === "confirmed"));
  const done     = ds.filter(d => d.attendanceRecorded && d.registrations.find(r => r.userId === cu.id && r.status === "confirmed"));
  const activeAds = ads.filter(a => a.active);

  return (
    <div className="page">

      {/* Profile */}
      <div className="profile-hero">
        <div className="profile-hero-bg-text">{(cu.name || "U").split(" ")[0].toUpperCase()}</div>
        <div style={{display:"flex", gap:18, alignItems:"flex-start", flexWrap:"wrap", position:"relative"}}>
          <div className="ava" style={{width:64, height:64, fontSize:28, clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"}}>{(cu.name||"U")[0]}</div>
          <div>
            <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:32, letterSpacing:3, color:"var(--chalk)"}}>{cu.name}</div>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", alignItems:"center", marginTop:6}}>
              <RankBadge rankId={cu.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
              <span className={`bdg ${cu.role === "admin" || cu.role === "app_admin" ? "r" : cu.role === "marshal" ? "o" : "d"}`}>
                {(cu.role||"member").replace("_"," ").toUpperCase()}
              </span>
              {myCl && <span className="bdg d">{myCl.name}</span>}
            </div>
            <div style={{fontSize:12, color:"var(--chalk3)", marginTop:8}}>{cu.email} · {cu.phone}</div>
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
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:3, color:"var(--sand)", textTransform:"uppercase", display:"flex", alignItems:"center", gap:8}}>
              <span style={{width:16, height:2, background:"var(--sand)", display:"inline-block"}} /> Featured Offer
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
        ? <div style={{color:"var(--chalk3)", fontSize:14, marginBottom:32}}>
            No registered drives yet.{" "}
            <button className="btn out xs" onClick={() => go("drives")} style={{marginLeft:8}}>BROWSE DRIVES</button>
          </div>
        : myDrives.map(d => (
          <div key={d.id} className="dcard">
            <div className="dcard-accent" />
            {d.image && <img src={d.image} alt={d.title} className="dcard-img" />}
            <div className="dcard-title">{d.title}</div>
            <div className="dcard-desc">{d.description}</div>
            <div className="dcard-meta">
              <div className="dm">📍 <strong>{d.location}</strong></div>
              <div className="dm">📅 <strong>{d.date}</strong>{d.startTime && <> · 🕐 <strong>{fmtTime(d.startTime)}</strong></>}</div>
              <RankBadge rankId={d.requiredRankId} clubRanks={clubRanks} clubId={d.clubId} />
            </div>
          </div>
        ))
      }

      {done.length > 0 && <>
        <div className="sh" style={{marginTop:32}}><div className="sh-label">History</div><div className="sh-title">COMPLETED DRIVES</div></div>
        {done.map(d => (
          <div key={d.id} className="dcard" style={{opacity:.6}}>
            <div className="dcard-accent" style={{background:"var(--green)"}} />
            <div className="dcard-title">{d.title}</div>
            <div className="dcard-meta">
              <div className="dm">📅 <strong>{d.date}</strong></div>
              <span className="bdg g">✓ COMPLETED</span>
            </div>
          </div>
        ))}
      </>}
    </div>
  );
}

/* ─── DRIVES ────────────────────────────────────────────────── */
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
    const reqLevel = getRank(drive.requiredRankId, clubRanks, drive.clubId)?.level || 1;
    if (uLevel < reqLevel) { showToast("Your rank is too low for this drive"); return; }
    const confirmed = drive.registrations.filter(r => r.status === "confirmed").length;
    const status    = confirmed >= drive.capacity ? "waiting" : "confirmed";
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

      {list.length === 0 && <div style={{color:"var(--chalk3)", fontSize:14, padding:"20px 0"}}>No drives posted yet.</div>}

      {list.map(drive => {
        const confirmed = drive.registrations.filter(r => r.status === "confirmed").length;
        const waiting   = drive.registrations.filter(r => r.status === "waiting").length;
        const myReg     = drive.registrations.find(r => r.userId === cu.id);
        const isOwner   = drive.postedBy === cu.id || cu.role === "admin";
        const reqLevel  = getRank(drive.requiredRankId, clubRanks, drive.clubId)?.level || 1;
        const cl        = getClub(cs, drive.clubId);
        const pct       = drive.capacity > 0 ? Math.min(confirmed / drive.capacity * 100, 100) : 0;
        return (
          <div key={drive.id} className="dcard">
            <div className="dcard-accent" />
            {drive.image && <img src={drive.image} alt={drive.title} className="dcard-img" />}
            <div className="dcard-inner">
              {/* Title row */}
              <div style={{display:"flex", justifyContent:"space-between", flexWrap:"wrap", gap:8, alignItems:"flex-start", marginBottom:8}}>
                <div className="dcard-title" style={{flex:1, minWidth:0}}>{drive.title}</div>
                <div style={{display:"flex", gap:6, flexWrap:"wrap", flexShrink:0}}>
                  <RankBadge rankId={drive.requiredRankId} clubRanks={clubRanks} clubId={drive.clubId} />
                  {cl && <span className="bdg d">{cl.name}</span>}
                </div>
              </div>

              {/* Description */}
              {drive.description && <div className="dcard-desc">{drive.description}</div>}

              {/* Meta grid — 2 columns */}
              <div className="dcard-meta-grid">
                {drive.location  && <div className="dm">📍 <strong>{drive.location}</strong></div>}
                {drive.date      && <div className="dm">📅 <strong>{drive.date}</strong></div>}
                {drive.coordinates && <div className="dm">🗺 <strong>{drive.coordinates}</strong></div>}
                {drive.startTime && <div className="dm">🕐 <strong>{fmtTime(drive.startTime)}</strong></div>}
                <div className="dm">👥 <strong>{confirmed}/{drive.capacity}</strong> confirmed</div>
                {waiting > 0 && <div className="dm"><span className="waitbdg">⏳ {waiting} WAITING</span></div>}
              </div>

              {/* Capacity bar */}
              <div className="capbar"><div className="capfill" style={{width:`${pct}%`}} /></div>

              {drive.attendanceRecorded && <div style={{marginBottom:10}}><span className="bdg g">✓ ATTENDANCE RECORDED</span></div>}

              {/* Actions row */}
              <div style={{display:"flex", gap:8, marginTop:12, flexWrap:"wrap", alignItems:"center"}}>
                {myReg && <span className={`bdg ${myReg.status === "confirmed" ? "g" : "o"}`}>{myReg.status === "confirmed" ? "✓ REGISTERED" : "⏳ WAITING LIST"}</span>}
                {!myReg && uLevel >= reqLevel && <button className="btn gold xs" onClick={() => register(drive)}>REGISTER</button>}
                {!myReg && uLevel < reqLevel  && <span className="bdg d">RANK TOO LOW</span>}
                {isOwner && waiting > 0 && <button className="btn out xs" onClick={() => setWaitM(drive)}>WAITING LIST ({waiting})</button>}
                {isOwner && !drive.attendanceRecorded && confirmed > 0 && <button className="btn out-grn xs" onClick={() => setAttM(drive)}>RECORD ATTENDANCE</button>}
                <button className="btn out xs" style={{marginLeft:"auto"}} onClick={() => setDetail(drive)}>VIEW DRIVE →</button>
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
          onSave={d => {
            const newDrive = {...d, id:Date.now(), postedBy:cu.id, registrations:[], attendanceRecorded:false};
            upd({ drives: [...ds, newDrive] });
            setCreate(false);
            showToast("Drive posted! Members are being notified.");
            pushNotif && pushNotif({ type:"drive", title:"🚙 New Drive Posted", body:`${newDrive.title} — ${newDrive.location}` });
            if (window.__clubbb_hooks?.onDrivePosted) window.__clubbb_hooks.onDrivePosted(newDrive);
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

      {waitM && (
        <Modal title="WAITING LIST" onClose={() => setWaitM(null)}>
          <div style={{fontSize:13, color:"var(--chalk3)", marginBottom:20}}>{waitM.title}</div>
          {waitM.registrations.filter(r => r.status === "waiting").map(reg => {
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
                  upd({ drives: ds.map(d => d.id === waitM.id ? {...d, registrations: d.registrations.map(r => r.userId === reg.userId ? {...r, status:"confirmed"} : r)} : d) });
                  setWaitM(null);
                  showToast("Member accepted!");
                }}>ACCEPT</button>
              </div>
            );
          })}
        </Modal>
      )}

      {attM && (
        <Modal title="RECORD ATTENDANCE" onClose={() => setAttM(null)}>
          <div style={{fontSize:13, color:"var(--chalk3)", marginBottom:16}}>{attM.title} — confirmed attendees will be marked complete.</div>
          {attM.registrations.filter(r => r.status === "confirmed").map(reg => {
            const u = getUser(state.users, reg.userId);
            if (!u) return null;
            return (
              <div key={reg.userId} className="urow">
                <div className="ava">{(u.name||"?")[0]}</div>
                <div style={{flex:1}}><div className="uname">{u.name}</div></div>
                <span className="bdg g">✓ PRESENT</span>
              </div>
            );
          })}
          <button className="btn gold" style={{width:"100%", marginTop:20}} onClick={() => {
            upd({ drives: ds.map(d => d.id === attM.id ? {...d, attendanceRecorded:true} : d) });
            setAttM(null);
            showToast("Attendance recorded!");
          }}>CONFIRM ATTENDANCE</button>
        </Modal>
      )}
    </div>
  );
}

function CreateDrive({ clubId, ranks, onClose, onSave }) {
  const [f, setF] = useState({title:"", description:"", location:"", coordinates:"", mapLink:"", capacity:10, requiredRankId:1, clubId, date:"", startTime:"", image:""});
  const s = k => e => setF({...f, [k]: e.target.value});
  const rankList = ranks && ranks.length > 0 ? ranks : DEFAULT_RANKS;
  return (
    <Modal title="POST NEW DRIVE" onClose={onClose}>
      <div className="fg">
        <label className="fl">Drive Cover Image <span style={{color:"var(--red)"}}>*</span></label>
        <ImageUpload value={f.image} onChange={v => setF({...f, image:v})} height={160} label="Upload Cover Photo" hint="Required · JPG, PNG, WEBP · Max 5MB" />
        {!f.image && <div style={{fontSize:11, color:"var(--red)", marginTop:6, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1}}>A cover image is required</div>}
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
        {f.startTime && <div style={{fontSize:11, color:"var(--chalk3)", marginTop:5, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:1}}>
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
      <button className="btn gold" style={{width:"100%", marginTop:8}} onClick={() => {
        if (!f.image)               { alert("Please upload a cover image — it is required"); return; }
        if (!f.title || !f.location){ alert("Fill required fields: Drive Name and Location"); return; }
        if (!f.date)                { alert("Please set a drive date"); return; }
        if (!f.startTime)           { alert("Please set a start time"); return; }
        onSave(f);
      }}>POST DRIVE</button>
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

  if (!cl) return <div className="page"><div style={{color:"var(--chalk3)"}}>Club not found.</div></div>;

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
        <div className="card">
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
          <div className="fg">
            <label className="fl">Terms & Conditions</label>
            <textarea className="fi fi-ta" style={{minHeight:110}} value={form.terms || ""} onChange={s("terms")} />
          </div>
          <div className="dvd" />
          <div className="ibox" style={{marginBottom:18}}>
            <strong style={{color:"var(--sand)"}}>ROLE RULES</strong><br />
            Admin & Marshal can post drives. To promote to Marshal, 2 marshals must vote YES.
          </div>
          <button className="btn gold" onClick={() => {
            upd({ clubs: cs.map(c => c.id === cl.id ? {...c, ...form} : c) });
            showToast("Club updated!");
          }}>SAVE CHANGES</button>
        </div>
      )}

      {/* ── RANKINGS TAB ── */}
      {tab === "rankings" && (
        <div>
          <div className="ibox" style={{marginBottom:24}}>
            <strong style={{color:"var(--sand)"}}>RANK EDITOR</strong><br />
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
                <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:2, color:"var(--chalk3)", textTransform:"uppercase", flexShrink:0, width:56, textAlign:"right"}}>LVL {i + 1}</span>
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
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:2, color:"var(--chalk3)", textTransform:"uppercase", marginBottom:12}}>Preview</div>
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
                    <div className="dcard-meta">
                      {d.date      && <div className="dm">📅 <strong>{d.date}</strong></div>}
                      {d.startTime && <div className="dm">🕐 <strong>{(() => { const [h,m]=d.startTime.split(":"); const hr=Number(h); return `${hr===0?12:hr>12?hr-12:hr}:${m} ${hr<12?"AM":"PM"}`; })()}</strong></div>}
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
          {myPromos.length === 0 && <div style={{color:"var(--chalk3)", fontSize:14}}>No pending promotion requests.</div>}
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
                      <span style={{fontSize:12, color:"var(--chalk3)"}}>Promote to:</span>
                      <RankBadge rankId={req.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
                    </div>
                  </div>
                  <span className={`bdg ${req.status === "approved" ? "g" : "o"}`}>{req.status.toUpperCase()}</span>
                </div>
                <div style={{display:"flex", gap:24, marginBottom:12}}>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14}}>✅ YES: <span style={{color:"var(--green)"}}>{yes}</span>/2</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14}}>❌ NO: <span style={{color:"var(--red)"}}>{no}</span></div>
                </div>
                {req.votes.map(v => {
                  const vtr = getUser(us, v.voterId);
                  return (
                    <div key={v.voterId} style={{fontSize:12, color:"var(--chalk3)", marginBottom:3}}>
                      <strong style={{color:"var(--chalk)"}}>{vtr ? vtr.name : "Unknown"}</strong>:{" "}
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
      {reqs.length === 0 && <div style={{color:"var(--chalk3)", fontSize:14, padding:"20px 0"}}>No pending votes at this time.</div>}
      {reqs.map(req => {
        const target   = getUser(us, req.userId);
        const hasVoted = req.votes.find(v => v.voterId === cu.id);
        const yes      = req.votes.filter(v => v.vote === "yes").length;
        return (
          <div key={req.id} className="vcard">
            <div style={{marginBottom:14}}>
              <div className="vcard-name">{target ? target.name : "Unknown"}</div>
              <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center", marginTop:6}}>
                <span style={{fontSize:12, color:"var(--chalk3)"}}>Current:</span>
                <RankBadge rankId={target ? target.rankId : 1} clubRanks={clubRanks} clubId={cu.clubId} />
                <span style={{fontSize:12, color:"var(--chalk3)"}}>→ Proposed:</span>
                <RankBadge rankId={req.rankId} clubRanks={clubRanks} clubId={cu.clubId} />
              </div>
            </div>
            <div style={{marginBottom:14}}>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:2, color:"var(--chalk3)", marginBottom:8}}>VOTES CAST ({req.votes.length})</div>
              {req.votes.map(v => {
                const vtr = getUser(us, v.voterId);
                return (
                  <div key={v.voterId} style={{fontSize:13, marginBottom:4, color:"var(--chalk3)"}}>
                    <strong style={{color:"var(--chalk)"}}>{vtr ? vtr.name : "Unknown"}</strong>:{" "}
                    <span style={{color: v.vote === "yes" ? "var(--green)" : "var(--red)", fontWeight:700}}>{v.vote.toUpperCase()}</span>
                    {v.comment && ` — ${v.comment}`}
                  </div>
                );
              })}
            </div>
            {hasVoted
              ? <span className="bdg d">YOUR VOTE: {hasVoted.vote.toUpperCase()}</span>
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
        {[["ads","Marketplace Ads"],["clubs","All Clubs"],["users","All Users"]].map(([id, l]) => (
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
              <input type="checkbox" id="featured-chk" checked={form.featured} onChange={e => setForm({...form, featured:e.target.checked})} style={{width:16, height:16, accentColor:"var(--sand)", cursor:"pointer"}} />
              <label htmlFor="featured-chk" style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:1, color:"var(--chalk)", cursor:"pointer"}}>
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

          <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:18, letterSpacing:2, color:"var(--chalk)", marginBottom:14}}>ACTIVE ADS</div>
          {ads.filter(a => a.active).length === 0 && <div style={{color:"var(--chalk3)", fontSize:13, marginBottom:20}}>No active ads yet.</div>}
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
                {ad.link && <div style={{fontSize:11, color:"var(--sand3)", marginTop:4, fontFamily:"'Barlow Condensed',sans-serif"}}>{ad.link}</div>}
              </div>
              <div style={{display:"flex", flexDirection:"column", gap:6, flexShrink:0}}>
                <button className="btn xs" style={{background: ad.featured ? "var(--sand3)" : "transparent", color: ad.featured ? "var(--ink)" : "var(--chalk3)", border:"1px solid var(--sand3)", clipPath:"none", fontSize:10, letterSpacing:1, padding:"4px 10px"}}
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
  return (
    <div className="ad-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ad-modal">
        <button className="ad-modal-close" onClick={onClose}>✕</button>

        {/* Thumbnail / hero */}
        {ad.thumbnail
          ? <img src={ad.thumbnail} alt={ad.title} className="ad-modal-thumb" />
          : <div className="ad-modal-thumb-ph">
              <span style={{position:"relative", zIndex:1}}>{ad.icon}</span>
            </div>
        }

        <div className="ad-modal-content">
          {ad.featured && (
            <div style={{display:"inline-flex", alignItems:"center", gap:6, background:"var(--sand)", color:"var(--ink)", fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:2, textTransform:"uppercase", padding:"3px 10px", marginBottom:14}}>
              ⭐ FEATURED OFFER
            </div>
          )}
          <div className="ad-modal-cat">
            <span style={{width:14, height:2, background:"var(--sand3)", display:"inline-block"}} />
            {ad.category || "Promotion"}
          </div>
          <div className="ad-modal-title">{ad.title}</div>
          <div className="ad-modal-desc">{ad.desc}</div>

          {ad.details && (
            <>
              <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:3, textTransform:"uppercase", color:"var(--sand)", marginBottom:12, display:"flex", alignItems:"center", gap:8}}>
                <span style={{width:16, height:2, background:"var(--sand)", display:"inline-block"}} />
                Offer Details
              </div>
              <div className="ad-modal-details">{ad.details}</div>
            </>
          )}

          <div className="ad-modal-actions">
            {ad.link
              ? <a href={ad.link} target="_blank" rel="noreferrer" className="btn gold sm" style={{textDecoration:"none"}}>VISIT OFFER PAGE →</a>
              : <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, color:"var(--chalk3)"}}>Contact the advertiser for more information.</span>
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
          <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:3, color:"var(--sand)", textTransform:"uppercase", marginBottom:14, display:"flex", alignItems:"center", gap:10}}>
            <span style={{width:20, height:2, background:"var(--sand)", display:"inline-block"}} />
            Featured Promotions
          </div>
          <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))", gap:16, marginBottom:40}}>
            {featured.map(ad => (
              <div key={ad.id} onClick={() => setSelected(ad)} style={{background:"linear-gradient(135deg,var(--ink3),var(--ink2))", border:"1px solid var(--sand3)", position:"relative", overflow:"hidden", cursor:"pointer", transition:"transform .15s,box-shadow .2s"}}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 12px 36px rgba(0,0,0,.45)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>
                <div style={{position:"absolute", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,var(--sand),var(--sand2))"}} />
                {ad.thumbnail
                  ? <img src={ad.thumbnail} alt={ad.title} style={{width:"100%", height:130, objectFit:"cover", display:"block"}} />
                  : <div style={{width:"100%", height:130, background:"linear-gradient(135deg,var(--ink4),var(--ink3))", display:"flex", alignItems:"center", justifyContent:"center", fontSize:44}}>{ad.icon}</div>
                }
                <div style={{padding:"16px 18px 18px"}}>
                  <div style={{position:"absolute", top:ad.thumbnail ? 116 : 116, right:10, fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:2, textTransform:"uppercase", color:"var(--ink)", background:"var(--sand)", padding:"3px 8px"}}>⭐ FEATURED</div>
                  <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:2.5, textTransform:"uppercase", color:"var(--sand3)", marginBottom:5}}>{ad.category}</div>
                  <div style={{fontFamily:"'Bebas Neue',sans-serif", fontSize:17, letterSpacing:2, color:"var(--chalk)", lineHeight:1.1, marginBottom:6}}>{ad.title}</div>
                  <div style={{fontSize:12, color:"var(--chalk3)", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>{ad.desc}</div>
                  <div style={{marginTop:12, fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, letterSpacing:1.5, color:"var(--sand)"}}>VIEW DETAILS →</div>
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
        ? <div style={{color:"var(--chalk3)", fontSize:14, padding:"24px 0"}}>No offers in this category yet.</div>
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

  // Simulate positions for demo members already on drive
  const positions = Object.entries(driveTrack).map(([uid, pos]) => {
    const u = getUser(us, Number(uid) || uid);
    return { ...pos, user: u, isMe: (Number(uid) || uid) === cu.id };
  });

  // Generate stable demo positions for confirmed members
  const confirmed = drive.registrations.filter(r => r.status === "confirmed");
  const demoPositions = confirmed.filter(r => r.userId !== cu.id).map((r, i) => {
    const u = getUser(us, r.userId);
    const angle = (i / confirmed.length) * Math.PI * 2;
    return { user: u, lat: 23.11 + Math.cos(angle) * 0.008, lng: 53.77 + Math.sin(angle) * 0.008, isMe: false, sharing: true };
  });

  function startSharing() {
    if (!navigator.geolocation) { showToast("GPS not available on this device"); return; }
    const id = navigator.geolocation.watchPosition(
      pos => {
        const { latitude: lat, longitude: lng } = pos.coords;
        upd({ liveTrack: { ...liveTrack, [drive.id]: { ...driveTrack, [cu.id]: { lat, lng, ts: Date.now(), sharing: true } } } });
      },
      () => {
        // Fallback to simulated position for demo
        upd({ liveTrack: { ...liveTrack, [drive.id]: { ...driveTrack, [cu.id]: { lat: 23.1118 + (Math.random()-.5)*.01, lng: 53.7766 + (Math.random()-.5)*.01, ts: Date.now(), sharing: true } } } });
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

  // Map rendering — place dots proportionally on canvas
  const allPos = [...demoPositions, ...(driveTrack[cu.id]?.sharing ? [{ ...driveTrack[cu.id], user: cu, isMe: true }] : [])];
  const sharingCount = demoPositions.length + (isSharing ? 1 : 0);

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
    setNotifs(q => [...q.slice(-4), { ...n, id }]);
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
            <div className="notif-time">{new Date().toLocaleTimeString()}</div>
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
function ClubChat({ state, upd, showToast }) {
  const { currentUser:cu, users:us, clubs:cs, chat = {} } = state;
  const clubId   = cu.clubId;
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
  const { currentUser:cu, users:us, checklists = {} } = state;
  const driveChecks = checklists[drive.id] || {};
  const myCheck     = driveChecks[cu.id] || {};
  const isAdmin     = ["admin","marshal","support"].includes(cu.role);
  const confirmed   = drive.registrations.filter(r => r.status === "confirmed");
  const done        = CHECKLIST_ITEMS.filter(i => myCheck[i.id]).length;
  const pct         = Math.round(done / CHECKLIST_ITEMS.length * 100);
  const allDone     = done === CHECKLIST_ITEMS.length;

  function toggle(itemId) {
    const updated = { ...myCheck, [itemId]: !myCheck[itemId], ts: Date.now() };
    upd({ checklists: { ...checklists, [drive.id]: { ...driveChecks, [cu.id]: updated } } });
    if (!myCheck[itemId] && done + 1 === CHECKLIST_ITEMS.length) showToast("✅ All checks done — you're ready!");
  }

  return (
    <div>
      {/* My checklist */}
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ fontSize:14, fontWeight:700, color:"var(--ink)" }}>My Vehicle Checklist</div>
          <span style={{ fontSize:13, fontWeight:700, color: allDone ? "var(--green)" : "var(--mid)" }}>
            {done}/{CHECKLIST_ITEMS.length} {allDone ? "✅ Ready!" : ""}
          </span>
        </div>
        <div className="checklist-progress"><div className="checklist-fill" style={{ width:`${pct}%` }} /></div>
        {CHECKLIST_ITEMS.map(item => (
          <div key={item.id} className={`check-item${myCheck[item.id] ? " done" : ""}`} onClick={() => toggle(item.id)}>
            <span className="check-icon">{item.icon}</span>
            <span className="check-label">{item.label}</span>
            <div className="check-box">{myCheck[item.id] ? "✓" : ""}</div>
          </div>
        ))}
      </div>

      {/* Marshal view — see all members status */}
      {isAdmin && confirmed.length > 0 && (
        <div>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:2, textTransform:"uppercase", color:"var(--mid2)", marginBottom:12 }}>Member Readiness</div>
          {confirmed.map(reg => {
            const u      = getUser(us, reg.userId);
            const uCheck = driveChecks[reg.userId] || {};
            const uDone  = CHECKLIST_ITEMS.filter(i => uCheck[i.id]).length;
            const ready  = uDone === CHECKLIST_ITEMS.length;
            return (
              <div key={reg.userId} className={`marshal-check-row${ready ? " all-done" : ""}`}>
                <div className="ava" style={{ width:34, height:34, fontSize:13, borderRadius:10 }}>{(u?.name||"?")[0]}</div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"var(--ink)" }}>{u?.name}</div>
                  <div style={{ fontSize:11, color:"var(--mid2)", marginTop:2 }}>{uDone}/{CHECKLIST_ITEMS.length} items checked</div>
                </div>
                <span className={`bdg ${ready ? "g" : "d"}`}>{ready ? "✅ READY" : `${uDone}/${CHECKLIST_ITEMS.length}`}</span>
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
  const wasAttendee = drive.registrations.find(r => r.userId === cu.id && r.status === "confirmed");

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
            {drive.date      && <div className="dm">📅 <strong>{drive.date}</strong></div>}
            {drive.startTime && <div className="dm">🕐 <strong>{fmtTime(drive.startTime)}</strong></div>}
            {drive.mapLink   && <a href={drive.mapLink} target="_blank" rel="noreferrer" className="btn out sm" style={{ marginTop:8 }}>🗺 Open in Google Maps</a>}
          </div>
        </div>
      )}
      {tab === "tracker"   && <LiveTracker   drive={drive} state={state} upd={upd} showToast={showToast} />}
      {tab === "sos"       && <SOSPanel      state={state} upd={upd} showToast={showToast} pushNotif={() => {}} />}
      {tab === "checklist" && <DriveChecklist drive={drive} state={state} upd={upd} showToast={showToast} />}
      {tab === "chat"      && <ClubChat      state={state} upd={upd} showToast={showToast} />}
      {tab === "rating"    && <DriveRating   drive={drive} state={state} upd={upd} showToast={showToast} />}
    </Modal>
  );
}

export default function App() {
  const [S, setS]           = useState(INIT);
  const [toast, setToast]   = useState(null);
  const [mobOpen, setMob]   = useState(false);
  const { notifs, push: pushNotif, dismiss } = useNotifications();

  const showToast = msg => setToast(msg);
  const upd  = patch => setS(s => ({...s, ...patch}));
  const go   = page  => { setS(s => ({...s, page})); setMob(false); };
  const login  = u   => { setS(s => ({...s, currentUser:u, page:"dashboard"})); setMob(false); };
  const logout = ()  => { setS(s => ({...s, currentUser:null, page:"home"})); setMob(false); };

  function reg(type, form) {
    if (type === "member") {
      const u = {id:Date.now(), name:form.name, email:form.email, phone:form.phone, role:"member", rankId:1, clubId:Number(form.clubId), drives:0};
      setS(s => ({...s, users:[...s.users, u], currentUser:u, page:"dashboard"}));
    } else {
      const cid = Math.max(0, ...S.clubs.map(c => c.id)) + 1;
      const u   = {id:Date.now(), name:form.name, email:form.email, phone:form.phone, role:"admin", rankId:5, clubId:cid, drives:0};
      const c   = {id:cid, name:form.name, email:form.email, phone:form.phone, adminId:u.id, logo:"", banner:"", description:"", terms:""};
      setS(s => ({
        ...s,
        users:     [...s.users, u],
        clubs:     [...s.clubs, c],
        currentUser: u,
        page:      "club-admin",
        clubRanks: {...s.clubRanks, [cid]: DEFAULT_RANKS.map(r => ({...r}))},
      }));
    }
    showToast("Welcome to CLUBBB!");
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
    </div>
  );
}
