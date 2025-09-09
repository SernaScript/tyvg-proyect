"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Target, 
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

interface SiigoCostCenter {
  id: number
  code: string
  name: string
  active: boolean
  createdAt: string
  updatedAt: string
}

interface CostCenterStats {
  total: number
  active: number
  inactive: number
}

interface Message {
  type: 'success' | 'error' | 'info'
  text: string
}

export default function SiigoCostCentersPage() {
  const [costCenters, setCostCenters] = useState<SiigoCostCenter[]>([])
  const [stats, setStats] = useState<CostCenterStats>({ total: 0, active: 0, inactive: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [message, setMessage] = useState<Message | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('')

  useEffect(() => {
    loadCostCenters()
  }, [])

  const loadCostCenters = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/cost-centers')
      const data = await response.json()

      if (data.success) {
        setCostCenters(data.data)
        setStats(data.stats)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error cargando centros de costo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión' })
    } finally {
      setIsLoading(false)
    }
  }

  const syncWithSiigo = async () => {
    setIsSyncing(true)
    setMessage(null)
    try {
      const response = await fetch('/api/siigo/cost-centers', {
        method: 'GET'
      })
      const data = await response.json()

      if (data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Sincronización exitosa'
        })
        await loadCostCenters() // Recargar datos
      } else {
        setMessage({ type: 'error', text: data.error || 'Error en la sincronización' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión durante la sincronización' })
    } finally {
      setIsSyncing(false)
    }
  }

  const exportCostCenters = () => {
    const csvContent = [
      'ID,Código,Nombre,Activo,Fecha Actualización',
      ...costCenters.map(costCenter => 
        `${costCenter.id},"${costCenter.code}","${costCenter.name}",${costCenter.active ? 'Sí' : 'No'},"${new Date(costCenter.updatedAt).toLocaleString()}"`
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `centros_costo_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredCostCenters = costCenters.filter(costCenter => {
    const matchesSearch = costCenter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         costCenter.code.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesActive = activeFilter === '' || 
                         (activeFilter === 'true' && costCenter.active) ||
                         (activeFilter === 'false' && !costCenter.active)
    
    return matchesSearch && matchesActive
  })

  return (
    <AreaLayout 
      areaId="siigo-integration" 
      moduleId="siigo-cost-centers"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Centros de Costo</h1>
            <p className="text-muted-foreground">
              Gestión y sincronización de centros de costo desde Siigo
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Centros de costo registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Centros de costo activos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactivos</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
              <p className="text-xs text-muted-foreground">
                Centros de costo inactivos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones</CardTitle>
            <CardDescription>
              Sincroniza centros de costo desde Siigo o exporta los datos locales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {message && (
              <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                  {message.text}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={syncWithSiigo} 
                disabled={isSyncing}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
                {isSyncing ? 'Sincronizando...' : 'Sincronizar'}
              </Button>
              
              <Button 
                onClick={exportCostCenters} 
                variant="outline"
                disabled={costCenters.length === 0}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por nombre o código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <select
                value={activeFilter}
                onChange={(e) => setActiveFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Filtrar por estado activo/inactivo"
              >
                <option value="">Todos los estados</option>
                <option value="true">Solo activos</option>
                <option value="false">Solo inactivos</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Cost Centers List */}
        <Card>
          <CardHeader>
            <CardTitle>Centros de Costo</CardTitle>
            <CardDescription>
              {filteredCostCenters.length} de {costCenters.length} centros de costo
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                Cargando centros de costo...
              </div>
            ) : filteredCostCenters.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {costCenters.length === 0 
                  ? 'No hay centros de costo registrados. Haz clic en "Sincronizar" para obtener datos de Siigo.'
                  : 'No se encontraron centros de costo con los filtros aplicados.'
                }
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCostCenters.map((costCenter) => (
                  <div
                    key={costCenter.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Target className="h-8 w-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{costCenter.name}</h3>
                          <Badge variant={costCenter.active ? "default" : "secondary"}>
                            {costCenter.active ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">Código: {costCenter.code}</p>
                        <p className="text-xs text-gray-400">
                          ID: {costCenter.id} • Actualizado: {new Date(costCenter.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        ID: {costCenter.id}
                      </Badge>
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
