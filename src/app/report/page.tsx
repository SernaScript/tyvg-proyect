"use client"

import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  BarChart3, 
  Truck,
  Calculator,
  PiggyBank,
  Briefcase
} from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

export type ReportType = 'logistics' | 'accounting' | 'management' | 'treasury'

export const reportTypes = [
  {
    id: 'logistics' as const,
    name: 'Logística',
    description: 'Reportes de inventarios, viajes, combustible y movimientos logísticos',
    icon: Truck,
    color: 'orange',
    bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    textColor: 'text-orange-600 dark:text-orange-400',
    hoverColor: 'hover:bg-orange-100 dark:hover:bg-orange-900/30'
  },
  {
    id: 'accounting' as const,
    name: 'Contabilidad',
    description: 'Reportes financieros, contables y de conciliación',
    icon: Calculator,
    color: 'blue',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    textColor: 'text-blue-600 dark:text-blue-400',
    hoverColor: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
  },
  {
    id: 'management' as const,
    name: 'Gerencia',
    description: 'Reportes ejecutivos y de gestión empresarial',
    icon: Briefcase,
    color: 'purple',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    textColor: 'text-purple-600 dark:text-purple-400',
    hoverColor: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
  },
  {
    id: 'treasury' as const,
    name: 'Tesoreria',
    description: 'Reportes de flujo de efectivo, pagos y cartera',
    icon: PiggyBank,
    color: 'green',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    textColor: 'text-green-600 dark:text-green-400',
    hoverColor: 'hover:bg-green-100 dark:hover:bg-green-900/30'
  }
]

export default function Reportes() {
  const router = useRouter()

  const handleReportTypeClick = (type: ReportType) => {
    router.push(`/report/${type}`)
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generación y análisis de reportes empresariales
            </p>
          </div>
        </div>

        {/* Selección de Tipo de Reporte */}
        <Card>
          <CardHeader>
            <CardTitle>Seleccionar Tipo de Reporte</CardTitle>
            <CardDescription>
              Elige el área de negocio para generar los reportes correspondientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {reportTypes.map((reportType) => {
                const Icon = reportType.icon
                
                return (
                  <button
                    key={reportType.id}
                    onClick={() => handleReportTypeClick(reportType.id)}
                    className={cn(
                      "p-6 rounded-lg border-2 transition-all duration-200 text-left",
                      reportType.bgColor,
                      reportType.borderColor,
                      reportType.hoverColor,
                      "hover:scale-105 cursor-pointer"
                    )}
                  >
                    <div className="flex flex-col items-start gap-4">
                      <div className={cn(
                        "p-3 rounded-lg",
                        reportType.bgColor,
                        "border",
                        reportType.borderColor
                      )}>
                        <Icon className={cn("h-6 w-6", reportType.textColor)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {reportType.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {reportType.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-2">
                        <span>Ver reportes</span>
                        <BarChart3 className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}
