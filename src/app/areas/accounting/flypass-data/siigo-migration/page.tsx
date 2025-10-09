"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Send,
  CheckCircle,
  XCircle,
  X,
  Database,
  FileText,
  Receipt,
  Eye,
  Code
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
  const [isMigratingJournals, setIsMigratingJournals] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [flypassData, setFlypassData] = useState<FlypassData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [migratingItems, setMigratingItems] = useState<Set<string>>(new Set())
  const [migratingJournalItems, setMigratingJournalItems] = useState<Set<string>>(new Set())
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [migrationProgress, setMigrationProgress] = useState<{
    current: number
    total: number
    currentItem?: { licensePlate: string; cufe?: string }
    type?: 'purchase' | 'journal'
  } | null>(null)
  const [journalStats, setJournalStats] = useState<{
    totalPending: number
    byDocumentType: Record<string, number>
  }>({ totalPending: 0, byDocumentType: {} })
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewData, setPreviewData] = useState<{
    type: 'purchase' | 'journal'
    endpoint: string
    method: string
    requestBody: any
    recordCount: number
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
    
    // Auto-remover notificación después de 6 segundos para mejor UX
    setTimeout(() => {
      removeNotification(notification.id)
    }, 6000)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
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

  // Cargar estadísticas de journals pendientes
  const loadJournalStats = async () => {
    try {
      const response = await fetch('/api/flypass-data/siigo-journal-migration')
      if (response.ok) {
        const data = await response.json()
        setJournalStats(data.data)
      }
    } catch (error) {
      console.error('Error cargando estadísticas de journals:', error)
    }
  }

  // Función para generar preview de migración de facturas
  const generatePurchasePreview = async () => {
    try {
      const pendingResponse = await fetch(`/api/flypass-data?page=1&limit=1000`)
      if (!pendingResponse.ok) {
        throw new Error('Error al cargar registros pendientes')
      }

      const pendingData = await pendingResponse.json()
      const records = pendingData.data.filter((record: FlypassData) => 
        !record.accounted && record.documentType === "FC"
      )
      
      if (records.length === 0) {
        addNotification('info', 'Sin Registros', 'No hay facturas pendientes de migración')
        return
      }

      // Generar preview de la primera solicitud como ejemplo
      const firstRecord = records[0]
      const previewRequestBody = {
        document: { 
          id: 39037 
        },
        date: new Date(firstRecord.creationDate).toISOString().split('T')[0],
        supplier: { 
          identification: "900219834", 
          branch_office: 0 
        },
        cost_center: "[ID_DEL_CENTRO_DE_COSTO]", // Placeholder
        provider_invoice: {
          prefix: firstRecord.documentNumber.split('-')[0] || '',
          number: firstRecord.documentNumber.split('-').slice(1).join('-') || ''
        },
        observations: firstRecord.cufe,
        discount_type: "Value",
        supplier_by_item: false,
        tax_included: false,
        items: [{
          type: "Account",
          code: "61459501",
          description: firstRecord.description || "PASAJE FLYPASS",
          quantity: 1,
          price: firstRecord.subtotal
        }],
        payments: [{
          id: 71,
          value: firstRecord.subtotal,
          due_date: new Date(firstRecord.creationDate).toISOString().split('T')[0]
        }]
      }

      setPreviewData({
        type: 'purchase',
        endpoint: 'https://api.siigo.com/v1/purchases',
        method: 'POST',
        requestBody: previewRequestBody,
        recordCount: records.length
      })
      setShowPreviewModal(true)

    } catch (error) {
      addNotification('error', 'Error', 'Error generando preview de migración')
    }
  }

  // Función para generar preview de migración de journals
  const generateJournalPreview = async () => {
    try {
      const pendingResponse = await fetch(`/api/flypass-data?page=1&limit=1000`)
      if (!pendingResponse.ok) {
        throw new Error('Error al cargar registros pendientes')
      }

      const pendingData = await pendingResponse.json()
      const records = pendingData.data.filter((record: FlypassData) => 
        !record.accounted && record.documentType !== "FC"
      )
      
      if (records.length === 0) {
        addNotification('info', 'Sin Registros', 'No hay journals pendientes de migración')
        return
      }

      // Generar preview de la primera solicitud como ejemplo
      const firstRecord = records[0]
      const previewRequestBody = {
        document: { 
          id: 39069 
        },
        date: new Date(firstRecord.creationDate).toISOString().split('T')[0],
        items: [
          {
            account: { 
              code: "23359501", 
              movement: "Debit" 
            },
            customer: { 
              identification: "900219834", 
              branch_office: 0 
            },
            description: `${firstRecord.documentType} FLYPASS - ${firstRecord.description || "PASAJE"}`,
            cost_center: "[ID_DEL_CENTRO_DE_COSTO]", // Placeholder
            value: firstRecord.subtotal,
            due: {
              prefix: firstRecord.relatedDocument ? firstRecord.relatedDocument.substring(0, 4) : "",
              consecutive: firstRecord.relatedDocument ? parseInt(firstRecord.relatedDocument.substring(4)) || 0 : 0,
              quote: 1,
              date: new Date(firstRecord.creationDate).toISOString().split('T')[0]
            }
          },
          {
            account: { 
              code: "61350603", 
              movement: "Credit" 
            },
            customer: { 
              identification: "900219834", 
              branch_office: 0 
            },
            description: `${firstRecord.documentType} FLYPASS - ${firstRecord.description || "PASAJE"}`,
            cost_center: 518,
            value: firstRecord.subtotal
          }
        ],
        observations: `Migración automática - CUFE: ${firstRecord.cufe} - Placa: ${firstRecord.licensePlate}`
      }

      setPreviewData({
        type: 'journal',
        endpoint: 'https://api.siigo.com/v1/journals',
        method: 'POST',
        requestBody: previewRequestBody,
        recordCount: records.length
      })
      setShowPreviewModal(true)

    } catch (error) {
      addNotification('error', 'Error', 'Error generando preview de migración')
    }
  }

  // Función para ejecutar migración después del preview (mantenida para compatibilidad)
  const executeMigration = async () => {
    if (!previewData) return

    if (previewData.type === 'purchase') {
      await startMigration()
    } else {
      await startJournalMigration()
    }
    
    setShowPreviewModal(false)
    setPreviewData(null)
  }

  // Función para iniciar migración masiva (ahora privada)
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
        currentItem: undefined,
        type: 'purchase'
      })

      let processed = 0
      let errors = 0

      // Procesar cada registro individualmente
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        setMigrationProgress({
          current: i + 1,
          total: records.length,
          currentItem: { licensePlate: record.licensePlate, cufe: record.cufe },
          type: 'purchase'
        })

        try {
          const response = await fetch(`/api/flypass-data/siigo-migration/${record.id}`, {
            method: 'POST'
          })

          const result = await response.json()

          if (result.success) {
            processed++
            addNotification('success', '✅ Factura Contabilizada', 
              `Placa ${record.licensePlate} contabilizada como Purchase en Siigo`)
          } else {
            errors++
            addNotification('error', '❌ Error de Contabilización', 
              `Placa ${record.licensePlate}: ${result.error}`)
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
      
      const successRate = records.length > 0 ? Math.round((processed / records.length) * 100) : 0
      addNotification('info', '🎉 Migración de Facturas Completada', 
        `✅ ${processed} facturas contabilizadas • ❌ ${errors} errores • 📊 ${successRate}% éxito`)

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
        addNotification('success', '✅ Factura Contabilizada', 'Registro contabilizado como Purchase en Siigo')
        // Recargar datos
        await loadPendingFlypassData(currentPage)
      } else {
        addNotification('error', '❌ Error de Contabilización', result.error || 'Error desconocido')
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

  // Función para iniciar migración masiva de journals
  const startJournalMigration = async () => {
    setIsMigratingJournals(true)
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
        !record.accounted && record.documentType !== "FC"
      )
      
      if (records.length === 0) {
        addNotification('info', 'Sin Registros', 'No hay journals pendientes de migración')
        return
      }

      setMigrationProgress({
        current: 0,
        total: records.length,
        currentItem: undefined,
        type: 'journal'
      })

      let processed = 0
      let errors = 0

      // Procesar cada registro individualmente
      for (let i = 0; i < records.length; i++) {
        const record = records[i]
        
        setMigrationProgress({
          current: i + 1,
          total: records.length,
          currentItem: { licensePlate: record.licensePlate, cufe: record.cufe },
          type: 'journal'
        })

        try {
          const response = await fetch(`/api/flypass-data/siigo-journal-migration/${record.id}`, {
            method: 'POST'
          })

          const result = await response.json()

          if (result.success) {
            processed++
            addNotification('success', '✅ Journal Contabilizado', 
              `Placa ${record.licensePlate} contabilizada como Journal en Siigo`)
          } else {
            errors++
            addNotification('error', '❌ Error de Contabilización', 
              `Placa ${record.licensePlate}: ${result.error}`)
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
      await loadJournalStats()
      
      const successRate = records.length > 0 ? Math.round((processed / records.length) * 100) : 0
      addNotification('info', '🎉 Migración de Journals Completada', 
        `✅ ${processed} journals contabilizados • ❌ ${errors} errores • 📊 ${successRate}% éxito`)

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      addNotification('error', 'Error', 'Error durante la migración masiva de journals')
    } finally {
      setIsMigratingJournals(false)
      setMigrationProgress(null)
    }
  }

  // Función para migrar un journal individual
  const migrateJournalIndividual = async (recordId: string) => {
    setMigratingJournalItems(prev => new Set(prev).add(recordId))
    
    try {
      const response = await fetch(`/api/flypass-data/siigo-journal-migration/${recordId}`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        addNotification('success', '✅ Journal Contabilizado', 'Registro contabilizado como Journal en Siigo')
        // Recargar datos y estadísticas
        await loadPendingFlypassData(currentPage)
        await loadJournalStats()
      } else {
        addNotification('error', '❌ Error de Contabilización', result.error || 'Error desconocido')
      }
    } catch (error) {
      addNotification('error', 'Error', 'Error de conexión al migrar journal')
    } finally {
      setMigratingJournalItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(recordId)
        return newSet
      })
    }
  }

  useEffect(() => {
    loadPendingFlypassData()
    loadJournalStats()
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
  const pendingFC = flypassData.filter(record => !record.accounted && record.documentType === "FC").length
  const pendingNonFC = flypassData.filter(record => !record.accounted && record.documentType !== "FC").length

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


        {/* Progreso de migración */}
        {migrationProgress && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-800">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Contabilizando {migrationProgress.type === 'purchase' ? 'Facturas' : 'Notas Crédito'} en Siigo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Procesando registro {migrationProgress.current} de {migrationProgress.total}
                  </span>
                  <span className="font-bold text-blue-600">
                    {Math.round((migrationProgress.current / migrationProgress.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${(migrationProgress.current / migrationProgress.total) * 100}%` }}
                  />
                </div>
                {migrationProgress.currentItem && (
                  <div className="text-sm text-blue-700 bg-blue-100 p-2 rounded">
                    <span className="font-medium">Procesando:</span> Placa {migrationProgress.currentItem.licensePlate}
                    {migrationProgress.currentItem.cufe && ` • CUFE: ${migrationProgress.currentItem.cufe}`}
                  </div>
                )}
                <div className="text-xs text-blue-600">
                  💡 Los registros se procesan individualmente para garantizar la integridad de los datos
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Botones de migración masiva */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            onClick={startMigration}
            disabled={isMigrating || pendingFC === 0}
            className="flex items-center gap-2 flex-1"
            size="lg"
          >
            {isMigrating ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Contabilizando Facturas...
              </>
            ) : (
              <>
                <Receipt className="h-5 w-5" />
                Contabilizar Facturas ({pendingFC})
              </>
            )}
          </Button>

          <Button 
            onClick={startJournalMigration}
            disabled={isMigratingJournals || pendingNonFC === 0}
            className="flex items-center gap-2 flex-1"
            size="lg"
            variant="outline"
          >
            {isMigratingJournals ? (
              <>
                <RefreshCw className="h-5 w-5 animate-spin" />
                Contabilizando Journals...
              </>
            ) : (
              <>
                <FileText className="h-5 w-5" />
                Contabilizar Notas Credito ({pendingNonFC})
              </>
            )}
          </Button>
        </div>

        {/* Tabla de registros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Registros de Flypass Data
            </CardTitle>
            <CardDescription>
              Página {currentPage} de {totalPages}
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
                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, flypassData.length + ((currentPage - 1) * itemsPerPage))} registros
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

                {/* Tabla de registros */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-gray-700">Placa</th>
                        <th className="text-left p-3 font-medium text-gray-700">Peaje</th>
                        <th className="text-left p-3 font-medium text-gray-700">Fecha</th>
                        <th className="text-left p-3 font-medium text-gray-700">Valor</th>
                        <th className="text-left p-3 font-medium text-gray-700">Estado</th>
                        <th className="text-left p-3 font-medium text-gray-700">Tipo</th>
                        <th className="text-center p-3 font-medium text-gray-700">Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {flypassData.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="p-3">
                            <div>
                              <p className="font-medium">{record.licensePlate}</p>
                            </div>
                          </td>
                          <td className="p-3">
                            <p className="text-sm text-muted-foreground">{record.tollName}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-sm">{formatDate(record.creationDate)}</p>
                          </td>
                          <td className="p-3">
                            <p className="text-sm font-medium">{formatCurrency(record.subtotal)}</p>
                          </td>
                          <td className="p-3">
                            <Badge variant={record.accounted ? "default" : "secondary"}>
                              {record.accounted ? "Contabilizado" : "Pendiente"}
                            </Badge>
                          </td>
                          <td className="p-3">
                            <Badge variant="outline" className="text-xs">
                              {record.documentType}
                            </Badge>
                          </td>
                          <td className="p-3 text-center">
                            {!record.accounted && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => 
                                  record.documentType === "FC" 
                                    ? migrateIndividual(record.id)
                                    : migrateJournalIndividual(record.id)
                                }
                                disabled={migratingItems.has(record.id) || migratingJournalItems.has(record.id)}
                                className="h-8 w-8 p-0"
                              >
                                {(migratingItems.has(record.id) || migratingJournalItems.has(record.id)) ? (
                                  <RefreshCw className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Send className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de Preview */}
        {showPreviewModal && previewData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Code className="h-6 w-6 text-blue-600" />
                    <div>
                      <h2 className="text-xl font-semibold">
                        Preview de Solicitud HTTP - {previewData.type === 'purchase' ? 'Purchase' : 'Journal'}
                      </h2>
                      <p className="text-sm text-gray-600">
                        Se procesarán {previewData.recordCount} registros
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowPreviewModal(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Endpoint:</h3>
                    <div className="bg-gray-100 p-3 rounded font-mono text-sm">
                      <span className="text-blue-600 font-semibold">{previewData.method}</span> {previewData.endpoint}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-sm text-gray-700 mb-2">Request Body (Ejemplo del primer registro):</h3>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded text-xs overflow-x-auto">
                      {JSON.stringify(previewData.requestBody, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800">Nota Importante:</h4>
                        <p className="text-sm text-yellow-700 mt-1">
                          Este es un ejemplo basado en el primer registro. Cada registro se procesará individualmente 
                          con sus datos específicos (placa, CUFE, fecha, etc.). El campo "cost_center" se resolverá 
                          automáticamente basándose en la placa del vehículo.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-6 border-t bg-gray-50 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={executeMigration}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Confirmar y Ejecutar Migración
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AreaLayout>
  )
}
