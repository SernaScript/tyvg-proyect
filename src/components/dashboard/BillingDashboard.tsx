"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  FileText,
  Receipt,
  Users,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  CreditCard
} from "lucide-react"

interface BillingDashboardProps {
  user: User
}

export function BillingDashboard({ user }: BillingDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Facturación
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Emisión y gestión de facturación electrónica
          </p>
        </div>

        {/* Billing Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Facturas Emitidas
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">
                +45 este mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ingresos Totales
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$1.8M</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Activos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +5 nuevos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Tiempo Promedio
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.3min</div>
              <p className="text-xs text-muted-foreground">
                Por factura
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Billing Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Emisión de Facturas</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">En desarrollo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Notas de Crédito</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">En desarrollo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Gestión de Clientes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reportes de Facturación</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Activo</span>
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
                  <p className="font-medium">Procesar facturas pendientes</p>
                  <p className="text-muted-foreground">12 documentos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Actualizar datos de clientes</p>
                  <p className="text-muted-foreground">5 clientes</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Generar reporte mensual</p>
                  <p className="text-muted-foreground">Vence en 2 días</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Revisar notas de crédito</p>
                  <p className="text-muted-foreground">3 pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Billing Modules */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Facturación
            </h2>
            <p className="text-muted-foreground">
              Herramientas especializadas para gestión de facturación
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/billing/invoice-generation">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-blue-600" />
                    Emisión de Facturas
                  </CardTitle>
                  <CardDescription>
                    Creación y emisión de facturas electrónicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>En desarrollo</p>
                    <p>12 pendientes</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/billing/credit-notes">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-green-600" />
                    Notas de Crédito
                  </CardTitle>
                  <CardDescription>
                    Gestión de notas de crédito y débito
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>En desarrollo</p>
                    <p>3 pendientes</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/billing/customers">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-purple-600" />
                    Gestión de Clientes
                  </CardTitle>
                  <CardDescription>
                    Administración de información de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>89 clientes activos</p>
                    <p>5 actualizaciones</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/billing/reports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Reportes de Facturación
                  </CardTitle>
                  <CardDescription>
                    Análisis de ventas y facturación
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>324 facturas emitidas</p>
                    <p>$1.8M en ingresos</p>
                  </div>
                </CardContent>
              </Link>
            </Card>
          </div>
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
            <Link href="/areas/billing/customers">
              <Button size="lg">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Clientes
              </Button>
            </Link>
            <Link href="/areas/billing/reports">
              <Button variant="outline" size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Ver Reportes
              </Button>
            </Link>
            <Link href="/areas/billing/invoice-generation">
              <Button variant="outline" size="lg">
                <FileText className="mr-2 h-4 w-4" />
                Emitir Facturas
              </Button>
            </Link>
            <Link href="/areas/billing/credit-notes">
              <Button variant="outline" size="lg">
                <Receipt className="mr-2 h-4 w-4" />
                Notas de Crédito
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
