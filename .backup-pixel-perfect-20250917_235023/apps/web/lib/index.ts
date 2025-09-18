// Re-export utilities to satisfy missing imports
export { getTenantContext as extractTenantContext } from './tenant-context';
export { checkPermission as enforceRBAC } from './rbac';
