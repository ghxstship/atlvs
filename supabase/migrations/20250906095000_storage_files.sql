-- Storage bucket + files table with RLS
set local search_path = public;

-- Files table
create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  created_by uuid not null references public.users(id) default public.current_user_id(),
  name text not null,
  path text not null,
  mime_type text,
  size int,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists files_org_idx on public.files (organization_id desc, created_at desc);
create index if not exists files_project_idx on public.files (project_id desc, created_at desc);

alter table public.files enable row level security;

-- RLS: org members can read/write within org
create policy files_read on public.files
  for select using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = files.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );

create policy files_insert on public.files
  for insert with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = files.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );

create policy files_update on public.files
  for update using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = files.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );

-- Storage bucket (attachments)
insert into storage.buckets (id, name, public)
values ('attachments','attachments', false)
on conflict (id) do nothing;

-- Storage policies for attachments bucket
create policy attachments_read on storage.objects
  for select using (
    bucket_id = 'attachments' and
    exists (
      select 1
      from public.memberships m
      where m.user_id = public.current_user_id() and m.status = 'active'
    )
  );

create policy attachments_write on storage.objects
  for insert to authenticated with check (
    bucket_id = 'attachments' and
    exists (
      select 1
      from public.memberships m
      where m.user_id = public.current_user_id() and m.status = 'active'
    )
  );

create policy attachments_update on storage.objects
  for update to authenticated using (
    bucket_id = 'attachments' and owner = auth.uid()
  ) with check (
    bucket_id = 'attachments' and owner = auth.uid()
  );

create policy attachments_delete on storage.objects
  for delete to authenticated using (
    bucket_id = 'attachments' and owner = auth.uid()
  );
