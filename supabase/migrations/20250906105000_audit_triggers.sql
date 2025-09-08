-- Append audit helper and triggers for projects
set local search_path = public;

create or replace function public.append_audit(
  p_actor_user_id uuid,
  p_organization_id uuid,
  p_project_id uuid,
  p_action text,
  p_entity_type text,
  p_entity_id text,
  p_meta jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_logs (actor_user_id, organization_id, project_id, action, entity_type, entity_id, meta)
  values (p_actor_user_id, p_organization_id, p_project_id, p_action, p_entity_type, p_entity_id, p_meta);
end;
$$;

revoke all on function public.append_audit(uuid,uuid,uuid,text,text,text,jsonb) from public;
grant execute on function public.append_audit(uuid,uuid,uuid,text,text,text,jsonb) to postgres; -- internal only

-- Trigger function to audit project CUD
create or replace function public.audit_projects()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := public.current_user_id();
  v_org uuid;
  v_proj uuid;
  v_action text;
  v_entity_id text;
  v_meta jsonb;
begin
  if TG_OP = 'INSERT' then
    v_org := NEW.organization_id;
    v_proj := NEW.id;
    v_action := 'project.created';
    v_entity_id := NEW.id::text;
    v_meta := jsonb_build_object('name', NEW.name, 'status', NEW.status);
  elsif TG_OP = 'UPDATE' then
    v_org := NEW.organization_id;
    v_proj := NEW.id;
    v_action := 'project.updated';
    v_entity_id := NEW.id::text;
    v_meta := jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW));
  elsif TG_OP = 'DELETE' then
    v_org := OLD.organization_id;
    v_proj := OLD.id;
    v_action := 'project.deleted';
    v_entity_id := OLD.id::text;
    v_meta := row_to_json(OLD)::jsonb;
  end if;

  perform public.append_audit(v_actor, v_org, v_proj, v_action, 'project', v_entity_id, v_meta);
  return coalesce(NEW, OLD);
end;
$$;

-- Idempotent triggers
drop trigger if exists trg_audit_projects on public.projects;
create trigger trg_audit_projects
  after insert or update or delete on public.projects
  for each row execute procedure public.audit_projects();
