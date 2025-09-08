-- Optional configuration table for webhook retry policies per organization/event
create table if not exists public.webhook_policies (
  organization_id uuid not null,
  event_name text not null,
  max_attempts int not null default 5,
  backoff_cap_minutes int not null default 60,
  primary key (organization_id, event_name)
);

alter table public.webhook_policies enable row level security;
create policy webhook_policies_no_select on public.webhook_policies for select using (false);
create policy webhook_policies_service_write on public.webhook_policies for all to service_role using (true) with check (true);
