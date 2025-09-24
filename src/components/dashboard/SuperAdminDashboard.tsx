"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AreasNavigation } from "@/components/navigation/AreasNavigation"
import Link from "next/link"
import { 
  Zap,
  Shield,
  Clock,
  TrendingUp,
  Users,
  Settings,
  Database,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Link as LinkIcon
} from "lucide-react"

interface SuperAdminDashboardProps {
  user: User
}

export function SuperAdminDashboard({ user }: SuperAdminDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Super Administrador
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Control total del sistema TYVG
          </p>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Usuarios Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +3 desde la semana pasada
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Procesos Automatizados
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                +12% este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Ahorrado
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,240h</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Disponibilidad
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">99.9%</div>
              <p className="text-xs text-muted-foreground">
                Uptime del sistema
              </p>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Base de Datos</span>
                  <span className="text-green-600 font-medium">Operativa</span>
                </div>
                <div className="flex justify-between">
                  <span>API Siigo</span>
                  <span className="text-green-600 font-medium">Conectada</span>
                </div>
                <div className="flex justify-between">
                  <span>Integración Siigo</span>
                  <span className="text-green-600 font-medium">Activa</span>
                </div>
                <div className="flex justify-between">
                  <span>Scraping</span>
                  <span className="text-green-600 font-medium">Activo</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                Alertas Recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">Error de conexión Siigo</p>
                  <p className="text-muted-foreground">Hace 2 horas</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Alto uso de CPU</p>
                  <p className="text-muted-foreground">Hace 4 horas</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-sm">
                  <p className="font-medium">156 facturas procesadas</p>
                  <p className="text-muted-foreground">Últimas 24h</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">3 usuarios nuevos</p>
                  <p className="text-muted-foreground">Esta semana</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Todas las Áreas del Sistema
            </h2>
            <p className="text-muted-foreground">
              Acceso completo a todos los módulos organizados por área
            </p>
          </div>
          
          <AreasNavigation showDescription={false} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones de Administración</CardTitle>
            <CardDescription>
              Herramientas de gestión y configuración del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/users">
              <Button size="lg">
                <Users className="mr-2 h-4 w-4" />
                Gestión de Usuarios
              </Button>
            </Link>
            <Link href="/settings">
              <Button variant="outline" size="lg">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </Button>
            </Link>
            <Link href="/database">
              <Button variant="outline" size="lg">
                <Database className="mr-2 h-4 w-4" />
                Base de Datos
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reportes del Sistema
              </Button>
            </Link>
            <Link href="/areas/siigo-integration">
              <Button variant="outline" size="lg">
                <LinkIcon className="mr-2 h-4 w-4" />
                Integración Siigo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
