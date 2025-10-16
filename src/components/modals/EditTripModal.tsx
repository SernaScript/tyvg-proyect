'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  Truck, 
  Save,
  AlertCircle
} from 'lucide-react'

interface Trip {
  id: string
  waybillNumber?: string
  scheduledDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  status: string
  certifiedWeight?: number
  observations?: string
  tripRequest: {
    id: string
    priority: string
    project: {
      id: string
      name: string
      client: {
        id: string
        name: string
        identification: string
      }
    }
  }
  driver: {
    id: string
    name: string
    identification: string
    license: string
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
  }
}

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
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState({
    driverId: '',
    vehicleId: '',
    waybillNumber: '',
    scheduledDate: '',
    actualStartDate: '',
    actualEndDate: '',
    status: '',
    certifiedWeight: '',
    observations: ''
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
        setFormData({
          driverId: data.driverId,
          vehicleId: data.vehicleId,
          waybillNumber: data.waybillNumber || '',
          scheduledDate: data.scheduledDate ? new Date(data.scheduledDate).toISOString().slice(0, 16) : '',
          actualStartDate: data.actualStartDate ? new Date(data.actualStartDate).toISOString().slice(0, 16) : '',
          actualEndDate: data.actualEndDate ? new Date(data.actualEndDate).toISOString().slice(0, 16) : '',
          status: data.status,
          certifiedWeight: data.certifiedWeight ? data.certifiedWeight.toString() : '',
          observations: data.observations || ''
        })
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
    }
  }

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?isActive=true')
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
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.driverId) {
      newErrors.driverId = 'El conductor es requerido'
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'El vehículo es requerido'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha programada es requerida'
    }

    if (formData.certifiedWeight && (isNaN(parseFloat(formData.certifiedWeight)) || parseFloat(formData.certifiedWeight) <= 0)) {
      newErrors.certifiedWeight = 'El peso certificado debe ser mayor a 0'
    }

    if (formData.actualStartDate && formData.actualEndDate) {
      const startDate = new Date(formData.actualStartDate)
      const endDate = new Date(formData.actualEndDate)
      if (endDate < startDate) {
        newErrors.actualEndDate = 'La fecha de finalización no puede ser anterior a la fecha de inicio'
      }
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
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          waybillNumber: formData.waybillNumber || null,
          scheduledDate: formData.scheduledDate,
          actualStartDate: formData.actualStartDate || null,
          actualEndDate: formData.actualEndDate || null,
          status: formData.status,
          certifiedWeight: formData.certifiedWeight ? parseFloat(formData.certifiedWeight) : null,
          observations: formData.observations || null
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
        driverId: '',
        vehicleId: '',
        waybillNumber: '',
        scheduledDate: '',
        actualStartDate: '',
        actualEndDate: '',
        status: '',
        certifiedWeight: '',
        observations: ''
      })
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
              {trip?.waybillNumber ? `Guía: ${trip.waybillNumber}` : 'Sin número de guía'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} disabled={loading}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {trip && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Información del Proyecto</p>
                  <p className="text-sm text-blue-700">
                    <strong>Proyecto:</strong> {trip.tripRequest.project.name} • 
                    <strong> Cliente:</strong> {trip.tripRequest.project.client.name}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Conductor */}
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

              {/* Vehículo */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Número de Guía */}
              <div className="space-y-2">
                <Label htmlFor="waybillNumber">Número de Guía</Label>
                <Input
                  id="waybillNumber"
                  value={formData.waybillNumber}
                  onChange={(e) => handleInputChange('waybillNumber', e.target.value)}
                  placeholder="Opcional"
                />
              </div>

              {/* Estado */}
              <div className="space-y-2">
                <Label htmlFor="status">Estado *</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SCHEDULED">Programado</SelectItem>
                    <SelectItem value="LOADING">Cargando</SelectItem>
                    <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                    <SelectItem value="COMPLETED">Completado</SelectItem>
                    <SelectItem value="INVOICED">Facturado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Fecha Programada */}
              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Fecha Programada *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-600">{errors.scheduledDate}</p>
                )}
              </div>

              {/* Fecha de Inicio Real */}
              <div className="space-y-2">
                <Label htmlFor="actualStartDate">Fecha de Inicio Real</Label>
                <Input
                  id="actualStartDate"
                  type="datetime-local"
                  value={formData.actualStartDate}
                  onChange={(e) => handleInputChange('actualStartDate', e.target.value)}
                />
              </div>

              {/* Fecha de Finalización Real */}
              <div className="space-y-2">
                <Label htmlFor="actualEndDate">Fecha de Finalización Real</Label>
                <Input
                  id="actualEndDate"
                  type="datetime-local"
                  value={formData.actualEndDate}
                  onChange={(e) => handleInputChange('actualEndDate', e.target.value)}
                />
                {errors.actualEndDate && (
                  <p className="text-sm text-red-600">{errors.actualEndDate}</p>
                )}
              </div>
            </div>

            {/* Peso Certificado */}
            <div className="space-y-2">
              <Label htmlFor="certifiedWeight">Peso Certificado (toneladas)</Label>
              <Input
                id="certifiedWeight"
                type="number"
                step="0.01"
                min="0"
                value={formData.certifiedWeight}
                onChange={(e) => handleInputChange('certifiedWeight', e.target.value)}
                placeholder="Opcional"
              />
              {errors.certifiedWeight && (
                <p className="text-sm text-red-600">{errors.certifiedWeight}</p>
              )}
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
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
