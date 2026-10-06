-- Phase 1: scans, scan_images, private storage, RLS lockdown
-- Apply via Supabase SQL editor or: supabase db push

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- scans
-- ---------------------------------------------------------------------------
create table if not exists public.scans (
  id uuid primary key default gen_random_uuid(),
  participant_id text null,
  age integer not null,
  sex text not null,
  height_cm numeric not null,
  weight_kg numeric not null,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint scans_sex_check
    check (sex in ('male', 'female', 'prefer_not_to_say')),
  constraint scans_status_check
    check (status in ('draft', 'uploading', 'submitted', 'saved', 'failed')),
  constraint scans_age_check
    check (age >= 18 and age <= 100),
  constraint scans_height_check
    check (height_cm >= 100 and height_cm <= 230),
  constraint scans_weight_check
    check (weight_kg >= 30 and weight_kg <= 300)
);

create index if not exists scans_created_at_idx on public.scans (created_at desc);
create index if not exists scans_status_idx on public.scans (status);

-- ---------------------------------------------------------------------------
-- scan_images
-- ---------------------------------------------------------------------------
create table if not exists public.scan_images (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references public.scans (id) on delete cascade,
  view text not null,
  storage_path text not null,
  original_filename text null,
  mime_type text not null,
  file_size_bytes integer not null,
  width integer null,
  height integer null,
  created_at timestamptz not null default now(),
  constraint scan_images_view_check
    check (view in ('front', 'back', 'left', 'right')),
  constraint scan_images_scan_view_unique unique (scan_id, view)
);

create index if not exists scan_images_scan_id_idx on public.scan_images (scan_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists scans_set_updated_at on public.scans;
create trigger scans_set_updated_at
  before update on public.scans
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- Phase 1: no end-user auth. Client access is denied; Next.js API routes use
-- the service role (bypasses RLS). When auth is added, replace these policies
-- with user_id = auth.uid() ownership checks.
-- ---------------------------------------------------------------------------
alter table public.scans enable row level security;
alter table public.scan_images enable row level security;

-- No policies for anon/authenticated → deny by default under RLS.

-- ---------------------------------------------------------------------------
-- Storage: private bucket for body photos
-- Object path convention: {scan_id}/{view}.{ext}
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'body-scans',
  'body-scans',
  false,
  15728640, -- 15 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Deny direct client access to storage objects; server uses service role.
drop policy if exists "Deny public read body-scans" on storage.objects;
drop policy if exists "Deny public write body-scans" on storage.objects;

-- Explicit deny policies are optional when no allow policies exist; kept for clarity.
create policy "Deny anon select body-scans"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'body-scans' and false);

create policy "Deny anon insert body-scans"
  on storage.objects for insert
  to anon, authenticated
  with check (bucket_id = 'body-scans' and false);

create policy "Deny anon update body-scans"
  on storage.objects for update
  to anon, authenticated
  using (bucket_id = 'body-scans' and false);

create policy "Deny anon delete body-scans"
  on storage.objects for delete
  to anon, authenticated
  using (bucket_id = 'body-scans' and false);
