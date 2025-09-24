"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Calculator,
  FileText,
  Building2,
  BarChart3,
  Zap,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Receipt
} from "lucide-react"

interface AccountingDashboardProps {
  user: User
}

export function AccountingDashboard({ user }: AccountingDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Contabilidad
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Gestión contable y financiera
          </p>
        </div>

        {/* Accounting Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Facturas Procesadas
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247</div>
              <p className="text-xs text-muted-foreground">
                +156 este mes
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
              <div className="text-2xl font-bold">89h</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Procesos F2X
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">324</div>
              <p className="text-xs text-muted-foreground">
                Automatizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Precisión
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">98.7%</div>
              <p className="text-xs text-muted-foreground">
                Sin errores
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Accounting Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado de Procesos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Automatización F2X</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conciliación Bancaria</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">En Proceso</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Facturas Electrónicas</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Reportes Contables</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Disponible</span>
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
                  <p className="font-medium">Revisar facturas pendientes</p>
                  <p className="text-muted-foreground">23 documentos</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Conciliar movimientos bancarios</p>
                  <p className="text-muted-foreground">5 transacciones</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Generar reporte mensual</p>
                  <p className="text-muted-foreground">Vence en 3 días</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Validar datos F2X</p>
                  <p className="text-muted-foreground">12 registros</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Accounting Modules */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Contabilidad
            </h2>
            <p className="text-muted-foreground">
              Herramientas especializadas para gestión contable
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/accounting/automatizacion-f2x">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-blue-600" />
                    Automatización F2X
                  </CardTitle>
                  <CardDescription>
                    Procesamiento automático de documentos F2X
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>324 procesos completados</p>
                    <p>98.7% de precisión</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/accounting/reconciliation">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-green-600" />
                    Conciliación Bancaria
                  </CardTitle>
                  <CardDescription>
                    Conciliación automática de cuentas bancarias
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>5 transacciones pendientes</p>
                    <p>En proceso</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/accounting/electronic-invoices">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Receipt className="h-5 w-5 text-purple-600" />
                    Facturas Electrónicas
                  </CardTitle>
                  <CardDescription>
                    Gestión y procesamiento de facturas electrónicas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>1,247 facturas procesadas</p>
                    <p>Activo</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/accounting/reports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-orange-600" />
                    Reportes Contables
                  </CardTitle>
                  <CardDescription>
                    Generación de reportes financieros y contables
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Reporte mensual pendiente</p>
                    <p>Vence en 3 días</p>
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
            <Link href="/areas/accounting/automatizacion-f2x">
              <Button size="lg">
                <Zap className="mr-2 h-4 w-4" />
                Procesar F2X
              </Button>
            </Link>
            <Link href="/areas/accounting/reconciliation">
              <Button variant="outline" size="lg">
                <Building2 className="mr-2 h-4 w-4" />
                Conciliar Bancos
              </Button>
            </Link>
            <Link href="/areas/accounting/electronic-invoices">
              <Button variant="outline" size="lg">
                <Receipt className="mr-2 h-4 w-4" />
                Facturas Electrónicas
              </Button>
            </Link>
            <Link href="/areas/accounting/reports">
              <Button variant="outline" size="lg">
                <BarChart3 className="mr-2 h-4 w-4" />
                Generar Reportes
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
