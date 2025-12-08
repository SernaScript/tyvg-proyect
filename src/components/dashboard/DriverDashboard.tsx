"use client"

import { User } from "@/types/auth"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Calendar, 
  MapPin, 
  Truck, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Camera,
  LogOut,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

interface Trip {
  id: string
  waybillNumber?: string
  scheduledDate: string
  actualStartDate?: string
  actualEndDate?: string
  status: 'SCHEDULED' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'INVOICED'
  certifiedWeight?: number
  observations?: string
  tripRequest: {
    id: string
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    project: {
      id: string
      name: string
      address?: string
      client: {
        id: string
        name: string
      }
    }
    materials: Array<{
      id: string
      quantity: number
      material: {
        id: string
        name: string
        unitOfMeasure: string
      }
    }>
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
  }
  materials: Array<{
    id: string
    quantity: number
    material: {
      id: string
      name: string
      unitOfMeasure: string
    }
  }>
}

interface DriverDashboardProps {
  user: User
}

export function DriverDashboard({ user }: DriverDashboardProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    fetchTrips()
  }, [statusFilter])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== 'all') {
        params.append('status', statusFilter)
      }
      // The endpoint now automatically filters by the current driver
      
      const response = await fetch(`/api/trips?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // The API can return { trips, total, ... } or directly an array
        const tripsData = Array.isArray(data) ? data : (data.trips || [])
        setTrips(tripsData)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'LOADING':
        return 'bg-yellow-100 text-yellow-800'
      case 'IN_TRANSIT':
        return 'bg-purple-100 text-purple-800'
      case 'DELIVERED':
        return 'bg-green-100 text-green-800'
      case 'COMPLETED':
        return 'bg-emerald-100 text-emerald-800'
      case 'INVOICED':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'SCHEDULED': 'Programado',
      'LOADING': 'Cargando',
      'IN_TRANSIT': 'En Tránsito',
      'DELIVERED': 'Entregado',
      'COMPLETED': 'Completado',
      'INVOICED': 'Facturado'
    }
    return statusMap[status] || status
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleLogout = async () => {
    await logout()
  }

  const stats = {
    scheduled: trips.filter(t => t.status === 'SCHEDULED').length,
    inTransit: trips.filter(t => t.status === 'IN_TRANSIT').length,
    completed: trips.filter(t => t.status === 'COMPLETED' || t.status === 'DELIVERED').length,
    total: trips.length
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 pb-20">
      {/* Header móvil */}
      <div className="sticky top-0 z-50 bg-white shadow-sm border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Dashboard Conductor</h1>
              <p className="text-xs text-gray-600">{user.name || user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden md:flex"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="border-t p-4 space-y-2 md:hidden">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 space-y-4 max-w-4xl mx-auto">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Programados</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">En Tránsito</p>
                  <p className="text-2xl font-bold text-purple-600">{stats.inTransit}</p>
                </div>
                <Truck className="w-8 h-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Completados</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Total</p>
                  <p className="text-2xl font-bold text-gray-700">{stats.total}</p>
                </div>
                <Package className="w-8 h-8 text-gray-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('all')}
            className="whitespace-nowrap"
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'SCHEDULED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('SCHEDULED')}
            className="whitespace-nowrap"
          >
            Programados
          </Button>
          <Button
            variant={statusFilter === 'IN_TRANSIT' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('IN_TRANSIT')}
            className="whitespace-nowrap"
          >
            En Tránsito
          </Button>
          <Button
            variant={statusFilter === 'LOADING' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('LOADING')}
            className="whitespace-nowrap"
          >
            Cargando
          </Button>
          <Button
            variant={statusFilter === 'COMPLETED' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter('COMPLETED')}
            className="whitespace-nowrap"
          >
            Completados
          </Button>
        </div>

        {/* Lista de viajes */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : trips.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">No hay viajes asignados</p>
              <p className="text-sm text-gray-500 mt-2">
                {statusFilter !== 'all' 
                  ? 'No hay viajes con este estado'
                  : 'Los viajes asignados aparecerán aquí'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="bg-white/90 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/driver/trips/${trip.id}`)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getStatusColor(trip.status)}>
                          {getStatusText(trip.status)}
                        </Badge>
                        {trip.tripRequest.priority === 'URGENT' && (
                          <Badge variant="destructive" className="text-xs">
                            Urgente
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {trip.tripRequest.project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {trip.tripRequest.project.client.name}
                      </p>
                    </div>
                    {trip.waybillNumber && (
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Guía</p>
                        <p className="text-sm font-mono font-semibold">{trip.waybillNumber}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-orange-500" />
                      <span className="truncate">
                        {trip.tripRequest.project.address || 'Sin dirección'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Truck className="w-4 h-4 text-orange-500" />
                      <span>{trip.vehicle.plate} • {trip.vehicle.brand} {trip.vehicle.model}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4 text-orange-500" />
                      <span>{formatDateShort(trip.scheduledDate)}</span>
                    </div>
                    {trip.materials && trip.materials.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Package className="w-4 h-4 text-orange-500" />
                        <span>
                          {trip.materials.length} material(es)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Acciones rápidas */}
                  <div className="flex gap-2 pt-3 border-t">
                    {trip.status === 'SCHEDULED' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/driver/trips/${trip.id}/start`)
                        }}
                      >
                        <Clock className="w-4 h-4 mr-1" />
                        Iniciar
                      </Button>
                    )}
                    {(trip.status === 'LOADING' || trip.status === 'IN_TRANSIT') && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/driver/trips/${trip.id}/evidence`)
                        }}
                      >
                        <Camera className="w-4 h-4 mr-1" />
                        Evidencia
                      </Button>
                    )}
                    {trip.status === 'IN_TRANSIT' && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/driver/trips/${trip.id}/complete`)
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Completar
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/driver/trips/${trip.id}`)
                      }}
                    >
                      Ver Detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

