"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, AlertCircle, CheckCircle, Scale, Truck, Package, Calendar } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { ProjectAutocomplete } from "@/components/ui/ProjectAutocomplete"
import { MaterialAutocomplete } from "@/components/ui/MaterialAutocomplete"
import { MeasureType } from "@/types/trip"

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  capacityTons?: number
  capacityM3?: number
  ownershipType: 'OWNED' | 'OUTSOURCED'
  isActive: boolean
}

interface Project {
  id: string
  name: string
  description?: string
  address?: string
  isActive: boolean
  client: {
    id: string
    name: string
    identification: string
  }
}

interface Material {
  id: string
  name: string
  type: string
  unitOfMeasure: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function CreateTripPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  const getTodayDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const [formData, setFormData] = useState({
    materialId: '',
    projectId: '',
    date: getTodayDate(),
    vehicleId: '',
    incomingReceiptNumber: '',
    outcomingReceiptNumber: '',
    quantity: '',
    measure: '' as MeasureType | '',
    observation: ''
  })

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [driverId, setDriverId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDriverId()
  }, [])

  useEffect(() => {
    if (driverId) {
      fetchVehicles()
    }
  }, [driverId])

  const fetchDriverId = async () => {
    try {
      const response = await fetch('/api/drivers/me')
      if (response.ok) {
        const driver = await response.json()
        setDriverId(driver.id)
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch(`/api/vehicles?active=true&driverId=${driverId}`)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter((v: Vehicle) => v.isActive))
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    setFormData(prev => ({ ...prev, projectId: project?.id || '' }))
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: '' }))
    }
  }

  const handleMaterialSelect = (materials: Material[]) => {
    const material = materials.length > 0 ? materials[0] : null
    setSelectedMaterial(material)
    setFormData(prev => ({ ...prev, materialId: material?.id || '' }))
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }))
    }
  }

  const normalizeDecimalInput = (value: string): string => {
    // Permitir solo números, punto y coma
    const cleaned = value.replace(/[^0-9.,]/g, '')
    
    // Convertir todas las comas a puntos
    let normalized = cleaned.replace(/,/g, '.')
    
    // Contar cuántos puntos hay
    const dotCount = (normalized.match(/\./g) || []).length
    
    // Si hay más de un punto, mantener solo el primero
    if (dotCount > 1) {
      const firstDotIndex = normalized.indexOf('.')
      normalized = normalized.substring(0, firstDotIndex + 1) + normalized.substring(firstDotIndex + 1).replace(/\./g, '')
    }
    
    // Validar formato: números opcionales, un punto opcional, números opcionales
    const numericRegex = /^[0-9]*\.?[0-9]*$/
    if (normalized === '' || numericRegex.test(normalized)) {
      return normalized
    }
    
    // Si no pasa la validación, devolver el valor anterior
    return formData.quantity
  }

  const handleInputChange = (field: string, value: string) => {
    if (field === 'quantity') {
      const normalized = normalizeDecimalInput(value)
      setFormData(prev => ({ ...prev, [field]: normalized }))
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
      return
    }

    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) setError('')
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.materialId) {
      newErrors.materialId = 'El material es requerido'
    }

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es requerido'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'El vehículo es requerido'
    }

    if (!formData.quantity || formData.quantity.trim() === '') {
      newErrors.quantity = 'La cantidad es requerida'
    } else {
      const quantityValue = parseFloat(formData.quantity)
      if (isNaN(quantityValue) || quantityValue <= 0) {
        newErrors.quantity = 'La cantidad debe ser un número mayor a cero'
      }
    }

    if (!formData.measure) {
      newErrors.measure = 'La medida es requerida'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    if (!driverId) {
      setError('No se pudo identificar al conductor')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: formData.materialId,
          projectId: formData.projectId,
          date: formData.date,
          driverId: driverId,
          vehicleId: formData.vehicleId,
          incomingReceiptNumber: formData.incomingReceiptNumber || null,
          outcomingReceiptNumber: formData.outcomingReceiptNumber || null,
          quantity: parseFloat(formData.quantity),
          measure: formData.measure,
          salePrice: 0,
          outsourcedPrice: 0,
          observation: formData.observation || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Error al crear el viaje')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/driver')
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el viaje')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
        <div className="flex items-center gap-2 p-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/driver')}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2 flex-1">
            <Plus className="h-5 w-5 text-orange-600" />
            <h1 className="text-base font-semibold">Nuevo Viaje</h1>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-3">
        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Información básica */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-0.5">
                <Label htmlFor="date" className="text-xs">Fecha *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
                {errors.date && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1 mt-0.5">
                    <AlertCircle className="h-3 w-3" />
                    {errors.date}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <ProjectAutocomplete
                  label="Proyecto *"
                  placeholder="Buscar proyecto..."
                  value={selectedProject}
                  onChange={handleProjectSelect}
                  error={errors.projectId}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Material *</Label>
                <MaterialAutocomplete
                  selectedMaterials={selectedMaterial ? [selectedMaterial] : []}
                  onMaterialsChange={handleMaterialSelect}
                  disabled={isLoading}
                  multiple={false}
                />
                {errors.materialId && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.materialId}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vehicleId" className="text-xs">Vehículo *</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(value) => handleInputChange('vehicleId', value)}
                  required
                  disabled={isLoading || vehicles.length === 0}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder={vehicles.length === 0 ? "No hay vehículos asignados" : "Selecciona un vehículo"} />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        No hay vehículos asignados a este conductor
                      </div>
                    ) : (
                      vehicles.map((vehicle) => (
                        <SelectItem key={vehicle.id} value={vehicle.id} className="text-xs">
                          <div>
                            <p className="font-medium">{vehicle.plate}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {vehicle.brand} {vehicle.model}
                              {vehicle.capacityTons && ` • ${vehicle.capacityTons}T`}
                              {vehicle.capacityM3 && ` • ${vehicle.capacityM3}m³`}
                            </p>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {vehicles.length === 0 && (
                  <p className="text-[10px] text-amber-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Este conductor no tiene vehículos asignados
                  </p>
                )}
                {errors.vehicleId && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.vehicleId}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recibos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Recibos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="incomingReceiptNumber" className="text-xs">Recibo de Entrada</Label>
                  <Input
                    id="incomingReceiptNumber"
                    value={formData.incomingReceiptNumber}
                    onChange={(e) => handleInputChange('incomingReceiptNumber', e.target.value)}
                    placeholder="Opcional"
                    disabled={isLoading}
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="outcomingReceiptNumber" className="text-xs">Recibo de Salida</Label>
                  <Input
                    id="outcomingReceiptNumber"
                    value={formData.outcomingReceiptNumber}
                    onChange={(e) => handleInputChange('outcomingReceiptNumber', e.target.value)}
                    placeholder="Opcional"
                    disabled={isLoading}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cantidad y Medida */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Cantidad y Medida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="quantity" className="text-xs">Cantidad *</Label>
                <Input
                  id="quantity"
                  type="text"
                  inputMode="decimal"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  onBlur={(e) => {
                    const value = e.target.value.trim()
                    if (value && !isNaN(parseFloat(value))) {
                      const numValue = parseFloat(value)
                      if (numValue > 0) {
                        setFormData(prev => ({ ...prev, quantity: numValue.toString() }))
                      }
                    }
                  }}
                  placeholder="0.000"
                  disabled={isLoading}
                  className="h-8 text-xs"
                />
                {errors.quantity && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.quantity}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label className="text-xs">Tipo de Unidad de Medida *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.measure === MeasureType.METROS_CUBICOS ? "default" : "outline"}
                    onClick={() => handleInputChange('measure', MeasureType.METROS_CUBICOS)}
                    className="flex-1 h-8 text-xs"
                    disabled={isLoading}
                  >
                    <Scale className="h-3 w-3 mr-1" />
                    m³
                  </Button>
                  <Button
                    type="button"
                    variant={formData.measure === MeasureType.TONELADAS ? "default" : "outline"}
                    onClick={() => handleInputChange('measure', MeasureType.TONELADAS)}
                    className="flex-1 h-8 text-xs"
                    disabled={isLoading}
                  >
                    <Scale className="h-3 w-3 mr-1" />
                    Toneladas
                  </Button>
                </div>
                {errors.measure && (
                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.measure}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Observaciones</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => handleInputChange('observation', e.target.value)}
                placeholder="Observaciones adicionales para el viaje..."
                rows={3}
                disabled={isLoading}
                className="text-xs"
              />
            </CardContent>
          </Card>

          {error && (
            <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
              <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
              <span className="text-red-800">{error}</span>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
              <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
              <span className="text-green-800">Viaje creado exitosamente</span>
            </div>
          )}

          {/* Botones fijos en la parte inferior */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 space-y-2 z-10">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/driver')}
              disabled={isLoading}
              className="w-full h-9 text-xs"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.materialId || !formData.projectId || !formData.date || !formData.vehicleId || !formData.quantity || !formData.measure}
              className="w-full h-9 text-xs bg-orange-600 hover:bg-orange-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-3 w-3 mr-1" />
                  Crear Viaje
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

