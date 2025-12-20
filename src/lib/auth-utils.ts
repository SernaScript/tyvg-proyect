// Authentication utility functions that don't require Prisma
// These can be safely used in client components

import { 
  Permission, 
  PermissionAction,
  AREA_PERMISSIONS_MAP
} from '@/types/auth'

// Permission utilities (no database access)
export const hasPermission = (
  userPermissions: Permission[],
  resource: string,
  action: PermissionAction
): boolean => {
  return userPermissions.some(
    permission => 
      permission.resource === resource && 
      (permission.action === action || permission.action === PermissionAction.MANAGE)
  )
}

export const canAccessArea = (userPermissions: Permission[], areaId: string): boolean => {
  const areaConfig = AREA_PERMISSIONS_MAP[areaId]
  if (!areaConfig) return false

  return hasPermission(
    userPermissions,
    areaConfig.requiredPermission.resource,
    areaConfig.requiredPermission.action
  )
}

export const canAccessModule = (
  userPermissions: Permission[],
  areaId: string,
  moduleId: string
): boolean => {
  const areaConfig = AREA_PERMISSIONS_MAP[areaId]
  if (!areaConfig) return false

  const moduleConfig = areaConfig.modules.find(m => m.moduleId === moduleId)
  if (!moduleConfig) {
    // If module not configured, check area permission
    return canAccessArea(userPermissions, areaId)
  }

  return hasPermission(
    userPermissions,
    moduleConfig.requiredPermission.resource,
    moduleConfig.requiredPermission.action
  )
}

