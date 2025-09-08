-- Split remaining CUD policies (companies, company_contracts, finance_accounts)
-- and add covering indexes flagged by the performance advisor

-- Companies: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'companies' AND policyname = 'org_tables_cud'
  ) THEN
    EXECUTE 'DROP POLICY org_tables_cud ON public.companies';
  END IF;
END $$;

DROP POLICY IF EXISTS companies_insert ON public.companies;
CREATE POLICY companies_insert ON public.companies FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = companies.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS companies_update ON public.companies;
CREATE POLICY companies_update ON public.companies FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = companies.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = companies.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS companies_delete ON public.companies;
CREATE POLICY companies_delete ON public.companies FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = companies.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Company Contracts: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'company_contracts' AND policyname = 'company_contracts_cud'
  ) THEN
    EXECUTE 'DROP POLICY company_contracts_cud ON public.company_contracts';
  END IF;
END $$;

DROP POLICY IF EXISTS company_contracts_insert ON public.company_contracts;
CREATE POLICY company_contracts_insert ON public.company_contracts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contracts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS company_contracts_update ON public.company_contracts;
CREATE POLICY company_contracts_update ON public.company_contracts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contracts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contracts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS company_contracts_delete ON public.company_contracts;
CREATE POLICY company_contracts_delete ON public.company_contracts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = company_contracts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Finance Accounts: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'finance_accounts' AND policyname = 'finance_accounts_cud'
  ) THEN
    EXECUTE 'DROP POLICY finance_accounts_cud ON public.finance_accounts';
  END IF;
END $$;

DROP POLICY IF EXISTS finance_accounts_insert ON public.finance_accounts;
CREATE POLICY finance_accounts_insert ON public.finance_accounts FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_accounts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS finance_accounts_update ON public.finance_accounts;
CREATE POLICY finance_accounts_update ON public.finance_accounts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_accounts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_accounts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS finance_accounts_delete ON public.finance_accounts;
CREATE POLICY finance_accounts_delete ON public.finance_accounts FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_accounts.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Covering indexes for remaining lints
CREATE INDEX IF NOT EXISTS idx_products_organization_id ON public.products(organization_id);

CREATE INDEX IF NOT EXISTS idx_projects_organization_id ON public.projects(organization_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_by ON public.projects(created_by);

CREATE INDEX IF NOT EXISTS idx_rfps_organization_id ON public.rfps(organization_id);
CREATE INDEX IF NOT EXISTS idx_rfps_project_id ON public.rfps(project_id);

CREATE INDEX IF NOT EXISTS idx_riders_event_id ON public.riders(event_id);

CREATE INDEX IF NOT EXISTS idx_services_organization_id ON public.services(organization_id);

CREATE INDEX IF NOT EXISTS idx_spaces_organization_id ON public.spaces(organization_id);

CREATE INDEX IF NOT EXISTS idx_tasks_assignee_id ON public.tasks(assignee_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON public.tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_organization_id ON public.tasks(organization_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);

CREATE INDEX IF NOT EXISTS idx_training_attendance_training_id ON public.training_attendance(training_id);
CREATE INDEX IF NOT EXISTS idx_training_attendance_user_id ON public.training_attendance(user_id);
