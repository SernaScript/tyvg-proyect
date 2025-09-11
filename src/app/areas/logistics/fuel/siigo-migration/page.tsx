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
  Send,
  CheckCircle,
  XCircle,
  X
} from "lucide-react"
import { FuelPurchase } from "@/types/fuel"

// Tipos para notificaciones
interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
}

export default function SiigoMigrationPage() {
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ isConfigured: false })
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [migratingItems, setMigratingItems] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number
    total: number
    currentItem?: { plate: string; receipt?: string }
  } | null>(null)
  const itemsPerPage = 20

  // Funciones para manejar notificaciones
  const addNotification = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    const notification: Notification = {
      id: Date.now().toString(),
      type,
      title,
      message,
      timestamp: new Date()
    }
    setNotifications(prev => [...prev, notification])
    
    // Auto-remover notificación después de 5 segundos
    setTimeout(() => {
      removeNotification(notification.id)
    }, 5000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

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
    setMigrationProgress(null)
    
    try {
      // Obtener la lista de registros pendientes para procesar uno por uno
      const pendingResponse = await fetch(`/api/fuel-purchases?state=true&page=1&limit=1000`)
      if (!pendingResponse.ok) {
        throw new Error('Error al cargar registros pendientes')
      }

      const pendingData = await pendingResponse.json()
      const records = pendingData.data
      
      if (records.length === 0) {
        addNotification('info', 'Sin Registros', 'No hay registros pendientes de migración')
        return
      }

      setMigrationProgress({
        current: 0,
        total: records.length,
        currentItem: undefined
      })

      let processed = 0
      let errors = 0

      // Procesar cada registro individualmente
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        // Actualizar progreso actual
        setMigrationProgress({
          current: i,
          total: records.length,
          currentItem: {
            plate: record.vehicle.plate,
            receipt: record.receipt
          }
        })

        try {
          const response = await fetch(`/api/fuel-purchases/siigo-migration/${record.id}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            }
          })

          const result = await response.json()

          if (response.ok) {
            processed++
            // Mostrar notificación inmediata de éxito
            addNotification(
              'success',
              'Documento Enviado',
              `Recibo ${record.receipt || 'N/A'} de la placa ${record.vehicle.plate} enviado exitosamente`
            )
          } else {
            errors++
            // Mostrar notificación inmediata de error
            addNotification(
              'error',
              'Error de Envío',
              `Error al enviar recibo ${record.receipt || 'N/A'} de la placa ${record.vehicle.plate}: ${result.error}`
            )
          }
        } catch (error) {
          errors++
          addNotification(
            'error',
            'Error de Envío',
            `Error al enviar recibo ${record.receipt || 'N/A'} de la placa ${record.vehicle.plate}: ${error instanceof Error ? error.message : 'Error desconocido'}`
          )
        }

        // Pequeña pausa para que se vean las notificaciones
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Mostrar resumen final
      addNotification(
        'success',
        'Migración Completada',
        `Procesados: ${processed} | Errores: ${errors}`
      )

      // Recargar datos
      await loadPendingFuelPurchases()
      
    } catch (error) {
      console.error('Error during migration:', error)
      addNotification('error', 'Error de Migración', 'Error al migrar los datos')
    } finally {
      setIsMigrating(false)
      setMigrationProgress(null)
    }
  }

  // Función para migrar un registro individual
  const migrateSingleRecord = async (purchaseId: string) => {
    setMigratingItems(prev => new Set(prev).add(purchaseId))
    
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
        
        // Mostrar notificación de éxito
        addNotification(
          'success',
          'Documento Enviado',
          `Recibo ${result.data.receipt || 'N/A'} de la placa ${result.data.plate} enviado exitosamente`
        )
      } else {
        // Mostrar notificación de error
        addNotification(
          'error',
          'Error de Envío',
          `Error al enviar recibo de la placa ${result.data?.plate || 'N/A'}: ${result.error}`
        )
      }
    } catch (error) {
      console.error('Error during single migration:', error)
      
      // Mostrar notificación de error
      addNotification(
        'error',
        'Error de Envío',
        `Error al enviar registro: ${error instanceof Error ? error.message : 'Error desconocido'}`
      )
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
                      Migrando... ({migrationProgress ? `${migrationProgress.current}/${migrationProgress.total}` : '0'})
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-2" />
                      Iniciar Migración Masiva ({totalRecords})
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

        {/* Indicador de Progreso de Migración */}
        {migrationProgress && (
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-800">
                    Migrando registros a Siigo...
                  </div>
                  <div className="text-xs text-blue-600 mt-1">
                    {migrationProgress.current} de {migrationProgress.total} registros procesados
                  </div>
                  {migrationProgress.currentItem && (
                    <div className="text-xs text-blue-600 mt-1">
                      Procesando: Placa {migrationProgress.currentItem.plate} 
                      {migrationProgress.currentItem.receipt && ` - Recibo ${migrationProgress.currentItem.receipt}`}
                    </div>
                  )}
                </div>
                <div className="w-32 bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${migrationProgress.total > 0 ? (migrationProgress.current / migrationProgress.total) * 100 : 0}%` 
                    }}
                    title={`Progreso de migración: ${migrationProgress.current} de ${migrationProgress.total} registros`}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sistema de Notificaciones */}
        <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg shadow-lg border-l-4 transform transition-all duration-300 ease-in-out ${
                notification.type === 'success'
                  ? 'bg-green-50 border-green-400 text-green-800'
                  : notification.type === 'error'
                  ? 'bg-red-50 border-red-400 text-red-800'
                  : 'bg-blue-50 border-blue-400 text-blue-800'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                  {notification.type === 'info' && <AlertCircle className="h-5 w-5 text-blue-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{notification.title}</div>
                  <div className="text-xs mt-1 opacity-90">{notification.message}</div>
                  <div className="text-xs mt-1 opacity-70">
                    {notification.timestamp.toLocaleTimeString()}
                  </div>
                </div>
                <button
                  onClick={() => removeNotification(notification.id)}
                  className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Cerrar notificación"
                  aria-label="Cerrar notificación"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AreaLayout>
  )
}
