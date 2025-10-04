"use client"

import { useParams, useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function ReconciliationSetupPage() {
  const params = useParams()
  const router = useRouter()
  
  const bank = params.bank as string
  const period = params.period as string

  // Mapeo de slugs a nombres de bancos
  const bankNames: { [key: string]: string } = {
    'banco-de-occidente': 'Banco de Occidente',
    'bancolombia': 'Bancolombia',
    'banco-davivienda': 'Banco Davivienda',
    'banco-de-bogota': 'Banco de Bogotá'
  }

  const bankName = bankNames[bank] || bank
  const formattedPeriod = new Date(period + '-01').toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long' 
  })

  const handleStartReconciliation = () => {
    // Aquí iría la lógica para iniciar la conciliación específica
    console.log(`Iniciando conciliación para ${bankName} - ${formattedPeriod}`)
    // Por ahora, redirigir de vuelta a la lista
    router.push('/areas/accounting/reconciliation')
  }

  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="reconciliation"
      actions={
        <Button 
          variant="outline" 
          onClick={() => router.push('/areas/accounting/reconciliation/new')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-green-500" />
              Configuración de Conciliación
            </CardTitle>
            <CardDescription>
              Configure los parámetros específicos para la conciliación seleccionada
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Información de la Conciliación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Detalles de la Conciliación
            </CardTitle>
            <CardDescription>
              Información de la conciliación que se va a crear
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Resumen de la selección */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Banco</p>
                    <p className="text-lg font-semibold text-blue-800">{bankName}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Calendar className="w-6 h-6 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Período</p>
                    <p className="text-lg font-semibold text-green-800">{formattedPeriod}</p>
                  </div>
                </div>
              </div>

              {/* Pasos del proceso */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Proceso de Conciliación</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium">Importar Extracto Bancario</p>
                      <p className="text-sm text-gray-600">Cargar el archivo del extracto bancario para {bankName}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium">Importar Registros Contables</p>
                      <p className="text-sm text-gray-600">Cargar los movimientos contables del período {formattedPeriod}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium">Procesar Conciliación</p>
                      <p className="text-sm text-gray-600">Ejecutar el algoritmo de conciliación automática</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">4</span>
                    </div>
                    <div>
                      <p className="font-medium">Revisar Diferencias</p>
                      <p className="text-sm text-gray-600">Analizar y resolver las diferencias encontradas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estado del proceso */}
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Estado del Proceso</span>
                </div>
                <p className="text-sm text-yellow-700">
                  La conciliación para {bankName} del período {formattedPeriod} está lista para ser configurada.
                  Haga clic en "Iniciar Conciliación" para comenzar el proceso.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  onClick={handleStartReconciliation}
                  className="flex-1 h-12"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Iniciar Conciliación
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/areas/accounting/reconciliation/new')}
                  className="flex-1 sm:flex-none h-12"
                >
                  Cambiar Parámetros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
