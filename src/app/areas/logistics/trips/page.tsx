'use client'

import { useState, useEffect } from 'react'
import { AreaLayout } from '@/components/layout/AreaLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Calendar, 
  Truck, 
  User, 
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Package,
  FileText,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { CreateTripModal } from '@/components/modals/CreateTripModal'
import { ViewTripModal } from '@/components/modals/ViewTripModal'
import { EditTripModal } from '@/components/modals/EditTripModal'
import { DeleteTripModal } from '@/components/modals/DeleteTripModal'

interface Trip {
  id: string
  waybillNumber?: string
  scheduledDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  status: 'SCHEDULED' | 'LOADING' | 'IN_TRANSIT' | 'DELIVERED' | 'COMPLETED' | 'INVOICED'
  certifiedWeight?: number
  observations?: string
  createdAt: Date
  updatedAt: Date
  tripRequest: {
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
    capacityTons?: number
    capacityM3?: number
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
  evidences: Array<{
    id: string
    type: string
    fileUrl: string
    createdAt: Date
  }>
  expenses: Array<{
    id: string
    type: string
    amount: number
    description?: string
  }>
}

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
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
  } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const fetchTrips = async () => {
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (priorityFilter !== 'all') params.append('priority', priorityFilter)

      const response = await fetch(`/api/trips?${params}`)
      if (response.ok) {
        const data = await response.json()
        setTrips(data)
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTrips()
  }, [searchTerm, statusFilter, priorityFilter])

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
      waybillNumber: trip.waybillNumber,
      projectName: trip.tripRequest.project.name,
      clientName: trip.tripRequest.project.client.name,
      scheduledDate: trip.scheduledDate,
      status: trip.status
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
        // Recargar la lista de viajes
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
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

  const getTotalExpenses = (expenses: any[]) => {
    if (!expenses || !Array.isArray(expenses)) return 0
    return expenses.reduce((total, expense) => total + (expense.amount || 0), 0)
  }

  const getTotalMaterials = (materials: any[]) => {
    if (!materials || !Array.isArray(materials)) return 0
    return materials.reduce((total, material) => total + (material.quantity || 0), 0)
  }

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.waybillNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tripRequest.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.tripRequest.project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || trip.status === statusFilter
    const matchesPriority = priorityFilter === 'all' || trip.tripRequest.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const stats = {
    total: trips.length,
    scheduled: trips.filter(t => t.status === 'SCHEDULED').length,
    inTransit: trips.filter(t => t.status === 'IN_TRANSIT').length,
    completed: trips.filter(t => t.status === 'COMPLETED').length
  }

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
              Programa y gestiona los viajes de transporte desde solicitudes
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Programar Viaje
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Viajes</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                {stats.scheduled} programados, {stats.inTransit} en tránsito
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completed}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% del total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En Tránsito</CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.inTransit}</div>
              <p className="text-xs text-muted-foreground">
                Viajes en ejecución
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Programados</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.scheduled}</div>
              <p className="text-xs text-muted-foreground">
                Viajes programados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar por guía, proyecto, cliente, conductor o placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="SCHEDULED">Programado</SelectItem>
                  <SelectItem value="LOADING">Cargando</SelectItem>
                  <SelectItem value="IN_TRANSIT">En Tránsito</SelectItem>
                  <SelectItem value="DELIVERED">Entregado</SelectItem>
                  <SelectItem value="COMPLETED">Completado</SelectItem>
                  <SelectItem value="INVOICED">Facturado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las prioridades</SelectItem>
                  <SelectItem value="LOW">Baja</SelectItem>
                  <SelectItem value="MEDIUM">Media</SelectItem>
                  <SelectItem value="HIGH">Alta</SelectItem>
                  <SelectItem value="URGENT">Urgente</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Trips Table */}
        <Card>
          <CardHeader>
            <CardTitle>Viajes ({filteredTrips.length})</CardTitle>
            <CardDescription>
              Lista de viajes programados desde solicitudes de transporte
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Guía</TableHead>
                    <TableHead className="text-xs">Obra</TableHead>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs">Conductor</TableHead>
                    <TableHead className="text-xs">Placa</TableHead>
                    <TableHead className="text-xs">Fecha Programada</TableHead>
                    <TableHead className="text-xs">Estado</TableHead>
                    <TableHead className="text-xs">Prioridad</TableHead>
                    <TableHead className="text-xs">Materiales</TableHead>
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
                            {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                              ? 'No se encontraron viajes con los filtros aplicados'
                              : 'Comienza programando tu primer viaje'
                            }
                          </p>
                          {!searchTerm && statusFilter === 'all' && priorityFilter === 'all' && (
                            <Button onClick={() => setIsCreateModalOpen(true)}>
                              <Plus className="h-4 w-4 mr-2" />
                              Programar Viaje
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-medium text-sm">
                          {trip.waybillNumber || (
                            <span className="text-muted-foreground text-xs">Sin guía</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.tripRequest.project.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.tripRequest.project.client.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.driver.name}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-sm">{trip.vehicle.plate}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{formatDate(trip.scheduledDate)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(trip.status)} text-xs`}>
                            {getStatusText(trip.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${getPriorityColor(trip.tripRequest.priority)} text-xs`}>
                            {getPriorityText(trip.tripRequest.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {trip.tripRequest.materials && trip.tripRequest.materials.length > 0 ? (
                              <div className="space-y-1">
                                {trip.tripRequest.materials.map((material, index) => (
                                  <p key={index} className="font-medium text-xs">
                                    {material.material.name}
                                  </p>
                                ))}
                              </div>
                            ) : (
                              <p className="text-muted-foreground text-xs">Sin materiales</p>
                            )}
                          </div>
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

      {/* Create Trip Modal */}
      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          fetchTrips()
        }}
      />

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
