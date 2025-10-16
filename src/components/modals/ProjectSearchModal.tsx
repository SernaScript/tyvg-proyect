'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  X, 
  Search, 
  Building2, 
  User, 
  MapPin,
  Check
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description?: string
  location?: string
  startDate?: Date
  endDate?: Date
  status: string
  client: {
    id: string
    name: string
    identification: string
  }
}

interface ProjectSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (project: Project) => void
  selectedProjectId?: string
}

export function ProjectSearchModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedProjectId 
}: ProjectSearchModalProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      fetchProjects()
    }
  }, [isOpen])

  useEffect(() => {
    filterProjects()
  }, [projects, searchTerm])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/projects?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error fetching projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterProjects = () => {
    if (!searchTerm.trim()) {
      setFilteredProjects(projects)
      return
    }

    const filtered = projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.client.identification.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (project.location && project.location.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredProjects(filtered)
  }

  const handleSelect = (project: Project) => {
    onSelect(project)
    onClose()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800'
      case 'PLANNING': return 'bg-blue-100 text-blue-800'
      case 'ON_HOLD': return 'bg-yellow-100 text-yellow-800'
      case 'COMPLETED': return 'bg-gray-100 text-gray-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Activo'
      case 'PLANNING': return 'Planificación'
      case 'ON_HOLD': return 'En Pausa'
      case 'COMPLETED': return 'Completado'
      case 'CANCELLED': return 'Cancelado'
      default: return status
    }
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Buscar Proyecto
            </CardTitle>
            <CardDescription>
              Selecciona un proyecto de la lista. Puedes buscar por nombre, cliente o ubicación.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Barra de búsqueda */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar por nombre del proyecto, cliente o ubicación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Información de resultados */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredProjects.length} proyecto{filteredProjects.length !== 1 ? 's' : ''} encontrado{filteredProjects.length !== 1 ? 's' : ''}
            </span>
            {searchTerm && (
              <span>
                Resultados para: "{searchTerm}"
              </span>
            )}
          </div>

          {/* Lista de proyectos */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando proyectos...</p>
                </div>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron proyectos</h3>
                <p className="text-muted-foreground">
                  {searchTerm 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'No hay proyectos disponibles'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Proyecto</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Fechas</TableHead>
                    <TableHead className="w-[100px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${
                        selectedProjectId === project.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <TableCell>
                        {selectedProjectId === project.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{project.name}</p>
                          {project.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{project.client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            ID: {project.client.identification}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {project.location ? (
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm">{project.location}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No especificada</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(project.status)} text-xs`}>
                          {getStatusText(project.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {project.startDate && (
                            <p>Inicio: {formatDate(project.startDate)}</p>
                          )}
                          {project.endDate && (
                            <p>Fin: {formatDate(project.endDate)}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handleSelect(project)}
                          className="w-full"
                        >
                          Seleccionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
