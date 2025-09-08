-- Add is_demo flags to marketplace tables for reversible seeding
set local search_path = public;

alter table if exists public.marketplace_vendors
  add column if not exists is_demo boolean not null default false;

alter table if exists public.marketplace_listings
  add column if not exists is_demo boolean not null default false;
