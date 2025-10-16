'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  X, 
  Truck, 
  User, 
  MapPin, 
  Calendar, 
  Clock, 
  Package, 
  FileText, 
  Weight,
  AlertCircle,
  CheckCircle,
  DollarSign,
  Camera,
  History
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
  createdAt: Date
  updatedAt: Date
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
  driver: {
    id: string
    name: string
    identification: string
    license: string
    phone?: string
    email?: string
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
    capacityTons: number
    capacityM3: number
    ownershipType: string
  }
  materials?: Array<{
    id: string
    quantity: number
    material: {
      id: string
      name: string
      type: string
      unitOfMeasure: string
    }
  }>
  evidences?: Array<{
    id: string
    type: string
    fileUrl?: string
    description?: string
    createdAt: Date
  }>
  expenses?: Array<{
    id: string
    type: string
    amount: number
    description?: string
    createdAt: Date
  }>
  audits?: Array<{
    id: string
    action: string
    details?: string
    createdAt: Date
    user: {
      id: string
      name: string
    }
  }>
}

interface ViewTripModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
}

export function ViewTripModal({ isOpen, onClose, tripId }: ViewTripModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTrip()
    }
  }, [isOpen, tripId])

  const fetchTrip = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/trips/${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setTrip(data)
      } else {
        console.error('Error fetching trip')
      }
    } catch (error) {
      console.error('Error fetching trip:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-100 text-blue-800'
      case 'LOADING': return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT': return 'bg-orange-100 text-orange-800'
      case 'DELIVERED': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-emerald-100 text-emerald-800'
      case 'INVOICED': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'Programado'
      case 'LOADING': return 'Cargando'
      case 'IN_TRANSIT': return 'En Tránsito'
      case 'DELIVERED': return 'Entregado'
      case 'COMPLETED': return 'Completado'
      case 'INVOICED': return 'Facturado'
      default: return status
    }
  }

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

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-muted-foreground">Cargando detalles del viaje...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Error</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-muted-foreground">No se pudo cargar la información del viaje</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-blue-600" />
              Detalles del Viaje
            </CardTitle>
            <CardDescription>
              {trip.waybillNumber ? `Guía: ${trip.waybillNumber}` : 'Sin número de guía'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Estado y Prioridad */}
          <div className="flex items-center gap-4">
            <Badge className={`${getStatusColor(trip.status)} text-sm px-3 py-1`}>
              {getStatusText(trip.status)}
            </Badge>
            <Badge className={`${getPriorityColor(trip.tripRequest.priority)} text-sm px-3 py-1`}>
              {getPriorityText(trip.tripRequest.priority)}
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del Proyecto */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Información del Proyecto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proyecto</p>
                  <p className="font-semibold">{trip.tripRequest.project.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{trip.tripRequest.project.client.name}</p>
                  <p className="text-sm text-muted-foreground">
                    ID: {trip.tripRequest.project.client.identification}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Información del Conductor y Vehículo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Conductor y Vehículo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Conductor</p>
                  <p className="font-semibold">{trip.driver.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Licencia: {trip.driver.license}
                  </p>
                  {trip.driver.phone && (
                    <p className="text-sm text-muted-foreground">
                      Tel: {trip.driver.phone}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p className="font-semibold">{trip.vehicle.plate}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.vehicle.brand} {trip.vehicle.model}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Capacidad: {trip.vehicle.capacityTons} ton / {trip.vehicle.capacityM3} m³
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fechas y Horarios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fechas y Horarios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Programado</p>
                  <p className="font-semibold">{formatDate(trip.scheduledDate)}</p>
                </div>
                {trip.actualStartDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Inicio Real</p>
                    <p className="font-semibold">{formatDate(trip.actualStartDate)}</p>
                  </div>
                )}
                {trip.actualEndDate && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Finalización Real</p>
                    <p className="font-semibold">{formatDate(trip.actualEndDate)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Materiales */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                Materiales a Transportar
              </CardTitle>
            </CardHeader>
            <CardContent>
              {trip.tripRequest.materials && trip.tripRequest.materials.length > 0 ? (
                <div className="space-y-3">
                  {trip.tripRequest.materials.map((material) => (
                    <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{material.material.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {material.material.type} • {material.material.unitOfMeasure}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{material.quantity}</p>
                        <p className="text-sm text-muted-foreground">{material.material.unitOfMeasure}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay materiales asignados</p>
              )}
            </CardContent>
          </Card>

          {/* Peso Certificado */}
          {trip.certifiedWeight && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Peso Certificado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{trip.certifiedWeight} toneladas</p>
              </CardContent>
            </Card>
          )}

          {/* Observaciones */}
          {trip.observations && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{trip.observations}</p>
              </CardContent>
            </Card>
          )}

          {/* Evidencias */}
          {trip.evidences && trip.evidences.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Camera className="h-4 w-4" />
                  Evidencias ({trip.evidences.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trip.evidences.map((evidence) => (
                    <div key={evidence.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{evidence.type}</p>
                          {evidence.description && (
                            <p className="text-sm text-muted-foreground">{evidence.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDate(evidence.createdAt)}
                          </p>
                        </div>
                        {evidence.fileUrl && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={evidence.fileUrl} target="_blank" rel="noopener noreferrer">
                              Ver Archivo
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gastos */}
          {trip.expenses && trip.expenses.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Gastos ({trip.expenses.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trip.expenses.map((expense) => (
                    <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{expense.type}</p>
                        {expense.description && (
                          <p className="text-sm text-muted-foreground">{expense.description}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDate(expense.createdAt)}
                        </p>
                      </div>
                      <p className="font-semibold text-lg">${expense.amount.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historial de Auditoría */}
          {trip.audits && trip.audits.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Historial de Cambios
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trip.audits.map((audit) => (
                    <div key={audit.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold">{audit.action}</p>
                          {audit.details && (
                            <p className="text-sm text-muted-foreground">{audit.details}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            Por: {audit.user.name} • {formatDate(audit.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
