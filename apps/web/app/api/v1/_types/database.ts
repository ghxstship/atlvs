export interface DatabaseRow {
  [key: string]: unknown;
}

export interface Organization extends DatabaseRow {
  id: string;
  name: string;
  stripe_customer_id?: string | null;
}

export interface Membership extends DatabaseRow {
  organization_id: string;
  role: string;
  user_id: string;
  status: string;
}

export interface BillingSettings extends DatabaseRow {
  id: string;
  plan_id?: string;
  plan_name?: string;
  billing_cycle?: string;
  status?: string;
  current_period_start?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  trial_end?: string;
  seats?: number;
  used_seats?: number;
  billing_email?: string;
  tax_id?: string;
  billing_address?: Record<string, unknown>;
  payment_method?: Record<string, unknown>;
  invoice_settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}
