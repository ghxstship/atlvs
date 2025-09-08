-- Set defaults for created_by to current_user_id() to simplify client inserts
set local search_path = public;

alter table if exists public.projects
  alter column created_by set default public.current_user_id();

alter table if exists public.tasks
  alter column created_by set default public.current_user_id();
