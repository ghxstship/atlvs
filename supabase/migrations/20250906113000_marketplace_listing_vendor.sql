-- Add vendor linkage to marketplace listings
set local search_path = public;

alter table if exists public.marketplace_listings
  add column if not exists vendor_id uuid references public.marketplace_vendors(id) on delete set null;

create index if not exists marketplace_listings_vendor_idx on public.marketplace_listings (vendor_id);
