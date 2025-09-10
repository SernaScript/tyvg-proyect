"use client"

import React, { useState } from "react"
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
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
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
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const isClient = useClientOnly()

  // Calcular paginación
  const totalPages = Math.ceil(fuelPurchases.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = fuelPurchases.slice(startIndex, endIndex)

  // Resetear página cuando cambien los datos
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages)
    } else if (totalPages === 0) {
      setCurrentPage(1)
    }
  }, [fuelPurchases.length, totalPages, currentPage])

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
    if (!isClient) return `$${Math.round(amount).toLocaleString()}`
    return `$${Math.round(amount).toLocaleString('es-CO')}`
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
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Vehículo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Modelo</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Proveedor</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Cantidad</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Total</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Fecha</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                      <th className="text-center py-3 px-4 font-medium text-gray-600">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((record) => (
                    <tr key={record.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-orange-100">
                            <Car className="h-4 w-4 text-orange-600" />
                          </div>
                          <span className="font-medium">{record.vehicle.plate}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-600">
                          {record.vehicle.brand} {record.vehicle.model}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500">
                          {record.provider}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium">{record.quantity}L</span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-medium">{formatCurrency(record.total)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="text-sm">{formatDate(record.date)}</span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <Badge variant={record.state ? "default" : "secondary"}>
                          {record.state ? "Activo" : "Inactivo"}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(record)}
                            className="h-8 w-8 p-0"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(record.id)}
                            disabled={deleteLoading === record.id}
                            className="h-8 w-8 p-0"
                          >
                            {deleteLoading === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
            </div>
          )}

          {/* Controles de Paginación */}
          {fuelPurchases.length > 0 && (
            <div className="flex items-center justify-between mt-6 px-4 py-3 border-t bg-gray-50">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label htmlFor="items-per-page" className="text-sm text-gray-600">Mostrar:</label>
                  <select
                    id="items-per-page"
                    value={itemsPerPage}
                    onChange={(e) => {
                      const newItemsPerPage = Number(e.target.value)
                      console.log('Changing items per page from', itemsPerPage, 'to', newItemsPerPage)
                      setItemsPerPage(newItemsPerPage)
                      setCurrentPage(1)
                    }}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span className="text-sm text-gray-600">registros</span>
                </div>
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1} a {Math.min(endIndex, fuelPurchases.length)} de {fuelPurchases.length} registros
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.max(currentPage - 1, 1)
                    console.log('Previous page: from', currentPage, 'to', newPage)
                    setCurrentPage(newPage)
                  }}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNumber;
                    if (totalPages <= 5) {
                      pageNumber = i + 1;
                    } else if (currentPage <= 3) {
                      pageNumber = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNumber = totalPages - 4 + i;
                    } else {
                      pageNumber = currentPage - 2 + i;
                    }
                    
                    // Asegurar que el número de página esté dentro del rango válido
                    if (pageNumber < 1 || pageNumber > totalPages) {
                      return null;
                    }
                    
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          console.log('Clicking page number:', pageNumber, 'from current:', currentPage)
                          setCurrentPage(pageNumber)
                        }}
                        className="w-8 h-8 p-0"
                      >
                        {pageNumber}
                      </Button>
                    );
                  }).filter(Boolean)}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newPage = Math.min(currentPage + 1, totalPages)
                    console.log('Next page: from', currentPage, 'to', newPage)
                    setCurrentPage(newPage)
                  }}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
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
