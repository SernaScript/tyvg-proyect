'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  X,
  Calendar,
  User,
  Truck,
  Package,
  AlertCircle,
  DollarSign,
  Scale
} from 'lucide-react'
import { ProjectAutocomplete } from '@/components/ui/ProjectAutocomplete'
import { MaterialAutocomplete } from '@/components/ui/MaterialAutocomplete'
import { MeasureType } from '@/types/trip'

interface Driver {
  id: string
  name: string
  identification: string
  license: string
  phone?: string
  email?: string
  isActive: boolean
}

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

interface CreateTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateTripModal({ isOpen, onClose, onSuccess }: CreateTripModalProps) {
  const [formData, setFormData] = useState({
    materialId: '',
    projectId: '',
    date: '',
    driverId: '',
    vehicleId: '',
    incomingReceiptNumber: '',
    outcomingReceiptNumber: '',
    quantity: '',
    measure: '' as MeasureType | '',
    salePrice: '',
    outsourcedPrice: '',
    observation: ''
  })

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen) {
      fetchDrivers()
      fetchVehicles()
    }
  }, [isOpen])

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    setFormData(prev => ({ ...prev, projectId: project?.id || '' }))
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: '' }))
    }
  }

  const handleMaterialSelect = (materials: Material[]) => {
    // Only take the first material since we now have a single material per trip
    const material = materials.length > 0 ? materials[0] : null
    setSelectedMaterial(material)
    setFormData(prev => ({ ...prev, materialId: material?.id || '' }))
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }))
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?active=true')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Special handling for quantity field - only allow numbers and decimal point
    if (field === 'quantity') {
      // Allow empty string, numbers, and a single decimal point
      const numericRegex = /^[0-9]*\.?[0-9]*$/
      if (value === '' || numericRegex.test(value)) {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }))
        }
      }
      return
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
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

    if (!formData.driverId) {
      newErrors.driverId = 'El conductor es requerido'
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

    if (formData.salePrice && parseFloat(formData.salePrice) < 0) {
      newErrors.salePrice = 'El precio de venta no puede ser negativo'
    }

    if (formData.outsourcedPrice && parseFloat(formData.outsourcedPrice) < 0) {
      newErrors.outsourcedPrice = 'El precio tercerizado no puede ser negativo'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          materialId: formData.materialId,
          projectId: formData.projectId,
          date: formData.date,
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          incomingReceiptNumber: formData.incomingReceiptNumber || null,
          outcomingReceiptNumber: formData.outcomingReceiptNumber || null,
          quantity: parseFloat(formData.quantity),
          measure: formData.measure,
          salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
          outsourcedPrice: formData.outsourcedPrice ? parseFloat(formData.outsourcedPrice) : 0,
          observation: formData.observation || null
        }),
      })

      if (tripResponse.ok) {
        onSuccess()
        resetForm()
        onClose()
      } else {
        const errorData = await tripResponse.json()
        setErrors({ submit: errorData.message || 'Error al crear el viaje' })
      }
    } catch (error) {
      console.error('Error creating trip:', error)
      setErrors({ submit: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      materialId: '',
      projectId: '',
      date: '',
      driverId: '',
      vehicleId: '',
      incomingReceiptNumber: '',
      outcomingReceiptNumber: '',
      quantity: '',
      measure: '',
      salePrice: '',
      outsourcedPrice: '',
      observation: ''
    })
    setSelectedProject(null)
    setSelectedMaterial(null)
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedDriver = drivers.find(d => d.id === formData.driverId)
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Crear Viaje</CardTitle>
            <CardDescription>
              Crea un nuevo viaje con todos los detalles necesarios
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Selection */}
            <ProjectAutocomplete
              label="Proyecto"
              placeholder="Buscar proyecto..."
              value={selectedProject}
              onChange={handleProjectSelect}
              error={errors.projectId}
              disabled={loading}
              required
            />

            {/* Material Selection */}
            <div className="space-y-2">
              <Label>Material *</Label>
              <MaterialAutocomplete
                selectedMaterials={selectedMaterial ? [selectedMaterial] : []}
                onMaterialsChange={handleMaterialSelect}
                disabled={loading}
                multiple={false}
              />
              {errors.materialId && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.materialId}
                </p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
              />
              {errors.date && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.date}
                </p>
              )}
            </div>

            {/* Driver and Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="driverId">Conductor *</Label>
                <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        <div>
                          <p className="font-medium">{driver.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Lic: {driver.license} • Doc: {driver.identification}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.driverId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.driverId}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehículo *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange('vehicleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div>
                          <p className="font-medium">{vehicle.plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {vehicle.brand} {vehicle.model}
                            {vehicle.capacityTons && ` • ${vehicle.capacityTons}T`}
                            {vehicle.capacityM3 && ` • ${vehicle.capacityM3}m³`}
                          </p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.vehicleId}
                  </p>
                )}
              </div>
            </div>

            {/* Receipt Numbers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="incomingReceiptNumber">Número de Recibo de Entrada</Label>
                <Input
                  id="incomingReceiptNumber"
                  value={formData.incomingReceiptNumber}
                  onChange={(e) => handleInputChange('incomingReceiptNumber', e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="outcomingReceiptNumber">Número de Recibo de Salida</Label>
                <Input
                  id="outcomingReceiptNumber"
                  value={formData.outcomingReceiptNumber}
                  onChange={(e) => handleInputChange('outcomingReceiptNumber', e.target.value)}
                  placeholder="Opcional"
                />
              </div>
            </div>

            {/* Quantity and Measure */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Cantidad *</Label>
                  <Input
                    id="quantity"
                    type="text"
                    inputMode="decimal"
                    value={formData.quantity}
                    onChange={(e) => handleInputChange('quantity', e.target.value)}
                    onBlur={(e) => {
                      // Format the value on blur to ensure proper decimal format
                      const value = e.target.value.trim()
                      if (value && !isNaN(parseFloat(value))) {
                        const numValue = parseFloat(value)
                        if (numValue > 0) {
                          setFormData(prev => ({ ...prev, quantity: numValue.toString() }))
                        }
                      }
                    }}
                    placeholder="0.000"
                  />
                  {errors.quantity && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {errors.quantity}
                    </p>
                  )}
                </div>

              <div className="space-y-2">
                <Label htmlFor="measure">Medida *</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={formData.measure === MeasureType.METROS_CUBICOS ? "default" : "outline"}
                    onClick={() => handleInputChange('measure', MeasureType.METROS_CUBICOS)}
                    className="flex-1"
                    disabled={loading}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Metros Cúbicos
                  </Button>
                  <Button
                    type="button"
                    variant={formData.measure === MeasureType.TONELADAS ? "default" : "outline"}
                    onClick={() => handleInputChange('measure', MeasureType.TONELADAS)}
                    className="flex-1"
                    disabled={loading}
                  >
                    <Scale className="h-4 w-4 mr-2" />
                    Toneladas
                  </Button>
                </div>
                {errors.measure && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.measure}
                  </p>
                )}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="salePrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.salePrice}
                    onChange={(e) => handleInputChange('salePrice', e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
                {errors.salePrice && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.salePrice}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="outsourcedPrice">Precio Tercerizado</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="outsourcedPrice"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.outsourcedPrice}
                    onChange={(e) => handleInputChange('outsourcedPrice', e.target.value)}
                    placeholder="0.00"
                    className="pl-9"
                  />
                </div>
                {errors.outsourcedPrice && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.outsourcedPrice}
                  </p>
                )}
              </div>
            </div>

            {/* Observation */}
            <div className="space-y-2">
              <Label htmlFor="observation">Observaciones</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => handleInputChange('observation', e.target.value)}
                placeholder="Observaciones adicionales para el viaje..."
                rows={3}
              />
            </div>

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.submit}
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={loading || !formData.materialId || !formData.projectId || !formData.date || !formData.driverId || !formData.vehicleId || !formData.quantity || !formData.measure}
              >
                {loading ? 'Creando...' : 'Crear Viaje'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
