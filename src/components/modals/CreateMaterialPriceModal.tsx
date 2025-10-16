"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, DollarSign, AlertCircle, CheckCircle, Calendar, Package, Building2 } from "lucide-react"
import { ProjectAutocomplete } from "@/components/ui/ProjectAutocomplete"
import { MaterialAutocompleteSingle } from "@/components/ui/MaterialAutocompleteSingle"

interface Project {
  id: string
  name: string
  description?: string
  address?: string
  status?: string
  isActive: boolean
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
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface CreateMaterialPriceModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateMaterialPriceModal({ 
  isOpen, 
  onClose, 
  onSuccess
}: CreateMaterialPriceModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    materialId: '',
    salePrice: '',
    outsourcedPrice: '',
    validFrom: '',
    validTo: '',
    isActive: true
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'salePrice' || name === 'outsourcedPrice') {
      // Solo permitir números y punto decimal para los precios
      const numericValue = value.replace(/[^0-9.]/g, '')
      setFormData(prev => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    setFormData(prev => ({ ...prev, projectId: project?.id || '' }))
  }

  const handleMaterialSelect = (material: Material | null) => {
    setSelectedMaterial(material)
    setFormData(prev => ({ ...prev, materialId: material?.id || '' }))
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
          salePrice: parseFloat(formData.salePrice),
          outsourcedPrice: parseFloat(formData.outsourcedPrice),
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
      salePrice: '',
      outsourcedPrice: '',
      validFrom: '',
      validTo: '',
      isActive: true
    })
    setSelectedProject(null)
    setSelectedMaterial(null)
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      setError('')
      setSuccess(false)
      onClose()
    }
  }



  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
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
                <ProjectAutocomplete
                  label="Proyecto"
                  placeholder="Buscar proyecto..."
                  value={selectedProject}
                  onChange={handleProjectSelect}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <MaterialAutocompleteSingle
                  label="Material"
                  placeholder="Buscar material..."
                  value={selectedMaterial}
                  onChange={handleMaterialSelect}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salePrice">Precio de Venta *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="salePrice"
                    name="salePrice"
                    type="text"
                    value={formData.salePrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                {selectedMaterial && (
                  <p className="text-sm text-gray-500">
                    Precio de venta por {selectedMaterial.unitOfMeasure}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="outsourcedPrice">Precio de Subcontratación *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="outsourcedPrice"
                    name="outsourcedPrice"
                    type="text"
                    value={formData.outsourcedPrice}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
                {selectedMaterial && (
                  <p className="text-sm text-gray-500">
                    Precio de subcontratación por {selectedMaterial.unitOfMeasure}
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
                    <p>• <strong>Precio de Venta:</strong> Precio al que se vende el material al cliente</p>
                    <p>• <strong>Precio de Subcontratación:</strong> Precio que se paga a proveedores externos</p>
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
                disabled={isLoading || !formData.projectId || !formData.materialId || !formData.salePrice || !formData.outsourcedPrice}
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

