'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  X, 
  Calendar, 
  User, 
  Truck, 
  Package, 
  MapPin,
  Clock,
  AlertCircle,
  CheckCircle,
  Search
} from 'lucide-react'
import { ProjectAutocomplete } from '@/components/ui/ProjectAutocomplete'
import { MaterialAutocomplete } from '@/components/ui/MaterialAutocomplete'

interface TripRequest {
  id: string
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  observations?: string
  project: {
    id: string
    name: string
    address?: string
    client: {
      id: string
      name: string
      identification: string
    }
  }
  materials: Array<{
    id: string
    quantity: number
    material: {
      id: string
      name: string
      type: string
      unitOfMeasure: string
    }
  }>
}

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
  ownershipType: 'OWNED' | 'RENTED' | 'PROVIDED'
  isActive: boolean
}

interface Project {
  id: string
  name: string
  description?: string
  location?: string
  status: string
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
    projectId: '',
    driverId: '',
    vehicleId: '',
    waybillNumber: '',
    scheduledDate: '',
    certifiedWeight: '',
    observations: ''
  })

  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([])
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
    setSelectedMaterials(materials)
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

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es requerido'
    }

    if (!formData.driverId) {
      newErrors.driverId = 'El conductor es requerido'
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'El vehículo es requerido'
    }

    if (!formData.scheduledDate) {
      newErrors.scheduledDate = 'La fecha programada es requerida'
    } else {
      const scheduledDate = new Date(formData.scheduledDate)
      const now = new Date()
      if (scheduledDate < now) {
        newErrors.scheduledDate = 'La fecha programada no puede ser en el pasado'
      }
    }

    if (formData.certifiedWeight && parseFloat(formData.certifiedWeight) <= 0) {
      newErrors.certifiedWeight = 'El peso certificado debe ser mayor a 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    try {
      // Primero crear la solicitud de viaje
      const tripRequestResponse = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: formData.projectId,
          priority: 'MEDIUM',
          materials: selectedMaterials.map(material => ({
            materialId: material.id,
            quantity: 1 // Cantidad por defecto, se puede ajustar después
          })),
          observations: formData.observations
        }),
      })

      if (!tripRequestResponse.ok) {
        const errorData = await tripRequestResponse.json()
        setErrors({ submit: errorData.message || 'Error al crear la solicitud de viaje' })
        return
      }

      const tripRequest = await tripRequestResponse.json()

      // Luego crear el viaje
      const tripResponse = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tripRequestId: tripRequest.id,
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          waybillNumber: formData.waybillNumber || null,
          scheduledDate: formData.scheduledDate,
          certifiedWeight: formData.certifiedWeight ? parseFloat(formData.certifiedWeight) : null,
          observations: formData.observations
        }),
      })

      if (tripResponse.ok) {
        onSuccess()
        resetForm()
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
      projectId: '',
      driverId: '',
      vehicleId: '',
      waybillNumber: '',
      scheduledDate: '',
      certifiedWeight: '',
      observations: ''
    })
    setSelectedProject(null)
    setSelectedMaterials([])
    setErrors({})
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const selectedDriver = drivers.find(d => d.id === formData.driverId)
  const selectedVehicle = vehicles.find(v => v.id === formData.vehicleId)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800'
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800'
      case 'HIGH': return 'bg-orange-100 text-orange-800'
      case 'URGENT': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'Baja'
      case 'MEDIUM': return 'Media'
      case 'HIGH': return 'Alta'
      case 'URGENT': return 'Urgente'
      default: return priority
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleClose}>
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle>Programar Viaje</CardTitle>
            <CardDescription>
              Crea un nuevo viaje basado en una solicitud existente
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
              <Label>Materiales a Transportar</Label>
              <div className="space-y-3">
                {selectedMaterials.length > 0 ? (
                  <div className="space-y-2">
                    {selectedMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                        <div>
                          <p className="font-semibold">{material.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {material.type} • {material.unitOfMeasure}
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedMaterials(selectedMaterials.filter(m => m.id !== material.id))}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                    <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-muted-foreground">No hay materiales seleccionados</p>
                  </div>
                )}
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {}}
                  className="w-full"
                >
                  <Search className="h-4 w-4 mr-2" />
                  {selectedMaterials.length > 0 ? 'Agregar Más Materiales' : 'Seleccionar Materiales'}
                </Button>
              </div>
            </div>

            {/* Selected Project Details */}
            {selectedProject && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Detalles de la Solicitud</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Proyecto</Label>
                      <p className="font-medium">{selectedProject.name}</p>
                      {selectedProject.location && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3" />
                          <span>{selectedProject.location}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                      <p className="font-medium">{selectedProject.client.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Doc: {selectedProject.client.identification}
                      </p>
                    </div>
                  </div>

                  {selectedProject.description && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Descripción</Label>
                      <p className="text-sm mt-1">{selectedProject.description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

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

            {/* Selected Driver and Vehicle Details */}
            {(selectedDriver || selectedVehicle) && (
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Asignación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedDriver && (
                      <div className="flex items-center gap-3 p-3 bg-background rounded border">
                        <User className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{selectedDriver.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Lic: {selectedDriver.license} • Doc: {selectedDriver.identification}
                          </p>
                          {selectedDriver.phone && (
                            <p className="text-sm text-muted-foreground">Tel: {selectedDriver.phone}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {selectedVehicle && (
                      <div className="flex items-center gap-3 p-3 bg-background rounded border">
                        <Truck className="h-8 w-8 text-primary" />
                        <div>
                          <p className="font-medium">{selectedVehicle.plate}</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedVehicle.brand} {selectedVehicle.model}
                          </p>
                          <div className="flex gap-2 text-sm text-muted-foreground">
                            {selectedVehicle.capacityTons && (
                              <span>{selectedVehicle.capacityTons}T</span>
                            )}
                            {selectedVehicle.capacityM3 && (
                              <span>{selectedVehicle.capacityM3}m³</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Trip Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="waybillNumber">Número de Guía</Label>
                <Input
                  id="waybillNumber"
                  value={formData.waybillNumber}
                  onChange={(e) => handleInputChange('waybillNumber', e.target.value)}
                  placeholder="Opcional - se puede asignar después"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduledDate">Fecha Programada *</Label>
                <Input
                  id="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={(e) => handleInputChange('scheduledDate', e.target.value)}
                />
                {errors.scheduledDate && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {errors.scheduledDate}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifiedWeight">Peso Certificado (kg)</Label>
              <Input
                id="certifiedWeight"
                type="number"
                step="0.001"
                value={formData.certifiedWeight}
                onChange={(e) => handleInputChange('certifiedWeight', e.target.value)}
                placeholder="Opcional - se puede registrar después"
              />
              {errors.certifiedWeight && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.certifiedWeight}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                value={formData.observations}
                onChange={(e) => handleInputChange('observations', e.target.value)}
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
                disabled={loading || !formData.projectId || !formData.driverId || !formData.vehicleId || !formData.scheduledDate}
              >
                {loading ? 'Programando...' : 'Programar Viaje'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

    </div>
  )
}
