# Database Unused Indexes Audit

**Date:** 2025-01-01  
**Status:** INFO - Review Required  
**Category:** Performance Optimization

## Overview

This document catalogs all indexes flagged as "unused" by the Supabase database linter. While these indexes have never been used in queries, they may be needed for:
- Future features
- Currently disabled modules
- Admin/reporting queries
- Edge cases or rarely-used operations

## Recommendation Strategy

1. **KEEP** - Indexes on critical foreign keys and frequently joined columns
2. **MONITOR** - Indexes that may be used by upcoming features
3. **CONSIDER REMOVAL** - Truly redundant indexes after verification

---

## Unused Indexes by Category

### ✅ KEEP - Critical for Multi-tenant Security & Joins

These indexes support RLS policies and common join patterns:

| Table | Index | Reason to Keep |
|-------|-------|----------------|
| `products` | `idx_products_organization_id` | Critical for RLS and organization filtering |
| `projects` | `idx_projects_organization_id` | Critical for RLS and organization filtering |
| `projects` | `idx_projects_created_by` | Common for creator lookups |
| `services` | `idx_services_organization_id` | Critical for RLS and organization filtering |
| `spaces` | `idx_spaces_organization_id` | Critical for RLS and organization filtering |
| `companies` | `idx_companies_organization_id` | Critical for RLS and organization filtering |
| `jobs` | `idx_jobs_organization_id` | Critical for RLS and organization filtering |
| `memberships` | `idx_memberships_organization_id` | Critical for user-organization lookups |

**Action:** Keep all organization_id indexes - they're essential for multi-tenant security.

---

### 📊 MONITOR - Business Logic & Reporting

These may be used by reporting features or business logic:

| Table | Index | Usage Scenario |
|-------|-------|----------------|
| `projects` | `idx_projects_org_status_created` | Composite index for dashboard queries |
| `organizations` | `idx_organizations_metadata_gin` | JSONB search capabilities |
| `organizations` | `idx_organizations_settings_gin` | Settings search capabilities |
| `projects` | `idx_projects_active` | Active projects filtering |
| `organizations` | `idx_organizations_active` | Active organizations filtering |
| `companies` | `idx_companies_name` | Company name search |
| `jobs` | `idx_jobs_status` | Job status filtering |

**Action:** Monitor usage over next 30-90 days before deciding.

---

### 🔍 REVIEW - Module-Specific Indexes

#### Programming Module
| Table | Index | Notes |
|-------|-------|-------|
| `rfps` | `idx_rfps_organization_id` | RLS critical - KEEP |
| `rfps` | `idx_rfps_project_id` | Project filtering - KEEP |
| `riders` | `idx_riders_event_id` | Event lookups - KEEP |
| `events` | `idx_events_project_id` | Project filtering - KEEP |
| `lineups` | `idx_lineups_event_id` | Event lookups - KEEP |
| `call_sheets` | `idx_call_sheets_event_id` | Event lookups - KEEP |

**Action:** Keep all - supporting active programming features.

#### Procurement Module
| Table | Index | Notes |
|-------|-------|-------|
| `procurement_orders` | `idx_procurement_orders_organization_id` | RLS - KEEP |
| `procurement_orders` | `idx_procurement_orders_project_id` | Project filtering - KEEP |
| `procurement_orders` | `idx_procurement_orders_vendor_company_id` | Vendor lookups - KEEP |
| `procurement_order_items` | `idx_procurement_order_items_order_id` | Order line items - KEEP |
| `procurement_order_items` | `idx_procurement_order_items_product_id` | Product lookups - KEEP |
| `procurement_order_items` | `idx_procurement_order_items_service_id` | Service lookups - KEEP |

**Action:** Keep all - supporting active procurement features.

#### Jobs Module
| Table | Index | Notes |
|-------|-------|-------|
| `job_assignments` | `idx_job_assignments_assignee_user_id` | User lookups - KEEP |
| `job_assignments` | `idx_job_assignments_job_id` | Job lookups - KEEP |
| `job_compliance` | `idx_job_compliance_job_id` | Compliance lookups - KEEP |
| `job_contracts` | `idx_job_contracts_company_id` | Company lookups - KEEP |
| `job_contracts` | `idx_job_contracts_job_id` | Job lookups - KEEP |
| `jobs` | `idx_jobs_project_id` | Project filtering - KEEP |
| `jobs` | `idx_jobs_created_by` | Creator lookups - KEEP |

**Action:** Keep all - supporting active jobs features.

#### Finance Module
| Table | Index | Notes |
|-------|-------|-------|
| `finance_accounts` | `idx_finance_accounts_organization_id` | RLS - KEEP |
| `finance_transactions` | `idx_finance_transactions_account_id` | Account lookups - KEEP |
| `finance_transactions` | `idx_finance_transactions_invoice_id` | Invoice linkage - KEEP |
| `finance_transactions` | `idx_finance_transactions_organization_id` | RLS - KEEP |
| `finance_transactions` | `idx_finance_transactions_project_id` | Project filtering - KEEP |
| `forecasts` | `idx_forecasts_project_id` | Project filtering - KEEP |
| `invoices` | `idx_invoices_organization_id` | RLS - KEEP |
| `invoices` | `idx_invoices_project_id` | Project filtering - KEEP |
| `invoices` | `idx_invoices_vendor_company_id` | Vendor lookups - KEEP |
| `budgets` | `idx_budgets_project_id` | Project filtering - KEEP |

**Action:** Keep all - critical for financial operations.

#### OpenDeck Marketplace
| Table | Index | Notes |
|-------|-------|-------|
| `opendeck_conversations` | `idx_conversations_project_id` | Project messaging - KEEP |
| `opendeck_conversations` | `idx_conversations_contract_id` | Contract messaging - KEEP |
| `opendeck_messages` | `idx_messages_conversation_id` | Message threading - KEEP |
| `opendeck_messages` | `idx_messages_sender_id` | Sender lookups - KEEP |
| `opendeck_transactions` | `idx_transactions_contract_id` | Contract payments - KEEP |
| `opendeck_transactions` | `idx_transactions_vendor_id` | Vendor earnings - KEEP |
| `opendeck_transactions` | `idx_transactions_status` | Status filtering - KEEP |
| `opendeck_escrow_accounts` | `idx_escrow_contract_id` | Escrow linkage - KEEP |
| `opendeck_reviews` | `idx_reviews_contract_id` | Contract reviews - KEEP |
| `opendeck_reviews` | `idx_reviews_project_id` | Project reviews - KEEP |
| `opendeck_reviews` | `idx_reviews_reviewer_id` | Reviewer lookups - KEEP |
| `opendeck_notifications` | `idx_notifications_user_id` | User notifications - KEEP |
| `opendeck_notifications` | `idx_notifications_is_read` | Read status filtering - KEEP |
| `opendeck_saved_searches` | `idx_saved_searches_user_id` | User searches - KEEP |
| `opendeck_vendor_lists` | `idx_vendor_lists_user_id` | User lists - KEEP |
| `opendeck_vendor_list_items` | `idx_vendor_list_items_list_id` | List items - KEEP |
| `opendeck_vendor_list_items` | `idx_vendor_list_items_vendor_id` | Vendor lookups - KEEP |
| `opendeck_disputes` | `idx_disputes_contract_id` | Dispute resolution - KEEP |
| `opendeck_disputes` | `idx_disputes_status` | Status filtering - KEEP |
| `opendeck_analytics` | `idx_analytics_event_type` | Analytics queries - KEEP |
| `opendeck_analytics` | `idx_analytics_entity` | Entity tracking - KEEP |
| `opendeck_analytics` | `idx_analytics_user_id` | User analytics - KEEP |
| `opendeck_analytics` | `idx_analytics_created_at` | Time-series queries - KEEP |
| `opendeck_earnings` | `idx_earnings_vendor_id` | Vendor earnings - KEEP |
| `opendeck_earnings` | `idx_earnings_contract_id` | Contract earnings - KEEP |

**Action:** Keep all - supporting active marketplace features.

#### Comments & Activity
| Table | Index | Notes |
|-------|-------|-------|
| `comments` | `idx_comments_polymorphic` | Polymorphic lookups - KEEP |
| `comments` | `idx_comments_author` | Author lookups - KEEP |
| `comments` | `idx_comments_organization` | RLS - KEEP |
| `comments` | `idx_comments_parent` | Thread replies - KEEP |
| `comments` | `idx_comments_unresolved` | Unresolved filtering - KEEP |
| `project_tags` | `idx_project_tags_project` | Project tagging - KEEP |
| `project_tags` | `idx_project_tags_name` | Tag search - KEEP |

**Action:** Keep all - supporting collaboration features.

#### Tasks & Manning
| Table | Index | Notes |
|-------|-------|-------|
| `tasks` | `idx_tasks_assignee_id` | Assignee lookups - KEEP |
| `tasks` | `idx_tasks_created_by` | Creator lookups - KEEP |
| `tasks` | `idx_tasks_organization_id` | RLS - KEEP |
| `tasks` | `idx_tasks_project_id` | Project filtering - KEEP |
| `manning_slots` | `idx_manning_slots_project_id` | Project staffing - KEEP |

**Action:** Keep all - supporting task management.

#### Training & Onboarding
| Table | Index | Notes |
|-------|-------|-------|
| `training_attendance` | `idx_training_attendance_training_id` | Attendance tracking - KEEP |
| `training_attendance` | `idx_training_attendance_user_id` | User attendance - KEEP |
| `trainings` | `idx_trainings_organization_id` | RLS - KEEP |
| `onboarding_assignments` | `idx_onboarding_assignments_task_id` | Task assignments - KEEP |
| `onboarding_assignments` | `idx_onboarding_assignments_user_id` | User onboarding - KEEP |
| `onboarding_tasks` | `idx_onboarding_tasks_organization_id` | RLS - KEEP |

**Action:** Keep all - supporting HR features.

#### Permissions & Security
| Table | Index | Notes |
|-------|-------|-------|
| `user_permissions` | `idx_user_permissions_user` | User lookups - KEEP |
| `user_permissions` | `idx_user_permissions_resource` | Resource access - KEEP |

**Action:** Keep all - critical for security.

#### Companies & Contracts
| Table | Index | Notes |
|-------|-------|-------|
| `advancing_items` | `idx_advancing_items_project_id` | Project items - KEEP |
| `bids` | `idx_bids_company_id` | Company bids - KEEP |
| `bids` | `idx_bids_opportunity_id` | Opportunity bids - KEEP |
| `company_contracts` | `idx_company_contracts_organization_id` | RLS - KEEP |
| `company_contracts` | `idx_company_contracts_company_id` | Company lookups - KEEP |
| `company_contracts` | `idx_company_contracts_project_id` | Project contracts - KEEP |
| `contractor_agreements` | `idx_contractor_agreements_project_id` | Project agreements - KEEP |
| `contractor_agreements` | `idx_contractor_agreements_user_id` | User agreements - KEEP |

**Action:** Keep all - supporting business operations.

#### Opportunities & Pipeline
| Table | Index | Notes |
|-------|-------|-------|
| `opportunities` | `idx_opportunities_organization_id` | RLS - KEEP |
| `opportunities` | `idx_opportunities_project_id` | Project opportunities - KEEP |
| `organizations` | `idx_organizations_subscription_active` | Subscription filtering - KEEP |

**Action:** Keep all - supporting sales pipeline.

#### Search & Full-text
| Table | Index | Notes |
|-------|-------|-------|
| `projects` | `idx_projects_name_search` | Text search - KEEP |

**Action:** Keep - supporting search features.

#### Payments & Billing
| Table | Index | Notes |
|-------|-------|-------|
| `payments` | `idx_payments_organization_id` | RLS - KEEP |
| `payments` | `idx_payments_user_id` | User payments - KEEP |
| `payments` | `idx_payments_pi_id` | Payment intent lookups - KEEP |
| `organizations` | `idx_organizations_stripe_customer_id` | Stripe integration - KEEP |
| `users` | `idx_users_stripe_customer_id` | Stripe integration - KEEP |

**Action:** Keep all - critical for billing.

#### Domains & Entitlements
| Table | Index | Notes |
|-------|-------|-------|
| `organization_domains` | `idx_org_domains_org_id` | Domain lookups - KEEP |
| `organization_domains` | `idx_org_domains_domain` | Domain verification - KEEP |
| `organization_entitlements` | `idx_org_entitlements_org_id` | Feature access - KEEP |

**Action:** Keep all - supporting authentication.

#### System & Integration
| Table | Index | Notes |
|-------|-------|-------|
| `purchase_orders` | `po_org_idx` | RLS - KEEP |
| `purchase_orders` | `po_status_idx` | Status filtering - KEEP |
| `api_keys` | `api_keys_org_idx` | RLS - KEEP |
| `api_keys` | `api_keys_active_idx` | Active keys filtering - KEEP |
| `invoices` | `invoices_status_idx` | Status filtering - KEEP |
| `audit_logs` | `audit_logs_org_idx` | RLS - KEEP |
| `audit_logs` | `audit_logs_project_idx` | Project audit trail - KEEP |
| `webhook_subscriptions` | `webhook_subs_org_idx` | RLS - KEEP |
| `webhook_subscriptions` | `webhook_subs_active_idx` | Active webhooks - KEEP |
| `webhook_deliveries` | `webhook_deliveries_sub_idx` | Delivery tracking - KEEP |
| `webhook_deliveries` | `webhook_deliveries_status_idx` | Status monitoring - KEEP |

**Action:** Keep all - supporting integrations.

#### Programs & Pipeline
| Table | Index | Notes |
|-------|-------|-------|
| `programs` | `programs_org_idx` | RLS - KEEP |
| `pipeline_stages` | `pipeline_stages_org_idx` | RLS - KEEP |
| `jobs` | `jobs_status_idx` | Status filtering - KEEP |

**Action:** Keep all - supporting business processes.

#### Reports & Analytics
| Table | Index | Notes |
|-------|-------|-------|
| `reports` | `reports_org_idx` | RLS - KEEP |

**Action:** Keep - supporting reporting.

---

## Summary & Recommendations

### ✅ FINAL DECISION: KEEP ALL INDEXES

**Rationale:**
1. **Multi-tenant Security:** All `organization_id` indexes are critical for RLS policies
2. **Active Features:** All indexes support currently implemented or planned features
3. **Join Performance:** Foreign key indexes significantly improve join performance
4. **Low Storage Cost:** Index storage cost is minimal compared to query performance gains
5. **Development Stage:** Application is still evolving; premature optimization could hurt

### 📊 Statistics
- **Total Unused Indexes:** 125+
- **Critical for RLS:** ~40 (32%)
- **Supporting Active Features:** ~85 (68%)
- **Recommended for Removal:** 0 (0%)

### 🔄 Monitoring Plan
1. Enable `pg_stat_statements` extension
2. Monitor index usage weekly
3. Review after 90 days of production use
4. Consider removal only if:
   - Feature permanently deprecated
   - Covered by composite index
   - Proven redundant through query analysis

### 📝 Notes
- "Unused" doesn't mean "unnecessary" - many indexes support RLS, joins, and edge cases
- Storage cost of keeping indexes is minimal
- Removing indexes prematurely can cause performance issues
- Better to keep indexes during development and optimize post-production

---

**Last Updated:** 2025-01-01  
**Next Review:** 2025-04-01 (90 days)
