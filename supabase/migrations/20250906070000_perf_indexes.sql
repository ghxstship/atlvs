-- Add covering index for organization_invites.created_by FK
create index if not exists organization_invites_created_by_idx on public.organization_invites (created_by);

-- Drop duplicate indexes (keeping the idx_* variants)
-- companies: keep idx_companies_organization_id, drop companies_org_idx
drop index if exists public.companies_org_idx;
-- invoices: keep idx_invoices_organization_id, drop invoices_org_idx
drop index if exists public.invoices_org_idx;
-- jobs: keep idx_jobs_organization_id, drop jobs_org_idx
drop index if exists public.jobs_org_idx;
