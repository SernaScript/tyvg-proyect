"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Truck,
  Package,
  ClipboardList,
  Building2,
  Fuel,
  Car,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingUp
} from "lucide-react"

interface LogisticsDashboardProps {
  user: User
}

export function LogisticsDashboard({ user }: LogisticsDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Panel de Logística
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bienvenido, {user.name || user.email}. Gestión de inventarios y cadena de suministro
          </p>
        </div>

        {/* Logistics Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vehículos Activos
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                +2 este mes
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Combustible Consumido
              </CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,247L</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Órdenes de Compra
              </CardTitle>
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">89</div>
              <p className="text-xs text-muted-foreground">
                +12 esta semana
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
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Entregas a tiempo
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Logistics Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Estado de Operaciones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Control de Inventarios</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">En desarrollo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Órdenes de Compra</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-yellow-600 font-medium">En desarrollo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Gestión de Almacenes</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-600 font-medium">Planificado</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Combustible</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 font-medium">Activo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Vehículos</span>
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
                Alertas y Tareas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Mantenimiento vehículo ABC-123</p>
                  <p className="text-muted-foreground">Vence en 5 días</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Actualizar inventario</p>
                  <p className="text-muted-foreground">Almacén Principal - 15 items</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Revisar órdenes pendientes</p>
                  <p className="text-muted-foreground">8 órdenes sin confirmar</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Reporte de combustible</p>
                  <p className="text-muted-foreground">Generar mensualmente</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logistics Modules */}
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Logística
            </h2>
            <p className="text-muted-foreground">
              Herramientas especializadas para gestión logística
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/inventory">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Control de Inventarios
                  </CardTitle>
                  <CardDescription>
                    Gestión y control de inventarios en tiempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>En desarrollo</p>
                    <p>15 items pendientes</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/purchase-orders">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ClipboardList className="h-5 w-5 text-green-600" />
                    Órdenes de Compra
                  </CardTitle>
                  <CardDescription>
                    Gestión de órdenes de compra y proveedores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>89 órdenes activas</p>
                    <p>8 pendientes</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/warehouses">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    Gestión de Almacenes
                  </CardTitle>
                  <CardDescription>
                    Control de almacenes y ubicaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Planificado</p>
                    <p>Próximamente</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/fuel">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Fuel className="h-5 w-5 text-orange-600" />
                    Combustible
                  </CardTitle>
                  <CardDescription>
                    Gestión de consumo y costos de combustible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>1,247L consumidos</p>
                    <p>24 vehículos</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/vehicles">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-indigo-600" />
                    Vehículos
                  </CardTitle>
                  <CardDescription>
                    Gestión de flota vehicular y mantenimiento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>24 vehículos activos</p>
                    <p>1 mantenimiento pendiente</p>
                  </div>
                </CardContent>
              </Link>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/areas/logistics/reports">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-red-600" />
                    Reportes de Logística
                  </CardTitle>
                  <CardDescription>
                    Reportes de movimientos y rotación de inventarios
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>En desarrollo</p>
                    <p>Próximamente</p>
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
            <Link href="/areas/logistics/fuel">
              <Button size="lg">
                <Fuel className="mr-2 h-4 w-4" />
                Gestión de Combustible
              </Button>
            </Link>
            <Link href="/areas/logistics/vehicles">
              <Button variant="outline" size="lg">
                <Car className="mr-2 h-4 w-4" />
                Gestionar Vehículos
              </Button>
            </Link>
            <Link href="/areas/logistics/purchase-orders">
              <Button variant="outline" size="lg">
                <ClipboardList className="mr-2 h-4 w-4" />
                Órdenes de Compra
              </Button>
            </Link>
            <Link href="/areas/logistics/inventory">
              <Button variant="outline" size="lg">
                <Package className="mr-2 h-4 w-4" />
                Control de Inventarios
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
