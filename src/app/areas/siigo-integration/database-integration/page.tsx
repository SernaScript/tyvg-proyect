"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Database, 
  Search, 
  RefreshCw, 
  Download, 
  Upload, 
  ArrowUpDown,
  Building2,
  DollarSign,
  Package,
  Truck,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock
} from "lucide-react"

interface EndpointConfig {
  id: string
  name: string
  description: string
  icon: any
  endpoint: string
  status: 'active' | 'inactive' | 'error'
  lastSync: Date | null
  recordCount: number
  color: string
}

interface QueryResult {
  endpoint: string
  data: any[]
  timestamp: Date
  status: 'success' | 'error'
  recordCount: number
  error?: string
}

export default function DatabaseIntegrationPage() {
  const [endpoints] = useState<EndpointConfig[]>([
    {
      id: 'warehouses',
      name: 'Almacenes',
      description: 'Gestión de almacenes y ubicaciones de inventario',
      icon: Building2,
      endpoint: '/api/siigo/warehouses',
      status: 'active',
      lastSync: new Date(Date.now() - 2 * 60 * 60 * 1000),
      recordCount: 12,
      color: 'blue'
    },
    {
      id: 'cost-centers',
      name: 'Centros de Costo',
      description: 'Administración de centros de costo y presupuestos',
      icon: DollarSign,
      endpoint: '/api/siigo/cost-centers',
      status: 'active',
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
      recordCount: 8,
      color: 'green'
    },
    {
      id: 'movements',
      name: 'Movimientos',
      description: 'Registro de movimientos de inventario y transacciones',
      icon: ArrowUpDown,
      endpoint: '/api/siigo/movements',
      status: 'active',
      lastSync: new Date(Date.now() - 30 * 60 * 1000),
      recordCount: 156,
      color: 'orange'
    },
    {
      id: 'products',
      name: 'Productos',
      description: 'Catálogo de productos y servicios',
      icon: Package,
      endpoint: '/api/siigo/products',
      status: 'active',
      lastSync: new Date(Date.now() - 45 * 60 * 1000),
      recordCount: 89,
      color: 'purple'
    },
    {
      id: 'customers',
      name: 'Clientes',
      description: 'Base de datos de clientes y contactos',
      icon: Users,
      endpoint: '/api/siigo/customers',
      status: 'active',
      lastSync: new Date(Date.now() - 1 * 60 * 60 * 1000),
      recordCount: 234,
      color: 'blue'
    },
    {
      id: 'invoices',
      name: 'Facturas',
      description: 'Registro de facturas y documentos de venta',
      icon: FileText,
      endpoint: '/api/siigo/invoices',
      status: 'error',
      lastSync: new Date(Date.now() - 3 * 60 * 60 * 1000),
      recordCount: 0,
      color: 'red'
    }
  ])

  const [queryResults, setQueryResults] = useState<QueryResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all')

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'inactive':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Activo</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Error</Badge>
      case 'inactive':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Inactivo</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'border-blue-200 bg-blue-50 text-blue-800',
      green: 'border-green-200 bg-green-50 text-green-800',
      orange: 'border-orange-200 bg-orange-50 text-orange-800',
      purple: 'border-purple-200 bg-purple-50 text-purple-800',
      red: 'border-red-200 bg-red-50 text-red-800'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  const executeQuery = async (endpointId: string) => {
    setIsLoading(true)
    const endpoint = endpoints.find(ep => ep.id === endpointId)
    if (!endpoint) return

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockData = Array.from({ length: Math.floor(Math.random() * 20) + 5 }, (_, i) => ({
        id: i + 1,
        name: `Registro ${i + 1}`,
        description: `Descripción del registro ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      }))

      const result: QueryResult = {
        endpoint: endpointId,
        data: mockData,
        timestamp: new Date(),
        status: 'success',
        recordCount: mockData.length
      }

      setQueryResults(prev => [result, ...prev.slice(0, 9)]) // Keep last 10 results
    } catch (error) {
      const result: QueryResult = {
        endpoint: endpointId,
        data: [],
        timestamp: new Date(),
        status: 'error',
        recordCount: 0,
        error: 'Error al ejecutar la consulta'
      }
      setQueryResults(prev => [result, ...prev.slice(0, 9)])
    } finally {
      setIsLoading(false)
    }
  }

  const syncAllEndpoints = async () => {
    setIsLoading(true)
    for (const endpoint of endpoints) {
      if (endpoint.status === 'active') {
        await executeQuery(endpoint.id)
        await new Promise(resolve => setTimeout(resolve, 1000)) // Delay between requests
      }
    }
    setIsLoading(false)
  }

  const filteredEndpoints = endpoints.filter(endpoint => {
    const matchesSearch = endpoint.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         endpoint.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = selectedEndpoint === 'all' || endpoint.id === selectedEndpoint
    return matchesSearch && matchesFilter
  })

  const totalRecords = endpoints.reduce((sum, endpoint) => sum + endpoint.recordCount, 0)
  const activeEndpoints = endpoints.filter(endpoint => endpoint.status === 'active').length
  const errorEndpoints = endpoints.filter(endpoint => endpoint.status === 'error').length

  return (
    <AreaLayout
      areaId="siigo-integration"
      moduleId="siigo-database-integration"
      title="Integración de Bases de Datos"
      description="Consultas y sincronización con endpoints de Siigo"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Endpoints</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{endpoints.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeEndpoints} activos, {errorEndpoints} con errores
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registros</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                sincronizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Sincronización</CardTitle>
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {endpoints.reduce((latest, endpoint) => {
                  if (!endpoint.lastSync) return latest
                  if (!latest) return endpoint.lastSync
                  return endpoint.lastSync > latest ? endpoint.lastSync : latest
                }, null as Date | null)?.toLocaleTimeString() || 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">
                hace unos minutos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consultas Ejecutadas</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{queryResults.length}</div>
              <p className="text-xs text-muted-foreground">
                en esta sesión
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Acciones de Integración
            </CardTitle>
            <CardDescription>
              Ejecuta consultas y sincronizaciones con los endpoints de Siigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar endpoints..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <select
                  value={selectedEndpoint}
                  onChange={(e) => setSelectedEndpoint(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Filtrar por endpoint"
                >
                  <option value="all">Todos los endpoints</option>
                  {endpoints.map(endpoint => (
                    <option key={endpoint.id} value={endpoint.id}>{endpoint.name}</option>
                  ))}
                </select>
                
                <Button 
                  onClick={syncAllEndpoints} 
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                  Sincronizar Todo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Endpoints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEndpoints.map((endpoint) => {
            const Icon = endpoint.icon
            return (
              <Card key={endpoint.id} className="hover:shadow-md transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <CardTitle className="text-base">{endpoint.name}</CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(endpoint.status)}
                      {getStatusBadge(endpoint.status)}
                    </div>
                  </div>
                  <CardDescription className="text-sm">
                    {endpoint.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Registros:</span>
                      <span className="font-medium">{endpoint.recordCount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Última sync:</span>
                      <span className="font-medium">
                        {endpoint.lastSync ? endpoint.lastSync.toLocaleTimeString() : 'Nunca'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <code className="text-xs bg-gray-100 px-1 rounded">
                        {endpoint.endpoint}
                      </code>
                    </div>
                    
                    <Button 
                      onClick={() => executeQuery(endpoint.id)}
                      disabled={isLoading || endpoint.status === 'error'}
                      className="w-full"
                      size="sm"
                    >
                      <Search className="h-3 w-3 mr-1" />
                      Ejecutar Consulta
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Query Results */}
        {queryResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Resultados de Consultas
              </CardTitle>
              <CardDescription>
                Historial de consultas ejecutadas en esta sesión
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {queryResults.map((result, index) => {
                  const endpoint = endpoints.find(ep => ep.id === result.endpoint)
                  const Icon = endpoint?.icon || Database
                  
                  return (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium text-sm">
                            {endpoint?.name || result.endpoint}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {result.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {result.recordCount} registros
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {result.status === 'success' ? 'Éxito' : 'Error'}
                          </div>
                        </div>
                        
                        {result.status === 'success' ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AreaLayout>
  )
}

