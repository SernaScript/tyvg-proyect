"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Plus,
  Filter,
  Building2,
  Package,
  User,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck
} from "lucide-react"
import { CreateTripRequestModal } from "@/components/modals/CreateTripRequestModal"

// Interface para los datos de solicitudes de viaje
interface TripRequest {
  id: string
  requestDate: Date
  priority: string
  status: string
  observations?: string
  createdAt: Date
  updatedAt: Date
  project: {
    id: string
    name: string
    client: {
      id: string
      name: string
      identification: string
    }
  }
  requestingUser: {
    id: string
    name: string
    email: string
  }
  materials: TripRequestMaterial[]
  trips?: Trip[]
}

interface TripRequestMaterial {
  id: string
  requestedQuantity: number
  unitOfMeasure: string
  material: {
    id: string
    name: string
    type: string
  }
}

interface Trip {
  id: string
  status: string
  scheduledDate?: Date
  driver: {
    id: string
    user: {
      name: string
    }
  }
  vehicle: {
    id: string
    plate: string
  }
}

// Interface para proyectos
interface Project {
  id: string
  name: string
  client: {
    id: string
    name: string
    identification: string
  }
}

// Interface para materiales
interface Material {
  id: string
  name: string
  type: string
  unitOfMeasure: string
  isActive: boolean
}

export default function TripRequestsPage() {
  const [tripRequests, setTripRequests] = useState<TripRequest[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedPriority, setSelectedPriority] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateTripRequestModalOpen, setIsCreateTripRequestModalOpen] = useState(false)

  // Función para cargar solicitudes de viaje
  const fetchTripRequests = async () => {
    try {
      const response = await fetch('/api/trip-requests')
      if (response.ok) {
        const data = await response.json()
        setTripRequests(data)
      }
    } catch (error) {
      console.error('Error fetching trip requests:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar proyectos
  const fetchProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  // Función para cargar materiales
  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/materials')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    }
  }

  useEffect(() => {
    fetchTripRequests()
    fetchProjects()
    fetchMaterials()
  }, [])

  // Filtrar solicitudes de viaje
  const filteredTripRequests = tripRequests.filter(request => {
    const matchesSearch = 
      request.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requestingUser.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.observations?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProject = !selectedProject || request.project.id === selectedProject
    const matchesStatus = !selectedStatus || request.status === selectedStatus
    const matchesPriority = !selectedPriority || request.priority === selectedPriority
    const matchesActive = showInactive || request.status !== 'CANCELLED'
    
    return matchesSearch && matchesProject && matchesStatus && matchesPriority && matchesActive
  })

  // Función para manejar la creación exitosa de una solicitud
  const handleTripRequestCreated = () => {
    fetchTripRequests()
  }

  // Función para formatear fechas
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Función para obtener el color del badge según el estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800'
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800'
      case 'CANCELLED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Función para obtener el color del badge según la prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800'
      case 'NORMAL':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Estadísticas
  const stats = {
    total: tripRequests.length,
    pending: tripRequests.filter(r => r.status === 'PENDING').length,
    scheduled: tripRequests.filter(r => r.status === 'SCHEDULED').length,
    cancelled: tripRequests.filter(r => r.status === 'CANCELLED').length,
    urgent: tripRequests.filter(r => r.priority === 'URGENT').length
  }

  return (
    <AreaLayout areaId="logistics" moduleId="trip-requests">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Viaje</h1>
            <p className="text-gray-600 mt-1">
              Gestiona las solicitudes de transporte de materiales por proyecto
            </p>
          </div>
          <Button
            onClick={() => setIsCreateTripRequestModalOpen(true)}
            className="bg-orange-600 hover:bg-orange-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nueva Solicitud
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Programadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.cancelled}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Urgentes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Proyecto, cliente, solicitante..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="project" className="text-sm font-medium">Proyecto</label>
                <select
                  id="project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los proyectos</option>
                  {projects.filter(p => p.client).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Estado</label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="PENDING">Pendiente</option>
                  <option value="SCHEDULED">Programada</option>
                  <option value="CANCELLED">Cancelada</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="priority" className="text-sm font-medium">Prioridad</label>
                <select
                  id="priority"
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todas las prioridades</option>
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedProject('')
                    setSelectedStatus('')
                    setSelectedPriority('')
                    setShowInactive(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>
              Solicitudes de Viaje ({filteredTripRequests.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              </div>
            ) : filteredTripRequests.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay solicitudes de viaje
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedProject || selectedStatus || selectedPriority
                    ? 'No se encontraron solicitudes con los filtros aplicados'
                    : 'Comienza creando tu primera solicitud de viaje'
                  }
                </p>
                {!searchTerm && !selectedProject && !selectedStatus && !selectedPriority && (
                  <Button
                    onClick={() => setIsCreateTripRequestModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Solicitud
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTripRequests.map((request) => (
                  <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg text-gray-900">
                            Solicitud #{request.id.slice(-8)}
                          </h3>
                          <Badge className={getStatusColor(request.status)}>
                            {request.status === 'PENDING' && 'Pendiente'}
                            {request.status === 'SCHEDULED' && 'Programada'}
                            {request.status === 'CANCELLED' && 'Cancelada'}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority === 'NORMAL' && 'Normal'}
                            {request.priority === 'URGENT' && 'Urgente'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Building2 className="h-3 w-3" />
                              <span className="font-medium">Proyecto:</span>
                              <span className="truncate">{request.project.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">Cliente:</span>
                              <span className="truncate">{request.project.client.name}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-medium">Solicitante:</span>
                              <span className="truncate">{request.requestingUser.name}</span>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className="font-medium">Fecha solicitud:</span>
                              <span>{formatDate(request.requestDate)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Package className="h-3 w-3" />
                              <span className="font-medium">Materiales:</span>
                              <span>{request.materials.length} tipo(s)</span>
                            </div>
                            {request.trips && request.trips.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Truck className="h-3 w-3" />
                                <span className="font-medium">Viajes:</span>
                                <span>{request.trips.length} programado(s)</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {request.observations && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm text-gray-700">
                              <span className="font-medium">Observaciones:</span> {request.observations}
                            </p>
                          </div>
                        )}
                        
                        {request.materials.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Materiales solicitados:</p>
                            <div className="flex flex-wrap gap-2">
                              {request.materials.map((material) => (
                                <Badge key={material.id} variant="outline" className="text-xs">
                                  {material.material.name} - {material.requestedQuantity} {material.unitOfMeasure}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                          <span>Creado: {formatDate(request.createdAt)}</span>
                          <span>Actualizado: {formatDate(request.updatedAt)}</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <Button size="sm" variant="outline">
                          Ver Detalles
                        </Button>
                        <Button size="sm" variant="outline">
                          Editar
                        </Button>
                        {request.status === 'PENDING' && (
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Programar
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear solicitud */}
        <CreateTripRequestModal
          isOpen={isCreateTripRequestModalOpen}
          onClose={() => setIsCreateTripRequestModalOpen(false)}
          onSuccess={handleTripRequestCreated}
          projects={projects}
          materials={materials}
        />
      </div>
    </AreaLayout>
  )
}
