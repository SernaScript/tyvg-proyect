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
  X,
  Database
} from "lucide-react"

// Tipos para notificaciones
interface Notification {
  id: string
  type: 'success' | 'error' | 'info'
  title: string
  message: string
  timestamp: Date
}

interface FlypassData {
  id: string
  licensePlate: string
  tollName: string
  passageDate: string | Date
  creationDate: string | Date
  subtotal: number
  cufe: string
  accounted: boolean
  documentType: string
}

export default function FlypassSiigoMigrationPage() {
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ isConfigured: false })
  const [flypassData, setFlypassData] = useState<FlypassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalRecords, setTotalRecords] = useState(0)
  const [migratingItems, setMigratingItems] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number
    total: number
    currentItem?: { licensePlate: string; cufe?: string }
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

  // Cargar registros de flypass_data pendientes
  const loadPendingFlypassData = async (page: number = 1) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/flypass-data?page=${page}&limit=${itemsPerPage}`)
      if (response.ok) {
        const data = await response.json()
        setFlypassData(data.data)
        setTotalPages(data.pagination.totalPages)
        setTotalRecords(data.pagination.total)
        setCurrentPage(page)
      } else {
        setError('Error al cargar los registros de flypass_data')
      }
    } catch (error) {
      setError('Error de conexión al cargar los datos')
      console.error('Error loading flypass data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Función para iniciar migración masiva
  const startMigration = async () => {
    setIsMigrating(true)
    setError(null)
    setMigrationProgress(null)
    
    try {
      // Obtener la lista de registros pendientes para procesar uno por uno
      const pendingResponse = await fetch(`/api/flypass-data?page=1&limit=1000`)
      if (!pendingResponse.ok) {
        throw new Error('Error al cargar registros pendientes')
      }

      const pendingData = await pendingResponse.json()
      const records = pendingData.data.filter((record: FlypassData) => 
        !record.accounted && record.documentType === "FC"
      )
      
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
        
        setMigrationProgress({
          current: i + 1,
          total: records.length,
          currentItem: { licensePlate: record.licensePlate, cufe: record.cufe }
        })

        try {
          const response = await fetch(`/api/flypass-data/siigo-migration/${record.id}`, {
            method: 'POST'
          })

          const result = await response.json()

          if (result.success) {
            processed++
            addNotification('success', 'Migrado', `Placa ${record.licensePlate} migrada exitosamente`)
          } else {
            errors++
            addNotification('error', 'Error', `Error migrando placa ${record.licensePlate}: ${result.error}`)
          }
        } catch (error) {
          errors++
          addNotification('error', 'Error', `Error de conexión migrando placa ${record.licensePlate}`)
        }

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Recargar datos después de la migración
      await loadPendingFlypassData(currentPage)
      
      addNotification('info', 'Migración Completada', 
        `Procesados: ${processed}, Errores: ${errors}, Total: ${records.length}`)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      addNotification('error', 'Error', 'Error durante la migración masiva')
    } finally {
      setIsMigrating(false)
      setMigrationProgress(null)
    }
  }

  // Función para migrar un registro individual
  const migrateIndividual = async (recordId: string) => {
    setMigratingItems(prev => new Set(prev).add(recordId))
    
    try {
      const response = await fetch(`/api/flypass-data/siigo-migration/${recordId}`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        addNotification('success', 'Migrado', 'Registro migrado exitosamente')
        // Recargar datos
        await loadPendingFlypassData(currentPage)
      } else {
        addNotification('error', 'Error', result.error || 'Error desconocido')
      }
    } catch (error) {
      addNotification('error', 'Error', 'Error de conexión al migrar')
    } finally {
      setMigratingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(recordId)
        return newSet
      })
    }
  }

  useEffect(() => {
    loadSiigoCredentials()
    loadPendingFlypassData()
  }, [])

  const formatDate = (dateInput: string | Date) => {
    // Si ya es un objeto Date, usarlo directamente; si es string, convertirlo
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  const pendingCount = flypassData.filter(record => !record.accounted).length

  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="flypass-siigo-migration"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Migración Flypass a Siigo</h1>
            <p className="text-muted-foreground">
              Migra los datos de peajes de Flypass a Siigo como purchases
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Volver
          </Button>
        </div>

        {/* Notificaciones */}
        {notifications.length > 0 && (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border flex items-center justify-between ${
                  notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
                  notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
                  'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  {notification.type === 'success' && <CheckCircle className="h-4 w-4" />}
                  {notification.type === 'error' && <XCircle className="h-4 w-4" />}
                  {notification.type === 'info' && <AlertCircle className="h-4 w-4" />}
                  <div>
                    <p className="font-medium">{notification.title}</p>
                    <p className="text-sm">{notification.message}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeNotification(notification.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Estado de credenciales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Siigo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4" />
                <span>Credenciales de Siigo</span>
                <Badge variant={credentials.isConfigured ? "default" : "destructive"}>
                  {credentials.isConfigured ? "Configuradas" : "No configuradas"}
                </Badge>
              </div>
              {!credentials.isConfigured && (
                <Button variant="outline" size="sm">
                  Configurar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Progreso de migración */}
        {migrationProgress && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Migración en Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>Procesando registro {migrationProgress.current} de {migrationProgress.total}</span>
                  <span>{Math.round((migrationProgress.current / migrationProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                  />
                </div>
                {migrationProgress.currentItem && (
                  <div className="text-sm text-muted-foreground">
                    Procesando: Placa {migrationProgress.currentItem.licensePlate}
                    {migrationProgress.currentItem.cufe && ` (${migrationProgress.currentItem.cufe})`}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Resumen y controles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total de Registros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRecords}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Contabilizados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{totalRecords - pendingCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Botón de migración masiva */}
        <Card>
          <CardHeader>
            <CardTitle>Migración Masiva</CardTitle>
            <CardDescription>
              Migra todos los registros pendientes a Siigo automáticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={startMigration}
              disabled={isMigrating || !credentials.isConfigured || pendingCount === 0}
              className="flex items-center gap-2"
            >
              {isMigrating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Migrando...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Iniciar Migración Masiva
                </>
              )}
            </Button>
            {!credentials.isConfigured && (
              <p className="text-sm text-red-600 mt-2">
                Las credenciales de Siigo no están configuradas
              </p>
            )}
            {pendingCount === 0 && (
              <p className="text-sm text-green-600 mt-2">
                No hay registros pendientes de migración
              </p>
            )}
          </CardContent>
        </Card>

        {/* Tabla de registros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Registros de Flypass Data
            </CardTitle>
            <CardDescription>
              {totalRecords} registros encontrados • Página {currentPage} de {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => loadPendingFlypassData(currentPage)} variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reintentar
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Controles de paginación */}
                <div className="flex items-center justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPendingFlypassData(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Anterior
                  </Button>
                  
                  <span className="text-sm text-muted-foreground">
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalRecords)} de {totalRecords}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadPendingFlypassData(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                {/* Lista de registros */}
                <div className="space-y-2">
                  {flypassData.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-medium">Placa: {record.licensePlate}</p>
                            <p className="text-sm text-muted-foreground">{record.tollName}</p>
                          </div>
                          <div>
                            <p className="text-sm">{formatDate(record.creationDate)}</p>
                            <p className="text-sm font-medium">{formatCurrency(record.subtotal)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">CUFE: {record.cufe}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={record.accounted ? "default" : "secondary"}>
                          {record.accounted ? "Contabilizado" : "Pendiente"}
                        </Badge>
                        {!record.accounted && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => migrateIndividual(record.id)}
                            disabled={migratingItems.has(record.id)}
                          >
                            {migratingItems.has(record.id) ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                                Migrando...
                              </>
                            ) : (
                              <>
                                <Send className="h-3 w-3 mr-1" />
                                Migrar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
