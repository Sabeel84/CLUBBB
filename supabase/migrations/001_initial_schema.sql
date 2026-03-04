-- CLUBBB Database Schema
-- Run this in Supabase SQL Editor: Dashboard → SQL Editor → New Query → Paste → Run

-- ── Users ────────────────────────────────────────────────────────
create table if not exists users (
  id              uuid        primary key default gen_random_uuid(),
  name            text        not null,
  email           text        unique not null,
  phone           text,
  role            text        not null default 'member'
                              check (role in ('member','marshal','admin','app_admin')),
  rank_id         integer     not null default 1,
  club_id         integer,
  email_verified  boolean     not null default false,
  drives_count    integer     not null default 0,
  created_at      timestamptz not null default now()
);

-- ── Clubs ────────────────────────────────────────────────────────
create table if not exists clubs (
  id              serial      primary key,
  name            text        not null,
  email           text        unique not null,
  phone           text,
  admin_id        uuid        references users(id) on delete set null,
  logo            text,
  banner          text,
  description     text,
  terms           text,
  email_verified  boolean     not null default false,
  created_at      timestamptz not null default now()
);

-- Add foreign key from users to clubs
alter table users
  add constraint users_club_id_fkey
  foreign key (club_id) references clubs(id) on delete set null
  not valid;

-- ── Drives ───────────────────────────────────────────────────────
create table if not exists drives (
  id                   serial      primary key,
  club_id              integer     references clubs(id) on delete cascade,
  posted_by            uuid        references users(id) on delete set null,
  title                text        not null,
  description          text,
  location             text,
  coordinates          text,
  map_link             text,
  date                 date,
  start_time           time,
  required_rank_id     integer     not null default 1,
  capacity             integer     not null default 10,
  image                text,
  attendance_recorded  boolean     not null default false,
  created_at           timestamptz not null default now()
);

-- ── Drive Registrations ───────────────────────────────────────────
create table if not exists drive_registrations (
  id         serial      primary key,
  drive_id   integer     not null references drives(id) on delete cascade,
  user_id    uuid        not null references users(id) on delete cascade,
  status     text        not null default 'confirmed'
                         check (status in ('confirmed','waiting')),
  created_at timestamptz not null default now(),
  unique (drive_id, user_id)
);

-- ── Ads / Marketplace ─────────────────────────────────────────────
create table if not exists ads (
  id          serial      primary key,
  title       text        not null,
  description text,
  details     text,
  icon        text        default '🚙',
  thumbnail   text,
  category    text        default 'General',
  link        text,
  featured    boolean     not null default false,
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);

-- ── Email Verification Tokens ─────────────────────────────────────
create table if not exists verification_tokens (
  id         uuid        primary key default gen_random_uuid(),
  email      text        not null,
  token      text        not null unique,
  type       text        not null check (type in ('member','club')),
  payload    jsonb,
  expires_at timestamptz not null default (now() + interval '24 hours'),
  used       boolean     not null default false,
  created_at timestamptz not null default now()
);

-- ── Indexes ───────────────────────────────────────────────────────
create index if not exists idx_users_club_id     on users(club_id);
create index if not exists idx_users_email       on users(email);
create index if not exists idx_drives_club_id    on drives(club_id);
create index if not exists idx_drives_date       on drives(date);
create index if not exists idx_vtoken_token      on verification_tokens(token);
create index if not exists idx_vtoken_email      on verification_tokens(email);
create index if not exists idx_dreg_drive        on drive_registrations(drive_id);
create index if not exists idx_dreg_user         on drive_registrations(user_id);

-- ── Seed: Default App Admin ───────────────────────────────────────
-- Change the email/name before running!
insert into users (name, email, phone, role, rank_id, email_verified)
values ('App Admin', 'admin@yourdomain.com', '+971500000000', 'app_admin', 5, true)
on conflict (email) do nothing;

-- ── Seed: Sample Ads ──────────────────────────────────────────────
insert into ads (title, description, details, icon, category, featured, active)
values
  ('Toyota GR Sport — Born for the Dunes',
   'Unmatched capability, legendary reliability. Book your test drive today.',
   'The Toyota GR Sport is engineered for desert conditions. Free accessory package (AED 8,000) with every test drive. Valid at all UAE dealerships.',
   '🚙', 'Vehicles', true, true),
  ('Desert Recovery Gear — 20% Off',
   'Premium sand ladders, snatch blocks & full recovery kits. Code: DUNES20',
   'Full SandMaster recovery range on discount. Free shipping on orders over AED 500. Valid for CLUBBB members only.',
   '⛏️', 'Gear', false, true)
on conflict do nothing;
