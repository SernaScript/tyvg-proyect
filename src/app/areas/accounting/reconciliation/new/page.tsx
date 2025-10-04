"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Plus,
  Building2,
  Calendar,
  ChevronRight
} from "lucide-react"

export default function NewReconciliationPage() {
  const router = useRouter()
  const [selectedBank, setSelectedBank] = useState("")
  const [selectedPeriod, setSelectedPeriod] = useState("")

  const handleBankChange = (bank: string) => {
    setSelectedBank(bank)
  }

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period)
  }

  const handleContinue = () => {
    if (selectedBank && selectedPeriod) {
      // Redirigir a la página específica del banco y período
      if (selectedBank === 'bancolombia') {
        router.push(`/areas/accounting/reconciliation/new/bancolombia/${selectedPeriod}`)
      } else {
        // Para otros bancos, usar la ruta genérica
        const bankSlug = selectedBank.toLowerCase().replace(/\s+/g, '-')
        router.push(`/areas/accounting/reconciliation/new/${bankSlug}/${selectedPeriod}`)
      }
    }
  }

  const isFormValid = selectedBank && selectedPeriod

  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="reconciliation"
      actions={
        <Button 
          variant="outline" 
          onClick={() => router.push('/areas/accounting/reconciliation')}
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
              <Plus className="h-5 w-5 text-green-500" />
              Nueva Conciliación
            </CardTitle>
            <CardDescription>
              Seleccione el banco y el período para iniciar el proceso de conciliación
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Selección de Banco y Período */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Configuración Inicial
            </CardTitle>
            <CardDescription>
              Elija el banco y el período que desea conciliar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="bank" className="text-base font-medium">
                    <Building2 className="inline w-4 h-4 mr-2" />
                    Banco *
                  </Label>
                  <Select 
                    value={selectedBank} 
                    onValueChange={handleBankChange}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banco-de-occidente">Banco de Occidente</SelectItem>
                      <SelectItem value="bancolombia">Bancolombia</SelectItem>
                      <SelectItem value="banco-davivienda">Banco Davivienda</SelectItem>
                      <SelectItem value="banco-de-bogota">Banco de Bogotá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="period" className="text-base font-medium">
                    <Calendar className="inline w-4 h-4 mr-2" />
                    Período *
                  </Label>
                  <Input 
                    id="period" 
                    type="month"
                    value={selectedPeriod}
                    onChange={(e) => handlePeriodChange(e.target.value)}
                    className="h-12"
                    required
                  />
                </div>
              </div>
              
              {/* Información de la selección */}
              {selectedBank && selectedPeriod && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-blue-800">
                      <Building2 className="w-4 h-4" />
                      <span className="font-medium">
                        {selectedBank === 'banco-de-occidente' && 'Banco de Occidente'}
                        {selectedBank === 'bancolombia' && 'Bancolombia'}
                        {selectedBank === 'banco-davivienda' && 'Banco Davivienda'}
                        {selectedBank === 'banco-de-bogota' && 'Banco de Bogotá'}
                      </span>
                      <span className="text-blue-600">•</span>
                      <Calendar className="w-4 h-4" />
                      <span className="font-medium">
                        {new Date(selectedPeriod + '-01').toLocaleDateString('es-CO', { 
                          year: 'numeric', 
                          month: 'long' 
                        })}
                      </span>
                    </div>
                    <p className="text-sm text-blue-600 mt-2">
                      Procederá a configurar la conciliación para esta entidad y período.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button 
                  onClick={handleContinue}
                  disabled={!isFormValid}
                  className="flex-1 h-12"
                >
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Continuar
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/areas/accounting/reconciliation')}
                  className="flex-1 sm:flex-none h-12"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
