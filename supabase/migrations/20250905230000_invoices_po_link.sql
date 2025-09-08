alter table public.invoices add column if not exists purchase_order_id uuid;
create index if not exists invoices_po_id_idx on public.invoices (purchase_order_id);
-- Optional: also index org + po for scoped queries
create index if not exists invoices_org_po_idx on public.invoices (organization_id, purchase_order_id);

-- Add FK to purchase_orders.id (nullable). If purchase_orders lives in public.purchase_orders
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'invoices_po_fk' 
    and table_name = 'invoices'
  ) then
    alter table public.invoices
      add constraint invoices_po_fk
      foreign key (purchase_order_id)
      references public.purchase_orders(id)
      on update cascade
      on delete set null;
  end if;
end $$;
