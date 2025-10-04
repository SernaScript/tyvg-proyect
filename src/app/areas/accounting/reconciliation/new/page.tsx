"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { 
  ArrowLeft,
  Plus,
  FileText,
  Building2
} from "lucide-react"

export default function NewReconciliationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    bank: "",
    account: "",
    accountType: "",
    period: "",
    description: ""
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Aquí iría la lógica para crear la conciliación
    console.log("Creando conciliación:", formData)
    // Redirigir de vuelta a la lista de conciliaciones
    router.push('/areas/accounting/reconciliation')
  }

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
              Crear Nueva Conciliación
            </CardTitle>
            <CardDescription>
              Configure los parámetros para realizar una nueva conciliación bancaria
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Formulario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Información de la Conciliación
            </CardTitle>
            <CardDescription>
              Complete los datos requeridos para iniciar el proceso de conciliación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label htmlFor="bank">Banco *</Label>
                  <Select 
                    value={formData.bank} 
                    onValueChange={(value) => handleInputChange('bank', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="occidente">Banco de Occidente</SelectItem>
                      <SelectItem value="bancolombia">Bancolombia</SelectItem>
                      <SelectItem value="davivienda">Banco Davivienda</SelectItem>
                      <SelectItem value="bogota">Banco de Bogotá</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="account">Número de Cuenta *</Label>
                  <Input 
                    id="account" 
                    placeholder="Ingrese el número de cuenta"
                    value={formData.account}
                    onChange={(e) => handleInputChange('account', e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="accountType">Tipo de Cuenta *</Label>
                  <Select 
                    value={formData.accountType} 
                    onValueChange={(value) => handleInputChange('accountType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="current">Cuenta Corriente</SelectItem>
                      <SelectItem value="savings">Cuenta de Ahorros</SelectItem>
                      <SelectItem value="credit">Tarjeta de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label htmlFor="period">Período de Conciliación *</Label>
                  <Input 
                    id="period" 
                    type="month"
                    value={formData.period}
                    onChange={(e) => handleInputChange('period', e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="description">Descripción (Opcional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Agregue una descripción para esta conciliación..."
                  rows={5}
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Iniciar Conciliación
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push('/areas/accounting/reconciliation')}
                  className="flex-1 sm:flex-none"
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
