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
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { CreateTripModalDriver } from "@/components/modals/CreateTripModalDriver"
import { EditTripModalDriver } from "@/components/modals/EditTripModalDriver"

interface Trip {
  id: string
  date: string
  quantity: number | string // Prisma Decimal se serializa como string
  measure: 'METROS_CUBICOS' | 'TONELADAS'
  observation?: string
  isApproved: boolean
  incomingReceiptNumber?: string
  outcomingReceiptNumber?: string
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
  material: {
    id: string
    name: string
    type: string
    unitOfMeasure: string
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
    capacityTons?: number
    capacityM3?: number
  }
  driver: {
    id: string
    name: string
    identification: string
    license: string
  }
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
  const [isCreateTripModalOpen, setIsCreateTripModalOpen] = useState(false)
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTrips, setTotalTrips] = useState(0)
  const tripsPerPage = 10

  useEffect(() => {
    fetchDriverId()
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [statusFilter, currentPage])

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

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter === 'pending') {
        params.append('isApproved', 'false')
      } else if (statusFilter === 'approved') {
        params.append('isApproved', 'true')
      }
      // Paginación
      params.append('page', currentPage.toString())
      params.append('limit', tripsPerPage.toString())
      
      // The endpoint now automatically filters by the current driver
      const response = await fetch(`/api/trips?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        // The API now returns { trips, total, page, limit, totalPages }
        if (Array.isArray(data)) {
          // Fallback para compatibilidad con respuestas antiguas
          setTrips(data)
          setTotalTrips(data.length)
        } else {
          setTrips(data.trips || [])
          setTotalTrips(data.total || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isApproved: boolean) => {
    return isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
  }

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Aprobado' : 'Pendiente'
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
      year: 'numeric'
    }).format(date)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Calcular estadísticas basadas en todos los viajes (necesitamos hacer una llamada separada)
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  })

  useEffect(() => {
    // Fetch estadísticas sin paginación
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        params.append('limit', '1000') // Obtener todos para estadísticas
        
        const response = await fetch(`/api/trips?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const allTrips = Array.isArray(data) ? data : (data.trips || [])
          setStats({
            pending: allTrips.filter(t => !t.isApproved).length,
            approved: allTrips.filter(t => t.isApproved).length,
            total: allTrips.length
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [statusFilter])

  const totalPages = totalTrips > 0 ? Math.ceil(totalTrips / tripsPerPage) : 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50/30 to-amber-50/50 pb-20">
      {/* Header móvil */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-md border-b border-orange-100">
        <div className="flex items-center justify-between p-4 md:px-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Truck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                Dashboard Conductor
              </h1>
              <p className="text-xs text-gray-500 font-medium">{user.name || user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden hover:bg-orange-50"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="hidden md:flex hover:bg-orange-50"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Menú móvil */}
        {menuOpen && (
          <div className="border-t border-orange-100 p-4 space-y-2 md:hidden bg-white/95 backdrop-blur-md">
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-orange-50"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
        {/* Botón crear viaje */}
        <div className="flex justify-end">
          <Button
            onClick={() => setIsCreateTripModalOpen(true)}
            className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-200 font-semibold px-6 py-6 h-auto"
            disabled={!driverId}
          >
            <Plus className="w-5 h-5 mr-2" />
            Crear Nuevo Viaje
          </Button>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-wide mb-0.5">Pendientes</p>
                  <p className="text-lg font-bold text-yellow-600">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-4 h-4 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-green-700 uppercase tracking-wide mb-0.5">Aprobados</p>
                  <p className="text-lg font-bold text-green-600">{stats.approved}</p>
                </div>
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-slate-50 to-gray-50 border-slate-200/50 shadow-sm hover:shadow-md transition-all duration-200">
            <CardContent className="p-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-semibold text-slate-700 uppercase tracking-wide mb-0.5">Total</p>
                  <p className="text-lg font-bold text-slate-700">{stats.total}</p>
                </div>
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-4 h-4 text-slate-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={statusFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('all')
              setCurrentPage(1)
            }}
            className={`whitespace-nowrap transition-all duration-200 ${
              statusFilter === 'all' 
                ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-md' 
                : 'hover:bg-orange-50 hover:border-orange-300'
            }`}
          >
            Todos
          </Button>
          <Button
            variant={statusFilter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('pending')
              setCurrentPage(1)
            }}
            className={`whitespace-nowrap transition-all duration-200 ${
              statusFilter === 'pending' 
                ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white shadow-md' 
                : 'hover:bg-yellow-50 hover:border-yellow-300'
            }`}
          >
            Pendientes
          </Button>
          <Button
            variant={statusFilter === 'approved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setStatusFilter('approved')
              setCurrentPage(1)
            }}
            className={`whitespace-nowrap transition-all duration-200 ${
              statusFilter === 'approved' 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md' 
                : 'hover:bg-green-50 hover:border-green-300'
            }`}
          >
            Aprobados
          </Button>
        </div>

        {/* Lista de viajes */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-14 w-14 border-4 border-orange-200 border-t-orange-600"></div>
              <p className="text-sm text-gray-500 font-medium">Cargando viajes...</p>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-2 border-dashed border-orange-200 shadow-sm">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-orange-400" />
              </div>
              <p className="text-gray-700 font-semibold text-lg mb-2">No hay viajes registrados</p>
              <p className="text-sm text-gray-500">
                {statusFilter !== 'all' 
                  ? 'No hay viajes con este estado'
                  : 'Crea tu primer viaje usando el botón de arriba'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {trips.map((trip) => (
              <Card 
                key={trip.id} 
                className="bg-white border border-gray-200/80 shadow-sm hover:shadow-md hover:border-orange-300/50 transition-all duration-200 group"
              >
                <CardContent className="p-3">
                  {/* Encabezado: Placa grande y botón editar */}
                  <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-orange-600 flex-shrink-0" />
                      <span className="text-lg font-bold text-gray-900">
                        {trip.vehicle.plate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {!trip.isApproved && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTripId(trip.id)
                            setIsEditTripModalOpen(true)
                          }}
                          className="h-7 px-2 text-xs hover:bg-orange-50"
                        >
                          <Edit className="w-3.5 h-3.5 mr-1" />
                          Editar
                        </Button>
                      )}
                      <Badge 
                        className={`${getStatusColor(trip.isApproved)} font-medium px-2 py-1 text-xs shadow-sm`}
                      >
                        {getStatusText(trip.isApproved)}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {/* Fecha */}
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {formatDateShort(trip.date)}
                      </span>
                    </div>
                    
                    {/* Proyecto */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        {trip.project.name}
                      </span>
                    </div>
                    
                    {/* Material y Cantidad */}
                    <div className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-gray-700 truncate">
                        <span className="font-semibold">{trip.material.name}</span>
                        {' - '}
                        <span className="text-orange-600 font-bold">
                          {typeof trip.quantity === 'string' ? parseFloat(trip.quantity) : trip.quantity}
                        </span>
                        {' '}
                        <span className="text-gray-500">{trip.material.unitOfMeasure}</span>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Paginación */}
        {!loading && trips.length > 0 && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <div className="text-sm text-gray-600">
              Mostrando {((currentPage - 1) * tripsPerPage) + 1} - {Math.min(currentPage * tripsPerPage, totalTrips)} de {totalTrips} viajes
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNumber
                  if (totalPages <= 5) {
                    pageNumber = i + 1
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i
                  } else {
                    pageNumber = currentPage - 2 + i
                  }
                  
                  if (pageNumber < 1 || pageNumber > totalPages) {
                    return null
                  }
                  
                  return (
                    <Button
                      key={pageNumber}
                      variant={currentPage === pageNumber ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNumber)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNumber}
                    </Button>
                  )
                }).filter(Boolean)}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1"
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de creación de viaje */}
      {driverId && (
        <CreateTripModalDriver
          isOpen={isCreateTripModalOpen}
          onClose={() => setIsCreateTripModalOpen(false)}
          onSuccess={() => {
            fetchTrips()
            setIsCreateTripModalOpen(false)
          }}
          driverId={driverId}
        />
      )}

      {/* Modal de edición de viaje */}
      {driverId && selectedTripId && (
        <EditTripModalDriver
          isOpen={isEditTripModalOpen}
          onClose={() => {
            setIsEditTripModalOpen(false)
            setSelectedTripId(null)
          }}
          onSuccess={() => {
            fetchTrips()
            setIsEditTripModalOpen(false)
            setSelectedTripId(null)
          }}
          tripId={selectedTripId}
          driverId={driverId}
        />
      )}
    </div>
  )
}

