"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AREAS_CONFIG, getAreaColorClasses, getModuleStatusBadgeClasses, getModuleStatusDisplayName, ModuleStatus } from "@/config/areas"
import { 
  Home, 
  Settings, 
  BarChart3,
  Users,
  Database,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { PermissionAction } from "@/types/auth"

const staticNavigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
]

const adminNavigation = [
  {
    name: "Reportes",
    href: "/report",
    icon: BarChart3,
  },
  {
    name: "Usuarios",
    href: "/users",
    icon: Users,
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [expandedAreas, setExpandedAreas] = useState<string[]>([])
  const { canAccessArea, canAccessModule, hasPermission, user } = useAuth()

  const toggleArea = (areaId: string) => {
    setExpandedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    )
  }

  const isAreaActive = (areaId: string) => {
    return pathname.startsWith(`/areas/${areaId}`)
  }

  const isModuleActive = (moduleHref: string) => {
    return pathname === moduleHref
  }

  // Filter areas based on user permissions
  const accessibleAreas = AREAS_CONFIG.filter(area => canAccessArea(area.id))

  // Filter admin navigation based on permissions
  const accessibleAdminNav = adminNavigation.filter(item => {
    switch (item.name) {
      case "Reportes":
        return hasPermission("reports", PermissionAction.VIEW)
      case "Usuarios":
        return hasPermission("users", PermissionAction.VIEW)
      case "Configuración":
        return hasPermission("settings", PermissionAction.VIEW)
      default:
        return false
    }
  })



  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 z-40">
      <div className="flex flex-col h-full">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Sistema TYVG
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Panel de Control
          </p>
          {user && (
            <div className="mt-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                {user.name || user.email}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.role.displayName}
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* Static Navigation */}
          {staticNavigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 text-left",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}

          {/* Separator */}
          <div className="py-2">
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Areas Navigation */}
          {accessibleAreas.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                Áreas de Negocio
              </p>
              
              {accessibleAreas.map((area) => {
              const AreaIcon = area.icon
              const isExpanded = expandedAreas.includes(area.id)
              const isActive = isAreaActive(area.id)

              return (
                <div key={area.id}>
                  {/* Area Header */}
                  <div className="flex items-center">
                    <Link href={`/areas/${area.id}`} className="flex-1">
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-start gap-2 text-left pr-1",
                          isActive && "bg-primary text-primary-foreground"
                        )}
                      >
                        <AreaIcon className={cn("h-4 w-4", !isActive && getAreaColorClasses(area.color).text)} />
                        <span className="flex-1 truncate">{area.name}</span>
                      </Button>
                    </Link>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-transparent"
                      onClick={() => toggleArea(area.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </Button>
                  </div>

                  {/* Area Modules */}
                  {isExpanded && (
                    <div className="ml-6 mt-1 space-y-1">
                      {area.modules
                        .filter(module => canAccessModule(area.id, module.id))
                        .map((module) => {
                        const ModuleIcon = module.icon
                        const isModActive = isModuleActive(module.href)

                        return (
                          <Link key={module.id} href={module.href}>
                            <Button
                              variant={isModActive ? "default" : "ghost"}
                              size="sm"
                              disabled={module.status === ModuleStatus.PLANNED}
                              className={cn(
                                "w-full justify-start gap-2 text-left text-sm h-8",
                                isModActive && "bg-primary text-primary-foreground",
                                module.status === ModuleStatus.PLANNED && "opacity-50 cursor-not-allowed"
                              )}
                            >
                              <ModuleIcon className="h-3 w-3" />
                              <span className="flex-1 truncate">{module.name}</span>
                              {module.status && module.status !== ModuleStatus.ACTIVE && (
                                <Badge 
                                  variant="secondary" 
                                  className={cn("ml-auto text-xs px-1.5 py-0.5", getModuleStatusBadgeClasses(module.status))}
                                >
                                  {module.status === ModuleStatus.DEVELOPMENT ? 'Dev' : 'Plan'}
                                </Badge>
                              )}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
            </div>
          )}

          {/* Separator - only show if there are admin items */}
          {accessibleAdminNav.length > 0 && (
            <div className="py-2">
              <div className="border-t border-gray-200 dark:border-gray-700"></div>
            </div>
          )}

          {/* Admin Navigation */}
          {accessibleAdminNav.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-2 py-1">
                Administración
              </p>
              {accessibleAdminNav.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2 text-left",
                    isActive && "bg-primary text-primary-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
            </div>
          )}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Card className="p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Versión 1.0.0
            </p>
          </Card>
        </div>
      </div>
    </div>
  )
}
