"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Building2, 
  Search, 
  RefreshCw, 
  Download, 
  Upload,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  Filter,
  Database,
  ExternalLink
} from "lucide-react"

interface SiigoWarehouse {
  id: number
  name: string
  active: boolean
  hasMovements: boolean
  createdAt: string
  updatedAt: string
}

interface WarehouseStats {
  total: number
  active: number
  inactive: number
}

export default function SiigoWarehousesPage() {
  const [warehouses, setWarehouses] = useState<SiigoWarehouse[]>([])
  const [stats, setStats] = useState<WarehouseStats>({ total: 0, active: 0, inactive: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [movementsFilter, setMovementsFilter] = useState<string>('all')
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)

  const fetchWarehouses = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (activeFilter !== 'all') params.append('active', activeFilter)
      if (movementsFilter !== 'all') params.append('has_movements', movementsFilter)
      if (searchTerm) params.append('search', searchTerm)

      const response = await fetch(`/api/warehouses?${params}`)
      const data = await response.json()

      if (data.success) {
        setWarehouses(data.data)
        setStats(data.stats)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al cargar las bodegas' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al cargar las bodegas' })
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithSiigo = async () => {
    setIsSyncing(true)
    setMessage(null)
    try {
      const response = await fetch('/api/siigo/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' })
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ 
          type: 'success', 
          text: `Sincronización exitosa: ${data.syncStats.successful} bodegas actualizadas` 
        })
        // Recargar la lista después de la sincronización
        await fetchWarehouses()
      } else {
        setMessage({ type: 'error', text: data.error || 'Error en la sincronización' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión durante la sincronización' })
    } finally {
      setIsSyncing(false)
    }
  }


  const exportWarehouses = () => {
    const csvContent = [
      'ID,Nombre,Activa,Tiene Movimientos,Fecha Actualización',
      ...warehouses.map(warehouse => 
        `${warehouse.id},"${warehouse.name}",${warehouse.active ? 'Sí' : 'No'},${warehouse.hasMovements ? 'Sí' : 'No'},"${new Date(warehouse.updatedAt).toLocaleString()}"`
      )
    ].join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bodegas-siigo-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  useEffect(() => {
    fetchWarehouses()
  }, [activeFilter, movementsFilter, searchTerm])

  const getStatusBadge = (active: boolean) => {
    return active ? (
      <Badge className="bg-green-100 text-green-800 border-green-300">Activa</Badge>
    ) : (
      <Badge className="bg-gray-100 text-gray-800 border-gray-300">Inactiva</Badge>
    )
  }

  const getMovementsBadge = (hasMovements: boolean) => {
    return hasMovements ? (
      <Badge className="bg-blue-100 text-blue-800 border-blue-300">Con Movimientos</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Sin Movimientos</Badge>
    )
  }

  const filteredWarehouses = warehouses.filter(warehouse => {
    const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  return (
    <AreaLayout
      areaId="siigo-integration"
      moduleId="siigo-warehouses"
      title="Bodegas Siigo"
      description="Gestión y sincronización de bodegas desde Siigo"
    >
      <div className="space-y-6">
        {/* Status Alert */}
        {message && (
          <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
            {message.type === 'error' ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bodegas</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                registradas en Siigo
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bodegas Activas</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% del total` : '0% del total'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bodegas Inactivas</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}% del total` : '0% del total'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Con Movimientos</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {warehouses.filter(w => w.hasMovements).length}
              </div>
              <p className="text-xs text-muted-foreground">
                bodegas con actividad
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Gestión de Bodegas
            </CardTitle>
            <CardDescription>
              Sincroniza y gestiona las bodegas desde Siigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar bodegas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={activeFilter}
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por estado activo/inactivo"
                >
                  <option value="all">Todas las bodegas</option>
                  <option value="true">Solo activas</option>
                  <option value="false">Solo inactivas</option>
                </select>
                
                <select
                  value={movementsFilter}
                  onChange={(e) => setMovementsFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por estado de movimientos"
                >
                  <option value="all">Todos los estados</option>
                  <option value="true">Con movimientos</option>
                  <option value="false">Sin movimientos</option>
                </select>
                
                <Button 
                  onClick={syncWithSiigo} 
                  disabled={isSyncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
                </Button>
                
                <Button 
                  onClick={exportWarehouses} 
                  variant="outline"
                  disabled={warehouses.length === 0}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Warehouses List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Lista de Bodegas
            </CardTitle>
            <CardDescription>
              {filteredWarehouses.length} de {warehouses.length} bodegas mostradas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2">Cargando bodegas...</span>
              </div>
            ) : filteredWarehouses.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  No se encontraron bodegas
                </h3>
                <p className="text-muted-foreground">
                  {warehouses.length === 0 
                    ? 'No hay bodegas sincronizadas. Haz clic en "Sincronizar" para obtener las bodegas desde Siigo.'
                    : 'No hay bodegas que coincidan con los filtros aplicados.'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredWarehouses.map((warehouse) => (
                  <div key={warehouse.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <Building2 className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {warehouse.name}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          ID: {warehouse.id} • Actualizada: {new Date(warehouse.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(warehouse.active)}
                      {getMovementsBadge(warehouse.hasMovements)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
