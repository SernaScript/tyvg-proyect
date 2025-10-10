"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, AlertCircle, CheckCircle, Calendar, Package, Building2 } from "lucide-react"

interface Project {
  id: string
  name: string
  client: {
    id: string
    name: string
    identification: string
  }
}

interface Material {
  id: string
  name: string
  type: string
  unitOfMeasure: string
}

interface CreateMaterialPriceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projects: Project[]
  materials: Material[]
}

export function CreateMaterialPriceModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  projects, 
  materials 
}: CreateMaterialPriceModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    materialId: '',
    price: '',
    validFrom: '',
    validTo: '',
    isActive: true
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'price') {
      // Solo permitir números y punto decimal para el precio
      const numericValue = value.replace(/[^0-9.]/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validar fechas
      if (formData.validFrom && formData.validTo) {
        const validFrom = new Date(formData.validFrom)
        const validTo = new Date(formData.validTo)
        
        if (validFrom >= validTo) {
          throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
        }
      }

      const response = await fetch('/api/project-material-prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          validFrom: formData.validFrom || new Date().toISOString().split('T')[0],
          validTo: formData.validTo || null
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el precio')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        resetForm()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el precio')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectId: '',
      materialId: '',
      price: '',
      validFrom: '',
      validTo: '',
      isActive: true
    })
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  // Filtrar solo proyectos y materiales activos
  const activeProjects = projects.filter(project => project.client)
  const activeMaterials = materials.filter(material => material.isActive)

  // Obtener información del material seleccionado
  const selectedMaterial = activeMaterials.find(m => m.id === formData.materialId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-yellow-600" />
            <CardTitle>Crear Precio de Material</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="projectId">Proyecto *</Label>
                <select
                  id="projectId"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Seleccione un proyecto</option>
                  {activeProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="materialId">Material *</Label>
                <select
                  id="materialId"
                  name="materialId"
                  value={formData.materialId}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Seleccione un material</option>
                  {activeMaterials.map((material) => (
                    <option key={material.id} value={material.id}>
                      {material.name} ({material.unitOfMeasure})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio por Unidad *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="price"
                    name="price"
                    type="text"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                {selectedMaterial && (
                  <p className="text-sm text-gray-500">
                    Precio por {selectedMaterial.unitOfMeasure}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="validFrom">Válido desde *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="validFrom"
                    name="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo">Válido hasta</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="validTo"
                    name="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Dejar vacío para precio indefinido
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <input
                id="isActive"
                name="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={handleInputChange}
                disabled={isLoading}
                className="rounded border-gray-300"
                aria-label="Precio activo"
              />
              <Label htmlFor="isActive">Precio activo</Label>
            </div>

            {/* Información sobre precios */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Package className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Información sobre Precios</h4>
                  <div className="text-sm text-blue-800 mt-1 space-y-1">
                    <p>• Los precios se aplican por unidad del material seleccionado</p>
                    <p>• Un proyecto puede tener múltiples precios para el mismo material con diferentes vigencia</p>
                    <p>• El sistema usará el precio vigente más reciente para cada material</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm text-green-800">
                  Precio creado exitosamente
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.projectId || !formData.materialId || !formData.price}
                className="flex-1 bg-yellow-600 hover:bg-yellow-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4 mr-2" />
                    Crear Precio
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

