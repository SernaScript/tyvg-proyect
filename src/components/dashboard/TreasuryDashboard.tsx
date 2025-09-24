"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  PiggyBank,
  CreditCard,
  Users,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  BarChart3
} from "lucide-react"

interface TreasuryDashboardProps {
  user: User
}

export function TreasuryDashboard({ user }: TreasuryDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Tesorería
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Administración de flujo de efectivo y pagos
          </p>
        </div>

        {/* Treasury Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagos Aprobados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">47</div>
              <p className="text-xs text-muted-foreground">
                +12 esta semana
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Monto Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$2.4M</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Cartera Pendiente
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">23</div>
              <p className="text-xs text-muted-foreground">
                Clientes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Eficiencia
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">96%</div>
              <p className="text-xs text-muted-foreground">
                Pagos procesados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Treasury Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Pagos Aprobados</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">47 activos</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Programación de Pagos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">12 pendientes</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Flujo de Efectivo</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Estable</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conciliación Bancaria</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-blue-600 font-medium">En proceso</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-orange-600" />
                Alertas y Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Pago vence mañana</p>
                  <p className="text-muted-foreground">Proveedor ABC - $45,000</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Conciliación pendiente</p>
                  <p className="text-muted-foreground">Banco Principal - 3 días</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Revisar cartera vencida</p>
                  <p className="text-muted-foreground">5 clientes - $120,000</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Proyección de flujo</p>
                  <p className="text-muted-foreground">Actualizar semanalmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Treasury Modules */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Tesorería
            </h2>
            <p className="text-muted-foreground">
              Herramientas especializadas para gestión de tesorería
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/treasury/approved-payments">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Pagos Aprobados
                  </CardTitle>
                  <CardDescription>
                    Gestión y seguimiento de pagos aprobados
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>47 pagos activos</p>
                    <p>$2.4M en total</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/treasury/portfolio">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Gestión de Cartera
                  </CardTitle>
                  <CardDescription>
                    Control y seguimiento de cartera de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>23 clientes pendientes</p>
                    <p>$120,000 vencidos</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/treasury/payment-scheduling">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-purple-600" />
                    Programación de Pagos
                  </CardTitle>
                  <CardDescription>
                    Planificación y programación de pagos a proveedores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>12 pagos programados</p>
                    <p>1 vence mañana</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/treasury/cash-flow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-orange-600" />
                    Flujo de Efectivo
                  </CardTitle>
                  <CardDescription>
                    Proyección y control del flujo de efectivo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Proyección estable</p>
                    <p>Actualizar semanalmente</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/treasury/bank-reconciliation">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                    Conciliación Bancaria
                  </CardTitle>
                  <CardDescription>
                    Conciliación de movimientos bancarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>En proceso</p>
                    <p>3 días pendientes</p>
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
            <Link href="/areas/treasury/approved-payments">
              <Button size="lg">
                <CheckCircle className="mr-2 h-4 w-4" />
                Ver Pagos Aprobados
              </Button>
            </Link>
            <Link href="/areas/treasury/portfolio">
              <Button variant="outline" size="lg">
                <Users className="mr-2 h-4 w-4" />
                Gestionar Cartera
              </Button>
            </Link>
            <Link href="/areas/treasury/payment-scheduling">
              <Button variant="outline" size="lg">
                <Calendar className="mr-2 h-4 w-4" />
                Programar Pagos
              </Button>
            </Link>
            <Link href="/areas/treasury/bank-reconciliation">
              <Button variant="outline" size="lg">
                <CreditCard className="mr-2 h-4 w-4" />
                Conciliar Bancos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
