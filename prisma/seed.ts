// Prisma seed script for initial data

import { PrismaClient, RoleName, PermissionAction } from '@prisma/client'
import { hashPassword } from '../src/lib/auth'
import { config } from 'dotenv'

// Cargar variables de entorno
config()

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL
    }
  }
})

// Test user credentials - CHANGE IN PRODUCTION!
const TEST_USERS = [
  {
    email: 'superadmin@tyvg.com',
    password: 'SuperAdmin2024!',
    name: 'Super Administrador',
    role: RoleName.SUPER_ADMIN
  },
  {
    email: 'admin@tyvg.com',
    password: 'Admin2024!',
    name: 'Administrador General',
    role: RoleName.ADMIN
  },
  {
    email: 'contabilidad@tyvg.com',
    password: 'Conta2024!',
    name: 'Usuario Contabilidad',
    role: RoleName.ACCOUNTING
  },
  {
    email: 'tesoreria@tyvg.com',
    password: 'Tesoro2024!',
    name: 'Usuario Tesorería',
    role: RoleName.TREASURY
  },
  {
    email: 'logistica@tyvg.com',
    password: 'Logis2024!',
    name: 'Usuario Logística',
    role: RoleName.LOGISTICS
  },
  {
    email: 'facturacion@tyvg.com',
    password: 'Factura2024!',
    name: 'Usuario Facturación',
    role: RoleName.BILLING
  },
  {
    email: 'viewer@tyvg.com',
    password: 'Viewer2024!',
    name: 'Usuario Solo Lectura',
    role: RoleName.VIEWER
  },
  {
    email: 'conductor@tyvg.com',
    password: 'Conductor2024!',
    name: 'Conductor Ejemplo',
    role: RoleName.DRIVER
  },
  {
    email: 'cliente@tyvg.com',
    password: 'Cliente2024!',
    name: 'Cliente Ejemplo',
    role: RoleName.CLIENT
  },
  {
    email: 'deposito@tyvg.com',
    password: 'Deposito2024!',
    name: 'Usuario Depósito',
    role: RoleName.WAREHOUSE
  }
]

const ROLES_DATA = [
  {
    name: RoleName.SUPER_ADMIN,
    displayName: 'Super Administrador',
    description: 'Acceso completo a todo el sistema, incluyendo gestión de usuarios y configuración'
  },
  {
    name: RoleName.ADMIN,
    displayName: 'Administrador',
    description: 'Acceso administrativo a todas las áreas de negocio'
  },
  {
    name: RoleName.ACCOUNTING,
    displayName: 'Contabilidad',
    description: 'Acceso completo al área de contabilidad y visualización de reportes'
  },
  {
    name: RoleName.TREASURY,
    displayName: 'Tesorería',
    description: 'Acceso completo al área de tesorería y gestión de flujo de efectivo'
  },
  {
    name: RoleName.LOGISTICS,
    displayName: 'Logística',
    description: 'Acceso completo al área de logística e inventarios'
  },
  {
    name: RoleName.BILLING,
    displayName: 'Facturación',
    description: 'Acceso completo al área de facturación y gestión de clientes'
  },
  {
    name: RoleName.VIEWER,
    displayName: 'Solo Lectura',
    description: 'Acceso de solo lectura a todas las áreas'
  },
  {
    name: RoleName.DRIVER,
    displayName: 'Conductor',
    description: 'Acceso para conductores de vehículos'
  },
  {
    name: RoleName.CLIENT,
    displayName: 'Cliente',
    description: 'Acceso para clientes que solicitan servicios'
  },
  {
    name: RoleName.WAREHOUSE,
    displayName: 'Usuario de Depósito',
    description: 'Acceso para usuarios de depósito, gestión de inventarios y almacenes'
  }
]

const PERMISSIONS_DATA = [
  // Dashboard permissions
  { name: 'dashboard:view', resource: 'dashboard', action: PermissionAction.VIEW, description: 'Ver dashboard principal' },
  
  // Accounting permissions
  { name: 'accounting:view', resource: 'accounting', action: PermissionAction.VIEW, description: 'Ver área de contabilidad' },
  { name: 'accounting:edit', resource: 'accounting', action: PermissionAction.EDIT, description: 'Editar datos contables' },
  { name: 'accounting:create', resource: 'accounting', action: PermissionAction.CREATE, description: 'Crear registros contables' },
  { name: 'accounting:delete', resource: 'accounting', action: PermissionAction.DELETE, description: 'Eliminar registros contables' },
  { name: 'accounting:manage', resource: 'accounting', action: PermissionAction.MANAGE, description: 'Gestión completa de contabilidad' },
  
  // Treasury permissions
  { name: 'treasury:view', resource: 'treasury', action: PermissionAction.VIEW, description: 'Ver área de tesorería' },
  { name: 'treasury:edit', resource: 'treasury', action: PermissionAction.EDIT, description: 'Editar datos de tesorería' },
  { name: 'treasury:create', resource: 'treasury', action: PermissionAction.CREATE, description: 'Crear registros de tesorería' },
  { name: 'treasury:delete', resource: 'treasury', action: PermissionAction.DELETE, description: 'Eliminar registros de tesorería' },
  { name: 'treasury:manage', resource: 'treasury', action: PermissionAction.MANAGE, description: 'Gestión completa de tesorería' },
  
  // Logistics permissions
  { name: 'logistics:view', resource: 'logistics', action: PermissionAction.VIEW, description: 'Ver área de logística' },
  { name: 'logistics:edit', resource: 'logistics', action: PermissionAction.EDIT, description: 'Editar datos logísticos' },
  { name: 'logistics:create', resource: 'logistics', action: PermissionAction.CREATE, description: 'Crear registros logísticos' },
  { name: 'logistics:delete', resource: 'logistics', action: PermissionAction.DELETE, description: 'Eliminar registros logísticos' },
  { name: 'logistics:manage', resource: 'logistics', action: PermissionAction.MANAGE, description: 'Gestión completa de logística' },
  
  // Billing permissions
  { name: 'billing:view', resource: 'billing', action: PermissionAction.VIEW, description: 'Ver área de facturación' },
  { name: 'billing:edit', resource: 'billing', action: PermissionAction.EDIT, description: 'Editar datos de facturación' },
  { name: 'billing:create', resource: 'billing', action: PermissionAction.CREATE, description: 'Crear facturas' },
  { name: 'billing:delete', resource: 'billing', action: PermissionAction.DELETE, description: 'Eliminar facturas' },
  { name: 'billing:manage', resource: 'billing', action: PermissionAction.MANAGE, description: 'Gestión completa de facturación' },
  
  // Reports permissions
  { name: 'reports:view', resource: 'reports', action: PermissionAction.VIEW, description: 'Ver reportes' },
  { name: 'reports:create', resource: 'reports', action: PermissionAction.CREATE, description: 'Crear reportes' },
  { name: 'reports:manage', resource: 'reports', action: PermissionAction.MANAGE, description: 'Gestión completa de reportes' },
  
  // Users permissions
  { name: 'users:view', resource: 'users', action: PermissionAction.VIEW, description: 'Ver usuarios' },
  { name: 'users:edit', resource: 'users', action: PermissionAction.EDIT, description: 'Editar usuarios' },
  { name: 'users:create', resource: 'users', action: PermissionAction.CREATE, description: 'Crear usuarios' },
  { name: 'users:delete', resource: 'users', action: PermissionAction.DELETE, description: 'Eliminar usuarios' },
  { name: 'users:manage', resource: 'users', action: PermissionAction.MANAGE, description: 'Gestión completa de usuarios' },
  
  // Roles permissions
  { name: 'roles:view', resource: 'roles', action: PermissionAction.VIEW, description: 'Ver roles' },
  { name: 'roles:edit', resource: 'roles', action: PermissionAction.EDIT, description: 'Editar roles' },
  { name: 'roles:create', resource: 'roles', action: PermissionAction.CREATE, description: 'Crear roles' },
  { name: 'roles:delete', resource: 'roles', action: PermissionAction.DELETE, description: 'Eliminar roles' },
  { name: 'roles:manage', resource: 'roles', action: PermissionAction.MANAGE, description: 'Gestión completa de roles' },
  
  // Settings permissions
  { name: 'settings:view', resource: 'settings', action: PermissionAction.VIEW, description: 'Ver configuración' },
  { name: 'settings:edit', resource: 'settings', action: PermissionAction.EDIT, description: 'Editar configuración' },
  { name: 'settings:manage', resource: 'settings', action: PermissionAction.MANAGE, description: 'Gestión completa de configuración' },
  
  // Siigo permissions
  { name: 'siigo:view', resource: 'siigo', action: PermissionAction.VIEW, description: 'Ver integración con Siigo' },
  { name: 'siigo:edit', resource: 'siigo', action: PermissionAction.EDIT, description: 'Editar configuración de Siigo' },
  { name: 'siigo:create', resource: 'siigo', action: PermissionAction.CREATE, description: 'Crear configuraciones de Siigo' },
  { name: 'siigo:delete', resource: 'siigo', action: PermissionAction.DELETE, description: 'Eliminar configuraciones de Siigo' },
  { name: 'siigo:manage', resource: 'siigo', action: PermissionAction.MANAGE, description: 'Gestión completa de integración con Siigo' },
  
  // Database permissions
  { name: 'database:view', resource: 'database', action: PermissionAction.VIEW, description: 'Ver base de datos' },
  { name: 'database:manage', resource: 'database', action: PermissionAction.MANAGE, description: 'Gestión completa de base de datos' },
  
  // Logistics specific permissions
  { name: 'logistics:clients:view', resource: 'logistics_clients', action: PermissionAction.VIEW, description: 'Ver clientes' },
  { name: 'logistics:clients:create', resource: 'logistics_clients', action: PermissionAction.CREATE, description: 'Crear clientes' },
  { name: 'logistics:clients:edit', resource: 'logistics_clients', action: PermissionAction.EDIT, description: 'Editar clientes' },
  { name: 'logistics:projects:view', resource: 'logistics_projects', action: PermissionAction.VIEW, description: 'Ver proyectos/obras' },
  { name: 'logistics:projects:create', resource: 'logistics_projects', action: PermissionAction.CREATE, description: 'Crear proyectos/obras' },
  { name: 'logistics:projects:edit', resource: 'logistics_projects', action: PermissionAction.EDIT, description: 'Editar proyectos/obras' },
  { name: 'logistics:materials:view', resource: 'logistics_materials', action: PermissionAction.VIEW, description: 'Ver materiales' },
  { name: 'logistics:materials:create', resource: 'logistics_materials', action: PermissionAction.CREATE, description: 'Crear materiales' },
  { name: 'logistics:materials:edit', resource: 'logistics_materials', action: PermissionAction.EDIT, description: 'Editar materiales' },
  { name: 'logistics:drivers:view', resource: 'logistics_drivers', action: PermissionAction.VIEW, description: 'Ver conductores' },
  { name: 'logistics:drivers:create', resource: 'logistics_drivers', action: PermissionAction.CREATE, description: 'Crear conductores' },
  { name: 'logistics:drivers:edit', resource: 'logistics_drivers', action: PermissionAction.EDIT, description: 'Editar conductores' },
  { name: 'logistics:vehicles:view', resource: 'logistics_vehicles', action: PermissionAction.VIEW, description: 'Ver vehículos' },
  { name: 'logistics:vehicles:create', resource: 'logistics_vehicles', action: PermissionAction.CREATE, description: 'Crear vehículos' },
  { name: 'logistics:vehicles:edit', resource: 'logistics_vehicles', action: PermissionAction.EDIT, description: 'Editar vehículos' },
  { name: 'logistics:trips:view', resource: 'logistics_trips', action: PermissionAction.VIEW, description: 'Ver viajes' },
  { name: 'logistics:trips:create', resource: 'logistics_trips', action: PermissionAction.CREATE, description: 'Crear viajes' },
  { name: 'logistics:trips:edit', resource: 'logistics_trips', action: PermissionAction.EDIT, description: 'Editar viajes' },
  { name: 'logistics:expenses:view', resource: 'logistics_expenses', action: PermissionAction.VIEW, description: 'Ver gastos' },
  { name: 'logistics:expenses:approve', resource: 'logistics_expenses', action: PermissionAction.EDIT, description: 'Aprobar gastos' },
  { name: 'logistics:advances:view', resource: 'logistics_advances', action: PermissionAction.VIEW, description: 'Ver anticipos' },
  { name: 'logistics:advances:create', resource: 'logistics_advances', action: PermissionAction.CREATE, description: 'Crear anticipos' },
  { name: 'logistics:advances:legalize', resource: 'logistics_advances', action: PermissionAction.EDIT, description: 'Legalizar anticipos' },
  { name: 'logistics:alerts:view', resource: 'logistics_alerts', action: PermissionAction.VIEW, description: 'Ver alertas' },
  { name: 'logistics:alerts:manage', resource: 'logistics_alerts', action: PermissionAction.MANAGE, description: 'Gestionar alertas' },
  
  // Warehouse permissions
  { name: 'warehouse:view', resource: 'warehouse', action: PermissionAction.VIEW, description: 'Ver área de depósito' },
  { name: 'warehouse:edit', resource: 'warehouse', action: PermissionAction.EDIT, description: 'Editar datos de depósito' },
  { name: 'warehouse:create', resource: 'warehouse', action: PermissionAction.CREATE, description: 'Crear registros de depósito' },
  { name: 'warehouse:delete', resource: 'warehouse', action: PermissionAction.DELETE, description: 'Eliminar registros de depósito' },
  { name: 'warehouse:manage', resource: 'warehouse', action: PermissionAction.MANAGE, description: 'Gestión completa de depósito' },
  { name: 'logistics:warehouses:view', resource: 'logistics_warehouses', action: PermissionAction.VIEW, description: 'Ver almacenes' },
  { name: 'logistics:warehouses:create', resource: 'logistics_warehouses', action: PermissionAction.CREATE, description: 'Crear almacenes' },
  { name: 'logistics:warehouses:edit', resource: 'logistics_warehouses', action: PermissionAction.EDIT, description: 'Editar almacenes' },
  { name: 'logistics:inventory:view', resource: 'logistics_inventory', action: PermissionAction.VIEW, description: 'Ver inventarios' },
  { name: 'logistics:inventory:create', resource: 'logistics_inventory', action: PermissionAction.CREATE, description: 'Crear registros de inventario' },
  { name: 'logistics:inventory:edit', resource: 'logistics_inventory', action: PermissionAction.EDIT, description: 'Editar inventarios' }
]

// Role-Permission mappings
const ROLE_PERMISSIONS_MAPPING = {
  [RoleName.SUPER_ADMIN]: [
    'dashboard:view',
    'accounting:manage',
    'treasury:manage',
    'logistics:manage',
    'logistics:clients:view', 'logistics:clients:create', 'logistics:clients:edit',
    'logistics:projects:view', 'logistics:projects:create', 'logistics:projects:edit',
    'logistics:materials:view', 'logistics:materials:create', 'logistics:materials:edit',
    'logistics:drivers:view', 'logistics:drivers:create', 'logistics:drivers:edit',
    'logistics:vehicles:view', 'logistics:vehicles:create', 'logistics:vehicles:edit',
    'logistics:trips:view', 'logistics:trips:create', 'logistics:trips:edit',
    'logistics:expenses:view', 'logistics:expenses:approve',
    'logistics:advances:view', 'logistics:advances:create', 'logistics:advances:legalize',
    'logistics:alerts:view', 'logistics:alerts:manage',
    'billing:manage',
    'siigo:manage',
    'reports:manage',
    'users:manage',
    'roles:manage',
    'settings:manage',
    'database:manage'
  ],
  [RoleName.ADMIN]: [
    'dashboard:view',
    'accounting:manage',
    'treasury:manage',
    'logistics:manage',
    'logistics:clients:view', 'logistics:clients:create', 'logistics:clients:edit',
    'logistics:projects:view', 'logistics:projects:create', 'logistics:projects:edit',
    'logistics:materials:view', 'logistics:materials:create', 'logistics:materials:edit',
    'logistics:drivers:view', 'logistics:drivers:create', 'logistics:drivers:edit',
    'logistics:vehicles:view', 'logistics:vehicles:create', 'logistics:vehicles:edit',
    'logistics:trips:view', 'logistics:trips:create', 'logistics:trips:edit',
    'logistics:expenses:view', 'logistics:expenses:approve',
    'logistics:advances:view', 'logistics:advances:create', 'logistics:advances:legalize',
    'logistics:alerts:view', 'logistics:alerts:manage',
    'billing:manage',
    'siigo:view',
    'reports:view',
    'users:view',
    'database:view'
  ],
  [RoleName.ACCOUNTING]: [
    'dashboard:view',
    'accounting:manage',
    'siigo:view',
    'reports:view',
    'treasury:view',
    'billing:view'
  ],
  [RoleName.TREASURY]: [
    'dashboard:view',
    'treasury:manage',
    'siigo:view',
    'reports:view',
    'accounting:view',
    'billing:view'
  ],
  [RoleName.LOGISTICS]: [
    'dashboard:view',
    'logistics:manage',
    'logistics:clients:view', 'logistics:clients:create', 'logistics:clients:edit',
    'logistics:projects:view', 'logistics:projects:create', 'logistics:projects:edit',
    'logistics:materials:view', 'logistics:materials:create', 'logistics:materials:edit',
    'logistics:drivers:view', 'logistics:drivers:create', 'logistics:drivers:edit',
    'logistics:vehicles:view', 'logistics:vehicles:create', 'logistics:vehicles:edit',
    'logistics:trips:view', 'logistics:trips:create', 'logistics:trips:edit',
    'logistics:expenses:view', 'logistics:expenses:approve',
    'logistics:advances:view', 'logistics:advances:create', 'logistics:advances:legalize',
    'logistics:alerts:view', 'logistics:alerts:manage',
    'siigo:view',
    'reports:view',
    'billing:view'
  ],
  [RoleName.BILLING]: [
    'dashboard:view',
    'billing:manage',
    'siigo:view',
    'reports:view',
    'accounting:view'
  ],
  [RoleName.VIEWER]: [
    'dashboard:view',
    'accounting:view',
    'treasury:view',
    'logistics:view',
    'billing:view',
    'siigo:view',
    'reports:view'
  ],
  [RoleName.DRIVER]: [
    'dashboard:view',
    'logistics:trips:view',
    'logistics:expenses:view',
    'logistics:advances:view',
    'logistics:alerts:view'
  ],
  [RoleName.CLIENT]: [
    'dashboard:view',
    'logistics:projects:view',
    'logistics:trips:view'
  ],
  [RoleName.WAREHOUSE]: [
    'dashboard:view',
    'warehouse:manage',
    'logistics:warehouses:view',
    'logistics:warehouses:create',
    'logistics:warehouses:edit',
    'logistics:inventory:view',
    'logistics:inventory:create',
    'logistics:inventory:edit',
    'logistics:materials:view',
    'logistics:trips:view',
    'reports:view'
  ]
}

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create permissions first
  console.log('📋 Creating permissions...')
  const createdPermissions = new Map<string, string>()
  
  for (const permission of PERMISSIONS_DATA) {
    const created = await prisma.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission
    })
    createdPermissions.set(permission.name, created.id)
    console.log(`  ✅ Permission: ${permission.name}`)
  }

  // Create roles
  console.log('👥 Creating roles...')
  const createdRoles = new Map<RoleName, string>()
  
  for (const role of ROLES_DATA) {
    const created = await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role
    })
    createdRoles.set(role.name, created.id)
    console.log(`  ✅ Role: ${role.displayName}`)
  }

  // Create role-permission mappings
  console.log('🔗 Creating role-permission mappings...')
  
  for (const [roleName, permissionNames] of Object.entries(ROLE_PERMISSIONS_MAPPING)) {
    const roleId = createdRoles.get(roleName as RoleName)
    if (!roleId) continue

    // Clear existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId }
    })

    // Add new permissions
    for (const permissionName of permissionNames) {
      const permissionId = createdPermissions.get(permissionName)
      if (!permissionId) continue

      await prisma.rolePermission.create({
        data: {
          roleId,
          permissionId
        }
      })
    }
    console.log(`  ✅ Mapped ${permissionNames.length} permissions to ${roleName}`)
  }

  // Create test users
  console.log('👤 Creating test users...')
  
  for (const userData of TEST_USERS) {
    const roleId = createdRoles.get(userData.role)
    if (!roleId) continue

    const hashedPassword = await hashPassword(userData.password)
    
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {
        name: userData.name,
        password: hashedPassword,
        roleId,
        isActive: true
      },
      create: {
        email: userData.email,
        name: userData.name,
        password: hashedPassword,
        roleId,
        isActive: true
      }
    })
    console.log(`  ✅ User: ${userData.name} (${userData.email})`)
  }

  console.log('\n🎉 Database seeding completed!')
  console.log('\n📧 Test User Credentials:')
  console.log('=' .repeat(50))
  
  for (const user of TEST_USERS) {
    console.log(`${user.name}:`)
    console.log(`  📧 Email: ${user.email}`)
    console.log(`  🔑 Password: ${user.password}`)
    console.log(`  👤 Role: ${user.role}`)
    console.log('')
  }
  
  console.log('⚠️  IMPORTANT: Change these passwords in production!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })




