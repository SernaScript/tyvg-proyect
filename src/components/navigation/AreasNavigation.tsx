"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AREAS_CONFIG, 
  type AreaConfig, 
  type ModuleConfig,
  type ModuleSubsection,
  getAreaColorClasses,
  getModuleStatusDisplayName,
  getModuleStatusBadgeClasses,
  ModuleStatus
} from "@/config/areas"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Settings } from "lucide-react"

interface AreasNavigationProps {
  className?: string
  showDescription?: boolean
  compactMode?: boolean
}

export function AreasNavigation({ 
  className, 
  showDescription = true, 
  compactMode = false 
}: AreasNavigationProps) {
  const pathname = usePathname()
  const { canAccessArea } = useAuth()

  // Filter areas based on user permissions
  const accessibleAreas = AREAS_CONFIG.filter(area => canAccessArea(area.id))

  if (compactMode) {
    return (
      <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
        {accessibleAreas.map((area) => {
          const Icon = area.icon
          const colorClasses = getAreaColorClasses(area.color)
          
          return (
            <Link key={area.id} href={`/areas/${area.id}`}>
              <Card className={cn(
                "hover:shadow-md transition-all cursor-pointer h-full",
                colorClasses.border
              )}>
                <CardContent className="p-4 text-center">
                  <Icon className={cn("h-8 w-8 mx-auto mb-2", colorClasses.text)} />
                  <h3 className="font-semibold text-sm">{area.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    {area.modules.length} módulos
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn("space-y-8", className)}>
      {accessibleAreas.map((area) => {
        const Icon = area.icon
        const colorClasses = getAreaColorClasses(area.color)
        
        return (
          <div key={area.id} className="space-y-4">
            {/* Area Header */}
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg border",
                colorClasses.border
              )}>
                <Icon className={cn("h-6 w-6", colorClasses.text)} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {area.name}
                </h2>
                {showDescription && (
                  <p className="text-muted-foreground">{area.description}</p>
                )}
              </div>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {area.modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  areaColor={area.color}
                  isActive={pathname === module.href}
                  areaId={area.id}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Separate component for better organization
interface ModuleCardProps {
  module: ModuleConfig
  areaColor: string
  isActive: boolean
  areaId: string
}

function ModuleCard({ module, areaColor, isActive, areaId }: ModuleCardProps) {
  const ModuleIcon = module.icon
  const colorClasses = getAreaColorClasses(areaColor as any)
  const { canAccessModule } = useAuth()
  
  // Check if user can access this specific module
  const canAccess = canAccessModule(areaId, module.id)
  
  if (!canAccess) {
    return null // Don't render modules the user can't access
  }
  
  return (
    <Link href={module.href}>
      <Card className={cn(
        "hover:shadow-lg transition-all cursor-pointer h-full",
        isActive && "ring-2 ring-blue-500 ring-offset-2",
        colorClasses.border
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <ModuleIcon className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base">{module.name}</CardTitle>
            </div>
            {module.status && (
              <Badge 
                variant="outline" 
                className={cn("text-xs", getModuleStatusBadgeClasses(module.status))}
              >
                {getModuleStatusDisplayName(module.status)}
              </Badge>
            )}
          </div>
          <CardDescription className="text-sm">
            {module.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <Button 
            variant={isActive ? "default" : "outline"} 
            size="sm" 
            className="w-full"
            disabled={module.status === ModuleStatus.PLANNED}
          >
            {module.status === ModuleStatus.PLANNED ? 'Próximamente' : 'Acceder'}
          </Button>
        </CardContent>
      </Card>
    </Link>
  )
}

// Component to show only modules from a specific area
interface AreaModulesProps {
  areaId: string
  className?: string
}

export function AreaModules({ areaId, className }: AreaModulesProps) {
  const area = AREAS_CONFIG.find(areaItem => areaItem.id === areaId)
  const pathname = usePathname()
  const { canAccessArea, canAccessModule } = useAuth()
  
  if (!area || !canAccessArea(areaId)) return null

  return (
    <div className={cn("space-y-6", className)}>
      {/* Regular modules */}
      {area.modules.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {area.modules.map((module) => (
            <ModuleCard
              key={module.id}
              module={module}
              areaColor={area.color}
              isActive={pathname === module.href}
              areaId={area.id}
            />
          ))}
        </div>
      )}

      {/* Subsections - Show as single configuration card */}
      {area.subsections?.map((subsection) => {
        const hasAccessibleModules = subsection.modules.some(module => canAccessModule(area.id, module.id))
        
        if (!hasAccessibleModules) return null

        const configurationPath = `/areas/${area.id}/configuration`
        const isConfigActive = pathname === configurationPath || pathname.startsWith(configurationPath + '/')

        return (
          <Link key={subsection.id} href={configurationPath}>
            <Card className={cn(
              "hover:shadow-lg transition-all cursor-pointer h-full",
              isConfigActive && "ring-2 ring-blue-500 ring-offset-2",
              getAreaColorClasses(area.color).border
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">{subsection.name}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-sm">
                  Configuración y administración del sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant={isConfigActive ? "default" : "outline"} 
                  size="sm" 
                  className="w-full"
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
