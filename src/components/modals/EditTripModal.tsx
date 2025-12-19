'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  X, 
  Truck, 
  Save,
  AlertCircle,
  DollarSign,
  Scale,
  CheckCircle
} from 'lucide-react'
import { Trip, MeasureType } from '@/types/trip'
import { ProjectAutocomplete } from '@/components/ui/ProjectAutocomplete'
import { MaterialAutocomplete } from '@/components/ui/MaterialAutocomplete'

interface Driver {
  id: string
  name: string
  identification: string
  license: string
  isActive: boolean
}

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  isActive: boolean
}

interface Project {
  id: string
  name: string
  address?: string
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
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface EditTripModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  tripId: string
}

export function EditTripModal({ isOpen, onClose, onSuccess, tripId }: EditTripModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

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
    isApproved: false,
    observation: ''
  })

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTrip()
      fetchDrivers()
      fetchVehicles()
    }
  }, [isOpen, tripId])

  const fetchTrip = async () => {
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setTrip(data)
        
        // Set project and material from trip data
        if (data.project) {
          setSelectedProject({
            id: data.project.id,
            name: data.project.name,
            address: data.project.address,
            client: data.project.client || { id: '', name: '', identification: '' }
          })
        }
        
        if (data.material) {
          setSelectedMaterial({
            id: data.material.id,
            name: data.material.name,
            type: data.material.type,
            unitOfMeasure: data.material.unitOfMeasure,
            isActive: true
          })
        }

        setFormData({
          materialId: data.materialId || '',
          projectId: data.projectId || '',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : '',
          driverId: data.driverId || '',
          vehicleId: data.vehicleId || '',
          incomingReceiptNumber: data.incomingReceiptNumber || '',
          outcomingReceiptNumber: data.outcomingReceiptNumber || '',
          quantity: data.quantity ? data.quantity.toString() : '',
          measure: data.measure || '',
          salePrice: data.salePrice ? data.salePrice.toString() : '',
          outsourcedPrice: data.outsourcedPrice ? data.outsourcedPrice.toString() : '',
          isApproved: data.isApproved || false,
          observation: data.observation || ''
        })
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
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

  const handleInputChange = (field: string, value: string | boolean) => {
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

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a cero'
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
    
    if (!validateForm()) {
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: 'PUT',
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
          isApproved: formData.isApproved,
          observation: formData.observation || null
        }),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const errorData = await response.json()
        setErrors({ submit: errorData.message || 'Error al actualizar el viaje' })
      }
    } catch (error) {
      console.error('Error updating trip:', error)
      setErrors({ submit: 'Error de conexión' })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
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
        isApproved: false,
        observation: ''
      })
      setSelectedProject(null)
      setSelectedMaterial(null)
      setErrors({})
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Editar Viaje
            </CardTitle>
            <CardDescription>
              {trip?.incomingReceiptNumber ? `Recibo Entrada: ${trip.incomingReceiptNumber}` : 'Sin número de recibo'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {trip && trip.project && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Información del Proyecto</p>
                  <p className="text-sm text-blue-700">
                    <strong>Proyecto:</strong> {trip.project.name} • 
                    <strong> Cliente:</strong> {trip.project.client?.name || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

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
                <p className="text-sm text-red-600">{errors.date}</p>
              )}
            </div>

            {/* Driver and Vehicle Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="driverId">Conductor *</Label>
                <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar conductor" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name} - {driver.license}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.driverId && (
                  <p className="text-sm text-red-600">{errors.driverId}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehículo *</Label>
                <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange('vehicleId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.plate} - {vehicle.brand} {vehicle.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.vehicleId && (
                  <p className="text-sm text-red-600">{errors.vehicleId}</p>
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
                  type="number"
                  step="0.001"
                  min="0"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', e.target.value)}
                  placeholder="0.000"
                />
                {errors.quantity && (
                  <p className="text-sm text-red-600">{errors.quantity}</p>
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
                  <p className="text-sm text-red-600">{errors.measure}</p>
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
                  <p className="text-sm text-red-600">{errors.salePrice}</p>
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
                  <p className="text-sm text-red-600">{errors.outsourcedPrice}</p>
                )}
              </div>
            </div>

            {/* Approval Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
              <div className="space-y-0.5">
                <Label htmlFor="isApproved" className="text-base font-medium">
                  Aprobar Viaje
                </Label>
                <p className="text-sm text-muted-foreground">
                  Marca esta opción para aprobar el viaje
                </p>
              </div>
              <input
                type="checkbox"
                id="isApproved"
                checked={formData.isApproved}
                onChange={(e) => handleInputChange('isApproved', e.target.checked)}
                disabled={loading}
                className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
              />
            </div>

            {formData.isApproved && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-sm text-green-700">
                  Este viaje será marcado como aprobado al guardar
                </p>
              </div>
            )}

            {/* Observation */}
            <div className="space-y-2">
              <Label htmlFor="observation">Observaciones</Label>
              <Textarea
                id="observation"
                value={formData.observation}
                onChange={(e) => handleInputChange('observation', e.target.value)}
                placeholder="Observaciones adicionales..."
                rows={3}
              />
            </div>

            {/* Error de envío */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <p className="text-sm text-red-700">{errors.submit}</p>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
