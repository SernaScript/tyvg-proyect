'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AreaLayout } from '@/components/layout/AreaLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import {
  Plus,
  Search,
  MoreHorizontal,
  Calendar,
  Truck,
  User,
  CheckCircle,
  AlertCircle,
  Package,
  Eye,
  Edit,
  Trash2,
  DollarSign,
  Filter,
  X
} from 'lucide-react'
import { ViewTripModal } from '@/components/modals/ViewTripModal'
import { EditTripModal } from '@/components/modals/EditTripModal'
import { DeleteTripModal } from '@/components/modals/DeleteTripModal'
import { Trip, MeasureType } from '@/types/trip'

export default function TripsPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [isApprovedFilter, setIsApprovedFilter] = useState<string>('all')
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [showFilters, setShowFilters] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string>('')
  const [selectedTripInfo, setSelectedTripInfo] = useState<{
    incomingReceiptNumber?: string
    projectName: string
    clientName: string
    date: Date
    isApproved: boolean
  } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (isApprovedFilter !== 'all') params.append('isApproved', isApprovedFilter)
      if (dateFromFilter) params.append('dateFrom', dateFromFilter)
      if (dateToFilter) params.append('dateTo', dateToFilter)

      const response = await fetch(`/api/trips?${params}`)
      if (response.ok) {
        const data = await response.json()
        // El endpoint devuelve un objeto con { trips, total, page, limit, totalPages }
        // Necesitamos extraer el array 'trips'
        setTrips(data.trips || [])
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [searchTerm, isApprovedFilter, dateFromFilter, dateToFilter])

  const handleSearch = () => {
    setSearchTerm(searchInput)
  }

  const handleClearFilters = () => {
    setSearchInput('')
    setSearchTerm('')
    setIsApprovedFilter('all')
    setDateFromFilter('')
    setDateToFilter('')
  }

  const handleViewTrip = (tripId: string) => {
    setSelectedTripId(tripId)
    setIsViewModalOpen(true)
  }

  const handleEditTrip = (tripId: string) => {
    setSelectedTripId(tripId)
    setIsEditModalOpen(true)
  }

  const handleDeleteTrip = (trip: Trip) => {
    setSelectedTripId(trip.id)
    setSelectedTripInfo({
      incomingReceiptNumber: trip.incomingReceiptNumber,
      projectName: trip.project?.name || 'N/A',
      clientName: trip.project?.client?.name || 'N/A',
      date: trip.date,
      isApproved: trip.isApproved
    })
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteTrip = async () => {
    setDeleteLoading(true)
    try {
      const response = await fetch(`/api/trips/${selectedTripId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchTrips()
        setIsDeleteModalOpen(false)
        setSelectedTripId('')
        setSelectedTripInfo(null)
      } else {
        const errorData = await response.json()
        alert(`Error al eliminar el viaje: ${errorData.message}`)
      }
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Error de conexión al eliminar el viaje')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleModalClose = () => {
    setIsViewModalOpen(false)
    setIsEditModalOpen(false)
    setIsDeleteModalOpen(false)
    setSelectedTripId('')
    setSelectedTripInfo(null)
  }

  const handleModalSuccess = () => {
    fetchTrips()
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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
        return 'm³'
      case MeasureType.TONELADAS:
        return 'T'
      default:
        return measure
    }
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch =
      !searchTerm ||
      trip.incomingReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.outcomingReceiptNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.project?.client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle?.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.material?.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesApproved = isApprovedFilter === 'all' ||
      (isApprovedFilter === 'true' && trip.isApproved) ||
      (isApprovedFilter === 'false' && !trip.isApproved)

    const matchesDateFrom = !dateFromFilter || new Date(trip.date) >= new Date(dateFromFilter)
    const matchesDateTo = !dateToFilter || new Date(trip.date) <= new Date(dateToFilter)

    return matchesSearch && matchesApproved && matchesDateFrom && matchesDateTo
  })


  if (loading) {
    return (
      <AreaLayout areaId="logistics" moduleId="trips">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando viajes...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  return (
    <AreaLayout areaId="logistics" moduleId="trips">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gestión de Viajes</h1>
            <p className="text-muted-foreground">
              Crea y gestiona los viajes de transporte
            </p>
          </div>
          <Button onClick={() => router.push('/areas/logistics/trips/create')}>
            <Plus className="h-4 w-4 mr-2" />
            Crear Viaje
          </Button>
        </div>

        {/* Search and Filters Toggle */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por recibo, proyecto, cliente, conductor, placa o material..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSearch()
                      }
                    }}
                    className="pl-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleSearch} variant="default">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                {(searchTerm || isApprovedFilter !== 'all' || dateFromFilter || dateToFilter) && (
                  <Button onClick={handleClearFilters} variant="outline">
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Filters Panel */}
            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom">Fecha Desde</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo">Fecha Hasta</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isApproved">Estado de Aprobación</Label>
                    <Select value={isApprovedFilter} onValueChange={setIsApprovedFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Estado de Aprobación" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="true">Aprobados</SelectItem>
                        <SelectItem value="false">Pendientes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Viajes ({filteredTrips.length})</CardTitle>
            <CardDescription>
              Lista de viajes registrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Fecha</TableHead>
                    <TableHead className="text-xs">Material</TableHead>
                    <TableHead className="text-xs">Obra</TableHead>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs">Conductor</TableHead>
                    <TableHead className="text-xs">Placa</TableHead>
                    <TableHead className="text-xs">Cantidad</TableHead>
                    <TableHead className="text-xs">Precio Venta</TableHead>
                    <TableHead className="text-xs">Aprobado</TableHead>
                    <TableHead className="w-[70px] text-xs"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTrips.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        <div className="text-center">
                          <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No hay viajes</h3>
                          <p className="text-muted-foreground mb-4">
                            {searchTerm || isApprovedFilter !== 'all'
                              ? 'No se encontraron viajes con los filtros aplicados'
                              : 'Comienza creando tu primer viaje'
                            }
                          </p>
                          {!searchTerm && isApprovedFilter === 'all' && (
                            <Button onClick={() => router.push('/areas/logistics/trips/create')}>
                              <Plus className="h-4 w-4 mr-2" />
                              Crear Viaje
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{formatDate(trip.date)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.material?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.project?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.project?.client?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.driver?.name || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.vehicle?.plate || 'N/A'}</p>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {trip.quantity} {getMeasureText(trip.measure)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-medium">
                            {formatCurrency(trip.salePrice)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {trip.isApproved ? (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Aprobado
                            </Badge>
                          ) : (
                            <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleViewTrip(trip.id)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditTrip(trip.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => handleDeleteTrip(trip)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* View Trip Modal */}
      <ViewTripModal
        isOpen={isViewModalOpen}
        onClose={handleModalClose}
        tripId={selectedTripId}
      />

      {/* Edit Trip Modal */}
      <EditTripModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        tripId={selectedTripId}
      />

      {/* Delete Trip Modal */}
      <DeleteTripModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onConfirm={confirmDeleteTrip}
        tripInfo={selectedTripInfo || undefined}
        loading={deleteLoading}
      />
    </AreaLayout>
  )
}
