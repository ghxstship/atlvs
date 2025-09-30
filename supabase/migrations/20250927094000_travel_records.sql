-- Travel records table for profile module
create table if not exists public.user_travel_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,

  travel_type text not null check (travel_type in ('business', 'personal', 'relocation', 'training', 'conference', 'other')),
  destination text not null,
  country text not null,
  purpose text not null,
  start_date date not null,
  end_date date not null,
  duration_days integer not null default 0,

  accommodation text,
  transportation text,
  visa_required boolean not null default false,
  visa_status text not null default 'not-required' check (visa_status in ('not-required', 'pending', 'approved', 'denied', 'expired')),
  passport_used text,
  notes text,
  expenses numeric(12,2),
  currency text not null default 'USD',
  status text not null default 'planned' check (status in ('planned', 'confirmed', 'in-progress', 'completed', 'cancelled')),
  booking_reference text,
  emergency_contact text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.user_travel_records is 'Detailed travel history records for user profiles';

create index if not exists idx_user_travel_records_user_id on public.user_travel_records(user_id);
create index if not exists idx_user_travel_records_org_id on public.user_travel_records(organization_id);
create index if not exists idx_user_travel_records_start_date on public.user_travel_records(start_date);
create index if not exists idx_user_travel_records_status on public.user_travel_records(status);

alter table public.user_travel_records enable row level security;

create policy user_travel_records_select_own on public.user_travel_records
  for select using (
    user_id = public.current_user_id()
  );

create policy user_travel_records_modify_own on public.user_travel_records
  using (
    user_id = public.current_user_id()
  )
  with check (
    user_id = public.current_user_id()
  );

create policy user_travel_records_org_admin on public.user_travel_records
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = public.current_user_id()
        and m.organization_id = public.user_travel_records.organization_id
        and m.role in ('owner', 'admin')
    )
  );

create trigger update_user_travel_records_timestamp
  before update on public.user_travel_records
  for each row execute procedure public.set_updated_at();
