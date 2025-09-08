"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Truck, AlertCircle, CheckCircle } from "lucide-react"
import { CustomSelect } from "@/components/ui/custom-select"
import { DatePicker } from "@/components/ui/date-picker"

interface Owner {
  id: string
  document: string
  firstName: string
  lastName: string
  isActive: boolean
}

interface CreateVehicleModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function CreateVehicleModal({ isOpen, onClose, onSuccess }: CreateVehicleModalProps) {
  const [formData, setFormData] = useState({
    plate: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    type: '',
    status: 'active',
    driver: '',
    location: '',
    odometer: 0,
    fuelType: '',
    lastMaintenance: '',
    nextMaintenance: '',
    isActive: true,
    ownerId: ''
  })
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Cargar propietarios cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchOwners()
    }
  }, [isOpen])

  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners')
      if (response.ok) {
        const data = await response.json()
        setOwners(data.filter((owner: Owner) => owner.isActive))
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleDateChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const submitData = {
        ...formData,
        ownerId: formData.ownerId || null,
        lastMaintenance: formData.lastMaintenance || null,
        nextMaintenance: formData.nextMaintenance || null
      }

      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear el vehículo')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        resetForm()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el vehículo')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      plate: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      type: '',
      status: 'active',
      driver: '',
      location: '',
      odometer: 0,
      fuelType: '',
      lastMaintenance: '',
      nextMaintenance: '',
      isActive: true,
      ownerId: ''
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-orange-600" />
            <CardTitle>Crear Vehículo</CardTitle>
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
                <Label htmlFor="plate">Placa *</Label>
                <Input
                  id="plate"
                  name="plate"
                  type="text"
                  value={formData.plate}
                  onChange={handleInputChange}
                  placeholder="ABC-123"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Marca *</Label>
                <Input
                  id="brand"
                  name="brand"
                  type="text"
                  value={formData.brand}
                  onChange={handleInputChange}
                  placeholder="Toyota"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Modelo *</Label>
                <Input
                  id="model"
                  name="model"
                  type="text"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="Hilux"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Año *</Label>
                <Input
                  id="year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleInputChange}
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <CustomSelect
                  options={[
                    { value: "Camión", label: "Camión" },
                    { value: "Van", label: "Van" },
                    { value: "Pickup", label: "Pickup" },
                    { value: "Automóvil", label: "Automóvil" },
                    { value: "Motocicleta", label: "Motocicleta" }
                  ]}
                  value={formData.type}
                  onChange={(value) => handleSelectChange('type', value)}
                  placeholder="Seleccionar tipo"
                  disabled={isLoading}
                  ariaLabel="Tipo de vehículo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fuelType">Tipo de Combustible *</Label>
                <CustomSelect
                  options={[
                    { value: "Diesel", label: "Diesel" },
                    { value: "Gasolina", label: "Gasolina" },
                    { value: "Gas", label: "Gas" },
                    { value: "Eléctrico", label: "Eléctrico" }
                  ]}
                  value={formData.fuelType}
                  onChange={(value) => handleSelectChange('fuelType', value)}
                  placeholder="Seleccionar combustible"
                  disabled={isLoading}
                  ariaLabel="Tipo de combustible"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <CustomSelect
                  options={[
                    { value: "active", label: "Activo" },
                    { value: "inactive", label: "Inactivo" }
                  ]}
                  value={formData.status}
                  onChange={(value) => handleSelectChange('status', value)}
                  placeholder="Seleccionar estado"
                  disabled={isLoading}
                  ariaLabel="Estado del vehículo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ownerId">Propietario</Label>
                <CustomSelect
                  options={[
                    { value: "", label: "Sin propietario" },
                    ...owners.map((owner) => ({
                      value: owner.id,
                      label: `${owner.firstName} ${owner.lastName} (${owner.document})`
                    }))
                  ]}
                  value={formData.ownerId}
                  onChange={(value) => handleSelectChange('ownerId', value)}
                  placeholder="Seleccionar propietario"
                  disabled={isLoading}
                  ariaLabel="Propietario del vehículo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver">Conductor</Label>
                <Input
                  id="driver"
                  name="driver"
                  type="text"
                  value={formData.driver}
                  onChange={handleInputChange}
                  placeholder="Nombre del conductor"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Ubicación</Label>
                <Input
                  id="location"
                  name="location"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Ubicación actual"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="odometer">Odómetro (km)</Label>
                <Input
                  id="odometer"
                  name="odometer"
                  type="number"
                  value={formData.odometer}
                  onChange={handleInputChange}
                  min="0"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastMaintenance">Último Mantenimiento</Label>
                <DatePicker
                  value={formData.lastMaintenance}
                  onChange={(value) => handleDateChange('lastMaintenance', value)}
                  placeholder="Seleccionar fecha"
                  disabled={isLoading}
                  ariaLabel="Último mantenimiento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextMaintenance">Próximo Mantenimiento</Label>
                <DatePicker
                  value={formData.nextMaintenance}
                  onChange={(value) => handleDateChange('nextMaintenance', value)}
                  placeholder="Seleccionar fecha"
                  disabled={isLoading}
                  ariaLabel="Próximo mantenimiento"
                />
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
                aria-label="Vehículo activo"
              />
              <Label htmlFor="isActive">Vehículo activo</Label>
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
                  Vehículo creado exitosamente
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
                disabled={isLoading || !formData.plate || !formData.brand || !formData.model || !formData.type || !formData.fuelType}
                className="flex-1"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <Truck className="h-4 w-4 mr-2" />
                    Crear Vehículo
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
