"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  FileText,
  Search,
  Download,
  Calendar
} from "lucide-react"

interface KardexEntry {
  id: string
  date: Date
  type: 'ENTRADA' | 'SALIDA'
  document: string
  articleCode: string
  articleName: string
  quantity: number
  unitPrice: number
  total: number
  balance: number
}

export default function KardexPage() {
  const [entries, setEntries] = useState<KardexEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedArticle, setSelectedArticle] = useState('')

  useEffect(() => {
    fetchKardex()
  }, [])

  const fetchKardex = async () => {
    try {
      setIsLoading(true)
      // TODO: Implementar la llamada a la API
      // const response = await fetch('/api/warehouse/kardex')
      // const data = await response.json()
      // setEntries(data)
      
      // Datos de ejemplo
      setEntries([])
      setIsLoading(false)
    } catch (error) {
      setIsLoading(false)
    }
  }

  const handleFilter = () => {
    fetchKardex()
  }

  const handleExport = () => {
    // TODO: Implementar exportación a Excel/PDF
    alert('Funcionalidad de exportación próximamente')
  }

  const filteredEntries = entries.filter(entry => {
    const matchesSearch = 
      entry.articleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.document.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesArticle = !selectedArticle || entry.articleCode === selectedArticle
    
    const entryDate = new Date(entry.date)
    const matchesStartDate = !startDate || entryDate >= new Date(startDate)
    const matchesEndDate = !endDate || entryDate <= new Date(endDate)
    
    return matchesSearch && matchesArticle && matchesStartDate && matchesEndDate
  })

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kardex</h1>
            <p className="text-gray-600 mt-2">Consulta el historial de movimientos de inventario</p>
          </div>
          <Button onClick={handleExport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Filtra los movimientos según tus necesidades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Artículo, código, documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Fecha Inicio</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Fecha Fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="article">Artículo</Label>
                <Input
                  id="article"
                  placeholder="Código del artículo"
                  value={selectedArticle}
                  onChange={(e) => setSelectedArticle(e.target.value)}
                />
              </div>
            </div>
            <div className="mt-4">
              <Button onClick={handleFilter}>
                <Search className="h-4 w-4 mr-2" />
                Aplicar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kardex Table */}
        <Card>
          <CardHeader>
            <CardTitle>Movimientos de Inventario</CardTitle>
            <CardDescription>
              Historial completo de entradas y salidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Cargando movimientos...</div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No hay movimientos registrados</p>
                <p className="text-sm">Los movimientos aparecerán aquí cuando registres compras o ventas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Fecha</th>
                      <th className="text-left p-3 font-semibold">Tipo</th>
                      <th className="text-left p-3 font-semibold">Documento</th>
                      <th className="text-left p-3 font-semibold">Artículo</th>
                      <th className="text-right p-3 font-semibold">Cantidad</th>
                      <th className="text-right p-3 font-semibold">Precio Unit.</th>
                      <th className="text-right p-3 font-semibold">Total</th>
                      <th className="text-right p-3 font-semibold">Saldo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEntries.map((entry) => (
                      <tr key={entry.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          {new Date(entry.date).toLocaleDateString('es-ES')}
                        </td>
                        <td className="p-3">
                          <Badge variant={entry.type === 'ENTRADA' ? 'default' : 'destructive'}>
                            {entry.type}
                          </Badge>
                        </td>
                        <td className="p-3">{entry.document}</td>
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{entry.articleName}</div>
                            <div className="text-sm text-gray-500">{entry.articleCode}</div>
                          </div>
                        </td>
                        <td className="p-3 text-right">{entry.quantity}</td>
                        <td className="p-3 text-right">${entry.unitPrice.toFixed(2)}</td>
                        <td className="p-3 text-right font-semibold">
                          ${entry.total.toFixed(2)}
                        </td>
                        <td className="p-3 text-right font-semibold">
                          {entry.balance}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  )
}

