# Sistema de Dashboards Basado en Roles

Este directorio contiene el sistema de dashboards personalizados según el rol del usuario en el sistema TYVG.

## Estructura

- `RoleBasedDashboard.tsx` - Componente principal que determina qué dashboard mostrar según el rol
- `SuperAdminDashboard.tsx` - Dashboard para usuarios con rol SUPER_ADMIN
- `AdminDashboard.tsx` - Dashboard para usuarios con rol ADMIN
- `AccountingDashboard.tsx` - Dashboard para usuarios con rol ACCOUNTING
- `TreasuryDashboard.tsx` - Dashboard para usuarios con rol TREASURY
- `LogisticsDashboard.tsx` - Dashboard para usuarios con rol LOGISTICS
- `BillingDashboard.tsx` - Dashboard para usuarios con rol BILLING
- `ViewerDashboard.tsx` - Dashboard para usuarios con rol VIEWER

## Características

### Super Admin Dashboard
- Acceso completo a todas las áreas
- Métricas del sistema
- Gestión de usuarios y configuración
- Estado del sistema y alertas

### Admin Dashboard
- Acceso a todas las áreas de negocio
- Métricas de procesos automatizados
- Estado de las áreas
- Tareas pendientes

### Accounting Dashboard
- Métricas específicas de contabilidad
- Módulos de contabilidad (F2X, Conciliación, Facturas, Reportes)
- Estado de procesos contables
- Tareas pendientes de contabilidad

### Treasury Dashboard
- Métricas de tesorería (pagos, montos, cartera)
- Módulos de tesorería (Pagos Aprobados, Cartera, Programación, Flujo de Efectivo)
- Estado de pagos y alertas
- Tareas pendientes de tesorería

### Logistics Dashboard
- Métricas de logística (vehículos, combustible, órdenes)
- Módulos de logística (Inventarios, Órdenes, Almacenes, Combustible, Vehículos)
- Estado de operaciones logísticas
- Tareas pendientes de logística

### Billing Dashboard
- Métricas de facturación (facturas emitidas, ingresos, clientes)
- Módulos de facturación (Emisión, Notas de Crédito, Clientes, Reportes)
- Estado de facturación
- Tareas pendientes de facturación

### Viewer Dashboard
- Acceso de solo lectura a todas las áreas
- Métricas de visualización
- Información de acceso limitado
- Enlaces a reportes y visualizaciones

## Uso

El sistema se integra automáticamente con el contexto de autenticación (`AuthContext`) y determina el dashboard apropiado basado en el rol del usuario:

```tsx
import { RoleBasedDashboard } from '@/components/dashboard'

export default function Dashboard() {
  return <RoleBasedDashboard />
}
```

## Permisos

Cada dashboard respeta los permisos del usuario:
- Solo muestra las áreas a las que el usuario tiene acceso
- Filtra los módulos según los permisos específicos
- Adapta las acciones rápidas según el rol

## Personalización

Para agregar un nuevo rol o modificar un dashboard existente:

1. Crear el componente del dashboard en este directorio
2. Agregar el caso en `RoleBasedDashboard.tsx`
3. Exportar el componente en `index.ts`
4. Actualizar la configuración de permisos en `src/types/auth.ts`
