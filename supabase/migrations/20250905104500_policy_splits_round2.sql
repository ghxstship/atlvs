-- Split remaining CUD policies (invoices, jobs, finance_transactions) and add more covering indexes

-- Invoices: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'invoices' AND policyname = 'invoices_cud'
  ) THEN
    EXECUTE 'DROP POLICY invoices_cud ON public.invoices';
  END IF;
END $$;

DROP POLICY IF EXISTS invoices_insert ON public.invoices;
CREATE POLICY invoices_insert ON public.invoices FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = invoices.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS invoices_update ON public.invoices;
CREATE POLICY invoices_update ON public.invoices FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = invoices.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = invoices.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS invoices_delete ON public.invoices;
CREATE POLICY invoices_delete ON public.invoices FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = invoices.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Jobs: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'jobs' AND policyname = 'jobs_cud'
  ) THEN
    EXECUTE 'DROP POLICY jobs_cud ON public.jobs';
  END IF;
END $$;

DROP POLICY IF EXISTS jobs_insert ON public.jobs;
CREATE POLICY jobs_insert ON public.jobs FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = jobs.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS jobs_update ON public.jobs;
CREATE POLICY jobs_update ON public.jobs FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = jobs.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = jobs.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS jobs_delete ON public.jobs;
CREATE POLICY jobs_delete ON public.jobs FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = jobs.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Finance Transactions: drop CUD and create explicit policies
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'finance_transactions' AND policyname = 'finance_transactions_cud'
  ) THEN
    EXECUTE 'DROP POLICY finance_transactions_cud ON public.finance_transactions';
  END IF;
END $$;

DROP POLICY IF EXISTS finance_transactions_insert ON public.finance_transactions;
CREATE POLICY finance_transactions_insert ON public.finance_transactions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_transactions.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS finance_transactions_update ON public.finance_transactions;
CREATE POLICY finance_transactions_update ON public.finance_transactions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_transactions.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_transactions.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

DROP POLICY IF EXISTS finance_transactions_delete ON public.finance_transactions;
CREATE POLICY finance_transactions_delete ON public.finance_transactions FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.organization_id = finance_transactions.organization_id
      AND m.user_id = public.current_user_id()
      AND m.status = 'active'
  )
);

-- Additional covering indexes flagged by performance advisor
CREATE INDEX IF NOT EXISTS idx_jobs_organization_id ON public.jobs(organization_id);
CREATE INDEX IF NOT EXISTS idx_jobs_project_id ON public.jobs(project_id);

CREATE INDEX IF NOT EXISTS idx_lineups_event_id ON public.lineups(event_id);

CREATE INDEX IF NOT EXISTS idx_manning_slots_project_id ON public.manning_slots(project_id);

CREATE INDEX IF NOT EXISTS idx_memberships_organization_id ON public.memberships(organization_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_task_id ON public.onboarding_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_onboarding_assignments_user_id ON public.onboarding_assignments(user_id);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_organization_id ON public.onboarding_tasks(organization_id);

CREATE INDEX IF NOT EXISTS idx_opportunities_organization_id ON public.opportunities(organization_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_project_id ON public.opportunities(project_id);

CREATE INDEX IF NOT EXISTS idx_procurement_order_items_order_id ON public.procurement_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_procurement_order_items_product_id ON public.procurement_order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_procurement_order_items_service_id ON public.procurement_order_items(service_id);

CREATE INDEX IF NOT EXISTS idx_procurement_orders_organization_id ON public.procurement_orders(organization_id);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_project_id ON public.procurement_orders(project_id);
CREATE INDEX IF NOT EXISTS idx_procurement_orders_vendor_company_id ON public.procurement_orders(vendor_company_id);
