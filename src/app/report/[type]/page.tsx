"use client"

import { useParams, useRouter } from "next/navigation"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  ArrowLeft,
  FileText,
  Download,
  Calendar,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"
import { reportTypes, ReportType } from "../page"
import { cn } from "@/lib/utils"

interface Report {
  id: string
  name: string
  description: string
  status: 'available' | 'development' | 'planned' | 'pending'
  lastGenerated?: string
  frequency?: 'daily' | 'weekly' | 'monthly' | 'on-demand'
  route?: string
}

// Reportes por tipo (esto se puede expandir con datos reales)
const reportsByType: Record<ReportType, Report[]> = {
  logistics: [
    {
      id: 'log-1',
      name: 'Reporte de Inventarios',
      description: 'Estado actual de inventarios por almacén y material',
      status: 'pending',
      frequency: 'daily'
    },
    {
      id: 'log-2',
      name: 'Reporte de Viajes',
      description: 'Resumen de viajes realizados y pendientes',
      status: 'pending',
      frequency: 'daily'
    },
    {
      id: 'log-3',
      name: 'Reporte de Combustible',
      description: 'Consumo y costos de combustible por vehículo',
      status: 'pending',
      frequency: 'weekly'
    },
    {
      id: 'log-4',
      name: 'Rotación de Inventarios',
      description: 'Análisis de rotación y movimientos de materiales',
      status: 'pending',
      frequency: 'monthly'
    },
    {
      id: 'log-5',
      name: 'Reportes Flypass',
      description: 'Análisis y estadísticas de datos de peajes',
      status: 'available',
      frequency: 'on-demand',
      route: '/report/logistics/flypass'
    }
  ],
  accounting: [
    {
      id: 'acc-1',
      name: 'Balance General',
      description: 'Estado de situación financiera',
      status: 'pending',
      frequency: 'monthly'
    },
    {
      id: 'acc-2',
      name: 'Estado de Resultados',
      description: 'Ingresos, gastos y utilidades',
      status: 'pending',
      frequency: 'monthly'
    },
    {
      id: 'acc-3',
      name: 'Reporte de Conciliación',
      description: 'Conciliación bancaria y contable',
      status: 'pending',
      frequency: 'weekly'
    },
    {
      id: 'acc-4',
      name: 'Análisis de Cuentas por Pagar',
      description: 'Estado y vencimientos de cuentas por pagar',
      status: 'pending',
      frequency: 'daily'
    }
  ],
  management: [
    {
      id: 'mgmt-1',
      name: 'Dashboard Ejecutivo',
      description: 'Vista general de indicadores clave de negocio',
      status: 'available',
      frequency: 'daily',
      route: '/report/management/executive-dashboard'
    },
    {
      id: 'mgmt-2',
      name: 'Análisis de Rentabilidad',
      description: 'Rentabilidad por proyecto y cliente',
      status: 'pending',
      frequency: 'monthly'
    },
    {
      id: 'mgmt-3',
      name: 'Reporte de Productividad',
      description: 'Métricas de productividad y eficiencia operativa',
      status: 'pending',
      frequency: 'weekly'
    }
  ],
  treasury: [
    {
      id: 'tre-1',
      name: 'Flujo de Efectivo',
      description: 'Proyección y análisis de flujo de efectivo',
      status: 'pending',
      frequency: 'daily'
    },
    {
      id: 'tre-2',
      name: 'Programación de Pagos',
      description: 'Cronograma de pagos programados',
      status: 'pending',
      frequency: 'daily'
    },
    {
      id: 'tre-3',
      name: 'Análisis de Cartera',
      description: 'Estado y antigüedad de cartera de clientes',
      status: 'pending',
      frequency: 'weekly'
    },
    {
      id: 'tre-4',
      name: 'Reporte de Liquidez',
      description: 'Análisis de posición de liquidez',
      status: 'pending',
      frequency: 'monthly'
    }
  ]
}

const getStatusBadge = (status: Report['status']) => {
  const statusConfig = {
    available: {
      label: 'Disponible',
      className: 'bg-green-100 text-green-800 border-green-300',
      icon: CheckCircle
    },
    development: {
      label: 'En Desarrollo',
      className: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      icon: Clock
    },
    planned: {
      label: 'Planificado',
      className: 'bg-gray-100 text-gray-800 border-gray-300',
      icon: XCircle
    },
    pending: {
      label: 'Pendiente',
      className: 'bg-orange-100 text-orange-800 border-orange-300',
      icon: Clock
    }
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Badge className={cn("flex items-center gap-1", config.className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

const getFrequencyLabel = (frequency?: string) => {
  const labels: Record<string, string> = {
    'daily': 'Diario',
    'weekly': 'Semanal',
    'monthly': 'Mensual',
    'on-demand': 'Bajo Demanda'
  }
  return labels[frequency || 'on-demand'] || 'Bajo Demanda'
}

export default function ReportTypePage() {
  const params = useParams()
  const router = useRouter()
  const type = params.type as ReportType

  // Validar que el tipo sea válido
  const reportType = reportTypes.find(rt => rt.id === type)
  
  if (!reportType) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Tipo de Reporte No Encontrado</CardTitle>
              <CardDescription>
                El tipo de reporte seleccionado no existe
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/report')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Reportes
              </Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    )
  }

  const reports = reportsByType[type] || []
  const Icon = reportType.icon

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/report')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className={cn(
              "p-3 rounded-lg",
              reportType.bgColor,
              "border",
              reportType.borderColor
            )}>
              <Icon className={cn("h-6 w-6", reportType.textColor)} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Reportes de {reportType.name}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                {reportType.description}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Reportes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.map((report) => (
            <Card 
              key={report.id}
              className={cn(
                "transition-all duration-200",
                report.status === 'available' && "hover:shadow-lg cursor-pointer",
                report.status !== 'available' && "opacity-75"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{report.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {report.description}
                    </CardDescription>
                  </div>
                  {getStatusBadge(report.status)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.frequency && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Frecuencia: {getFrequencyLabel(report.frequency)}</span>
                    </div>
                  )}
                  {report.lastGenerated && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Clock className="h-4 w-4" />
                      <span>Última generación: {report.lastGenerated}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    {report.status === 'available' ? (
                      <>
                        <Button 
                          size="sm" 
                          className="flex-1"
                          onClick={() => {
                            if (report.route) {
                              router.push(report.route)
                            } else {
                              // Aquí se puede agregar la lógica para generar/ver el reporte
                              console.log('Generar reporte:', report.id)
                            }
                          }}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          {report.route ? 'Ver Reporte' : 'Generar'}
                        </Button>
                        {!report.route && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              // Aquí se puede agregar la lógica para descargar el reporte
                              console.log('Descargar reporte:', report.id)
                            }}
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled
                        className="flex-1"
                      >
                        {report.status === 'pending' ? 'Pendiente' : report.status === 'development' ? 'En Desarrollo' : 'Próximamente'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mensaje si no hay reportes */}
        {reports.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No hay reportes disponibles
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-4">
                Los reportes para esta área estarán disponibles próximamente.
              </p>
              <Button onClick={() => router.push('/report')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Selección
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  )
}

