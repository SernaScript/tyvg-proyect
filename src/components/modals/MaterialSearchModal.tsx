'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  X, 
  Search, 
  Package, 
  Check,
  Filter
} from 'lucide-react'

interface Material {
  id: string
  name: string
  type: string
  unitOfMeasure: string
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface MaterialSearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (materials: Material[]) => void
  selectedMaterials?: Material[]
  multiple?: boolean
}

export function MaterialSearchModal({ 
  isOpen, 
  onClose, 
  onSelect, 
  selectedMaterials = [],
  multiple = true
}: MaterialSearchModalProps) {
  const [materials, setMaterials] = useState<Material[]>([])
  const [filteredMaterials, setFilteredMaterials] = useState<Material[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [loading, setLoading] = useState(false)
  const [selectedItems, setSelectedItems] = useState<Material[]>(selectedMaterials)

  useEffect(() => {
    if (isOpen) {
      fetchMaterials()
      setSelectedItems(selectedMaterials)
    }
  }, [isOpen, selectedMaterials])

  useEffect(() => {
    filterMaterials()
  }, [materials, searchTerm, typeFilter])

  const fetchMaterials = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/materials?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setMaterials(data)
      }
    } catch (error) {
      console.error('Error fetching materials:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterMaterials = () => {
    let filtered = materials

    // Filtrar por término de búsqueda
    if (searchTerm.trim()) {
      filtered = filtered.filter(material => 
        material.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filtrar por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(material => material.type === typeFilter)
    }

    setFilteredMaterials(filtered)
  }

  const handleSelectMaterial = (material: Material) => {
    if (multiple) {
      const isSelected = selectedItems.some(item => item.id === material.id)
      if (isSelected) {
        setSelectedItems(selectedItems.filter(item => item.id !== material.id))
      } else {
        setSelectedItems([...selectedItems, material])
      }
    } else {
      setSelectedItems([material])
    }
  }

  const handleConfirmSelection = () => {
    onSelect(selectedItems)
    onClose()
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'cemento': return 'bg-gray-100 text-gray-800'
      case 'arena': return 'bg-yellow-100 text-yellow-800'
      case 'grava': return 'bg-stone-100 text-stone-800'
      case 'ladrillo': return 'bg-red-100 text-red-800'
      case 'acero': return 'bg-blue-100 text-blue-800'
      case 'madera': return 'bg-amber-100 text-amber-800'
      case 'pintura': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getUniqueTypes = () => {
    const types = materials.map(material => material.type)
    return Array.from(new Set(types)).sort()
  }

  const isSelected = (material: Material) => {
    return selectedItems.some(item => item.id === material.id)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Buscar Materiales
            </CardTitle>
            <CardDescription>
              {multiple 
                ? 'Selecciona uno o más materiales de la lista. Puedes buscar por nombre, tipo o descripción.'
                : 'Selecciona un material de la lista.'
              }
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Filtros de búsqueda */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, tipo o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                autoFocus
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {getUniqueTypes().map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Información de resultados y selección */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {filteredMaterials.length} material{filteredMaterials.length !== 1 ? 'es' : ''} encontrado{filteredMaterials.length !== 1 ? 's' : ''}
            </span>
            {selectedItems.length > 0 && (
              <span className="text-blue-600 font-medium">
                {selectedItems.length} material{selectedItems.length !== 1 ? 'es' : ''} seleccionado{selectedItems.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Lista de materiales */}
          <div className="border rounded-lg max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando materiales...</p>
                </div>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No se encontraron materiales</h3>
                <p className="text-muted-foreground">
                  {searchTerm || typeFilter !== 'all'
                    ? 'Intenta con otros términos de búsqueda o filtros'
                    : 'No hay materiales disponibles'
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Material</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px]">Acción</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMaterials.map((material) => (
                    <TableRow 
                      key={material.id} 
                      className={`cursor-pointer hover:bg-gray-50 ${
                        isSelected(material) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectMaterial(material)}
                    >
                      <TableCell>
                        {isSelected(material) && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-semibold">{material.name}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getTypeColor(material.type)} text-xs`}>
                          {material.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm font-medium">{material.unitOfMeasure}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground line-clamp-2">
                          {material.description || 'Sin descripción'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          variant={isSelected(material) ? "default" : "outline"}
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectMaterial(material)
                          }}
                          className="w-full"
                        >
                          {isSelected(material) ? 'Seleccionado' : 'Seleccionar'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Lista de materiales seleccionados */}
          {selectedItems.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Materiales Seleccionados:</h4>
              <div className="space-y-2">
                {selectedItems.map((material) => (
                  <div key={material.id} className="flex items-center justify-between bg-white rounded p-2">
                    <div className="flex items-center gap-3">
                      <Badge className={`${getTypeColor(material.type)} text-xs`}>
                        {material.type}
                      </Badge>
                      <span className="font-medium">{material.name}</span>
                      <span className="text-sm text-muted-foreground">
                        ({material.unitOfMeasure})
                      </span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleSelectMaterial(material)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmSelection}
              disabled={selectedItems.length === 0}
            >
              {multiple 
                ? `Confirmar Selección (${selectedItems.length})`
                : 'Confirmar'
              }
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
