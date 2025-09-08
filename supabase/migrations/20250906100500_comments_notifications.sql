-- Comments, tags, reactions, notifications
set local search_path = public;

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  body text not null,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);
create index if not exists comments_org_entity_idx on public.comments (organization_id, entity_type, entity_id, created_at desc);

alter table public.comments enable row level security;
create policy comments_read on public.comments
  for select using (
    exists (
      select 1 from public.memberships m
      where m.organization_id = comments.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );
create policy comments_write on public.comments
  for insert with check (
    exists (
      select 1 from public.memberships m
      where m.organization_id = comments.organization_id
        and m.user_id = public.current_user_id()
        and m.status = 'active'
    )
  );

-- Tags (simple key labels on entities)
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  entity_type text not null,
  entity_id text not null,
  tag text not null,
  created_by uuid not null references public.users(id),
  created_at timestamptz not null default now()
);
create index if not exists tags_org_entity_idx on public.tags (organization_id, entity_type, entity_id);

alter table public.tags enable row level security;
create policy tags_access on public.tags for all using (
  exists (
    select 1 from public.memberships m
    where m.organization_id = tags.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
) with check (
  exists (
    select 1 from public.memberships m
    where m.organization_id = tags.organization_id
      and m.user_id = public.current_user_id()
      and m.status = 'active'
  )
);

-- Reactions (emoji) on comments
create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (comment_id, user_id, emoji)
);
create index if not exists comment_reactions_comment_idx on public.comment_reactions (comment_id);

alter table public.comment_reactions enable row level security;
create policy comment_reactions_access on public.comment_reactions for all using (
  exists (
    select 1 from public.comments c
    join public.memberships m on m.organization_id = c.organization_id and m.user_id = public.current_user_id() and m.status = 'active'
    where c.id = comment_reactions.comment_id
  )
) with check (
  exists (
    select 1 from public.comments c
    join public.memberships m on m.organization_id = c.organization_id and m.user_id = public.current_user_id() and m.status = 'active'
    where c.id = comment_reactions.comment_id
  )
);

-- User notifications (per-user inbox)
create table if not exists public.user_notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade default public.current_user_id(),
  organization_id uuid references public.organizations(id) on delete set null,
  title text not null,
  body text,
  href text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists user_notifications_user_idx on public.user_notifications (user_id, created_at desc);

alter table public.user_notifications enable row level security;
create policy user_notifications_owner on public.user_notifications
  for all using (user_id = public.current_user_id()) with check (user_id = public.current_user_id());
