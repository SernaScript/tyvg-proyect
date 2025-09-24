# Sidebar con Permisos Basados en Roles

El componente `Sidebar` ahora está completamente integrado con el sistema de permisos basado en roles. Esto significa que cada usuario verá solo las áreas y módulos a los que tiene acceso según su rol.

## Características Implementadas

### 🔐 **Filtrado por Permisos**
- **Áreas de Negocio**: Solo se muestran las áreas a las que el usuario tiene acceso
- **Módulos**: Solo se muestran los módulos específicos dentro de cada área
- **Administración**: Solo se muestran las opciones administrativas permitidas

### 👤 **Información del Usuario**
- Muestra el nombre del usuario y su rol en el header
- Identificación visual clara del nivel de acceso

### 🎯 **Navegación Inteligente**
- Secciones se ocultan automáticamente si no hay elementos accesibles
- Separadores solo aparecen cuando hay contenido que mostrar

## Ejemplos por Rol

### Super Admin
```
Sistema TYVG
Panel de Control
┌─────────────────┐
│ Juan Pérez      │
│ Super Admin     │
└─────────────────┘

Dashboard

ÁREAS DE NEGOCIO
├ Contabilidad
├ Tesorería  
├ Logística
├ Facturación
└ Integración Siigo

ADMINISTRACIÓN
├ Reportes
├ Users
├ Base de Datos
└ Settings
```

### Contabilidad
```
Sistema TYVG
Panel de Control
┌─────────────────┐
│ María García    │
│ Contabilidad    │
└─────────────────┘

Dashboard

ÁREAS DE NEGOCIO
├ Contabilidad
├ Tesorería (solo lectura)
└ Facturación (solo lectura)

ADMINISTRACIÓN
└ Reportes
```

### Tesorería
```
Sistema TYVG
Panel de Control
┌─────────────────┐
│ Carlos López    │
│ Tesorería       │
└─────────────────┘

Dashboard

ÁREAS DE NEGOCIO
├ Contabilidad (solo lectura)
├ Tesorería
└ Facturación (solo lectura)

ADMINISTRACIÓN
└ Reportes
```

### Visualizador
```
Sistema TYVG
Panel de Control
┌─────────────────┐
│ Ana Martínez    │
│ Visualizador    │
└─────────────────┘

Dashboard

ÁREAS DE NEGOCIO
├ Contabilidad (solo lectura)
├ Tesorería (solo lectura)
├ Logística (solo lectura)
└ Facturación (solo lectura)

ADMINISTRACIÓN
└ Reportes
```

## Permisos por Sección

### Áreas de Negocio
- **Contabilidad**: `accounting:VIEW` o superior
- **Tesorería**: `treasury:VIEW` o superior  
- **Logística**: `logistics:VIEW` o superior
- **Facturación**: `billing:VIEW` o superior
- **Integración Siigo**: `siigo:VIEW` o superior

### Administración
- **Reportes**: `reports:VIEW`
- **Users**: `users:VIEW`
- **Base de Datos**: `database:VIEW`
- **Settings**: `settings:VIEW`

## Implementación Técnica

```tsx
// Filtrado de áreas accesibles
const accessibleAreas = AREAS_CONFIG.filter(area => canAccessArea(area.id))

// Filtrado de módulos accesibles
area.modules.filter(module => canAccessModule(area.id, module.id))

// Filtrado de navegación administrativa
const accessibleAdminNav = adminNavigation.filter(item => {
  switch (item.name) {
    case "Reportes":
      return hasPermission("reports", PermissionAction.VIEW)
    // ... otros casos
  }
})
```

## Beneficios

1. **Seguridad**: Los usuarios no pueden ver ni acceder a áreas no autorizadas
2. **UX Mejorada**: Interfaz más limpia y enfocada en las tareas del usuario
3. **Escalabilidad**: Fácil agregar nuevos roles y permisos
4. **Mantenibilidad**: Permisos centralizados y consistentes
