"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Users,
  Activity,
  Eye,
  EyeOff,
  Filter
} from "lucide-react"
import { CreateProjectModal } from "@/components/modals/CreateProjectModal"

// Interface para los datos de proyectos
interface Project {
  id: string
  name: string
  description?: string
  address?: string
  startDate?: Date
  endDate?: Date
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  client: {
    id: string
    name: string
    identification: string
  }
  materials?: ProjectMaterial[]
}

interface ProjectMaterial {
  id: string
  material: {
    id: string
    name: string
    type: string
  }
  price: number
  isActive: boolean
}

// Interface para los datos de clientes
interface Client {
  id: string
  identification: string
  name: string
  isActive: boolean
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateProjectModalOpen, setIsCreateProjectModalOpen] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
  }

  // Función para cargar clientes
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchProjects()
    fetchClients()
  }, [])

  // Filtrar proyectos
  const filteredProjects = projects.filter(project => {
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.identification.includes(searchTerm)
    
    const matchesClient = !selectedClient || project.client.id === selectedClient
    const matchesActive = showInactive || project.isActive
    
    return matchesSearch && matchesClient && matchesActive
  })

  // Función para manejar la creación exitosa de un proyecto
  const handleProjectCreated = () => {
    fetchProjects()
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para calcular días restantes
  const getDaysRemaining = (endDate: Date) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Función para obtener el estado del proyecto
  const getProjectStatus = (project: Project) => {
    if (!project.isActive) return { label: 'Inactivo', color: 'bg-red-100 text-red-800 border-red-300' }
    
    if (!project.startDate || !project.endDate) {
      return { label: 'Sin fechas', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    }

    const daysRemaining = getDaysRemaining(project.endDate)
    const today = new Date()
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)

    if (today < startDate) {
      return { label: 'Pendiente', color: 'bg-blue-100 text-blue-800 border-blue-300' }
    } else if (today > endDate) {
      return { label: 'Finalizado', color: 'bg-gray-100 text-gray-800 border-gray-300' }
    } else if (daysRemaining <= 7) {
      return { label: 'Por finalizar', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    } else {
      return { label: 'En curso', color: 'bg-green-100 text-green-800 border-green-300' }
    }
  }

  return (
    <AreaLayout areaId="logistics" moduleId="projects">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Building2 className="h-8 w-8 text-orange-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Proyectos
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administra todos los proyectos y obras del sistema
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Buscar y filtrar proyectos por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar proyecto</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, descripción o cliente..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="client">Filtrar por cliente</Label>
                <select
                  id="client"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="">Todos los clientes</option>
                  {clients.filter(c => c.isActive).map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.identification})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInactive(!showInactive)}
                  className="w-full"
                >
                  {showInactive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar Inactivos
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar Inactivos
                    </>
                  )}
                </Button>
              </div>
              
              <div className="flex items-end">
                <Button 
                  onClick={() => setIsCreateProjectModalOpen(true)}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Proyecto
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => p.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">En Curso</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {projects.filter(p => {
                      if (!p.isActive || !p.startDate || !p.endDate) return false
                      const today = new Date()
                      const start = new Date(p.startDate)
                      const end = new Date(p.endDate)
                      return today >= start && today <= end
                    }).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resultados</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredProjects.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de proyectos */}
        <Card>
          <CardHeader>
            <CardTitle>Proyectos del Sistema</CardTitle>
            <CardDescription>
              {filteredProjects.length} proyectos encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando proyectos...</p>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron proyectos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProjects.map((project) => {
                  const status = getProjectStatus(project)
                  return (
                    <div key={project.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{project.name}</p>
                            <Badge 
                              variant="outline" 
                              className={`${status.color} hidden sm:inline-flex`}
                            >
                              {status.label}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <div className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              <span className="truncate">{project.client.name}</span>
                            </div>
                            <span>ID: {project.client.identification}</span>
                          </div>
                          {project.description && (
                            <p className="text-sm text-muted-foreground mt-1 truncate">
                              {project.description}
                            </p>
                          )}
                          {project.address && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">{project.address}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                            {project.startDate && (
                              <span>Inicio: {formatDate(project.startDate)}</span>
                            )}
                            {project.endDate && (
                              <span>
                                Fin: {formatDate(project.endDate)}
                                {project.isActive && project.startDate && project.endDate && (
                                  <span className="ml-1">
                                    ({getDaysRemaining(project.endDate)} días)
                                  </span>
                                )}
                              </span>
                            )}
                            {project.materials && project.materials.length > 0 && (
                              <span>• {project.materials.length} material(es)</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 flex-shrink-0 ml-4">
                        <Button size="sm" variant="outline">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear proyecto */}
        <CreateProjectModal
          isOpen={isCreateProjectModalOpen}
          onClose={() => setIsCreateProjectModalOpen(false)}
          onSuccess={handleProjectCreated}
          clients={clients}
        />
      </div>
    </AreaLayout>
  )
}
