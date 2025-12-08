"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AREAS_CONFIG } from "@/config/areas"
import { useAuth } from "@/contexts/AuthContext"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getAreaColorClasses, getModuleStatusBadgeClasses, getModuleStatusDisplayName, ModuleStatus } from "@/config/areas"
import { cn } from "@/lib/utils"

export default function LogisticsConfigurationPage() {
    const pathname = usePathname()
    const { canAccessModule } = useAuth()
    const area = AREAS_CONFIG.find(areaItem => areaItem.id === 'logistics')
    const configurationSubsection = area?.subsections?.find(sub => sub.id === 'configuration')

    if (!area || !configurationSubsection) {
        return null
    }

    const colorClasses = getAreaColorClasses(area.color)

    return (
        <AreaLayout areaId="logistics" moduleId="configuration">
            <div className="space-y-6">
                {/* Configuration Section */}
                <Card>
                    <CardHeader>
                        <CardTitle>Configuración de Logística</CardTitle>
                        <CardDescription>
                            Administra las configuraciones y parámetros del sistema de logística
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {configurationSubsection.modules.map((module) => {
                                const ModuleIcon = module.icon
                                const canAccess = canAccessModule(area.id, module.id)

                                if (!canAccess) return null

                                const isActive = pathname === module.href

                                return (
                                    <Link key={module.id} href={module.href}>
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
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AreaLayout>
    )
}

