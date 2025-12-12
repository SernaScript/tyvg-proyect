"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Save
} from "lucide-react"

interface Article {
  id: string
  code: string
  name: string
  description?: string
  unit: string
  stock: number
  unitPrice: number
  createdAt: Date
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    unit: '',
    stock: 0,
    unitPrice: 0
  })

  useEffect(() => {
    fetchArticles()
  }, [])

  const fetchArticles = async () => {
    try {
      // TODO: Implementar la llamada a la API
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleCreate = () => {
    setIsCreating(true)
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: '',
      stock: 0,
      unitPrice: 0
    })
  }

  const handleEdit = (article: Article) => {
    setEditingId(article.id)
    setFormData({
      code: article.code,
      name: article.name,
      description: article.description || '',
      unit: article.unit,
      stock: article.stock,
      unitPrice: article.unitPrice
    })
    setIsCreating(false)
  }

  const handleCancel = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      unit: '',
      stock: 0,
      unitPrice: 0
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        // TODO: Implementar actualización
        alert('Artículo actualizado correctamente')
      } else {
        // TODO: Implementar creación
        alert('Artículo creado correctamente')
      }
      
      handleCancel()
      fetchArticles()
    } catch (error) {
      alert('Error al guardar el artículo')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este artículo?')) return
    
    try {
      // TODO: Implementar eliminación
      alert('Artículo eliminado correctamente')
      fetchArticles()
    } catch (error) {
      alert('Error al eliminar el artículo')
    }
  }

  const filteredArticles = articles.filter(article =>
    article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Crear Artículos</h1>
            <p className="text-gray-600 mt-2">Gestiona los artículos del inventario</p>
          </div>
          {!isCreating && !editingId && (
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Artículo
            </Button>
          )}
        </div>

        {/* Create/Edit Form */}
        {(isCreating || editingId) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Artículo' : 'Nuevo Artículo'}</CardTitle>
              <CardDescription>
                {editingId ? 'Modifica la información del artículo' : 'Completa los datos del nuevo artículo'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Código *</Label>
                    <Input
                      id="code"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                      placeholder="Código del artículo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Nombre del artículo"
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Descripción del artículo"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unidad de Medida *</Label>
                    <Input
                      id="unit"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="Ej: kg, unidades, m²"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock Inicial</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unitPrice">Precio Unitario</Label>
                    <Input
                      id="unitPrice"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.unitPrice}
                      onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit">
                    <Save className="h-4 w-4 mr-2" />
                    {editingId ? 'Actualizar' : 'Crear'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Articles List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Artículos</CardTitle>
                <CardDescription>Gestiona todos los artículos del inventario</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar artículos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando artículos...</div>
            ) : filteredArticles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay artículos registrados</p>
                <p className="text-sm">Crea tu primer artículo para comenzar</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredArticles.map((article) => (
                  <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold">{article.name}</h3>
                        <Badge variant="outline">{article.code}</Badge>
                        <Badge variant="secondary">Stock: {article.stock} {article.unit}</Badge>
                      </div>
                      {article.description && (
                        <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                      )}
                      <p className="text-sm text-gray-500 mt-1">
                        Precio: ${article.unitPrice.toFixed(2)} / {article.unit}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(article)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

