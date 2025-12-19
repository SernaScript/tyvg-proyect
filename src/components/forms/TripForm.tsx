'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Calendar,
  AlertCircle,
  DollarSign,
  Scale,
  Save,
  Plus
} from 'lucide-react'
import { ProjectAutocomplete } from '@/components/ui/ProjectAutocomplete'
import { MaterialAutocomplete } from '@/components/ui/MaterialAutocomplete'
import { MeasureType, Trip } from '@/types/trip'

interface Driver {
  id: string
  name: string
  identification: string
  license: string
  phone?: string
  email?: string
  isActive: boolean
}

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  capacityTons?: number
  capacityM3?: number
  ownershipType: 'OWNED' | 'OUTSOURCED'
  isActive: boolean
}

interface Project {
  id: string
  name: string
  description?: string
  address?: string
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

interface TripFormProps {
  initialData?: Trip | null
  onSubmit: (data: any) => Promise<void>
  onCancel?: () => void
  loading?: boolean
  showSaveAndAddAnother?: boolean
  onSaveAndAddAnother?: () => void
  showApprovalCheckbox?: boolean
}

export function TripForm({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  showSaveAndAddAnother = false,
  onSaveAndAddAnother,
  showApprovalCheckbox = false
}: TripFormProps) {
  const [formData, setFormData] = useState(() => ({
    materialId: initialData?.materialId || '',
    projectId: initialData?.projectId || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    driverId: initialData?.driverId || '',
    vehicleId: initialData?.vehicleId || '',
    incomingReceiptNumber: initialData?.incomingReceiptNumber || '',
    outcomingReceiptNumber: initialData?.outcomingReceiptNumber || '',
    quantity: initialData?.quantity?.toString() || '',
    measure: (initialData?.measure as MeasureType) || '' as MeasureType | '',
    salePrice: initialData?.salePrice?.toString() || '',
    outsourcedPrice: initialData?.outsourcedPrice?.toString() || '',
    isApproved: initialData?.isApproved || false,
    observation: initialData?.observation || ''
  }))

  const [selectedProject, setSelectedProject] = useState<Project | null>(() =>
    initialData?.project ? {
      id: initialData.project.id,
      name: initialData.project.name,
      description: initialData.project.description || undefined,
      address: initialData.project.address || undefined,
      isActive: initialData.project.isActive,
      client: {
        id: initialData.project.client.id,
        name: initialData.project.client.name,
        identification: initialData.project.client.identification
      }
    } : null
  )

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(() =>
    initialData?.material ? {
      id: initialData.material.id,
      name: initialData.material.name,
      type: initialData.material.type,
      unitOfMeasure: initialData.material.unitOfMeasure,
      description: initialData.material.description || undefined,
      isActive: initialData.material.isActive,
      createdAt: new Date(initialData.material.createdAt),
      updatedAt: new Date(initialData.material.updatedAt)
    } : null
  )

  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchDrivers()
    fetchVehicles()
  }, [])

  // Update form data when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        materialId: initialData.materialId || '',
        projectId: initialData.projectId || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        driverId: initialData.driverId || '',
        vehicleId: initialData.vehicleId || '',
        incomingReceiptNumber: initialData.incomingReceiptNumber || '',
        outcomingReceiptNumber: initialData.outcomingReceiptNumber || '',
        quantity: initialData.quantity?.toString() || '',
        measure: (initialData.measure as MeasureType) || '' as MeasureType | '',
        salePrice: initialData.salePrice?.toString() || '',
        outsourcedPrice: initialData.outsourcedPrice?.toString() || '',
        isApproved: initialData.isApproved || false,
        observation: initialData.observation || ''
      })

      if (initialData.project) {
        setSelectedProject({
          id: initialData.project.id,
          name: initialData.project.name,
          description: initialData.project.description || undefined,
          address: initialData.project.address || undefined,
          isActive: initialData.project.isActive,
          client: {
            id: initialData.project.client.id,
            name: initialData.project.client.name,
            identification: initialData.project.client.identification
          }
        })
      }

      if (initialData.material) {
        setSelectedMaterial({
          id: initialData.material.id,
          name: initialData.material.name,
          type: initialData.material.type,
          unitOfMeasure: initialData.material.unitOfMeasure,
          description: initialData.material.description || undefined,
          isActive: initialData.material.isActive,
          createdAt: new Date(initialData.material.createdAt),
          updatedAt: new Date(initialData.material.updatedAt)
        })
      }
    }
  }, [initialData])

  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?active=true')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles?isActive=true')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleProjectSelect = (project: Project | null) => {
    setSelectedProject(project)
    setFormData(prev => ({ ...prev, projectId: project?.id || '' }))
    if (errors.projectId) {
      setErrors(prev => ({ ...prev, projectId: '' }))
    }
  }

  const handleMaterialSelect = (materials: Material[]) => {
    const material = materials.length > 0 ? materials[0] : null
    setSelectedMaterial(material)
    setFormData(prev => ({ ...prev, materialId: material?.id || '' }))
    if (errors.materialId) {
      setErrors(prev => ({ ...prev, materialId: '' }))
    }
  }

  const handleInputChange = (field: string, value: string) => {
    // Special handling for quantity field - only allow numbers and decimal point
    if (field === 'quantity') {
      const numericRegex = /^[0-9]*\.?[0-9]*$/
      if (value === '' || numericRegex.test(value)) {
        setFormData(prev => ({ ...prev, [field]: value }))
        if (errors[field]) {
          setErrors(prev => ({ ...prev, [field]: '' }))
        }
      }
      return
    }

    // Special handling for price fields - validate outsourced price vs sale price
    if (field === 'salePrice' || field === 'outsourcedPrice') {
      setFormData(prev => {
        const newData = { ...prev, [field]: value }
        
        // Validate outsourced price is not greater than sale price
        if (field === 'outsourcedPrice' && value && newData.salePrice) {
          const outsourced = parseFloat(value)
          const sale = parseFloat(newData.salePrice)
          if (!isNaN(outsourced) && !isNaN(sale) && outsourced > sale) {
            setErrors(prev => ({ 
              ...prev, 
              outsourcedPrice: 'El precio de subcontratación no puede ser mayor al precio de venta'
            }))
            return prev
          }
        }
        
        // Validate sale price when outsourced price exists
        if (field === 'salePrice' && value && newData.outsourcedPrice) {
          const sale = parseFloat(value)
          const outsourced = parseFloat(newData.outsourcedPrice)
          if (!isNaN(sale) && !isNaN(outsourced) && outsourced > sale) {
            setErrors(prev => ({ 
              ...prev, 
              outsourcedPrice: 'El precio de subcontratación no puede ser mayor al precio de venta'
            }))
          } else if (errors.outsourcedPrice && outsourced <= sale) {
            setErrors(prev => ({ ...prev, outsourcedPrice: '' }))
          }
        }
        
        return newData
      })
      
      if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }))
      }
      return
    }
    
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.materialId) {
      newErrors.materialId = 'El material es requerido'
    }

    if (!formData.projectId) {
      newErrors.projectId = 'El proyecto es requerido'
    }

    if (!formData.date) {
      newErrors.date = 'La fecha es requerida'
    }

    if (!formData.driverId) {
      newErrors.driverId = 'El conductor es requerido'
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'El vehículo es requerido'
    }

    if (!formData.quantity || formData.quantity.trim() === '') {
      newErrors.quantity = 'La cantidad es requerida'
    } else {
      const quantityValue = parseFloat(formData.quantity)
      if (isNaN(quantityValue) || quantityValue <= 0) {
        newErrors.quantity = 'La cantidad debe ser un número mayor a cero'
      }
    }

    if (!formData.measure) {
      newErrors.measure = 'La medida es requerida'
    }

    if (formData.salePrice && parseFloat(formData.salePrice) < 0) {
      newErrors.salePrice = 'El precio de venta no puede ser negativo'
    }

    if (formData.outsourcedPrice && parseFloat(formData.outsourcedPrice) < 0) {
      newErrors.outsourcedPrice = 'El precio tercerizado no puede ser negativo'
    }

    // Validate that outsourced price is not greater than sale price
    if (formData.salePrice && formData.outsourcedPrice) {
      const salePrice = parseFloat(formData.salePrice)
      const outsourcedPrice = parseFloat(formData.outsourcedPrice)
      if (!isNaN(salePrice) && !isNaN(outsourcedPrice) && outsourcedPrice > salePrice) {
        newErrors.outsourcedPrice = 'El precio de subcontratación no puede ser mayor al precio de venta'
      }
    }

    // Block submission if outsourced price is greater than sale price
    if (formData.salePrice && formData.outsourcedPrice) {
      const salePrice = parseFloat(formData.salePrice)
      const outsourcedPrice = parseFloat(formData.outsourcedPrice)
      if (!isNaN(salePrice) && !isNaN(outsourcedPrice) && outsourcedPrice > salePrice) {
        newErrors.submit = 'No se puede guardar: El precio de subcontratación es mayor al precio de venta'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (saveAndAddAnother: boolean = false) => {
    if (!validateForm()) {
      return
    }

    try {
      await onSubmit({
        materialId: formData.materialId,
        projectId: formData.projectId,
        date: formData.date,
        driverId: formData.driverId,
        vehicleId: formData.vehicleId,
        incomingReceiptNumber: formData.incomingReceiptNumber || null,
        outcomingReceiptNumber: formData.outcomingReceiptNumber || null,
        quantity: parseFloat(formData.quantity),
        measure: formData.measure,
        salePrice: formData.salePrice ? parseFloat(formData.salePrice) : 0,
        outsourcedPrice: formData.outsourcedPrice ? parseFloat(formData.outsourcedPrice) : 0,
        isApproved: formData.isApproved,
        observation: formData.observation || null
      })

      if (saveAndAddAnother && onSaveAndAddAnother) {
        onSaveAndAddAnother()
      }
    } catch (error) {
      console.error('Error submitting form:', error)
      setErrors({ submit: 'Error al guardar el viaje' })
    }
  }

  return (
    <form className="space-y-6">
      {/* 4 Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Column 1: Fecha, Proyecto, Material, Vehículo */}
        <div className="space-y-4">
          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
            />
            {errors.date && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.date}
              </p>
            )}
          </div>

          {/* Project Selection */}
          <div className="space-y-2">
            <ProjectAutocomplete
              label="Proyecto"
              placeholder="Buscar proyecto..."
              value={selectedProject}
              onChange={handleProjectSelect}
              error={errors.projectId}
              disabled={loading}
              required
            />
          </div>

          {/* Material Selection */}
          <div className="space-y-2">
            <Label>Material *</Label>
            <MaterialAutocomplete
              selectedMaterials={selectedMaterial ? [selectedMaterial] : []}
              onMaterialsChange={handleMaterialSelect}
              disabled={loading}
              multiple={false}
            />
            {errors.materialId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.materialId}
              </p>
            )}
          </div>

          {/* Vehicle Selection */}
          <div className="space-y-2">
            <Label htmlFor="vehicleId">Vehículo *</Label>
            <Select value={formData.vehicleId} onValueChange={(value) => handleInputChange('vehicleId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un vehículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles.map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    <div>
                      <p className="font-medium">{vehicle.plate}</p>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model}
                        {vehicle.capacityTons && ` • ${vehicle.capacityTons}T`}
                        {vehicle.capacityM3 && ` • ${vehicle.capacityM3}m³`}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.vehicleId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.vehicleId}
              </p>
            )}
          </div>
        </div>

        {/* Column 2: Conductor, Número de entrada, Número de salida, Cantidad, Medida */}
        <div className="space-y-4">
          {/* Driver Selection */}
          <div className="space-y-2">
            <Label htmlFor="driverId">Conductor *</Label>
            <Select value={formData.driverId} onValueChange={(value) => handleInputChange('driverId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un conductor" />
              </SelectTrigger>
              <SelectContent>
                {drivers.map((driver) => (
                  <SelectItem key={driver.id} value={driver.id}>
                    <div>
                      <p className="font-medium">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Lic: {driver.license} • Doc: {driver.identification}
                      </p>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.driverId && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.driverId}
              </p>
            )}
          </div>

          {/* Incoming Receipt Number */}
          <div className="space-y-2">
            <Label htmlFor="incomingReceiptNumber">Número de Recibo de Entrada</Label>
            <Input
              id="incomingReceiptNumber"
              value={formData.incomingReceiptNumber}
              onChange={(e) => handleInputChange('incomingReceiptNumber', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {/* Outcoming Receipt Number */}
          <div className="space-y-2">
            <Label htmlFor="outcomingReceiptNumber">Número de Recibo de Salida</Label>
            <Input
              id="outcomingReceiptNumber"
              value={formData.outcomingReceiptNumber}
              onChange={(e) => handleInputChange('outcomingReceiptNumber', e.target.value)}
              placeholder="Opcional"
            />
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="quantity">Cantidad *</Label>
            <Input
              id="quantity"
              type="text"
              inputMode="decimal"
              value={formData.quantity}
              onChange={(e) => handleInputChange('quantity', e.target.value)}
              onBlur={(e) => {
                const value = e.target.value.trim()
                if (value && !isNaN(parseFloat(value))) {
                  const numValue = parseFloat(value)
                  if (numValue > 0) {
                    setFormData(prev => ({ ...prev, quantity: numValue.toString() }))
                  }
                }
              }}
              placeholder="0.000"
            />
            {errors.quantity && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.quantity}
              </p>
            )}
          </div>

          {/* Measure */}
          <div className="space-y-2">
            <Label htmlFor="measure">Medida *</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={formData.measure === MeasureType.METROS_CUBICOS ? "default" : "outline"}
                onClick={() => handleInputChange('measure', MeasureType.METROS_CUBICOS)}
                className="flex-1"
                disabled={loading}
              >
                <Scale className="h-4 w-4 mr-2" />
                Metros Cúbicos
              </Button>
              <Button
                type="button"
                variant={formData.measure === MeasureType.TONELADAS ? "default" : "outline"}
                onClick={() => handleInputChange('measure', MeasureType.TONELADAS)}
                className="flex-1"
                disabled={loading}
              >
                <Scale className="h-4 w-4 mr-2" />
                Toneladas
              </Button>
            </div>
            {errors.measure && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.measure}
              </p>
            )}
          </div>
        </div>

        {/* Column 3: Precio de venta, Precio Subcontratación */}
        <div className="space-y-4">
          {/* Sale Price */}
          <div className="space-y-2">
            <Label htmlFor="salePrice">Precio de Venta</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="salePrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
            {errors.salePrice && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.salePrice}
              </p>
            )}
          </div>

          {/* Outsourced Price */}
          <div className="space-y-2">
            <Label htmlFor="outsourcedPrice">Precio Tercerizado</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="outsourcedPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.outsourcedPrice}
                onChange={(e) => handleInputChange('outsourcedPrice', e.target.value)}
                placeholder="0.00"
                className="pl-9"
              />
            </div>
            {errors.outsourcedPrice && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.outsourcedPrice}
              </p>
            )}
          </div>

          {/* Approval Checkbox (only in edit mode) */}
          {showApprovalCheckbox && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isApproved"
                  checked={formData.isApproved}
                  onChange={(e) => setFormData(prev => ({ ...prev, isApproved: e.target.checked }))}
                  disabled={loading}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                  aria-label="Aprobar viaje"
                />
                <Label htmlFor="isApproved" className="font-normal cursor-pointer">
                  Aprobar Viaje
                </Label>
              </div>
            </div>
          )}
        </div>

        {/* Column 4: Cálculos y Observaciones */}
        <div className="space-y-4">
          {/* Total Sale Price (Cantidad × Precio de Venta) */}
          <div className="space-y-2">
            <Label>Total Venta</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={(() => {
                  const quantity = parseFloat(formData.quantity) || 0
                  const salePrice = parseFloat(formData.salePrice) || 0
                  const total = quantity * salePrice
                  return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(total)
                })()}
                readOnly
                className="pl-9 bg-muted"
              />
            </div>
          </div>

          {/* Total Outsourced Price (Cantidad × Precio Tercerizado) */}
          <div className="space-y-2">
            <Label>Total Tercerizado</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={(() => {
                  const quantity = parseFloat(formData.quantity) || 0
                  const outsourcedPrice = parseFloat(formData.outsourcedPrice) || 0
                  const total = quantity * outsourcedPrice
                  return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                  }).format(total)
                })()}
                readOnly
                className="pl-9 bg-muted"
              />
            </div>
          </div>

          {/* Profit Percentage */}
          <div className="space-y-2">
            <Label>% Utilidad</Label>
            <div className="relative">
              <Input
                type="text"
                value={(() => {
                  const salePrice = parseFloat(formData.salePrice) || 0
                  const outsourcedPrice = parseFloat(formData.outsourcedPrice) || 0
                  if (salePrice === 0) return '0.00%'
                  const profit = salePrice - outsourcedPrice
                  const profitPercentage = (profit / salePrice) * 100
                  return `${profitPercentage >= 0 ? '+' : ''}${profitPercentage.toFixed(2)}%`
                })()}
                readOnly
                className={(() => {
                  const salePrice = parseFloat(formData.salePrice) || 0
                  const outsourcedPrice = parseFloat(formData.outsourcedPrice) || 0
                  const profit = salePrice - outsourcedPrice
                  const profitPercentage = (profit / salePrice) * 100
                  return `bg-muted ${profitPercentage >= 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}`
                })()}
              />
            </div>
          </div>

          {/* Observation */}
          <div className="space-y-2">
            <Label htmlFor="observation">Observaciones</Label>
            <Textarea
              id="observation"
              value={formData.observation}
              onChange={(e) => handleInputChange('observation', e.target.value)}
              placeholder="Observaciones adicionales para el viaje..."
              rows={4}
            />
          </div>
        </div>
      </div>

      {errors.submit && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.submit}
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        )}
        {showSaveAndAddAnother && onSaveAndAddAnother && (
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit(true)}
            disabled={loading || !formData.materialId || !formData.projectId || !formData.date || !formData.driverId || !formData.vehicleId || !formData.quantity || !formData.measure || (formData.salePrice && formData.outsourcedPrice && parseFloat(formData.outsourcedPrice) > parseFloat(formData.salePrice))}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Guardar y Agregar Otro
              </>
            )}
          </Button>
        )}
        <Button
          type="button"
          onClick={() => handleSubmit(false)}
          disabled={loading || !formData.materialId || !formData.projectId || !formData.date || !formData.driverId || !formData.vehicleId || !formData.quantity || !formData.measure || (formData.salePrice && formData.outsourcedPrice && parseFloat(formData.outsourcedPrice) > parseFloat(formData.salePrice))}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </>
          )}
        </Button>
      </div>
    </form>
  )
}

