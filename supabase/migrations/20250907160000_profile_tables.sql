-- Profile Module - Comprehensive Database Schema
-- Extends the basic users table with specialized profile data

-- User profiles (extends basic users table)
create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  -- Basic Information
  avatar_url text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'non-binary', 'prefer-not-to-say')),
  nationality text,
  languages jsonb default '[]'::jsonb,
  
  -- Contact Information
  phone_primary text,
  phone_secondary text,
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  postal_code text,
  country text,
  
  -- Professional Information
  job_title text,
  department text,
  employee_id text,
  hire_date date,
  employment_type text check (employment_type in ('full-time', 'part-time', 'contract', 'freelance', 'intern')),
  manager_id uuid references public.users(id),
  skills jsonb default '[]'::jsonb,
  bio text,
  linkedin_url text,
  website_url text,
  
  -- Status and Metadata
  status text not null default 'active' check (status in ('active', 'inactive', 'pending', 'suspended')),
  profile_completion_percentage integer default 0 check (profile_completion_percentage >= 0 and profile_completion_percentage <= 100),
  last_updated_by uuid references public.users(id),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (user_id, organization_id)
);

-- Certifications and Licenses
create table if not exists public.user_certifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  name text not null,
  issuing_organization text not null,
  certification_number text,
  issue_date date,
  expiry_date date,
  status text not null default 'active' check (status in ('active', 'expired', 'suspended', 'revoked')),
  verification_url text,
  attachment_url text,
  notes text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Job History and Experience
create table if not exists public.user_job_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  company_name text not null,
  job_title text not null,
  department text,
  employment_type text check (employment_type in ('full-time', 'part-time', 'contract', 'freelance', 'intern')),
  start_date date not null,
  end_date date,
  is_current boolean default false,
  location text,
  description text,
  achievements jsonb default '[]'::jsonb,
  skills_used jsonb default '[]'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Emergency Contacts
create table if not exists public.user_emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  name text not null,
  relationship text not null,
  phone_primary text not null,
  phone_secondary text,
  email text,
  address_line1 text,
  address_line2 text,
  city text,
  state_province text,
  postal_code text,
  country text,
  is_primary boolean default false,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Health and Medical Information
create table if not exists public.user_health_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  blood_type text,
  allergies jsonb default '[]'::jsonb,
  medical_conditions jsonb default '[]'::jsonb,
  medications jsonb default '[]'::jsonb,
  emergency_medical_info text,
  physician_name text,
  physician_phone text,
  insurance_provider text,
  insurance_policy_number text,
  
  -- Fitness and Physical Requirements
  fitness_level text check (fitness_level in ('excellent', 'good', 'fair', 'poor')),
  physical_limitations text,
  last_physical_exam_date date,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Travel Information and Preferences
create table if not exists public.user_travel_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  passport_number text,
  passport_country text,
  passport_issue_date date,
  passport_expiry_date date,
  visa_info jsonb default '[]'::jsonb,
  
  -- Travel Preferences
  preferred_airline text,
  frequent_flyer_numbers jsonb default '{}'::jsonb,
  seat_preference text check (seat_preference in ('aisle', 'window', 'middle', 'no-preference')),
  meal_preference text,
  accommodation_preference text,
  
  -- Travel Restrictions
  travel_restrictions text,
  countries_cannot_visit jsonb default '[]'::jsonb,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uniform and Equipment Sizing
create table if not exists public.user_uniform_sizing (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  -- Clothing Sizes
  shirt_size text,
  pants_size text,
  jacket_size text,
  dress_size text,
  shoe_size text,
  hat_size text,
  
  -- Measurements
  height_cm integer,
  weight_kg integer,
  chest_cm integer,
  waist_cm integer,
  inseam_cm integer,
  
  -- Equipment Preferences
  equipment_preferences jsonb default '{}'::jsonb,
  special_requirements text,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Performance Reviews and Evaluations
create table if not exists public.user_performance_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  review_period_start date not null,
  review_period_end date not null,
  reviewer_id uuid not null references public.users(id),
  review_type text not null check (review_type in ('annual', 'quarterly', 'project-based', 'probationary')),
  
  -- Ratings (1-5 scale)
  overall_rating integer check (overall_rating >= 1 and overall_rating <= 5),
  technical_skills_rating integer check (technical_skills_rating >= 1 and technical_skills_rating <= 5),
  communication_rating integer check (communication_rating >= 1 and communication_rating <= 5),
  teamwork_rating integer check (teamwork_rating >= 1 and teamwork_rating <= 5),
  leadership_rating integer check (leadership_rating >= 1 and leadership_rating <= 5),
  
  -- Feedback
  strengths text,
  areas_for_improvement text,
  goals jsonb default '[]'::jsonb,
  reviewer_comments text,
  employee_comments text,
  
  status text not null default 'draft' check (status in ('draft', 'submitted', 'approved', 'archived')),
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Professional Endorsements and Recommendations
create table if not exists public.user_endorsements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  endorser_name text not null,
  endorser_title text,
  endorser_company text,
  endorser_email text,
  endorser_linkedin text,
  
  relationship text not null check (relationship in ('manager', 'colleague', 'client', 'mentor', 'direct-report')),
  skill_endorsed text not null,
  endorsement_text text not null,
  endorsement_date date not null,
  
  is_verified boolean default false,
  verification_date timestamptz,
  
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Profile Activity Log
create table if not exists public.user_profile_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  
  activity_type text not null check (activity_type in ('profile_updated', 'certification_added', 'certification_expired', 'job_history_added', 'emergency_contact_updated', 'health_record_updated', 'travel_info_updated', 'uniform_sizing_updated', 'performance_review_completed', 'endorsement_received')),
  activity_description text not null,
  metadata jsonb default '{}'::jsonb,
  performed_by uuid references public.users(id),
  
  created_at timestamptz not null default now()
);

-- Enable RLS on all profile tables
alter table public.user_profiles enable row level security;
alter table public.user_certifications enable row level security;
alter table public.user_job_history enable row level security;
alter table public.user_emergency_contacts enable row level security;
alter table public.user_health_records enable row level security;
alter table public.user_travel_info enable row level security;
alter table public.user_uniform_sizing enable row level security;
alter table public.user_performance_reviews enable row level security;
alter table public.user_endorsements enable row level security;
alter table public.user_profile_activity enable row level security;

-- RLS Policies for Profile Tables
-- Users can read/update their own profile data
create policy user_profiles_select_own on public.user_profiles
  for select using (user_id = public.current_user_id());
create policy user_profiles_update_own on public.user_profiles
  for update using (user_id = public.current_user_id());
create policy user_profiles_insert_own on public.user_profiles
  for insert with check (user_id = public.current_user_id());

-- Managers can read their direct reports' profiles
create policy user_profiles_select_reports on public.user_profiles
  for select using (
    exists (
      select 1 from public.user_profiles up
      where up.user_id = public.current_user_id()
      and up.organization_id = user_profiles.organization_id
      and user_profiles.manager_id = public.current_user_id()
    )
  );

-- HR and Admin roles can read all profiles in their organization
create policy user_profiles_select_hr_admin on public.user_profiles
  for select using (
    exists (
      select 1 from public.memberships m
      where m.user_id = public.current_user_id()
      and m.organization_id = user_profiles.organization_id
      and m.role in ('owner', 'admin')
    )
  );

-- Similar policies for other profile tables (self-access and org admin access)
-- Certifications
create policy user_certifications_select_own on public.user_certifications
  for select using (user_id = public.current_user_id());
create policy user_certifications_all_own on public.user_certifications
  for all using (user_id = public.current_user_id());

-- Job History
create policy user_job_history_select_own on public.user_job_history
  for select using (user_id = public.current_user_id());
create policy user_job_history_all_own on public.user_job_history
  for all using (user_id = public.current_user_id());

-- Emergency Contacts
create policy user_emergency_contacts_select_own on public.user_emergency_contacts
  for select using (user_id = public.current_user_id());
create policy user_emergency_contacts_all_own on public.user_emergency_contacts
  for all using (user_id = public.current_user_id());

-- Health Records (more restrictive - only self access)
create policy user_health_records_select_own on public.user_health_records
  for select using (user_id = public.current_user_id());
create policy user_health_records_all_own on public.user_health_records
  for all using (user_id = public.current_user_id());

-- Travel Info
create policy user_travel_info_select_own on public.user_travel_info
  for select using (user_id = public.current_user_id());
create policy user_travel_info_all_own on public.user_travel_info
  for all using (user_id = public.current_user_id());

-- Uniform Sizing
create policy user_uniform_sizing_select_own on public.user_uniform_sizing
  for select using (user_id = public.current_user_id());
create policy user_uniform_sizing_all_own on public.user_uniform_sizing
  for all using (user_id = public.current_user_id());

-- Performance Reviews (reviewers can access reviews they created)
create policy user_performance_reviews_select_own on public.user_performance_reviews
  for select using (user_id = public.current_user_id() or reviewer_id = public.current_user_id());
create policy user_performance_reviews_insert_reviewer on public.user_performance_reviews
  for insert with check (reviewer_id = public.current_user_id());
create policy user_performance_reviews_update_reviewer on public.user_performance_reviews
  for update using (reviewer_id = public.current_user_id());

-- Endorsements
create policy user_endorsements_select_own on public.user_endorsements
  for select using (user_id = public.current_user_id());
create policy user_endorsements_all_own on public.user_endorsements
  for all using (user_id = public.current_user_id());

-- Activity Log (read-only for users, insert for system)
create policy user_profile_activity_select_own on public.user_profile_activity
  for select using (user_id = public.current_user_id());

-- Indexes for performance
create index if not exists idx_user_profiles_user_id on public.user_profiles(user_id);
create index if not exists idx_user_profiles_organization_id on public.user_profiles(organization_id);
create index if not exists idx_user_profiles_manager_id on public.user_profiles(manager_id);
create index if not exists idx_user_certifications_user_id on public.user_certifications(user_id);
create index if not exists idx_user_certifications_expiry_date on public.user_certifications(expiry_date);
create index if not exists idx_user_job_history_user_id on public.user_job_history(user_id);
create index if not exists idx_user_emergency_contacts_user_id on public.user_emergency_contacts(user_id);
create index if not exists idx_user_health_records_user_id on public.user_health_records(user_id);
create index if not exists idx_user_travel_info_user_id on public.user_travel_info(user_id);
create index if not exists idx_user_uniform_sizing_user_id on public.user_uniform_sizing(user_id);
create index if not exists idx_user_performance_reviews_user_id on public.user_performance_reviews(user_id);
create index if not exists idx_user_performance_reviews_reviewer_id on public.user_performance_reviews(reviewer_id);
create index if not exists idx_user_endorsements_user_id on public.user_endorsements(user_id);
create index if not exists idx_user_profile_activity_user_id on public.user_profile_activity(user_id);

-- Function to calculate profile completion percentage
create or replace function public.calculate_profile_completion(user_profile_id uuid)
returns integer language plpgsql as $$
declare
  completion_score integer := 0;
  total_fields integer := 20; -- Adjust based on required fields
begin
  select 
    case when avatar_url is not null then 1 else 0 end +
    case when date_of_birth is not null then 1 else 0 end +
    case when phone_primary is not null then 1 else 0 end +
    case when address_line1 is not null then 1 else 0 end +
    case when city is not null then 1 else 0 end +
    case when country is not null then 1 else 0 end +
    case when job_title is not null then 1 else 0 end +
    case when department is not null then 1 else 0 end +
    case when hire_date is not null then 1 else 0 end +
    case when employment_type is not null then 1 else 0 end +
    case when bio is not null then 1 else 0 end +
    case when jsonb_array_length(skills) > 0 then 1 else 0 end +
    case when jsonb_array_length(languages) > 0 then 1 else 0 end +
    -- Add more fields as needed
    13 -- Additional fields for future expansion
  into completion_score
  from public.user_profiles
  where id = user_profile_id;
  
  return least(100, (completion_score * 100 / total_fields));
end;
$$;

-- Trigger to update profile completion percentage
create or replace function public.update_profile_completion()
returns trigger language plpgsql as $$
begin
  new.profile_completion_percentage := public.calculate_profile_completion(new.id);
  new.updated_at := now();
  return new;
end;
$$;

create trigger update_profile_completion_trigger
  before update on public.user_profiles
  for each row execute function public.update_profile_completion();
