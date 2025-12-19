"use client"

import { ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Home } from "lucide-react"
import { 
  getAreaById, 
  getModuleById, 
  AREAS_CONFIG,
  getAreaColorClasses,
  getModuleStatusDisplayName,
  getModuleStatusBadgeClasses,
  ModuleStatus
} from "@/config/areas"
import { cn } from "@/lib/utils"

interface AreaLayoutProps {
  children: ReactNode
  areaId: string
  moduleId?: string
  title?: string
  description?: string
  actions?: ReactNode
  className?: string
  hideSidebar?: boolean
}

export function AreaLayout({
  children,
  areaId,
  moduleId,
  title,
  description,
  actions,
  className,
  hideSidebar = false
}: AreaLayoutProps) {
  const pathname = usePathname()
  const area = getAreaById(areaId)
  const module = moduleId ? getModuleById(areaId, moduleId) : undefined

  if (!area) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Área no encontrada</CardTitle>
            <CardDescription>
              El área solicitada no existe o no está disponible.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Check if the current module is in a configuration subsection
  const isConfigurationModule = area.subsections?.some(subsection => 
    subsection.id === 'configuration' && 
    subsection.modules.some(mod => 
      mod.id === moduleId || 
      mod.href === pathname ||
      pathname.startsWith(mod.href + '/')
    )
  )

  const AreaIcon = area.icon
  const ModuleIcon = module?.icon
  const colorClasses = getAreaColorClasses(area.color)

  return (
    <div className={cn("min-h-screen bg-gray-50/50", className)}>
      {/* Header */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          {/* Breadcrumb */}
          <AreaBreadcrumb area={area} module={module} />

          {/* Header Content */}
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Area/Module Icon */}
              <div className={cn(
                "p-3 rounded-xl border-2",
                colorClasses.background,
                colorClasses.border.split(' ')[0]
              )}>
                {ModuleIcon ? (
                  <ModuleIcon className={cn("h-8 w-8", colorClasses.text)} />
                ) : (
                  <AreaIcon className={cn("h-8 w-8", colorClasses.text)} />
                )}
              </div>

              {/* Title and Description */}
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {title || module?.name || area.name}
                  </h1>
                  {module?.status && (
                    <Badge 
                      variant="outline" 
                      className={getModuleStatusBadgeClasses(module.status)}
                    >
                      {getModuleStatusDisplayName(module.status)}
                    </Badge>
                  )}
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  {description || module?.description || area.description}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {actions}
              <Link href={
                isConfigurationModule 
                  ? `/areas/${area.id}/configuration`
                  : module 
                    ? `/areas/${area.id}` 
                    : "/dashboard"
              }>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  {isConfigurationModule 
                    ? "Volver a Configuraciones"
                    : module 
                      ? `Volver a ${area.name}` 
                      : "Volver al Dashboard"}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar and Content */}
      <div className="container mx-auto px-4 py-6">
        <div className={cn(
          "grid gap-6",
          hideSidebar ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-4"
        )}>
          {/* Sidebar */}
          {!hideSidebar && (
            <div className="lg:col-span-1">
              <AreaSidebar area={area} currentPath={pathname} />
            </div>
          )}

          {/* Main Content */}
          <div className={hideSidebar ? "col-span-1" : "lg:col-span-3"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

// Separate components for better organization
interface AreaBreadcrumbProps {
  area: any
  module?: any
}

function AreaBreadcrumb({ area, module }: AreaBreadcrumbProps) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard" className="hover:text-foreground transition-colors">
        Dashboard
      </Link>
      <span>/</span>
      <Link 
        href={`/areas/${area.id}`} 
        className="hover:text-foreground transition-colors"
      >
        {area.name}
      </Link>
      {module && (
        <>
          <span>/</span>
          <span className="text-foreground font-medium">{module.name}</span>
        </>
      )}
    </div>
  )
}

interface AreaSidebarProps {
  area: any
  currentPath: string
}

function AreaSidebar({ area, currentPath }: AreaSidebarProps) {
  const AreaIcon = area.icon
  
  return (
    <Card className="sticky top-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <AreaIcon className="h-5 w-5" />
          {area.name}
        </CardTitle>
        <CardDescription className="text-sm">
          Módulos disponibles
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <nav className="space-y-1">
          {area.modules.map((moduleItem: any) => {
            const ModIcon = moduleItem.icon
            const isActive = currentPath === moduleItem.href
            
            return (
              <Link key={moduleItem.id} href={moduleItem.href}>
                <div className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground",
                  moduleItem.status === ModuleStatus.PLANNED && "opacity-50 cursor-not-allowed"
                )}>
                  <ModIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{moduleItem.name}</span>
                  {moduleItem.status && moduleItem.status !== ModuleStatus.ACTIVE && (
                    <Badge 
                      variant="secondary" 
                      className="ml-auto text-xs px-1.5 py-0.5"
                    >
                      {moduleItem.status === ModuleStatus.DEVELOPMENT ? 'Dev' : 'Plan'}
                    </Badge>
                  )}
                </div>
              </Link>
            )
          })}
        </nav>
      </CardContent>
    </Card>
  )
}

// Reusable breadcrumb component
interface BreadcrumbProps {
  items: Array<{
    label: string
    href?: string
  }>
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("flex items-center space-x-2 text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && <span className="mx-2">/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-foreground transition-colors">
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
