-- Add covering index for trainings.organization_id flagged by performance advisor
CREATE INDEX IF NOT EXISTS idx_trainings_organization_id ON public.trainings(organization_id);
