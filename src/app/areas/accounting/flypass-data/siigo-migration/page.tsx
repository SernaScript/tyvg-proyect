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
  const [migrationStats, setMigrationStats] = useState<{
    successful: number
    failed: number
    total: number
    isActive: boolean
  }>({ successful: 0, failed: 0, total: 0, isActive: false })
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
    setMigrationStats({ successful: 0, failed: 0, total: 0, isActive: false })
    
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

      // Inicializar estadísticas de migración
      setMigrationStats({
        successful: 0,
        failed: 0,
        total: records.length,
        isActive: true
      })

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
            setMigrationStats(prev => ({
              ...prev,
              successful: prev.successful + 1
            }))
          } else {
            errors++
            setMigrationStats(prev => ({
              ...prev,
              failed: prev.failed + 1
            }))
          }
        } catch (error) {
          errors++
          setMigrationStats(prev => ({
            ...prev,
            failed: prev.failed + 1
          }))
        }

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Recargar datos después de la migración
      await loadPendingFlypassData(currentPage)
      
      // Finalizar estadísticas
      setMigrationStats(prev => ({
        ...prev,
        isActive: false
      }))

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setMigrationStats(prev => ({
        ...prev,
        isActive: false
      }))
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
    setMigrationStats({ successful: 0, failed: 0, total: 0, isActive: false })
    
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

      // Inicializar estadísticas de migración
      setMigrationStats({
        successful: 0,
        failed: 0,
        total: records.length,
        isActive: true
      })

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
            setMigrationStats(prev => ({
              ...prev,
              successful: prev.successful + 1
            }))
          } else {
            errors++
            setMigrationStats(prev => ({
              ...prev,
              failed: prev.failed + 1
            }))
          }
        } catch (error) {
          errors++
          setMigrationStats(prev => ({
            ...prev,
            failed: prev.failed + 1
          }))
        }

        // Pequeña pausa para no sobrecargar la API
        await new Promise(resolve => setTimeout(resolve, 500))
      }

      // Recargar datos después de la migración
      await loadPendingFlypassData(currentPage)
      await loadJournalStats()
      
      // Finalizar estadísticas
      setMigrationStats(prev => ({
        ...prev,
        isActive: false
      }))

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error desconocido')
      setMigrationStats(prev => ({
        ...prev,
        isActive: false
      }))
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
    let date: Date
    
    if (dateInput instanceof Date) {
      date = dateInput
    } else {
      // Si es un string, crear la fecha de manera que evite problemas de zona horaria
      if (dateInput.includes('T') || dateInput.includes('Z')) {
        date = new Date(dateInput)
      } else {
        // Si es solo fecha (YYYY-MM-DD), crear la fecha en zona horaria local
        const [year, month, day] = dateInput.split('T')[0].split('-')
        date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
      }
    }
    
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


        {/* Barra de progreso con estadísticas */}
        {migrationStats.isActive && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <RefreshCw className="h-5 w-5 animate-spin" />
                Progreso de Migración
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">
                    Procesados: {migrationStats.successful + migrationStats.failed} de {migrationStats.total}
                  </span>
                  <span className="font-bold text-green-600">
                    {migrationStats.total > 0 ? Math.round(((migrationStats.successful + migrationStats.failed) / migrationStats.total) * 100) : 0}%
                  </span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-4 relative overflow-hidden">
                  <div 
                    className="bg-green-600 h-4 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${migrationStats.total > 0 ? ((migrationStats.successful + migrationStats.failed) / migrationStats.total) * 100 : 0}%` }}
                  />
                  <div 
                    className="bg-red-500 h-4 rounded-full transition-all duration-500 ease-out absolute top-0"
                    style={{ 
                      width: `${migrationStats.total > 0 ? (migrationStats.failed / migrationStats.total) * 100 : 0}%`,
                      left: `${migrationStats.total > 0 ? (migrationStats.successful / migrationStats.total) * 100 : 0}%`
                    }}
                  />
                </div>
                {migrationProgress?.currentItem && (
                  <div className="text-sm text-green-700 bg-green-100 p-2 rounded">
                    <span className="font-medium">Procesando:</span> Placa {migrationProgress.currentItem.licensePlate}
                    {migrationProgress.currentItem.cufe && ` • CUFE: ${migrationProgress.currentItem.cufe}`}
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="text-green-700">Exitosos: {migrationStats.successful}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <span className="text-red-700">Errores: {migrationStats.failed}</span>
                    </div>
                  </div>
                  <div className="text-green-600 font-medium">
                    {migrationStats.total > 0 ? Math.round((migrationStats.successful / migrationStats.total) * 100) : 0}% éxito
                  </div>
                </div>
                <div className="text-xs text-green-600">
                  💡 Los registros se procesan individualmente para garantizar la integridad de los datos
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Icono SVG de estadísticas en esquina */}
        {(migrationStats.successful > 0 || migrationStats.failed > 0) && !migrationStats.isActive && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="bg-white rounded-lg shadow-lg border p-3 hover:shadow-xl transition-shadow group">
              <div className="flex items-center gap-2">
                <svg width="40" height="40" viewBox="0 0 40 40" className="drop-shadow-sm">
                  {/* Círculo de fondo */}
                  <circle cx="20" cy="20" r="18" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="2"/>
                  
                  {/* Sección de éxitos (verde) */}
                  {migrationStats.successful > 0 && (
                    <path
                      d={`M 20 20 L 20 2 A 18 18 0 ${migrationStats.successful / (migrationStats.successful + migrationStats.failed) > 0.5 ? 1 : 0} 1 ${20 + 18 * Math.cos((migrationStats.successful / (migrationStats.successful + migrationStats.failed)) * 2 * Math.PI - Math.PI/2)} ${20 + 18 * Math.sin((migrationStats.successful / (migrationStats.successful + migrationStats.failed)) * 2 * Math.PI - Math.PI/2)} Z`}
                      fill="#10b981"
                      className="transition-all duration-500"
                    />
                  )}
                  
                  {/* Sección de errores (rojo) */}
                  {migrationStats.failed > 0 && (
                    <path
                      d={`M 20 20 L ${20 + 18 * Math.cos((migrationStats.successful / (migrationStats.successful + migrationStats.failed)) * 2 * Math.PI - Math.PI/2)} ${20 + 18 * Math.sin((migrationStats.successful / (migrationStats.successful + migrationStats.failed)) * 2 * Math.PI - Math.PI/2)} A 18 18 0 ${migrationStats.failed / (migrationStats.successful + migrationStats.failed) > 0.5 ? 1 : 0} 1 20 2 Z`}
                      fill="#ef4444"
                      className="transition-all duration-500"
                    />
                  )}
                  
                  {/* Icono central */}
                  <circle cx="20" cy="20" r="8" fill="white" stroke="#e5e7eb" strokeWidth="1"/>
                  <text x="20" y="24" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                    {migrationStats.successful + migrationStats.failed}
                  </text>
                </svg>
                
                {/* Botón para limpiar estadísticas */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setMigrationStats({ successful: 0, failed: 0, total: 0, isActive: false })}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              
              {/* Tooltip con información */}
              <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{migrationStats.successful} exitosos</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span>{migrationStats.failed} errores</span>
                </div>
              </div>
            </div>
          </div>
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
