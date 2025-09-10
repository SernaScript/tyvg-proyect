"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Edit, 
  Trash2, 
  Plus, 
  Car, 
  Calendar, 
  DollarSign, 
  Fuel,
  Loader2,
  AlertCircle
} from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { FuelPurchaseModal } from "@/components/modals/FuelPurchaseModal"
import { FuelPurchase, FuelPurchaseFormData } from "@/types/fuel"
import { useClientOnly } from "@/hooks/useClientOnly"

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

interface FuelPurchasesTableProps {
  fuelPurchases: FuelPurchase[]
  onRefresh: () => void
  isLoading?: boolean
}

export function FuelPurchasesTable({ 
  fuelPurchases, 
  onRefresh, 
  isLoading = false 
}: FuelPurchasesTableProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedFuelPurchase, setSelectedFuelPurchase] = useState<FuelPurchaseForEdit | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const isClient = useClientOnly()

  const handleCreate = () => {
    setSelectedFuelPurchase(null)
    setIsModalOpen(true)
  }

  const handleEdit = (fuelPurchase: FuelPurchase) => {
    // Convertir el fuelPurchase para el modal (date string -> Date)
    const fuelPurchaseForEdit = {
      ...fuelPurchase,
      date: new Date(fuelPurchase.date)
    }
    setSelectedFuelPurchase(fuelPurchaseForEdit)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este registro de combustible?')) {
      return
    }

    setDeleteLoading(id)
    try {
      const response = await fetch(`/api/fuel-purchases/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onRefresh()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error deleting fuel purchase:', error)
      alert('Error al eliminar el registro')
    } finally {
      setDeleteLoading(null)
    }
  }

  const handleSave = async (data: FuelPurchaseFormData) => {
    setIsSubmitting(true)
    try {
      const url = selectedFuelPurchase 
        ? `/api/fuel-purchases/${selectedFuelPurchase.id}`
        : '/api/fuel-purchases'
      
      const method = selectedFuelPurchase ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })

      if (response.ok) {
        onRefresh()
        setIsModalOpen(false)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error saving fuel purchase:', error)
      alert('Error al guardar el registro')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount: number) => {
    if (!isClient) return `$${amount.toFixed(2)}`
    return `$${amount.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  const formatDate = (dateString: string) => {
    if (!isClient) {
      const date = new Date(dateString)
      const day = date.getDate().toString().padStart(2, '0')
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const year = date.getFullYear()
      return `${day}/${month}/${year}`
    }
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Registros de Combustible</CardTitle>
          <CardDescription>Cargando registros...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Registros de Combustible</CardTitle>
              <CardDescription>
                Gestiona las compras de combustible de la flota
              </CardDescription>
            </div>
            <Button onClick={handleCreate} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Registro
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {fuelPurchases.length === 0 ? (
            <div className="text-center py-8">
              <Fuel className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay registros de combustible
              </h3>
              <p className="text-gray-500 mb-4">
                Comienza agregando el primer registro de combustible
              </p>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primer Registro
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {fuelPurchases.map((record) => (
                <div key={record.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-2 rounded-lg bg-orange-100">
                        <Car className="h-4 w-4 text-orange-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{record.vehicle.plate}</p>
                          <Badge variant={record.state ? "default" : "secondary"}>
                            {record.state ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">
                          {record.vehicle.brand} {record.vehicle.model}
                        </p>
                        <p className="text-sm text-gray-500">
                          {record.provider}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Cantidad</p>
                          <p className="font-medium">{record.quantity}L</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="font-medium">{formatCurrency(record.total)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-gray-500">Fecha</p>
                          <p className="font-medium">{formatDate(record.date)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(record)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        disabled={deleteLoading === record.id}
                      >
                        {deleteLoading === record.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <FuelPurchaseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        fuelPurchase={selectedFuelPurchase}
        isLoading={isSubmitting}
      />
    </>
  )
}
