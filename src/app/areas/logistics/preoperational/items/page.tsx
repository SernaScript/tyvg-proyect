"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  EyeOff,
  CheckCircle,
  XCircle,
  ArrowLeft
} from "lucide-react"
import { CreatePreoperationalItemModal } from "@/components/modals/CreatePreoperationalItemModal"
import { useRouter } from "next/navigation"

// Interface para los datos de items preoperacionales
interface PreoperationalItem {
  id: number
  name: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export default function PreoperationalItemsPage() {
  const router = useRouter()
  const [items, setItems] = useState<PreoperationalItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<PreoperationalItem | null>(null)

  // Función para cargar items
  const fetchItems = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/preoperational-items')
      if (response.ok) {
        const data = await response.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Error fetching preoperational items:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchItems()
  }, [])

  // Filtrar items
  const filteredItems = items.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesActive = showInactive || item.isActive
    
    return matchesSearch && matchesActive
  })

  // Función para manejar la creación/actualización exitosa
  const handleItemSuccess = () => {
    fetchItems()
    setItemToEdit(null)
  }

  // Función para abrir modal de edición
  const handleEdit = (item: PreoperationalItem) => {
    setItemToEdit(item)
    setIsCreateModalOpen(true)
  }

  // Función para eliminar item
  const handleDelete = async (item: PreoperationalItem) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar el item "${item.name}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/preoperational-items/${item.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchItems()
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al eliminar el item')
      }
    } catch (error) {
      console.error('Error deleting item:', error)
      alert('Error al eliminar el item')
    }
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para cerrar modal
  const handleCloseModal = () => {
    setIsCreateModalOpen(false)
    setItemToEdit(null)
  }

  return (
    <AreaLayout areaId="logistics" moduleId="preoperational">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/areas/logistics/preoperational')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Items Preoperacionales
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Gestión de items para inspecciones preoperacionales de vehículos
              </p>
            </div>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Buscar y filtrar items preoperacionales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Buscar item</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre del item..."
                    className="pl-10"
                  />
                </div>
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
                  onClick={() => {
                    setItemToEdit(null)
                    setIsCreateModalOpen(true)
                  }}
                  className="w-full bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Item
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de items */}
        <Card>
          <CardHeader>
            <CardTitle>Items Preoperacionales</CardTitle>
            <CardDescription>
              {filteredItems.length} items encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando items...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron items preoperacionales</p>
                <Button 
                  onClick={() => {
                    setItemToEdit(null)
                    setIsCreateModalOpen(true)
                  }}
                  className="mt-4 bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Item
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                        <ClipboardList className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{item.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`${item.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                          >
                            {item.isActive ? (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Activo
                              </>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Inactivo
                              </>
                            )}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>Creado: {formatDate(item.createdAt)}</span>
                          <span>Actualizado: {formatDate(item.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear/editar item */}
        <CreatePreoperationalItemModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleItemSuccess}
          itemToEdit={itemToEdit}
        />
      </div>
    </AreaLayout>
  )
}

