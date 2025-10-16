"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  X,
  Plus,
  Trash2,
  Building2,
  Package,
  User,
  Calendar,
  AlertTriangle,
  Info,
  Search
} from "lucide-react"
import { ProjectAutocomplete } from '@/components/ui/ProjectAutocomplete'
import { MaterialAutocomplete } from '@/components/ui/MaterialAutocomplete'

// Interface para proyectos
interface Project {
  id: string
  name: string
  description?: string
  location?: string
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
  description?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

interface CreateTripRequestModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  projects: Project[]
  materials: Material[]
}

export function CreateTripRequestModal({
  isOpen,
  onClose,
  onSuccess,
  projects,
  materials
}: CreateTripRequestModalProps) {
  const [formData, setFormData] = useState({
    projectId: '',
    priority: 'NORMAL',
    observations: ''
  })
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [selectedMaterials, setSelectedMaterials] = useState<Material[]>([])
  const [materialQuantities, setMaterialQuantities] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    setFormData(prev => ({ ...prev, projectId: project?.id || '' }))
  }

  const handleMaterialSelect = (materials: Material[]) => {
    setSelectedMaterials(materials)
    // Inicializar cantidades en 1 para materiales nuevos
    const newQuantities = { ...materialQuantities }
    materials.forEach(material => {
      if (!newQuantities[material.id]) {
        newQuantities[material.id] = '1'
      }
    })
    setMaterialQuantities(newQuantities)
  }

  const handleQuantityChange = (materialId: string, quantity: string) => {
    setMaterialQuantities(prev => ({ ...prev, [materialId]: quantity }))
  }

  const removeMaterial = (materialId: string) => {
    setSelectedMaterials(prev => prev.filter(m => m.id !== materialId))
    setMaterialQuantities(prev => {
      const newQuantities = { ...prev }
      delete newQuantities[materialId]
      return newQuantities
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      // Validar que se haya seleccionado un proyecto
      if (!formData.projectId) {
        throw new Error('Debe seleccionar un proyecto')
      }

      // Validar que se hayan seleccionado materiales
      if (selectedMaterials.length === 0) {
        throw new Error('Debe seleccionar al menos un material')
      }

      // Validar que todos los materiales tengan cantidad
      const invalidMaterials = selectedMaterials.some(m => {
        const quantity = materialQuantities[m.id]
        return !quantity || parseFloat(quantity) <= 0
      })
      if (invalidMaterials) {
        throw new Error('Todos los materiales deben tener una cantidad válida')
      }

      const response = await fetch('/api/trip-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          materials: selectedMaterials.map(material => ({
            materialId: material.id,
            requestedQuantity: parseFloat(materialQuantities[material.id])
          }))
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la solicitud')
      }

      setSuccess(true)
      setTimeout(() => {
        onSuccess()
        onClose()
      }, 1500)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al crear la solicitud')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      projectId: '',
      priority: 'NORMAL',
      observations: ''
    })
    setSelectedProject(null)
    setSelectedMaterials([])
    setMaterialQuantities({})
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  // Filtrar solo proyectos activos
  const activeProjects = projects.filter(project => project.client)
  const activeMaterials = materials.filter(material => material.isActive)

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-orange-600" />
            <CardTitle>Crear Solicitud de Viaje</CardTitle>
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
              {/* Proyecto */}
              <ProjectAutocomplete
                label="Proyecto"
                placeholder="Buscar proyecto..."
                value={selectedProject}
                onChange={handleProjectSelect}
                disabled={isLoading}
                required
              />

              {/* Prioridad */}
              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad *</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="NORMAL">Normal</option>
                  <option value="URGENT">Urgente</option>
                </select>
              </div>
            </div>

            {/* Observaciones */}
            <div className="space-y-2">
              <Label htmlFor="observations">Observaciones</Label>
              <Textarea
                id="observations"
                name="observations"
                value={formData.observations}
                onChange={handleInputChange}
                placeholder="Instrucciones especiales, ubicación específica, horarios, etc."
                disabled={isLoading}
                rows={3}
              />
            </div>

            {/* Materiales */}
            <div className="space-y-4">
              <MaterialAutocomplete
                label="Materiales Solicitados"
                placeholder="Buscar materiales..."
                selectedMaterials={selectedMaterials}
                onMaterialsChange={handleMaterialSelect}
                disabled={isLoading}
                required
                multiple={true}
              />

              {/* Cantidades de Materiales */}
              {selectedMaterials.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-medium">Cantidades</Label>
                  {selectedMaterials.map((material) => (
                    <div key={material.id} className="flex items-center gap-3 p-2 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <div>
                            <p className="font-semibold text-sm">{material.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {material.unitOfMeasure}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`quantity-${material.id}`} className="text-xs">Cantidad:</Label>
                          <Input
                            id={`quantity-${material.id}`}
                            type="number"
                            step="0.001"
                            min="0"
                            value={materialQuantities[material.id] || ''}
                            onChange={(e) => handleQuantityChange(material.id, e.target.value)}
                            placeholder="0.000"
                            required
                            disabled={isLoading}
                            className="w-24 h-8 text-sm"
                          />
                          <span className="text-xs text-muted-foreground">
                            {material.unitOfMeasure}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Información sobre solicitudes */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">Información sobre Solicitudes</h4>
                  <div className="text-sm text-blue-800 mt-1 space-y-1">
                    <p>• Las solicitudes se crean con estado "Pendiente" por defecto</p>
                    <p>• Los materiales solicitados deben tener cantidades válidas</p>
                    <p>• Las solicitudes urgentes tendrán prioridad en la programación</p>
                    <p>• Una vez creada, la solicitud puede ser programada y asignada a conductores</p>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <p className="text-red-800">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                  </div>
                  <p className="text-green-800">Solicitud creada exitosamente</p>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
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
                disabled={isLoading || !formData.projectId || selectedMaterials.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Building2 className="h-4 w-4 mr-2" />
                    Crear Solicitud
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
