create table if not exists public.marketplace_catalog_items (
  id uuid primary key,
  organization_id uuid not null,
  vendor_id uuid not null,
  sku text,
  title text not null,
  description text,
  unit_price numeric(12,2) not null,
  currency text not null,
  status text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists marketplace_catalog_items_org_idx on public.marketplace_catalog_items (organization_id);
create index if not exists marketplace_catalog_items_vendor_idx on public.marketplace_catalog_items (vendor_id);
create index if not exists marketplace_catalog_items_created_idx on public.marketplace_catalog_items (created_at desc);
create index if not exists marketplace_catalog_items_org_vendor_idx on public.marketplace_catalog_items (organization_id, vendor_id);

alter table public.marketplace_catalog_items
  add constraint marketplace_catalog_items_vendor_fk
  foreign key (vendor_id)
  references public.marketplace_vendors(id)
  on update cascade on delete cascade;

alter table public.marketplace_catalog_items enable row level security;
create policy marketplace_catalog_items_no_select on public.marketplace_catalog_items for select using (false);
create policy marketplace_catalog_items_service_write on public.marketplace_catalog_items for all to service_role using (true) with check (true);

create trigger set_marketplace_catalog_items_updated_at before update on public.marketplace_catalog_items for each row execute procedure public.set_updated_at();
