-- Fix advisor: Function Search Path Mutable for public.set_updated_at
-- Recreate the trigger function with an explicit search_path

begin;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

commit;
