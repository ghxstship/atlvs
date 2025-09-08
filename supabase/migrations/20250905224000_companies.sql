create table if not exists public.companies (
  id uuid primary key,
  organization_id uuid not null,
  name text not null,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists companies_org_idx on public.companies (organization_id);

alter table public.companies enable row level security;
create policy companies_no_select on public.companies for select using (false);
create policy companies_service_write on public.companies for all to service_role using (true) with check (true);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_companies_updated_at before update on public.companies for each row execute procedure public.set_updated_at();
