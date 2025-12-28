"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, ClipboardList, AlertCircle, CheckCircle, User, Truck, Calendar, Gauge, MessageSquare } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

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
    isActive: boolean
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

export default function CreatePreoperationalInspectionPage() {
    const router = useRouter()
    const { user } = useAuth()
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
    const [driverId, setDriverId] = useState<string | null>(null)

    useEffect(() => {
        fetchDriverId()
        fetchItems()
        fetchVehicles()
    }, [])

    useEffect(() => {
        if (driverId) {
            setFormData(prev => ({ ...prev, driverId }))
            fetchVehicles()
        }
    }, [driverId])

    const fetchDriverId = async () => {
        try {
            const response = await fetch('/api/drivers/me')
            if (response.ok) {
                const driver = await response.json()
                setDriverId(driver.id)
                setFormData(prev => ({ ...prev, driverId: driver.id }))
            }
        } catch (error) {
            console.error('Error fetching driver ID:', error)
        }
    }

    const fetchItems = async () => {
        try {
            const response = await fetch('/api/preoperational-items?active=true')
            if (response.ok) {
                const data = await response.json()
                const activeItems = data.filter((item: PreoperationalItem) => item.isActive)
                setItems(activeItems)

                const initialDetails: Record<number, ItemDetail> = {}
                activeItems.forEach((item: PreoperationalItem) => {
                    initialDetails[item.id] = {
                        itemId: item.id,
                        passed: false,
                        observations: ''
                    }
                })
                setItemDetails(initialDetails)
            }
        } catch (error) {
            console.error('Error fetching items:', error)
        }
    }

    const fetchVehicles = async () => {
        try {
            const url = driverId
                ? `/api/vehicles?active=true&driverId=${driverId}`
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

    const handleMileageChange = (field: 'initialMileage' | 'finalMileage', value: string) => {
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

        if (!formData.driverId || !formData.vehicleId || !formData.inspectionDate) {
            setError('Fecha de inspección, conductor y vehículo son requeridos')
            setIsLoading(false)
            return
        }

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
                router.push('/driver')
            }, 1500)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al crear la inspección')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header fijo */}
            <div className="sticky top-0 z-10 bg-white border-b shadow-sm">
                <div className="flex items-center gap-2 p-3">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/driver')}
                        className="h-8 w-8 p-0"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2 flex-1">
                        <ClipboardList className="h-5 w-5 text-orange-600" />
                        <h1 className="text-base font-semibold">Nueva Inspección</h1>
                    </div>
                </div>
            </div>

            <div className="p-3 space-y-3">
                <form onSubmit={handleSubmit} className="space-y-3">
                    {/* Información básica - 2 columnas en móvil */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Información Básica</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="inspectionDate" className="text-xs">Fecha *</Label>
                                    <Input
                                        id="inspectionDate"
                                        type="date"
                                        value={formData.inspectionDate}
                                        onChange={(e) => handleInputChange('inspectionDate', e.target.value)}
                                        required
                                        disabled={isLoading}
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="vehicleId" className="text-xs">Vehículo *</Label>
                                    <Select
                                        value={formData.vehicleId}
                                        onValueChange={(value) => handleInputChange('vehicleId', value)}
                                        required
                                    >
                                        <SelectTrigger className="h-8 text-xs">
                                            <SelectValue placeholder="Vehículo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {vehicles.map((vehicle) => (
                                                <SelectItem key={vehicle.id} value={vehicle.id} className="text-xs">
                                                    {vehicle.plate}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Kilometraje - 2 columnas */}
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label htmlFor="initialMileage" className="text-xs">Km Inicial</Label>
                                    <Input
                                        id="initialMileage"
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.initialMileage}
                                        onChange={(e) => handleMileageChange('initialMileage', e.target.value)}
                                        placeholder="0"
                                        disabled={isLoading}
                                        className="h-8 text-xs"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="finalMileage" className="text-xs">Km Final</Label>
                                    <Input
                                        id="finalMileage"
                                        type="text"
                                        inputMode="numeric"
                                        value={formData.finalMileage}
                                        onChange={(e) => handleMileageChange('finalMileage', e.target.value)}
                                        placeholder="0"
                                        disabled={isLoading}
                                        className="h-8 text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Items preoperacionales - Dividido en columnas */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Items Preoperacionales</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {items.length === 0 ? (
                                <p className="text-xs text-center py-4 text-gray-500">
                                    No hay items preoperacionales activos
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {items.map((item) => {
                                        const detail = itemDetails[item.id] || {
                                            itemId: item.id,
                                            passed: false,
                                            observations: ''
                                        }
                                        const isObservationsOpen = openObservations[item.id] || false
                                        return (
                                            <div key={item.id} className="border rounded p-2 space-y-2">
                                                {/* Fila: Item y Switch en 2 columnas */}
                                                <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
                                                    <p className="text-xs font-medium leading-tight">{item.name}</p>
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-[10px] text-gray-500">
                                                            {detail.passed ? 'Bien' : 'Mal'}
                                                        </span>
                                                        <Switch
                                                            checked={detail.passed}
                                                            onCheckedChange={() => toggleItemPassed(item.id)}
                                                            disabled={isLoading}
                                                            className="scale-75"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Botón de observaciones - solo icono */}
                                                <div className="flex justify-end">
                                                    <Button
                                                        type="button"
                                                        variant={isObservationsOpen ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => toggleObservations(item.id)}
                                                        disabled={isLoading}
                                                        className="h-7 w-7 p-0"
                                                    >
                                                        <MessageSquare className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>

                                                {/* Campo de observaciones expandible */}
                                                {isObservationsOpen && (
                                                    <div className="mt-1">
                                                        <Textarea
                                                            placeholder="Observaciones..."
                                                            value={detail.observations}
                                                            onChange={(e) => handleItemChange(item.id, 'observations', e.target.value)}
                                                            disabled={isLoading}
                                                            rows={2}
                                                            className="text-xs"
                                                        />
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {error && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-xs">
                            <AlertCircle className="h-3 w-3 text-red-600 flex-shrink-0" />
                            <span className="text-red-800">{error}</span>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                            <CheckCircle className="h-3 w-3 text-green-600 flex-shrink-0" />
                            <span className="text-green-800">Inspección creada exitosamente</span>
                        </div>
                    )}

                    {/* Botones fijos en la parte inferior */}
                    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 space-y-2 z-10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.push('/driver')}
                            disabled={isLoading}
                            className="w-full h-9 text-xs"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.driverId || !formData.vehicleId || items.length === 0}
                            className="w-full h-9 text-xs bg-orange-600 hover:bg-orange-700"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-2"></div>
                                    Creando...
                                </>
                            ) : (
                                <>
                                    <ClipboardList className="h-3 w-3 mr-1" />
                                    Crear Inspección
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

