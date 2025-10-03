"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Database, AlertCircle, CheckCircle, FileText } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface FlypassMigrationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: any) => void
}

interface MigrationInfo {
  statistics: {
    totalRecords: number
    byStatus: Array<{ status: string; _count: { status: number } }>
    byDocumentType: Array<{ documentType: string; _count: { documentType: number } }>
    byToll: Array<{ tollName: string; _count: { tollName: number } }>
  }
  availableFiles: Array<{
    name: string
    size: number
    modified: string
  }>
}

export function FlypassMigrationModal({ 
  open, 
  onOpenChange, 
  onSuccess 
}: FlypassMigrationModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingInfo, setIsLoadingInfo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [migrationInfo, setMigrationInfo] = useState<MigrationInfo | null>(null)

  // Cargar información de migración cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadMigrationInfo()
    }
  }, [open])

  const loadMigrationInfo = async () => {
    setIsLoadingInfo(true)
    try {
      const response = await fetch('/api/flypass-data/migrate')
      const data = await response.json()
      
      if (data.success) {
        setMigrationInfo(data.data)
      } else {
        setError(data.error || 'Error cargando información')
      }
    } catch (err) {
      setError('Error conectando con el servidor')
    } finally {
      setIsLoadingInfo(false)
    }
  }

  const handleMigrate = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/flypass-data/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error en la migración')
      }

      setResult(data)
      onSuccess?.(data)
      
      // Recargar información después de la migración
      await loadMigrationInfo()
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError(null)
      setResult(null)
      onOpenChange(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getAccountedCount = () => {
    if (!migrationInfo?.statistics) return 0
    const accountedStatus = migrationInfo.statistics.byStatus.find(s => s.status === 'true')
    return accountedStatus?._count.status || 0
  }

  const getTotalCount = () => {
    return migrationInfo?.statistics?.totalRecords || 0
  }

  const getAccountedPercentage = () => {
    const total = getTotalCount()
    const accounted = getAccountedCount()
    return total > 0 ? ((accounted / total) * 100).toFixed(1) : '0'
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Migración de Datos Flypass
          </DialogTitle>
          <DialogDescription>
            Migra el último archivo Excel de Flypass a la base de datos. Los datos existentes se actualizarán preservando el estado de contabilización.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información actual */}
          {isLoadingInfo ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>Cargando información...</span>
            </div>
          ) : migrationInfo ? (
            <div className="space-y-4">
              {/* Estadísticas actuales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm text-blue-600 font-medium">Total de registros</div>
                  <div className="text-2xl font-bold text-blue-900">
                    {getTotalCount().toLocaleString()}
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm text-green-600 font-medium">Contabilizados</div>
                  <div className="text-2xl font-bold text-green-900">
                    {getAccountedCount().toLocaleString()}
                  </div>
                  <div className="text-xs text-green-600">
                    ({getAccountedPercentage()}%)
                  </div>
                </div>
              </div>

              {/* Archivos disponibles */}
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Archivos disponibles
                </h4>
                {migrationInfo.availableFiles.length > 0 ? (
                  <div className="space-y-2">
                    {migrationInfo.availableFiles.slice(0, 3).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{file.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{formatFileSize(file.size)}</Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(file.modified).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                    {migrationInfo.availableFiles.length > 3 && (
                      <div className="text-xs text-gray-500 text-center">
                        ... y {migrationInfo.availableFiles.length - 3} archivos más
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">
                    No hay archivos Excel en el directorio de descargas
                  </div>
                )}
              </div>
            </div>
          ) : null}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription className={result.success ? "text-green-800" : "text-red-800"}>
                {result.message}
                {result.data && (
                  <div className="mt-2 text-sm">
                    <div>Archivo procesado: {result.data.fileProcessed}</div>
                    <div>Registros procesados: {result.data.processedRows?.toLocaleString()}</div>
                    {result.data.errorRows > 0 && (
                      <div>Errores: {result.data.errorRows}</div>
                    )}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleMigrate} 
            disabled={isLoading || migrationInfo?.availableFiles.length === 0}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Migrando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Migrar Datos
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
