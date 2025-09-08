-- Audit triggers for tasks CUD
set local search_path = public;

create or replace function public.audit_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_id();
  v_org uuid;
  v_task uuid;
  v_action text;
  v_entity_id text;
  v_meta jsonb;
begin
  if TG_OP = 'INSERT' then
    v_org := NEW.organization_id;
    v_task := NEW.id;
    v_action := 'task.created';
    v_entity_id := NEW.id::text;
    v_meta := jsonb_build_object('title', NEW.title, 'status', NEW.status);
  elsif TG_OP = 'UPDATE' then
    v_org := NEW.organization_id;
    v_task := NEW.id;
    v_action := 'task.updated';
    v_entity_id := NEW.id::text;
    v_meta := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
  elsif TG_OP = 'DELETE' then
    v_org := OLD.organization_id;
    v_task := OLD.id;
    v_action := 'task.deleted';
    v_entity_id := OLD.id::text;
    v_meta := row_to_json(OLD)::jsonb;
  end if;

  insert into public.audit_logs (actor_user_id, organization_id, action, entity_type, entity_id, meta)
  values (v_actor, v_org, v_action, 'task', v_entity_id, v_meta);
  return coalesce(NEW, OLD);
end;
$$;

drop trigger if exists trg_audit_tasks on public.tasks;
create trigger trg_audit_tasks
  after insert or update or delete on public.tasks
  for each row execute procedure public.audit_tasks();
