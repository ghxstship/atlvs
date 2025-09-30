'use client';

import { createBrowserClient } from '@/lib/supabase/client';

export type FinancePermission =
 | 'finance:read'
 | 'finance:create'
 | 'finance:update'
 | 'finance:delete'
 | 'finance:approve'
 | 'finance:export'
 | 'finance:import'
 | 'finance:admin';

export type FinanceResource =
 | 'budgets'
 | 'expenses'
 | 'revenue'
 | 'transactions'
 | 'accounts'
 | 'invoices'
 | 'forecasts'
 | 'analytics';

export interface PermissionContext {
 userId: string;
 orgId: string;
 role: string;
 resource: FinanceResource;
 resourceId?: string;
 action: string;
}

export class FinancePermissions {
 private supabase = createBrowserClient();

 /**
  * Check if user has specific permission for finance resource
  */
 async hasPermission(context: PermissionContext): Promise<boolean> {
   const { userId, orgId, role, resource, action } = context;

   // Admin role has all permissions
   if (role === 'admin' || role === 'owner') {
     return true;
   }

   // Check organization-level permissions
   const { data: orgPermissions } = await this.supabase
     .from('organization_entitlements')
     .select('permissions')
     .eq('organization_id', orgId)
     .eq('feature', 'finance')
     .single();

   if (!orgPermissions?.permissions) {
     return false;
   }

   const permissions = orgPermissions.permissions as FinancePermission[];

   // Check specific permission
   const requiredPermission = `finance:${action}` as FinancePermission;
   if (!permissions.includes(requiredPermission)) {
     return false;
   }

   // Additional checks based on resource and action
   return this.checkResourceSpecificPermissions(context);
 }

 /**
  * Check resource-specific permissions
  */
 private async checkResourceSpecificPermissions(context: PermissionContext): Promise<boolean> {
   const { resource, action, resourceId, userId, orgId } = context;

   switch (resource) {
     case 'expenses':
       return this.checkExpensePermissions(action, resourceId, userId, orgId);

     case 'budgets':
       return this.checkBudgetPermissions(action, resourceId, userId, orgId);

     case 'invoices':
       return this.checkInvoicePermissions(action, resourceId, userId, orgId);

     default:
       // For other resources, basic permission check is sufficient
       return true;
   }
 }

 /**
  * Expense-specific permission checks
  */
 private async checkExpensePermissions(
   action: string,
   resourceId?: string,
   userId?: string,
   orgId?: string
 ): Promise<boolean> {
   if (!resourceId || !userId || !orgId) return true;

   // Users can only approve/reject expenses they didn't create
   if (action === 'approve' || action === 'reject') {
     const { data: expense } = await this.supabase
       .from('expenses')
       .select('submitted_by')
       .eq('id', resourceId)
       .eq('organization_id', orgId)
       .single();

     return expense?.submitted_by !== userId;
   }

   // Users can update/delete their own expenses if not approved
   if (action === 'update' || action === 'delete') {
     const { data: expense } = await this.supabase
       .from('expenses')
       .select('submitted_by, status')
       .eq('id', resourceId)
       .eq('organization_id', orgId)
       .single();

     if (expense?.submitted_by === userId && expense?.status === 'draft') {
       return true;
     }

     // Approved expenses require approval permissions
     return action === 'update' ? false : true;
   }

   return true;
 }

 /**
  * Budget-specific permission checks
  */
 private async checkBudgetPermissions(
   action: string,
   resourceId?: string,
   userId?: string,
   orgId?: string
 ): Promise<boolean> {
   if (!resourceId || !orgId) return true;

   // Check if budget is associated with user's projects
   if (action === 'update' || action === 'delete') {
     const { data: budget } = await this.supabase
       .from('budgets')
       .select('project_id')
       .eq('id', resourceId)
       .eq('organization_id', orgId)
       .single();

     if (budget?.project_id) {
       // Check if user has access to the project
       const { data: projectAccess } = await this.supabase
         .from('project_members')
         .select('role')
         .eq('project_id', budget.project_id)
         .eq('user_id', userId)
         .single();

       return !!projectAccess;
     }
   }

   return true;
 }

 /**
  * Invoice-specific permission checks
  */
 private async checkInvoicePermissions(
   action: string,
   resourceId?: string,
   userId?: string,
   orgId?: string
 ): Promise<boolean> {
   if (!resourceId || !orgId) return true;

   // Only creators or admins can update/delete sent invoices
   if (action === 'update' || action === 'delete') {
     const { data: invoice } = await this.supabase
       .from('invoices')
       .select('created_by, status')
       .eq('id', resourceId)
       .eq('organization_id', orgId)
       .single();

     if (invoice?.status === 'sent' && invoice?.created_by !== userId) {
       return false;
     }
   }

   return true;
 }

 /**
  * Get all permissions for a user in an organization
  */
 async getUserPermissions(userId: string, orgId: string): Promise<FinancePermission[]> {
   const { data: memberships } = await this.supabase
     .from('memberships')
     .select('role')
     .eq('user_id', userId)
     .eq('organization_id', orgId)
     .single();

   if (!memberships) return [];

   // Admin roles have all permissions
   if (memberships.role === 'admin' || memberships.role === 'owner') {
     return [
       'finance:read',
       'finance:create',
       'finance:update',
       'finance:delete',
       'finance:approve',
       'finance:export',
       'finance:import',
       'finance:admin'
     ];
   }

   // Get organization entitlements
   const { data: entitlements } = await this.supabase
     .from('organization_entitlements')
     .select('permissions')
     .eq('organization_id', orgId)
     .eq('feature', 'finance')
     .single();

   return (entitlements?.permissions as FinancePermission[]) || [];
 }

 /**
  * Check bulk operation permissions
  */
 async canPerformBulkOperation(
   userId: string,
   orgId: string,
   operation: string,
   resourceIds: string[]
 ): Promise<boolean> {
   // Check base permission
   const hasPermission = await this.hasPermission({
     userId,
     orgId,
     role: '', // Will be checked internally
     resource: operation.split(':')[0] as FinanceResource,
     action: operation.split(':')[1]
   });

   if (!hasPermission) return false;

   // For bulk operations, check each resource individually
   for (const resourceId of resourceIds) {
     const resourcePermission = await this.hasPermission({
       userId,
       orgId,
       role: '',
       resource: operation.split(':')[0] as FinanceResource,
       resourceId,
       action: operation.split(':')[1]
     });

     if (!resourcePermission) return false;
   }

   return true;
 }

 /**
  * Get permission matrix for UI rendering
  */
 async getPermissionMatrix(userId: string, orgId: string): Promise<Record<FinanceResource, Record<string, boolean>>> {
   const permissions = await this.getUserPermissions(userId, orgId);

   const resources: FinanceResource[] = ['budgets', 'expenses', 'revenue', 'transactions', 'accounts', 'invoices', 'forecasts', 'analytics'];
   const actions = ['read', 'create', 'update', 'delete', 'approve', 'export', 'import'];

   const matrix: Record<FinanceResource, Record<string, boolean> = {} as any;

   for (const resource of resources) {
     matrix[resource] = {};
     for (const action of actions) {
       matrix[resource][action] = permissions.includes(`${resource === 'analytics' ? 'finance' : resource}:${action}` as FinancePermission);
     }
   }

   return matrix;
 }
}

export const financePermissions = new FinancePermissions();

// Utility functions for permission checking in components
export const useFinancePermissions = () => {
 return financePermissions;
};

export const checkFinancePermission = async (
 userId: string,
 orgId: string,
 resource: FinanceResource,
 action: string,
 resourceId?: string
): Promise<boolean> => {
 return financePermissions.hasPermission({
   userId,
   orgId,
   role: '', // Will be determined internally
   resource,
   resourceId,
   action
 });
};
