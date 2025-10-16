"use client"

import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Database,
  Building2,
  Target
} from "lucide-react"

export default function SiigoIntegrationPage() {
  const router = useRouter()

  return (
    <AreaLayout
      areaId="siigo-integration"
      title="Integración Siigo"
      description="Configuración y gestión de integración con Siigo"
    >
      <div className="space-y-8">

        {/* Modules Navigation */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Integración
            </h2>
            <p className="text-muted-foreground">
              Gestiona la configuración y monitoreo de la integración con Siigo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/database-integration')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Integración de Bases de Datos</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Consultas y sincronización con endpoints de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/warehouses')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Bodegas</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Gestión y sincronización de bodegas desde Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/cost-centers')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Centros de Costo</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Gestión y sincronización de centros de costo desde Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>


      </div>
    </AreaLayout>
  )
}

