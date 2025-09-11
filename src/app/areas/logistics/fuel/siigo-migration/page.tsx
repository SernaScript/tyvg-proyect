"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Cloud, 
  AlertCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send
} from "lucide-react"
import { FuelPurchase } from "@/types/fuel"

export default function SiigoMigrationPage() {
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<{
    request?: any
    response?: any
    error?: any
  } | null>(null)
  const [credentials, setCredentials] = useState({ isConfigured: false })
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [migratingItems, setMigratingItems] = useState<Set<string>>(new Set())
  const itemsPerPage = 20

  // Cargar credenciales de Siigo
  const loadSiigoCredentials = async () => {
    try {
      const response = await fetch('/api/siigo-credentials')
      if (response.ok) {
        const data = await response.json()
        setCredentials({ isConfigured: data.success && data.data !== null })
      }
    } catch (error) {
      console.error('Error loading Siigo credentials:', error)
    }
  }

  // Cargar registros de combustible pendientes
  const loadPendingFuelPurchases = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/fuel-purchases?state=true&page=${page}&limit=${itemsPerPage}`)
      if (response.ok) {
        const data = await response.json()
        setFuelPurchases(data.data)
        setTotalPages(data.pagination.pages)
        setTotalRecords(data.pagination.total)
        setCurrentPage(page)
      } else {
        setError('Error al cargar los registros de combustible')
      }
    } catch (error) {
      console.error('Error loading fuel purchases:', error)
      setError('Error al cargar los registros de combustible')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSiigoCredentials()
    loadPendingFuelPurchases()
  }, [])

  // Función para iniciar migración
  const startMigration = async () => {
    setIsMigrating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/fuel-purchases/siigo-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Migración exitosa - recargar datos
        await loadPendingFuelPurchases()
        // Mostrar mensaje de éxito
        alert(`Migración completada exitosamente!\n\nProcesados: ${result.summary?.processed || 0}\nErrores: ${result.summary?.errors || 0}`)
      } else {
        setError(result.error || 'Error al migrar los datos')
      }
    } catch (error) {
      console.error('Error during migration:', error)
      setError('Error al migrar los datos')
    } finally {
      setIsMigrating(false)
    }
  }

  // Función para migrar un registro individual
  const migrateSingleRecord = async (purchaseId: string) => {
    setMigratingItems(prev => new Set(prev).add(purchaseId))
    setError(null)
    setDebugInfo(null)
    
    try {
      const response = await fetch(`/api/fuel-purchases/siigo-migration/${purchaseId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Migración exitosa - recargar datos
        await loadPendingFuelPurchases(currentPage)
        alert(`Registro migrado exitosamente!\n\nVehículo: ${result.data.plate}\nTotal: $${result.data.total}`)
      } else {
        setError(result.error || 'Error al migrar el registro')
        setDebugInfo({
          request: result.debugInfo?.request,
          response: result.debugInfo?.response,
          error: result.debugInfo?.error || result
        })
      }
    } catch (error) {
      console.error('Error during single migration:', error)
      setError('Error al migrar el registro')
      setDebugInfo({
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setMigratingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(purchaseId)
        return newSet
      })
    }
  }

  // Función para cambiar de página
  const handlePageChange = (newPage: number) => {
    loadPendingFuelPurchases(newPage)
  }

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Acciones de Migración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Acciones de Migración
            </CardTitle>
            <CardDescription>
              Inicia la migración de datos a Siigo nube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!credentials.isConfigured && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Debes configurar las credenciales de Siigo antes de migrar los datos
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={startMigration}
                  disabled={!credentials.isConfigured || isMigrating || totalRecords === 0}
                  className="flex-1"
                >
                  {isMigrating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Migrando...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-2" />
                      Iniciar Migración ({totalRecords})
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/areas/siigo-integration')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración Avanzada
                </Button>
              </div>

              {error && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">{error}</span>
                  </div>
                  
                  {debugInfo && (
                    <div className="space-y-3">
                      {debugInfo.request && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-800 mb-2">📤 Petición enviada a Siigo:</h4>
                          <pre className="text-xs text-blue-700 bg-blue-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(debugInfo.request, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {debugInfo.response && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <h4 className="font-medium text-yellow-800 mb-2">📥 Respuesta de Siigo:</h4>
                          <pre className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(debugInfo.response, null, 2)}
                          </pre>
                        </div>
                      )}
                      
                      {debugInfo.error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <h4 className="font-medium text-red-800 mb-2">❌ Error detallado:</h4>
                          <pre className="text-xs text-red-700 bg-red-100 p-2 rounded overflow-x-auto">
                            {JSON.stringify(debugInfo.error, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Registros Pendientes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  Registros Pendientes de Migración
                </CardTitle>
                <CardDescription>
                  {totalRecords} registros pendientes de migrar a Siigo nube
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadPendingFuelPurchases(currentPage)}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Actualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : fuelPurchases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No hay registros pendientes de migración
              </div>
            ) : (
              <div className="space-y-4">
                {/* Tabla de registros */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 font-medium">Vehículo</th>
                        <th className="text-left p-2 font-medium">Fecha</th>
                        <th className="text-right p-2 font-medium">Cantidad</th>
                        <th className="text-right p-2 font-medium">Total</th>
                        <th className="text-left p-2 font-medium">Proveedor</th>
                        <th className="text-center p-2 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fuelPurchases.map((purchase) => {
                        const isMigrating = migratingItems.has(purchase.id)
                        return (
                          <tr key={purchase.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="p-2">
                              <div className="font-medium">{purchase.vehicle.plate}</div>
                              <div className="text-xs text-muted-foreground">
                                {purchase.vehicle.brand} {purchase.vehicle.model}
                              </div>
                            </td>
                            <td className="p-2">
                              {new Date(purchase.date).toLocaleDateString()}
                            </td>
                            <td className="p-2 text-right">
                              {purchase.quantity}L
                            </td>
                            <td className="p-2 text-right font-medium">
                              ${purchase.total.toLocaleString()}
                            </td>
                            <td className="p-2">
                              <Badge variant="outline" className="text-xs">
                                {purchase.provider}
                              </Badge>
                            </td>
                            <td className="p-2 text-center">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => migrateSingleRecord(purchase.id)}
                                disabled={!credentials.isConfigured || isMigrating}
                                className="h-8 w-8 p-0"
                                title={isMigrating ? "Migrando..." : "Migrar a Siigo"}
                              >
                                {isMigrating ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-muted-foreground">
                      Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords} registros
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm">
                        Página {currentPage} de {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages || isLoading}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
