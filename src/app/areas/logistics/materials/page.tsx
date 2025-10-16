"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Warehouse,
  Scale,
  Activity,
  Eye,
  EyeOff,
  DollarSign,
  Calendar
} from "lucide-react"
import { CreateMaterialModal } from "@/components/modals/CreateMaterialModal"

// Interface para los datos de materiales
interface Material {
  id: string
  name: string
  description?: string
  type: string
  unitOfMeasure: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  projectPrices?: ProjectMaterialPrice[]
}

interface ProjectMaterialPrice {
  id: string
  price: number
  validFrom: Date
  validTo?: Date
  isActive: boolean
  project: {
    id: string
    name: string
    client: {
      name: string
    }
  }
}

export default function MaterialsPage() {
  const [materials, setMaterials] = useState<Material[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateMaterialModalOpen, setIsCreateMaterialModalOpen] = useState(false)

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
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchMaterials()
  }, [])

  // Filtrar materiales
  const filteredMaterials = materials.filter(material => {
    const matchesSearch = 
      material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.unitOfMeasure.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = !selectedType || material.type === selectedType
    const matchesActive = showInactive || material.isActive
    
    return matchesSearch && matchesType && matchesActive
  })

  // Función para manejar la creación exitosa de un material
  const handleMaterialCreated = () => {
    fetchMaterials()
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para obtener el color del tipo de material
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'STOCKED':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'NON_STOCKED':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Función para obtener el nombre del tipo
  const getTypeName = (type: string) => {
    switch (type) {
      case 'STOCKED':
        return 'Inventariado'
      case 'NON_STOCKED':
        return 'No Inventariado'
      default:
        return type
    }
  }

  return (
    <AreaLayout areaId="logistics" moduleId="materials">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Package className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Materiales
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administra todos los materiales y sus precios por proyecto
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Buscar y filtrar materiales por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="search">Buscar material</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, descripción o unidad de medida..."
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="type">Filtrar por tipo</Label>
                <select
                  id="type"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Todos los tipos</option>
                  <option value="STOCKED">Inventariado</option>
                  <option value="NON_STOCKED">No Inventariado</option>
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
                  onClick={() => setIsCreateMaterialModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Material
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
                <Package className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Materiales</p>
                  <p className="text-2xl font-bold text-gray-900">{materials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Warehouse className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Inventariados</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {materials.filter(m => m.type === 'STOCKED').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {materials.filter(m => m.isActive).length}
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
                  <p className="text-2xl font-bold text-gray-900">{filteredMaterials.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de materiales */}
        <Card>
          <CardHeader>
            <CardTitle>Materiales del Sistema</CardTitle>
            <CardDescription>
              {filteredMaterials.length} materiales encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando materiales...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron materiales</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMaterials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-green-100 flex-shrink-0">
                        <Package className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{material.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`${getTypeColor(material.type)} hidden sm:inline-flex`}
                          >
                            {getTypeName(material.type)}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`${material.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                          >
                            {material.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Scale className="h-3 w-3" />
                            <span>Unidad: {material.unitOfMeasure}</span>
                          </div>
                        </div>
                        {material.description && (
                          <p className="text-sm text-muted-foreground mt-1 truncate">
                            {material.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Creado: {formatDate(material.createdAt)}</span>
                          {material.projectPrices && material.projectPrices.length > 0 && (
                            <span>• {material.projectPrices.length} precio(s) configurado(s)</span>
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
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear material */}
        <CreateMaterialModal
          isOpen={isCreateMaterialModalOpen}
          onClose={() => setIsCreateMaterialModalOpen(false)}
          onSuccess={handleMaterialCreated}
        />
      </div>
    </AreaLayout>
  )
}

