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
  BarChart3,
  CheckCircle,
  AlertCircle
} from "lucide-react"

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Administrador
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Gestión administrativa del sistema TYVG
          </p>
        </div>

        {/* Business Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Procesos Automatizados
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +8% desde el mes pasado
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
              <div className="text-2xl font-bold">420h</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Áreas Activas
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">
                Contabilidad, Tesorería, Logística, Facturación
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eficiencia
              </CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">94%</div>
              <p className="text-xs text-muted-foreground">
                Procesos completados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Business Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado de las Áreas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Contabilidad</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Operativa</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Tesorería</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Operativa</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Logística</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">Mantenimiento</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Facturación</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Operativa</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Tareas Pendientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Revisar pagos pendientes</p>
                  <p className="text-muted-foreground">Tesorería - 12 elementos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Conciliar movimientos bancarios</p>
                  <p className="text-muted-foreground">Contabilidad - 5 elementos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Actualizar inventarios</p>
                  <p className="text-muted-foreground">Logística - 8 elementos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Áreas de Negocio
            </h2>
            <p className="text-muted-foreground">
              Acceso a todos los módulos organizados por área
            </p>
          </div>
          
          <AreasNavigation showDescription={false} />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Acceso directo a las funciones más utilizadas
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Link href="/areas/accounting/flypass-data">
              <Button size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Datos de Flypass
              </Button>
            </Link>
            <Link href="/areas/treasury/approved-payments">
              <Button variant="outline" size="lg">
                <CheckCircle className="mr-2 h-4 w-4" />
                Pagos Aprobados
              </Button>
            </Link>
            <Link href="/areas/logistics/fuel">
              <Button variant="outline" size="lg">
                <TrendingUp className="mr-2 h-4 w-4" />
                Gestión de Combustible
              </Button>
            </Link>
            <Link href="/reports">
              <Button variant="outline" size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
