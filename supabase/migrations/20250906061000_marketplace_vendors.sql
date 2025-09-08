create table if not exists public.marketplace_vendors (
  id uuid primary key,
  organization_id uuid not null,
  name text not null,
  website text,
  contact_email text,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_vendors_org_idx on public.marketplace_vendors (organization_id);
create index if not exists marketplace_vendors_created_idx on public.marketplace_vendors (created_at desc);

alter table public.marketplace_vendors enable row level security;
create policy marketplace_vendors_no_select on public.marketplace_vendors for select using (false);
create policy marketplace_vendors_service_write on public.marketplace_vendors for all to service_role using (true) with check (true);

create trigger set_marketplace_vendors_updated_at before update on public.marketplace_vendors for each row execute procedure public.set_updated_at();
