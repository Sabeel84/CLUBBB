# 🏜️ CLUBBB — Desert Driving Community Platform

A full-featured desert driving club management app built with React + Vite.

## Features
- Club registration & member management
- Drive posting with email notifications to eligible members
- Email verification on registration (member & club)
- Rank system (5 tiers)
- Marketplace with featured promotions
- Admin panels (App Admin, Club Admin, Marshal)
- White modern UI — fully responsive desktop & mobile

---

## Tech Stack

| Layer | Service | Cost |
|---|---|---|
| Frontend | React + Vite on **Vercel** | Free |
| Database + Functions | **Supabase** | Free (500MB, 2M calls/mo) |
| Email | **Resend** | Free (100/day, 3K/month) |

---

## Setup Guide

### Step 1 — Create Supabase Project
1. Go to [supabase.com](https://supabase.com) → New Project → name it `clubbb`
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Settings → API** → copy:
   - `Project URL` → your `VITE_SUPABASE_URL`
   - `anon public` key → your `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → for Supabase Secrets (Step 3)

### Step 2 — Create Resend Account
1. Go to [resend.com](https://resend.com) → Sign up
2. **API Keys** → Create API Key → copy it
3. (Optional) **Domains** → add your domain for a custom from-address

### Step 3 — Set Supabase Edge Function Secrets
In Supabase Dashboard → **Settings → Edge Functions → Secrets**, add:

```
RESEND_API_KEY     = re_xxxxxxxxxxxxxxxxxxxxxxxx
APP_URL            = https://your-app.vercel.app
EMAIL_DOMAIN       = yourdomain.com   (or leave blank to use resend.dev sandbox)
```

The `SUPABASE_SERVICE_ROLE_KEY` is automatically available to Edge Functions — no need to add it manually.

### Step 4 — Deploy Edge Functions
Install Supabase CLI on your local machine (one-time):
```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase functions deploy send-verification
supabase functions deploy verify-token
supabase functions deploy notify-drive
```

> Your project ref is the string in your Supabase dashboard URL:
> `https://supabase.com/dashboard/project/YOUR_PROJECT_REF`

### Step 5 — Push to GitHub
1. Create a new repository on [github.com](https://github.com)
2. Upload all these files (drag and drop into the GitHub web interface)
3. That's it — your code is on GitHub

### Step 6 — Deploy on Vercel
1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
2. **Add New → Project** → Import your `clubbb` repository
3. Go to **Settings → Environment Variables** and add:
   ```
   VITE_SUPABASE_URL      = https://xxxxxxxxxx.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJxxxxxxxxxxxxxxxx
   ```
4. Click **Deploy** — live in ~60 seconds

### Step 7 — Update Email Links
After your Vercel URL is live (e.g. `https://clubbb.vercel.app`):
- Go to Supabase → **Settings → Edge Functions → Secrets**
- Update `APP_URL` to your real Vercel URL

---

## File Structure

```
clubbb/
├── index.html                          # Entry HTML
├── vite.config.js                      # Vite config
├── package.json                        # Dependencies
├── vercel.json                         # Vercel SPA routing
├── .env.example                        # Env var template
├── .gitignore
├── public/
│   └── favicon.svg
├── src/
│   ├── main.jsx                        # React entry point
│   ├── App.jsx                         # Root + verify page + email hooks
│   ├── supabase.js                     # Supabase client + email helpers
│   └── clubbb-app.jsx                  # Main app (all UI + logic)
└── supabase/
    ├── config.toml                     # Supabase local config
    ├── migrations/
    │   └── 001_initial_schema.sql      # Full database schema
    └── functions/
        ├── send-verification/index.ts  # Email: verify on register
        ├── verify-token/index.ts       # Handles verify link click
        └── notify-drive/index.ts       # Email: notify members on drive post
```

---

## How Email Flows Work

### Registration Verification
1. User fills registration form → clicks submit
2. App calls `send-verification` Edge Function
3. Edge Function creates a token in DB + sends branded email via Resend
4. User clicks link in email → goes to `/verify?token=xxxx`
5. App calls `verify-token` Edge Function → marks verified + creates account in DB
6. User is redirected to sign in

### Drive Notification
1. Admin/Marshal posts a new drive
2. App calls `notify-drive` Edge Function in background
3. Edge Function queries DB for all members in the same club with rank ≥ required rank
4. Sends a branded email to each eligible member via Resend batch API
5. Members click link in email → taken to the app to register for the drive

---

## Default Login (Demo Mode)
When Supabase is not configured, the app runs in demo mode with seed data.
Any of these emails work with any password in demo mode — the login just checks the email:
- `ahmed@email.com` (Admin)
- `khalid@email.com` (Marshal)
- `sara@email.com` (Member)
- `admin@clubbb.com` (App Admin)
