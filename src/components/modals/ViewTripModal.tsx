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
  Package, 
  FileText, 
  AlertCircle,
  CheckCircle,
  DollarSign,
  Camera,
  History,
  Scale,
  Receipt
} from 'lucide-react'
import { Trip, MeasureType } from '@/types/trip'

interface ViewTripModalProps {
  isOpen: boolean
  onClose: () => void
  tripId: string
}

export function ViewTripModal({ isOpen, onClose, tripId }: ViewTripModalProps) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [loading, setLoading] = useState(false)
  const [evidences, setEvidences] = useState<any[]>([])

  useEffect(() => {
    if (isOpen && tripId) {
      fetchTrip()
      fetchEvidences()
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

  const fetchEvidences = async () => {
    try {
      const response = await fetch(`/api/trip-evidence?tripId=${tripId}`)
      if (response.ok) {
        const data = await response.json()
        setEvidences(data)
      }
    } catch (error) {
      console.error('Error fetching evidences:', error)
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatDateTime = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getMeasureText = (measure: MeasureType) => {
    switch (measure) {
      case MeasureType.METROS_CUBICOS:
        return 'Metros Cúbicos (m³)'
      case MeasureType.TONELADAS:
        return 'Toneladas (T)'
      default:
        return measure
    }
  }

  const handleDeleteEvidence = async (evidenceId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta evidencia?')) {
      return
    }

    try {
      const response = await fetch(`/api/trip-evidence/${evidenceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchEvidences()
        if (trip) {
          fetchTrip() // Refresh trip to update evidences count
        }
      } else {
        alert('Error al eliminar la evidencia')
      }
    } catch (error) {
      console.error('Error deleting evidence:', error)
      alert('Error de conexión')
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
              {trip.incomingReceiptNumber ? `Recibo Entrada: ${trip.incomingReceiptNumber}` : 'Sin número de recibo'}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Approval Status */}
          <div className="flex items-center gap-4">
            {trip.isApproved ? (
              <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                <CheckCircle className="h-3 w-3 mr-1" />
                Aprobado
                {trip.approvedAt && (
                  <span className="ml-2">• {formatDateTime(trip.approvedAt)}</span>
                )}
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-800 text-sm px-3 py-1">
                <AlertCircle className="h-3 w-3 mr-1" />
                Pendiente de Aprobación
              </Badge>
            )}
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
                  <p className="font-semibold">{trip.project?.name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cliente</p>
                  <p className="font-semibold">{trip.project?.client?.name || 'N/A'}</p>
                  {trip.project?.client?.identification && (
                    <p className="text-sm text-muted-foreground">
                      ID: {trip.project.client.identification}
                    </p>
                  )}
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
                  <p className="font-semibold">{trip.driver?.name || 'N/A'}</p>
                  {trip.driver?.license && (
                    <p className="text-sm text-muted-foreground">
                      Licencia: {trip.driver.license}
                    </p>
                  )}
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Vehículo</p>
                  <p className="font-semibold">{trip.vehicle?.plate || 'N/A'}</p>
                  {trip.vehicle && (
                    <>
                      <p className="text-sm text-muted-foreground">
                        {trip.vehicle.brand} {trip.vehicle.model}
                      </p>
                      {(trip.vehicle.capacityTons || trip.vehicle.capacityM3) && (
                        <p className="text-sm text-muted-foreground">
                          Capacidad: {trip.vehicle.capacityTons ? `${trip.vehicle.capacityTons}T` : ''}
                          {trip.vehicle.capacityTons && trip.vehicle.capacityM3 && ' / '}
                          {trip.vehicle.capacityM3 ? `${trip.vehicle.capacityM3}m³` : ''}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Material y Cantidad */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-4 w-4" />
                Material y Cantidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Material</p>
                  <p className="font-semibold">{trip.material?.name || 'N/A'}</p>
                  {trip.material && (
                    <p className="text-sm text-muted-foreground">
                      {trip.material.type} • {trip.material.unitOfMeasure}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Cantidad</p>
                  <p className="font-semibold text-lg">{trip.quantity}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Medida</p>
                  <p className="font-semibold">{getMeasureText(trip.measure)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fecha */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Fecha del Viaje
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-lg">{formatDate(trip.date)}</p>
            </CardContent>
          </Card>

          {/* Recibos */}
          {(trip.incomingReceiptNumber || trip.outcomingReceiptNumber) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="h-4 w-4" />
                  Números de Recibo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trip.incomingReceiptNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recibo de Entrada</p>
                      <p className="font-semibold">{trip.incomingReceiptNumber}</p>
                    </div>
                  )}
                  {trip.outcomingReceiptNumber && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Recibo de Salida</p>
                      <p className="font-semibold">{trip.outcomingReceiptNumber}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Precios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Precios
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio de Venta</p>
                  <p className="font-semibold text-lg">{formatCurrency(trip.salePrice)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Precio Tercerizado</p>
                  <p className="font-semibold text-lg">{formatCurrency(trip.outsourcedPrice)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {trip.observation && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{trip.observation}</p>
              </CardContent>
            </Card>
          )}

          {/* Evidencias */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Camera className="h-4 w-4" />
                Evidencias ({evidences.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {evidences.length > 0 ? (
                <div className="space-y-3">
                  {evidences.map((evidence) => (
                    <div key={evidence.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {evidence.description && (
                            <p className="font-semibold mb-1">{evidence.description}</p>
                          )}
                          <p className="text-xs text-muted-foreground">
                            {formatDateTime(evidence.dateTime)}
                            {evidence.uploadedByUser && (
                              <span> • Por: {evidence.uploadedByUser.name}</span>
                            )}
                          </p>
                          {evidence.latitude && evidence.longitude && (
                            <p className="text-xs text-muted-foreground mt-1">
                              📍 {evidence.latitude}, {evidence.longitude}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {evidence.photoUrl && (
                            <Button size="sm" variant="outline" asChild>
                              <a href={evidence.photoUrl} target="_blank" rel="noopener noreferrer">
                                Ver Foto
                              </a>
                            </Button>
                          )}
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => handleDeleteEvidence(evidence.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  No hay evidencias registradas para este viaje
                </p>
              )}
            </CardContent>
          </Card>

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
                          <p className="text-xs text-muted-foreground">
                            Por: {audit.user?.name || 'N/A'} • {formatDateTime(audit.createdAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información de Creación */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="h-4 w-4" />
                Información del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Creado por</p>
                  <p className="font-medium">{trip.creator?.name || 'N/A'}</p>
                  {trip.createdAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDateTime(trip.createdAt)}
                    </p>
                  )}
                </div>
                {trip.updater && (
                  <div>
                    <p className="text-muted-foreground">Última actualización por</p>
                    <p className="font-medium">{trip.updater.name}</p>
                    {trip.updatedAt && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(trip.updatedAt)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )
}
