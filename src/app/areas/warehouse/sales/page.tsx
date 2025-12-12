"use client"

import { useState } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  ShoppingCart,
  Plus,
  Trash2,
  Save
} from "lucide-react"

interface SaleItem {
  id: string
  articleId: string
  articleName: string
  quantity: number
  unitPrice: number
  total: number
}

export default function SalesPage() {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [clientName, setClientName] = useState('')
  const [items, setItems] = useState<SaleItem[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const addItem = () => {
    const newItem: SaleItem = {
      id: Date.now().toString(),
      articleId: '',
      articleName: '',
      quantity: 1,
      unitPrice: 0,
      total: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof SaleItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value }
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice
        }
        return updated
      }
      return item
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // TODO: Implementar la lógica de guardado
      alert('Venta registrada correctamente')
      // Limpiar formulario
      setClientName('')
      setItems([])
    } catch (error) {
      alert('Error al registrar la venta')
    } finally {
      setIsSubmitting(false)
    }
  }

  const totalAmount = items.reduce((sum, item) => sum + item.total, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Registrar Ventas</h1>
          <p className="text-gray-600 mt-2">Registra las ventas de artículos del depósito</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Información de la Venta</CardTitle>
              <CardDescription>Completa los datos de la venta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="saleDate">Fecha de Venta</Label>
                  <Input
                    id="saleDate"
                    type="date"
                    value={saleDate}
                    onChange={(e) => setSaleDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientName">Cliente</Label>
                  <Input
                    id="clientName"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Nombre del cliente"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card className="mt-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Artículos</CardTitle>
                  <CardDescription>Agrega los artículos vendidos</CardDescription>
                </div>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Artículo
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No hay artículos agregados</p>
                  <p className="text-sm">Haz clic en "Agregar Artículo" para comenzar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="grid grid-cols-12 gap-4 items-end p-4 border rounded-lg">
                      <div className="col-span-4 space-y-2">
                        <Label>Artículo</Label>
                        <Input
                          value={item.articleName}
                          onChange={(e) => updateItem(item.id, 'articleName', e.target.value)}
                          placeholder="Nombre del artículo"
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Precio Unitario</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Total</Label>
                        <Input
                          value={`$${item.total.toFixed(2)}`}
                          disabled
                          className="bg-gray-50"
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Total and Submit */}
          {items.length > 0 && (
            <Card className="mt-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-lg font-semibold">Total de la Venta:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${totalAmount.toFixed(2)}
                  </span>
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Guardando...' : 'Registrar Venta'}
                </Button>
              </CardContent>
            </Card>
          )}
        </form>
      </div>
    </MainLayout>
  )
}

