-- Fix audit_logs table to add created_at column for telemetry compatibility
-- The telemetry system expects created_at but the table only has occurred_at

-- Add created_at column to audit_logs table
alter table public.audit_logs 
add column if not exists created_at timestamptz not null default now();

-- Update existing records to use occurred_at value for created_at
update public.audit_logs 
set created_at = occurred_at 
where created_at is null;

-- Create index for created_at column for performance
create index if not exists audit_logs_created_at_idx on public.audit_logs (created_at desc);

-- Add comment for clarity
comment on column public.audit_logs.created_at is 'Timestamp when the audit log record was created (for telemetry compatibility)';
