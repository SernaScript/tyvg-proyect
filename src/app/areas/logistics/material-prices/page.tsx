"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  DollarSign, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Calendar,
  Package,
  Building2,
  Activity,
  Eye,
  EyeOff,
  TrendingUp
} from "lucide-react"
import { CreateMaterialPriceModal } from "@/components/modals/CreateMaterialPriceModal"

// Interface para los datos de precios de materiales
interface ProjectMaterialPrice {
  id: string
  salePrice: number
  outsourcedPrice: number
  startDate: Date
  endDate?: Date
  isActive: boolean
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
  material: {
    id: string
    name: string
    type: string
    unitOfMeasure: string
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

export default function MaterialPricesPage() {
  const [materialPrices, setMaterialPrices] = useState<ProjectMaterialPrice[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedMaterial, setSelectedMaterial] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateMaterialPriceModalOpen, setIsCreateMaterialPriceModalOpen] = useState(false)

  // Función para cargar precios de materiales
  const fetchMaterialPrices = async () => {
    try {
      const response = await fetch('/api/project-material-prices')
      if (response.ok) {
        const data = await response.json()
        setMaterialPrices(data)
      }
    } catch (error) {
      console.error('Error fetching material prices:', error)
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

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMaterialPrices()
    fetchProjects()
    fetchMaterials()
  }, [])

  // Filtrar precios de materiales
  const filteredMaterialPrices = materialPrices.filter(price => {
    const matchesSearch = 
      price.material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      price.project.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesProject = !selectedProject || price.project.id === selectedProject
    const matchesMaterial = !selectedMaterial || price.material.id === selectedMaterial
    const matchesActive = showInactive || price.isActive
    
    return matchesSearch && matchesProject && matchesMaterial && matchesActive
  })

  // Función para manejar la creación exitosa de un precio
  const handleMaterialPriceCreated = () => {
    fetchMaterialPrices()
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para formatear precio
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price)
  }

  // Función para verificar si el precio está vigente
  const isPriceValid = (price: ProjectMaterialPrice) => {
    const today = new Date()
    const startDate = new Date(price.startDate)
    const endDate = price.endDate ? new Date(price.endDate) : null
    
    return today >= startDate && (!endDate || today <= endDate)
  }

  return (
    <AreaLayout areaId="logistics" moduleId="material-prices">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <DollarSign className="h-8 w-8 text-yellow-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Precios de Materiales por Proyecto
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administra los precios de materiales para cada proyecto
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Buscar y filtrar precios por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Material, proyecto o cliente..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="project">Filtrar por proyecto</Label>
                <select
                  id="project"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Todos los proyectos</option>
                  {projects.filter(p => p.client).map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="material">Filtrar por material</Label>
                <select
                  id="material"
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Todos los materiales</option>
                  {materials.filter(m => m.isActive).map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unitOfMeasure})
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
                  onClick={() => setIsCreateMaterialPriceModalOpen(true)}
                  className="w-full bg-yellow-600 hover:bg-yellow-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Precio
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
                <DollarSign className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Precios</p>
                  <p className="text-2xl font-bold text-gray-900">{materialPrices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Vigentes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {materialPrices.filter(p => isPriceValid(p)).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {materialPrices.filter(p => p.isActive).length}
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
                  <p className="text-2xl font-bold text-gray-900">{filteredMaterialPrices.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de precios */}
        <Card>
          <CardHeader>
            <CardTitle>Precios de Materiales</CardTitle>
            <CardDescription>
              {filteredMaterialPrices.length} precios encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando precios...</p>
              </div>
            ) : filteredMaterialPrices.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron precios</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterialPrices.map((price) => (
                  <div key={price.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-yellow-100 flex-shrink-0">
                        <DollarSign className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{price.material.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`${isPriceValid(price) ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                          >
                            {isPriceValid(price) ? 'Vigente' : 'Vencido'}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`${price.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                          >
                            {price.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            <span className="truncate">{price.project.name}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            <span>{price.material.unitOfMeasure}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>Cliente: {price.project.client.name}</span>
                          <div className="flex gap-4">
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Venta</p>
                              <span className="font-semibold text-lg text-green-600">
                                {formatPrice(price.salePrice)}
                              </span>
                            </div>
                            <div className="text-center">
                              <p className="text-xs text-gray-500">Subcontratación</p>
                              <span className="font-semibold text-lg text-blue-600">
                                {formatPrice(price.outsourcedPrice)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Válido desde: {formatDate(price.startDate)}</span>
                          {price.endDate && (
                            <span>Hasta: {formatDate(price.endDate)}</span>
                          )}
                          <span>Creado: {formatDate(price.createdAt)}</span>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear precio */}
        <CreateMaterialPriceModal
          isOpen={isCreateMaterialPriceModalOpen}
          onClose={() => setIsCreateMaterialPriceModalOpen(false)}
          onSuccess={handleMaterialPriceCreated}
        />
      </div>
    </AreaLayout>
  )
}

