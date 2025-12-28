"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { X, ClipboardList, AlertCircle, CheckCircle, User, Truck, Calendar, Gauge, MessageSquare } from "lucide-react"

interface Driver {
  id: string
  name: string
  identification: string
  license: string
}

interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
}

interface PreoperationalItem {
  id: number
  name: string
  isActive: boolean
}

interface ItemDetail {
  itemId: number
  passed: boolean
  observations: string
}

interface CreatePreoperationalInspectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  driverId?: string // ID del conductor (para cuando se usa desde DriverDashboard)
}

export function CreatePreoperationalInspectionModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  driverId: propDriverId
}: CreatePreoperationalInspectionModalProps) {
  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().slice(0, 10),
    driverId: '',
    vehicleId: '',
    initialMileage: '',
    finalMileage: ''
  })
  const [items, setItems] = useState<PreoperationalItem[]>([])
  const [itemDetails, setItemDetails] = useState<Record<number, ItemDetail>>({})
  const [openObservations, setOpenObservations] = useState<Record<number, boolean>>({})
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Cargar datos cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      fetchItems()
      fetchDrivers()
      fetchVehicles()
      resetForm()
    }
  }, [isOpen])

  // Cargar items preoperacionales activos
  const fetchItems = async () => {
    try {
      const response = await fetch('/api/preoperational-items?active=true')
      if (response.ok) {
        const data = await response.json()
        setItems(data.filter((item: PreoperationalItem) => item.isActive))
        
        // Inicializar detalles de items
        const initialDetails: Record<number, ItemDetail> = {}
        data.filter((item: PreoperationalItem) => item.isActive).forEach((item: PreoperationalItem) => {
          initialDetails[item.id] = {
            itemId: item.id,
            passed: false,
            observations: ''
          }
        })
        setItemDetails(initialDetails)
        setOpenObservations({})
      }
    } catch (error) {
      console.error('Error fetching items:', error)
    }
  }

  // Cargar conductores activos
  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers?active=true')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data.filter((d: Driver) => d.isActive))
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    }
  }

  // Cargar vehículos activos (si hay driverId, solo los asignados a ese conductor)
  const fetchVehicles = async () => {
    try {
      const url = propDriverId 
        ? `/api/vehicles?active=true&driverId=${propDriverId}`
        : '/api/vehicles?active=true'
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setVehicles(data.filter((v: Vehicle) => v.isActive))
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  // Validar que solo sean números para kilometraje
  const handleMileageChange = (field: 'initialMileage' | 'finalMileage', value: string) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '')
    handleInputChange(field, numericValue)
  }

  const handleItemChange = (itemId: number, field: keyof ItemDetail, value: boolean | string) => {
    setItemDetails(prev => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value
      }
    }))
  }

  const toggleItemPassed = (itemId: number) => {
    const current = itemDetails[itemId]?.passed ?? false
    handleItemChange(itemId, 'passed', !current)
  }

  const toggleObservations = (itemId: number) => {
    setOpenObservations(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validaciones
    if (!formData.driverId || !formData.vehicleId || !formData.inspectionDate) {
      setError('Fecha de inspección, conductor y vehículo son requeridos')
      setIsLoading(false)
      return
    }

    // Convertir detalles a array
    const details = Object.values(itemDetails).map(detail => ({
      itemId: detail.itemId,
      passed: detail.passed,
      observations: detail.observations || null,
      photoUrl: null
    }))

    try {
      const response = await fetch('/api/preoperational-inspections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspectionDate: new Date(formData.inspectionDate).toISOString(),
          driverId: formData.driverId,
          vehicleId: formData.vehicleId,
          initialMileage: formData.initialMileage ? parseFloat(formData.initialMileage) : null,
          finalMileage: formData.finalMileage ? parseFloat(formData.finalMileage) : null,
          details
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la inspección')
      }

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        onSuccess()
        onClose()
        resetForm()
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la inspección')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      inspectionDate: new Date().toISOString().slice(0, 10),
      driverId: propDriverId || '',
      vehicleId: '',
      initialMileage: '',
      finalMileage: ''
    })
    setItemDetails({})
    setOpenObservations({})
    setError('')
    setSuccess(false)
  }

  const handleClose = () => {
    if (!isLoading) {
      resetForm()
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
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-orange-600" />
            <CardTitle>Nueva Inspección Preoperacional</CardTitle>
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
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="inspectionDate">Fecha de Inspección *</Label>
                <Input
                  id="inspectionDate"
                  type="date"
                  value={formData.inspectionDate}
                  onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {!propDriverId ? (
                <div className="space-y-2">
                  <Label htmlFor="driverId">Conductor *</Label>
                  <Select 
                    value={formData.driverId} 
                    onValueChange={(value) => handleInputChange('driverId', value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un conductor" />
                    </SelectTrigger>
                    <SelectContent>
                      {drivers.map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <div>
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {driver.identification} - {driver.license}
                              </p>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="driverId">Conductor *</Label>
                  <Input
                    id="driverId"
                    value={drivers.find(d => d.id === propDriverId)?.name || 'Cargando...'}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehículo *</Label>
                <Select 
                  value={formData.vehicleId} 
                  onValueChange={(value) => handleInputChange('vehicleId', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un vehículo" />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        <div className="flex items-center gap-2">
                          <Truck className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium">{vehicle.plate}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.brand} {vehicle.model}
                            </p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Kilometraje */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="initialMileage">
                  <Gauge className="h-4 w-4 inline mr-2" />
                  Kilometraje Inicial
                </Label>
                <Input
                  id="initialMileage"
                  type="text"
                  inputMode="numeric"
                  value={formData.initialMileage}
                  onChange={(e) => handleMileageChange('initialMileage', e.target.value)}
                  placeholder="Ej: 50000"
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="finalMileage">
                  <Gauge className="h-4 w-4 inline mr-2" />
                  Kilometraje Final
                </Label>
                <Input
                  id="finalMileage"
                  type="text"
                  inputMode="numeric"
                  value={formData.finalMileage}
                  onChange={(e) => handleMileageChange('finalMileage', e.target.value)}
                  placeholder="Ej: 50050"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Items preoperacionales */}
            <div className="space-y-4">
              <Label>Verificación de Items Preoperacionales</Label>
              <div className="border rounded-lg p-4 space-y-4 max-h-96 overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No hay items preoperacionales activos. 
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto ml-1"
                      onClick={() => {
                        onClose()
                        window.location.href = '/areas/logistics/preoperational/items'
                      }}
                    >
                      Crear items primero
                    </Button>
                  </p>
                ) : (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const detail = itemDetails[item.id] || {
                        itemId: item.id,
                        passed: false,
                        observations: ''
                      }
                      const isObservationsOpen = openObservations[item.id] || false
                      return (
                        <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">{item.name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {detail.passed ? 'Bien' : 'Mal'}
                            </span>
                            <Switch
                              checked={detail.passed}
                              onCheckedChange={() => toggleItemPassed(item.id)}
                              disabled={isLoading}
                            />
                          </div>
                          <Button
                            type="button"
                            variant={isObservationsOpen ? "default" : "outline"}
                            size="sm"
                            onClick={() => toggleObservations(item.id)}
                            disabled={isLoading}
                          >
                            <MessageSquare className="h-4 w-4 mr-1" />
                            Observación
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Campos de observaciones expandibles */}
              {Object.keys(openObservations).filter(key => openObservations[parseInt(key)]).length > 0 && (
                <div className="space-y-3 mt-4">
                  {Object.keys(openObservations)
                    .filter(key => openObservations[parseInt(key)])
                    .map(key => {
                      const itemId = parseInt(key)
                      const item = items.find(i => i.id === itemId)
                      const detail = itemDetails[itemId] || { itemId, passed: false, observations: '' }
                      return (
                        <div key={itemId} className="border rounded-lg p-4 bg-gray-50">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="font-medium">{item?.name}</Label>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleObservations(itemId)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                          <Textarea
                            placeholder="Ingresa las observaciones para este item..."
                            value={detail.observations}
                            onChange={(e) => handleItemChange(itemId, 'observations', e.target.value)}
                            disabled={isLoading}
                            rows={3}
                          />
                        </div>
                      )
                    })}
                </div>
              )}
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
                  Inspección creada exitosamente
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
                disabled={isLoading || !formData.driverId || !formData.vehicleId || items.length === 0}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando...
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    Crear Inspección
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
