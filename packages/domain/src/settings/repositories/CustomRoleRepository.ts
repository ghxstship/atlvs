import { Result } from '../../shared/Result';
import {
  CustomRole,
  CustomRoleCreate,
  CustomRoleUpdate,
  CustomRoleFilter
} from '../entities/CustomRole';
import {
  PermissionMatrix,
  PermissionCheck,
  PermissionCheckResult
} from '../entities/PermissionMatrix';

export interface CustomRoleRepository {
  findById(id: string): Promise<Result<CustomRole>>;
  findByName(organizationId: string, name: string): Promise<Result<CustomRole>>;
  findAll(filter?: CustomRoleFilter): Promise<Result<CustomRole[]>>;
  create(data: CustomRoleCreate): Promise<Result<CustomRole>>;
  update(id: string, data: CustomRoleUpdate): Promise<Result<CustomRole>>;
  delete(id: string): Promise<Result<void>>;
  assignToUser(roleId: string, userId: string): Promise<Result<void>>;
  removeFromUser(roleId: string, userId: string): Promise<Result<void>>;
  getUserRoles(userId: string, organizationId: string): Promise<Result<CustomRole[]>>;
  getRolePermissions(roleId: string): Promise<Result<PermissionMatrix[]>>;
  checkPermission(check: PermissionCheck): Promise<Result<PermissionCheckResult>>;
  duplicateRole(roleId: string, newName: string): Promise<Result<CustomRole>>;
}
