create table if not exists public.marketplace_listings (
  id uuid primary key,
  organization_id uuid not null,
  title text not null,
  description text,
  price numeric(12,2) not null,
  currency text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_listings_org_idx on public.marketplace_listings (organization_id);
create index if not exists marketplace_listings_created_idx on public.marketplace_listings (created_at desc);

alter table public.marketplace_listings enable row level security;
create policy marketplace_listings_no_select on public.marketplace_listings for select using (false);
create policy marketplace_listings_service_write on public.marketplace_listings for all to service_role using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_marketplace_listings_updated_at before update on public.marketplace_listings for each row execute procedure public.set_updated_at();
