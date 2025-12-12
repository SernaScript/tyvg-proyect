// Authentication and Authorization Types

export interface User {
  id: string
  email: string
  name: string | null
  password?: string // Optional for security, only included during auth
  isActive: boolean
  lastLogin: Date | null
  createdAt: Date
  updatedAt: Date
  role: Role
}

export interface Role {
  id: string
  name: RoleName
  displayName: string
  description: string | null
  isActive: boolean
  permissions: Permission[]
}

export interface Permission {
  id: string
  name: string
  resource: string
  action: PermissionAction
  description: string | null
}

export enum RoleName {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  ACCOUNTING = 'ACCOUNTING',
  TREASURY = 'TREASURY',
  LOGISTICS = 'LOGISTICS',
  BILLING = 'BILLING',
  VIEWER = 'VIEWER',
  DRIVER = 'DRIVER',
  WAREHOUSE = 'WAREHOUSE'
}

export enum PermissionAction {
  VIEW = 'VIEW',
  CREATE = 'CREATE',
  EDIT = 'EDIT',
  DELETE = 'DELETE',
  MANAGE = 'MANAGE'
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthSession {
  id: string
  userId: string
  token: string
  expiresAt: Date
  user: User
}

export interface AuthContextType {
  user: User | null
  role: Role | null
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  hasPermission: (resource: string, action: PermissionAction) => boolean
  canAccessArea: (areaId: string) => boolean
  canAccessModule: (areaId: string, moduleId: string) => boolean
}

// Route protection types
export interface RoutePermission {
  resource: string
  action: PermissionAction
  allowedRoles?: RoleName[]
}

export interface ProtectedRouteConfig {
  [path: string]: RoutePermission
}

// Permission matrix for areas and modules
export interface AreaPermission {
  areaId: string
  displayName: string
  requiredPermission: {
    resource: string
    action: PermissionAction
  }
  modules: ModulePermission[]
}

export interface ModulePermission {
  moduleId: string
  displayName: string
  requiredPermission: {
    resource: string
    action: PermissionAction
  }
}

// Default role permissions configuration
export const ROLE_PERMISSIONS_CONFIG: Record<RoleName, string[]> = {
  [RoleName.SUPER_ADMIN]: [
    'accounting:MANAGE',
    'treasury:MANAGE',
    'logistics:MANAGE',
    'billing:MANAGE',
    'siigo:MANAGE',
    'users:MANAGE',
    'roles:MANAGE',
    'settings:MANAGE',
    'reports:MANAGE',
    'database:MANAGE'
  ],
  [RoleName.ADMIN]: [
    'accounting:MANAGE',
    'treasury:MANAGE',
    'logistics:MANAGE',
    'billing:MANAGE',
    'siigo:VIEW',
    'reports:VIEW',
    'users:VIEW',
    'database:VIEW'
  ],
  [RoleName.ACCOUNTING]: [
    'accounting:MANAGE',
    'siigo:VIEW',
    'reports:VIEW',
    'treasury:VIEW',
    'billing:VIEW'
  ],
  [RoleName.TREASURY]: [
    'treasury:MANAGE',
    'siigo:VIEW',
    'reports:VIEW',
    'accounting:VIEW',
    'billing:VIEW'
  ],
  [RoleName.LOGISTICS]: [
    'logistics:MANAGE',
    'siigo:VIEW',
    'reports:VIEW',
    'billing:VIEW'
  ],
  [RoleName.BILLING]: [
    'billing:MANAGE',
    'siigo:VIEW',
    'reports:VIEW',
    'accounting:VIEW'
  ],
  [RoleName.VIEWER]: [
    'accounting:VIEW',
    'treasury:VIEW',
    'logistics:VIEW',
    'billing:VIEW',
    'siigo:VIEW',
    'reports:VIEW'
  ],
  [RoleName.DRIVER]: [
    'trips:VIEW',
    'trips:EDIT',
    'trips:CREATE'
  ],
  [RoleName.WAREHOUSE]: [
    'warehouse:MANAGE',
    'logistics:warehouses:view',
    'logistics:warehouses:create',
    'logistics:warehouses:edit',
    'logistics:inventory:view',
    'logistics:inventory:create',
    'logistics:inventory:edit',
    'logistics:materials:view',
    'logistics:trips:view',
    'reports:VIEW'
  ]
}

// Area-specific permissions mapping
export const AREA_PERMISSIONS_MAP: Record<string, AreaPermission> = {
  accounting: {
    areaId: 'accounting',
    displayName: 'Contabilidad',
    requiredPermission: {
      resource: 'accounting',
      action: PermissionAction.VIEW
    },
    modules: [
      {
        moduleId: 'f2x-automation',
        displayName: 'Automatización F2X',
        requiredPermission: {
          resource: 'accounting',
          action: PermissionAction.EDIT
        }
      },
      {
        moduleId: 'reconciliation',
        displayName: 'Conciliación Bancaria',
        requiredPermission: {
          resource: 'accounting',
          action: PermissionAction.EDIT
        }
      }
    ]
  },
  treasury: {
    areaId: 'treasury',
    displayName: 'Tesorería',
    requiredPermission: {
      resource: 'treasury',
      action: PermissionAction.VIEW
    },
    modules: [
      {
        moduleId: 'portfolio',
        displayName: 'Gestión de Cartera',
        requiredPermission: {
          resource: 'treasury',
          action: PermissionAction.EDIT
        }
      }
    ]
  },
  logistics: {
    areaId: 'logistics',
    displayName: 'Logística',
    requiredPermission: {
      resource: 'logistics',
      action: PermissionAction.VIEW
    },
    modules: []
  },
  billing: {
    areaId: 'billing',
    displayName: 'Facturación',
    requiredPermission: {
      resource: 'billing',
      action: PermissionAction.VIEW
    },
    modules: []
  },
  'siigo-integration': {
    areaId: 'siigo-integration',
    displayName: 'Integración Siigo',
    requiredPermission: {
      resource: 'siigo',
      action: PermissionAction.VIEW
    },
    modules: [
      {
        moduleId: 'siigo-database-integration',
        displayName: 'Integración de Bases de Datos',
        requiredPermission: {
          resource: 'siigo',
          action: PermissionAction.MANAGE
        }
      },
      {
        moduleId: 'siigo-warehouses',
        displayName: 'Bodegas',
        requiredPermission: {
          resource: 'siigo',
          action: PermissionAction.VIEW
        }
      },
      {
        moduleId: 'siigo-cost-centers',
        displayName: 'Centros de Costo',
        requiredPermission: {
          resource: 'siigo',
          action: PermissionAction.VIEW
        }
      }
    ]
  },
  warehouse: {
    areaId: 'warehouse',
    displayName: 'Depósito',
    requiredPermission: {
      resource: 'warehouse',
      action: PermissionAction.VIEW
    },
    modules: [
      {
        moduleId: 'sales',
        displayName: 'Registrar Ventas',
        requiredPermission: {
          resource: 'warehouse',
          action: PermissionAction.CREATE
        }
      },
      {
        moduleId: 'purchases',
        displayName: 'Registrar Compras',
        requiredPermission: {
          resource: 'warehouse',
          action: PermissionAction.CREATE
        }
      },
      {
        moduleId: 'articles',
        displayName: 'Crear Artículos',
        requiredPermission: {
          resource: 'warehouse',
          action: PermissionAction.CREATE
        }
      },
      {
        moduleId: 'kardex',
        displayName: 'Visualizar Kardex',
        requiredPermission: {
          resource: 'warehouse',
          action: PermissionAction.VIEW
        }
      }
    ]
  }
}

