"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Vehicle, FuelPurchaseFormData } from "@/types/fuel"

interface FuelPurchaseForEdit {
  id?: string
  date: Date
  vehicleId: string
  quantity: number
  total: number
  provider: string
  state?: boolean
  vehicle?: {
    id: string
    plate: string
    brand: string
    model: string
  }
}

interface FuelPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (data: FuelPurchaseFormData) => Promise<void>
  fuelPurchase?: FuelPurchaseForEdit | null
  isLoading?: boolean
}

export function FuelPurchaseModal({
  isOpen,
  onClose,
  onSave,
  fuelPurchase,
  isLoading = false
}: FuelPurchaseModalProps) {
  const [formData, setFormData] = useState({
    date: new Date(),
    vehicleId: '',
    quantity: '',
    total: '',
    provider: ''
  })
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Cargar vehículos al abrir el modal
  useEffect(() => {
    if (isOpen) {
      loadVehicles()
    }
  }, [isOpen])

  // Cargar datos del registro si es edición
  useEffect(() => {
    if (fuelPurchase && isOpen) {
      setFormData({
        date: new Date(fuelPurchase.date),
        vehicleId: fuelPurchase.vehicleId,
        quantity: fuelPurchase.quantity.toString(),
        total: fuelPurchase.total.toString(),
        provider: fuelPurchase.provider
      })
    } else if (isOpen) {
      // Resetear formulario para nuevo registro
      setFormData({
        date: new Date(),
        vehicleId: '',
        quantity: '',
        total: '',
        provider: ''
      })
    }
  }, [fuelPurchase, isOpen])

  const loadVehicles = async () => {
    setLoadingVehicles(true)
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error loading vehicles:', error)
    } finally {
      setLoadingVehicles(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.date) {
      newErrors.date = 'La fecha es obligatoria'
    }

    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Debe seleccionar un vehículo'
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'La cantidad debe ser mayor a 0'
    }

    if (!formData.total || parseFloat(formData.total) <= 0) {
      newErrors.total = 'El total debe ser mayor a 0'
    }

    if (!formData.provider.trim()) {
      newErrors.provider = 'El proveedor es obligatorio'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      await onSave({
        date: formData.date,
        vehicleId: formData.vehicleId,
        quantity: parseFloat(formData.quantity),
        total: parseFloat(formData.total),
        provider: formData.provider.trim()
      })
      onClose()
    } catch (error) {
      console.error('Error saving fuel purchase:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>
            {fuelPurchase ? 'Editar Compra de Combustible' : 'Nueva Compra de Combustible'}
          </CardTitle>
          <CardDescription>
            {fuelPurchase 
              ? 'Modifica los datos de la compra de combustible'
              : 'Registra una nueva compra de combustible'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.date ? formData.date.toLocaleDateString('es-CO') : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, date }))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.date && <p className="text-sm text-red-600">{errors.date}</p>}
            </div>

            {/* Vehículo */}
            <div className="space-y-2">
              <Label htmlFor="vehicleId">Vehículo *</Label>
              <Select
                value={formData.vehicleId}
                onValueChange={(value) => handleInputChange('vehicleId', value)}
                disabled={loadingVehicles}
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingVehicles ? "Cargando vehículos..." : "Seleccionar vehículo"} />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.plate} - {vehicle.brand} {vehicle.model} ({vehicle.year})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.vehicleId && <p className="text-sm text-red-600">{errors.vehicleId}</p>}
            </div>

            {/* Cantidad */}
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad (L) *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.1"
                min="0"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="Ej: 45.5"
              />
              {errors.quantity && <p className="text-sm text-red-600">{errors.quantity}</p>}
            </div>

            {/* Total */}
            <div className="space-y-2">
              <Label htmlFor="total">Total ($) *</Label>
              <Input
                id="total"
                type="number"
                step="0.01"
                min="0"
                value={formData.total}
                onChange={(e) => handleInputChange('total', e.target.value)}
                placeholder="Ej: 125.50"
              />
              {errors.total && <p className="text-sm text-red-600">{errors.total}</p>}
            </div>

            {/* Proveedor */}
            <div className="space-y-2">
              <Label htmlFor="provider">Proveedor *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                placeholder="Ej: Estación Central"
              />
              {errors.provider && <p className="text-sm text-red-600">{errors.provider}</p>}
            </div>

            {/* Botones */}
            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  fuelPurchase ? 'Actualizar' : 'Crear'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
