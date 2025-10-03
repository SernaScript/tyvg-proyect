// Areas configuration following TypeScript/React naming conventions

import { 
  Calculator, 
  CreditCard, 
  Truck, 
  FileText, 
  Building2,
  PiggyBank,
  Receipt,
  FileBarChart,
  Users,
  DollarSign,
  Calendar,
  Package,
  ClipboardList,
  BarChart3,
  Zap,
  Settings,
  Fuel,
  Database,
  Car,
  Link as LinkIcon,
  Key,
  TestTube,
  ArrowUpDown,
  Target,
  CheckCircle,
  LucideIcon
} from "lucide-react"

export enum ModuleStatus {
  ACTIVE = 'active',
  DEVELOPMENT = 'development',
  PLANNED = 'planned'
}

export enum AreaColor {
  BLUE = 'blue',
  GREEN = 'green',
  ORANGE = 'orange',
  PURPLE = 'purple'
}

export interface ModuleConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  href: string
  status?: ModuleStatus
}

export interface AreaConfig {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: AreaColor
  modules: ModuleConfig[]
}

export const AREAS_CONFIG: AreaConfig[] = [
  {
    id: "accounting",
    name: "Contabilidad",
    description: "Gestión contable y financiera integral",
    icon: Calculator,
    color: AreaColor.BLUE,
    modules: [
      {
        id: "flypass-data",
        name: "Datos de Flypass",
        description: "Gestión y procesamiento de datos de peajes Flypass",
        icon: Database,
        href: "/areas/accounting/flypass-data",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "flypass-reports",
        name: "Reportes Flypass",
        description: "Análisis y estadísticas de datos de peajes",
        icon: BarChart3,
        href: "/areas/accounting/flypass-reports",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "reconciliation",
        name: "Conciliación Bancaria",
        description: "Conciliación automática de cuentas bancarias",
        icon: Building2,
        href: "/areas/accounting/reconciliation",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "electronic-invoices",
        name: "Facturas Electrónicas",
        description: "Gestión y procesamiento de facturas electrónicas",
        icon: Receipt,
        href: "/areas/accounting/electronic-invoices",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "accounting-reports",
        name: "Reportes Contables",
        description: "Generación de reportes financieros y contables",
        icon: FileBarChart,
        href: "/areas/accounting/reports",
        status: ModuleStatus.ACTIVE
      }
    ]
  },
  {
    id: "treasury",
    name: "Tesorería",
    description: "Administración de flujo de efectivo y pagos",
    icon: PiggyBank,
    color: AreaColor.GREEN,
    modules: [
      {
        id: "portfolio",
        name: "Gestión de Cartera",
        description: "Control y seguimiento de cartera de clientes",
        icon: Users,
        href: "/areas/treasury/portfolio",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "payment-scheduling",
        name: "Programación de Pagos",
        description: "Planificación y programación de pagos a proveedores",
        icon: Calendar,
        href: "/areas/treasury/payment-scheduling",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "cash-flow",
        name: "Flujo de Efectivo",
        description: "Proyección y control del flujo de efectivo",
        icon: DollarSign,
        href: "/areas/treasury/cash-flow",
        status: ModuleStatus.PLANNED
      },
      {
        id: "bank-reconciliation",
        name: "Conciliación Bancaria",
        description: "Conciliación de movimientos bancarios",
        icon: CreditCard,
        href: "/areas/treasury/bank-reconciliation",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "approved-payments",
        name: "Pagos Aprobados",
        description: "Gestión y seguimiento de pagos aprobados",
        icon: CheckCircle,
        href: "/areas/treasury/approved-payments",
        status: ModuleStatus.ACTIVE
      }
    ]
  },
  {
    id: "logistics",
    name: "Logística",
    description: "Gestión de inventarios y cadena de suministro",
    icon: Truck,
    color: AreaColor.ORANGE,
    modules: [
      {
        id: "inventory",
        name: "Control de Inventarios",
        description: "Gestión y control de inventarios en tiempo real",
        icon: Package,
        href: "/areas/logistics/inventory",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "purchase-orders",
        name: "Órdenes de Compra",
        description: "Gestión de órdenes de compra y proveedores",
        icon: ClipboardList,
        href: "/areas/logistics/purchase-orders",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "warehouses",
        name: "Gestión de Almacenes",
        description: "Control de almacenes y ubicaciones",
        icon: Building2,
        href: "/areas/logistics/warehouses",
        status: ModuleStatus.PLANNED
      },
      {
        id: "fuel",
        name: "Combustible",
        description: "Gestión de consumo y costos de combustible",
        icon: Fuel,
        href: "/areas/logistics/fuel",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "vehicles",
        name: "Vehículos",
        description: "Gestión de flota vehicular y mantenimiento",
        icon: Car,
        href: "/areas/logistics/vehicles",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "logistics-reports",
        name: "Reportes de Logística",
        description: "Reportes de movimientos y rotación de inventarios",
        icon: BarChart3,
        href: "/areas/logistics/reports",
        status: ModuleStatus.DEVELOPMENT
      }
    ]
  },
  {
    id: "billing",
    name: "Facturación",
    description: "Emisión y gestión de facturación electrónica",
    icon: FileText,
    color: AreaColor.PURPLE,
    modules: [
      {
        id: "invoice-generation",
        name: "Emisión de Facturas",
        description: "Creación y emisión de facturas electrónicas",
        icon: FileText,
        href: "/areas/billing/invoice-generation",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "credit-notes",
        name: "Notas de Crédito",
        description: "Gestión de notas de crédito y débito",
        icon: Receipt,
        href: "/areas/billing/credit-notes",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "customers",
        name: "Gestión de Clientes",
        description: "Administración de información de clientes",
        icon: Users,
        href: "/areas/billing/customers",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "billing-reports",
        name: "Reportes de Facturación",
        description: "Análisis de ventas y facturación",
        icon: BarChart3,
        href: "/areas/billing/reports",
        status: ModuleStatus.ACTIVE
      }
    ]
  },
  {
    id: "siigo-integration",
    name: "Integración Siigo",
    description: "Configuración y gestión de integración con Siigo",
    icon: LinkIcon,
    color: AreaColor.BLUE,
    modules: [
      {
        id: "siigo-credentials",
        name: "Credenciales Siigo",
        description: "Configuración de credenciales y conexión con Siigo",
        icon: Key,
        href: "/areas/siigo-integration/credentials",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "siigo-connection-test",
        name: "Prueba de Conexión",
        description: "Verificación de conectividad con la API de Siigo",
        icon: TestTube,
        href: "/areas/siigo-integration/connection-test",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "siigo-sync",
        name: "Sincronización de Datos",
        description: "Sincronización automática de datos con Siigo",
        icon: Zap,
        href: "/areas/siigo-integration/sync",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "siigo-logs",
        name: "Logs de Integración",
        description: "Registro de actividades y errores de integración",
        icon: FileBarChart,
        href: "/areas/siigo-integration/logs",
        status: ModuleStatus.DEVELOPMENT
      },
      {
        id: "siigo-database-integration",
        name: "Integración de Bases de Datos",
        description: "Consultas y sincronización con endpoints de Siigo (warehouses, cost-centers, movements, etc.)",
        icon: Database,
        href: "/areas/siigo-integration/database-integration",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "siigo-warehouses",
        name: "Bodegas",
        description: "Gestión y sincronización de bodegas desde Siigo",
        icon: Building2,
        href: "/areas/siigo-integration/warehouses",
        status: ModuleStatus.ACTIVE
      },
      {
        id: "siigo-cost-centers",
        name: "Centros de Costo",
        description: "Gestión y sincronización de centros de costo desde Siigo",
        icon: Target,
        href: "/areas/siigo-integration/cost-centers",
        status: ModuleStatus.ACTIVE
      }
    ]
  }
]

// Helper functions following naming conventions
export const getAreaById = (id: string): AreaConfig | undefined => {
  return AREAS_CONFIG.find(area => area.id === id)
}

export const getModuleById = (areaId: string, moduleId: string): ModuleConfig | undefined => {
  const area = getAreaById(areaId)
  return area?.modules.find(module => module.id === moduleId)
}

export const getAreaByModuleHref = (href: string): AreaConfig | undefined => {
  return AREAS_CONFIG.find(area => 
    area.modules.some(module => module.href === href)
  )
}

export const getModuleByHref = (href: string): ModuleConfig | undefined => {
  for (const area of AREAS_CONFIG) {
    const module = area.modules.find(moduleItem => moduleItem.href === href)
    if (module) return module
  }
  return undefined
}

export const getAreaColorClasses = (color: AreaColor) => {
  const colorMap = {
    [AreaColor.BLUE]: {
      border: 'border-blue-200 hover:border-blue-300',
      background: 'bg-blue-100',
      text: 'text-blue-600',
      hover: 'hover:bg-blue-200'
    },
    [AreaColor.GREEN]: {
      border: 'border-green-200 hover:border-green-300',
      background: 'bg-green-100',
      text: 'text-green-600',
      hover: 'hover:bg-green-200'
    },
    [AreaColor.ORANGE]: {
      border: 'border-orange-200 hover:border-orange-300',
      background: 'bg-orange-100',
      text: 'text-orange-600',
      hover: 'hover:bg-orange-200'
    },
    [AreaColor.PURPLE]: {
      border: 'border-purple-200 hover:border-purple-300',
      background: 'bg-purple-100',
      text: 'text-purple-600',
      hover: 'hover:bg-purple-200'
    }
  }
  
  return colorMap[color]
}

export const getModuleStatusDisplayName = (status: ModuleStatus): string => {
  const statusNames = {
    [ModuleStatus.ACTIVE]: 'Activo',
    [ModuleStatus.DEVELOPMENT]: 'En Desarrollo',
    [ModuleStatus.PLANNED]: 'Planificado'
  }
  
  return statusNames[status] || 'Desconocido'
}

export const getModuleStatusBadgeClasses = (status: ModuleStatus): string => {
  const statusClasses = {
    [ModuleStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-300',
    [ModuleStatus.DEVELOPMENT]: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    [ModuleStatus.PLANNED]: 'bg-gray-100 text-gray-800 border-gray-300'
  }
  
  return statusClasses[status] || statusClasses[ModuleStatus.PLANNED]
}
