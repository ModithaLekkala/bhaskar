-- =========================================================================
-- supabase/schema.sql
-- -------------------------------------------------------------------------
-- Run this ENTIRE file once in your Supabase project's SQL Editor
-- (Dashboard -> SQL Editor -> New query -> paste -> Run).
--
-- It creates:
--   1. profiles table       (role: 'admin' | 'customer')
--   2. A trigger that auto-creates a profile row whenever someone signs up
--   3. portfolios table     (customer-specific marketing/portfolio data)
--   4. subscribers table    ("Join the Club" newsletter list)
--   5. Row Level Security (RLS) policies for all three tables
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. PROFILES
-- One row per auth user. Role defaults to 'customer'; you promote Bhaskar
-- to 'admin' manually (see README "Making yourself Admin").
-- -------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Everyone (logged in) can read their own profile row
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admins can view every profile (needed for the admin dashboard's customer list)
create policy "Admins can view all profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Users can update their own profile (e.g. changing their name)
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- -------------------------------------------------------------------------
-- 2. AUTO-CREATE PROFILE ON SIGNUP
-- Whenever a new row appears in auth.users (i.e. someone signs up),
-- automatically insert a matching profiles row with role='customer'.
-- -------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  -- Change this email if you ever want a different admin account
  admin_email text := 'modithalekkala24@gmail.com';
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    case
      when lower(new.email) = lower(admin_email) then 'admin'
      else 'customer'
    end
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- -------------------------------------------------------------------------
-- 3. PORTFOLIOS
-- Each row is a piece of portfolio/marketing content belonging to a
-- specific customer (e.g. a real-estate market update, a campaign report).
-- -------------------------------------------------------------------------
create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  category text, -- e.g. 'Real Estate News', 'Campaign Report'
  created_at timestamptz not null default now()
);

alter table public.portfolios enable row level security;

-- Customers can view ONLY their own portfolio rows
create policy "Customers can view their own portfolio rows"
  on public.portfolios for select
  using (auth.uid() = customer_id);

-- Admins can view every portfolio row
create policy "Admins can view all portfolio rows"
  on public.portfolios for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

-- Only Admins can insert/update/delete portfolio rows
create policy "Admins can insert portfolio rows"
  on public.portfolios for insert
  with check (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can update portfolio rows"
  on public.portfolios for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Admins can delete portfolio rows"
  on public.portfolios for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- -------------------------------------------------------------------------
-- 4. SUBSCRIBERS ("Join the Club" newsletter)
-- Public/anonymous visitors can INSERT (subscribe), but only Admins can
-- SELECT (view the list) or DELETE (unsubscribe someone).
-- -------------------------------------------------------------------------
create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.subscribers enable row level security;

-- Anyone (including anonymous/public visitors) can subscribe
create policy "Anyone can subscribe"
  on public.subscribers for insert
  with check (true);

-- Only Admins can view the subscriber list
create policy "Admins can view subscribers"
  on public.subscribers for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- Only Admins can remove subscribers
create policy "Admins can delete subscribers"
  on public.subscribers for delete
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- =========================================================================
-- End of schema. After running this, see the README for how to:
--   - promote your own account to 'admin'
--   - insert sample portfolio rows for testing
-- =========================================================================
