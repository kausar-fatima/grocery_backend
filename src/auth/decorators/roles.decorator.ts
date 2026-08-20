import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../common/enums/user_role.enum';

export const ROLES_KEY = 'roles';

/// Restricts a route to the given roles. Use together with RolesGuard.
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
