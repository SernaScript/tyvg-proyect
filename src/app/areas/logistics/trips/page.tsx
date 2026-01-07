'use client'

import { useState, useEffect, useMemo } from 'react'
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
  Truck,
  User,
  CheckCircle2,
  Eye,
  Edit,
  Trash2,
  Filter,
  X,
  Wallet,
  Clock,
  Building2,
  Package
} from 'lucide-react'
import { ViewTripModal } from '@/components/modals/ViewTripModal'
import { EditTripModal } from '@/components/modals/EditTripModal'
import { DeleteTripModal } from '@/components/modals/DeleteTripModal'
import { Trip, MeasureType } from '@/types/trip'
import { cn } from '@/lib/utils'

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
    waybillNumber?: string
    projectName: string
    clientName: string
    scheduledDate: Date
    status: string
  } | undefined>(undefined)
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
      waybillNumber: trip.incomingReceiptNumber,
      projectName: trip.project?.name || 'N/A',
      clientName: trip.project?.client?.name || 'N/A',
      scheduledDate: trip.date,
      status: trip.isApproved ? 'Aprobado' : 'Pendiente'
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
        setSelectedTripInfo(undefined)
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
    setSelectedTripInfo(undefined)
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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

  const filteredTrips = useMemo(() => {
    return trips.filter(trip => {
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
  }, [trips, searchTerm, isApprovedFilter, dateFromFilter, dateToFilter])



  if (loading) {
    return (
      <AreaLayout areaId="logistics" moduleId="trips">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-muted-foreground animate-pulse">Cargando viajes...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  return (
    <AreaLayout areaId="logistics" moduleId="trips">
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestión de Logística</h1>
            <p className="text-muted-foreground mt-1">
              Control y seguimiento de viajes, materiales y facturación.
            </p>
          </div>
          <Button
            onClick={() => router.push('/areas/logistics/trips/create')}
            size="lg"
            className="shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
          >
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Viaje
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="shadow-sm border-muted/60">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por recibo, obra, cliente, conductor o placa..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-10 bg-muted/30 border-muted-foreground/20 focus:bg-background transition-colors"
                />
              </div>
              <div className="flex gap-2 items-center overflow-x-auto pb-2 lg:pb-0 font-medium">
                <Button onClick={handleSearch} variant="default" size="sm" className="h-10 px-4">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant={showFilters ? "default" : "outline"}
                  size="sm"
                  className={cn("h-10 px-4", showFilters && "bg-secondary text-secondary-foreground hover:bg-secondary/80")}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </Button>
                {(searchTerm || isApprovedFilter !== 'all' || dateFromFilter || dateToFilter) && (
                  <Button onClick={handleClearFilters} variant="ghost" size="sm" className="h-10 px-4 text-red-500 hover:text-red-600 hover:bg-red-50">
                    <X className="h-4 w-4 mr-2" />
                    Limpiar
                  </Button>
                )}
              </div>
            </div>

            {/* Expanded Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t animate-in slide-in-from-top-2 duration-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="dateFrom" className="text-xs font-semibold uppercase text-muted-foreground">Fecha Desde</Label>
                    <Input
                      id="dateFrom"
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => setDateFromFilter(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateTo" className="text-xs font-semibold uppercase text-muted-foreground">Fecha Hasta</Label>
                    <Input
                      id="dateTo"
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => setDateToFilter(e.target.value)}
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="isApproved" className="text-xs font-semibold uppercase text-muted-foreground">Estado</Label>
                    <Select value={isApprovedFilter} onValueChange={setIsApprovedFilter}>
                      <SelectTrigger className="bg-muted/30">
                        <SelectValue placeholder="Todos los estados" />
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

        {/* Content Area */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">
              Resultados ({filteredTrips.length})
            </h2>
            <div className="text-sm text-muted-foreground">
              Ordenador por fecha (reciente)
            </div>
          </div>

          {filteredTrips.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No se encontraron viajes</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                  {searchTerm || isApprovedFilter !== 'all'
                    ? 'Intenta ajustar los filtros de búsqueda para encontrar lo que necesitas.'
                    : 'Aún no hay viajes registrados en el sistema.'
                  }
                </p>
                {!searchTerm && isApprovedFilter === 'all' && (
                  <Button onClick={() => router.push('/areas/logistics/trips/create')}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primer Viaje
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/40 hover:bg-muted/40">
                    <TableRow>
                      <TableHead className="font-semibold">Fecha</TableHead>
                      <TableHead className="font-semibold">Detalle</TableHead>
                      <TableHead className="font-semibold">Destino/Cliente</TableHead>
                      <TableHead className="font-semibold">Transporte</TableHead>
                      <TableHead className="font-semibold text-right">Cantidad</TableHead>
                      <TableHead className="font-semibold text-right">Valor</TableHead>
                      <TableHead className="font-semibold text-center">Estado</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTrips.map((trip) => (
                      <TableRow key={trip.id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{formatDate(trip.date)}</span>
                            <span className="text-xs text-muted-foreground capitalize">
                              {new Date(trip.date).toLocaleDateString('es-CO', { weekday: 'long' })}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <Package className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{trip.material?.name || 'Material N/A'}</p>
                              {trip.incomingReceiptNumber && (
                                <p className="text-xs text-muted-foreground">Recibo: {trip.incomingReceiptNumber}</p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-sm font-medium">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate max-w-[150px]" title={trip.project?.name}>{trip.project?.name || 'Sin Obra'}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              <span className="truncate max-w-[150px]" title={trip.project?.client?.name}>{trip.project?.client?.name || 'Sin Cliente'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium">{trip.vehicle?.plate || '---'}</span>
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]" title={trip.driver?.name}>{trip.driver?.name || 'Sin Conductor'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono font-medium">
                            {trip.quantity} {getMeasureText(trip.measure)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="font-semibold text-sm text-foreground">
                            {formatCurrency(trip.salePrice)}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {trip.isApproved ? (
                            <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-100 border-emerald-200">
                              Aprobado
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200">
                              Pendiente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
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
                                className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/30"
                                onClick={() => handleDeleteTrip(trip)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden space-y-4">
                {filteredTrips.map((trip) => (
                  <Card key={trip.id} className="overflow-hidden shadow-sm active:shadow-md transition-shadow">
                    <CardHeader className="p-4 pb-2 bg-muted/20 border-b flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2">
                        <div className="font-mono text-sm font-bold bg-background px-2 py-1 rounded border">
                          {trip.vehicle?.plate || '---'}
                        </div>
                        <span className="text-xs text-muted-foreground">{formatDate(trip.date)}</span>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
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
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-bold text-base flex items-center gap-2">
                            {trip.material?.name}
                            {trip.isApproved ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            ) : (
                              <Clock className="h-4 w-4 text-amber-500" />
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">{trip.project?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg">{formatCurrency(trip.salePrice)}</p>
                          <p className="text-xs text-muted-foreground">{trip.quantity} {getMeasureText(trip.measure)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t mt-2">
                        <div className="flex items-center gap-1">
                          <User className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{trip.driver?.name || 'Sin Conductor'}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="truncate max-w-[120px]">{trip.project?.client?.name || 'Sin Cliente'}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div >

      <ViewTripModal
        isOpen={isViewModalOpen}
        onClose={handleModalClose}
        tripId={selectedTripId}
      />

      <EditTripModal
        isOpen={isEditModalOpen}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        tripId={selectedTripId}
      />

      <DeleteTripModal
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        onConfirm={confirmDeleteTrip}
        tripInfo={selectedTripInfo || undefined}
        loading={deleteLoading}
      />
    </AreaLayout >
  )
}
