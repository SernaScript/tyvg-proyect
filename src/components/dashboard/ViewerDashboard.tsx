"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreasNavigation } from "@/components/navigation/AreasNavigation"
import Link from "next/link"
import { 
  Eye,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface ViewerDashboardProps {
  user: User
}

export function ViewerDashboard({ user }: ViewerDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Visualización
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Acceso de solo lectura al sistema TYVG
          </p>
        </div>

        {/* Viewer Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Reportes Disponibles
              </CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                Actualizados hoy
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Documentos Vistos
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo de Sesión
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4h</div>
              <p className="text-xs text-muted-foreground">
                Hoy
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Áreas Accesibles
              </CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Solo lectura
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Viewer Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Acceso Disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Contabilidad</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Solo lectura</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tesorería</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Solo lectura</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Logística</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Solo lectura</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Facturación</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Solo lectura</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Información Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Nuevos reportes disponibles</p>
                  <p className="text-muted-foreground">Contabilidad - 3 reportes</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Actualización de datos</p>
                  <p className="text-muted-foreground">Tesorería - 2 horas</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Nuevos documentos</p>
                  <p className="text-muted-foreground">Logística - 5 documentos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Reportes de facturación</p>
                  <p className="text-muted-foreground">Actualizados hoy</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Áreas Disponibles
            </h2>
            <p className="text-muted-foreground">
              Acceso de solo lectura a todas las áreas del sistema
            </p>
          </div>
          
          <AreasNavigation showDescription={false} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Acceso directo a reportes y visualizaciones
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/reports">
              <Button size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
            </Link>
            <Link href="/areas/accounting/reports">
              <Button variant="outline" size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                Reportes Contables
              </Button>
            </Link>
            <Link href="/areas/treasury/approved-payments">
              <Button variant="outline" size="lg">
                <CheckCircle className="mr-2 h-4 w-4" />
                Ver Pagos
              </Button>
            </Link>
            <Link href="/areas/logistics/fuel">
              <Button variant="outline" size="lg">
                <Eye className="mr-2 h-4 w-4" />
                Ver Combustible
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Eye className="h-5 w-5" />
              Información de Acceso
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-700">
              Como usuario con rol de visualización, tienes acceso de solo lectura a todas las áreas del sistema. 
              Puedes consultar reportes, ver datos y documentos, pero no puedes realizar modificaciones. 
              Si necesitas permisos adicionales, contacta al administrador del sistema.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
