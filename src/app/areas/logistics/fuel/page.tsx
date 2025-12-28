"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Fuel, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  RefreshCw,
  X,
  AlertTriangle,
  Info,
  Cloud
} from "lucide-react"
import { FuelPurchasesTable } from "@/components/FuelPurchasesTable"
import { FuelPurchase } from "@/types/fuel"
import { useClientOnly } from "@/hooks/useClientOnly"
import { ClientOnly } from "@/components/ClientOnly"

interface ValidationResult {
  totalRows: number
  valid: number
  errors: number
  details: string[]
  validRecords: any[]
  invalidRecords: any[]
}

interface MigrationResult {
  total: number
  migrated: number
  errors: number
  details: string[]
  created: any[]
}

export default function FuelPage() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'validating' | 'validated' | 'migrating' | 'success' | 'error'>('idle')
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [migrationResult, setMigrationResult] = useState<MigrationResult | null>(null)
  const [showValidationModal, setShowValidationModal] = useState(false)
  const isClient = useClientOnly()

  // Cargar datos de combustible
  const loadFuelPurchases = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/fuel-purchases')
      if (response.ok) {
        const data = await response.json()
        setFuelPurchases(data.data)
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

  // Cargar datos al montar el componente
  useEffect(() => {
    loadFuelPurchases()
  }, [])

  // Función para descargar plantilla Excel
  const downloadTemplate = async () => {
    try {
      const response = await fetch('/api/fuel-purchases/template')
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = 'plantilla_combustible.xlsx'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        setError('Error al descargar la plantilla')
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      setError('Error al descargar la plantilla')
    }
  }

  // Función para manejar la carga de archivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('idle')
    }
  }

  // Función para validar el archivo cargado
  const validateFile = async () => {
    if (!selectedFile) return

    setUploadStatus('validating')
    setValidationResult(null)
    setError(null)
    
    try {
      const formData = new FormData()
      formData.append('file', selectedFile)

      const response = await fetch('/api/fuel-purchases/validate', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus('validated')
        setValidationResult({
          totalRows: result.summary.totalRows,
          valid: result.summary.valid,
          errors: result.summary.errors,
          details: result.details || [],
          validRecords: result.validRecords || [],
          invalidRecords: result.invalidRecords || []
        })
        
        // Mostrar modal de validación
        setShowValidationModal(true)
      } else {
        setUploadStatus('error')
        setError(result.error || 'Error al validar el archivo')
      }
    } catch (error) {
      console.error('Error validating file:', error)
      setUploadStatus('error')
      setError('Error al validar el archivo')
    }
  }

  // Función para migrar los registros válidos
  const migrateValidRecords = async () => {
    if (!validationResult || validationResult.validRecords.length === 0) return

    setUploadStatus('migrating')
    setMigrationResult(null)
    
    try {
      const response = await fetch('/api/fuel-purchases/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          validRecords: validationResult.validRecords
        })
      })

      const result = await response.json()

      if (response.ok) {
        setUploadStatus('success')
        setMigrationResult({
          total: result.summary.total,
          migrated: result.summary.migrated,
          errors: result.summary.errors,
          details: result.details || [],
          created: result.created || []
        })
        
        // Resetear el input y limpiar estados
        setSelectedFile(null)
        const fileInput = document.getElementById('file-upload') as HTMLInputElement
        if (fileInput) fileInput.value = ''
        setShowValidationModal(false)
        
        // Recargar los datos
        await loadFuelPurchases()
      } else {
        setUploadStatus('error')
        setError(result.error || 'Error al migrar los registros')
      }
    } catch (error) {
      console.error('Error migrating records:', error)
      setUploadStatus('error')
      setError('Error al migrar los registros')
    }
  }

  // Función para cancelar la migración
  const cancelMigration = () => {
    setSelectedFile(null)
    setUploadStatus('idle')
    setValidationResult(null)
    setMigrationResult(null)
    setShowValidationModal(false)
    setError(null)
    
    // Resetear el input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }


  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
              <Fuel className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Gestión de Combustible
              </h1>
              <p className="text-muted-foreground">
                Control de consumo y costos de combustible de la flota
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={loadFuelPurchases}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>


        {/* Módulo de Importación/Exportación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Gestión de Datos
            </CardTitle>
            <CardDescription>
              Descarga plantillas y importa datos de combustible desde archivos Excel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Botón Descargar */}
              <Button 
                onClick={downloadTemplate} 
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
              >
                <Download className="h-6 w-6 text-blue-600" />
                <span className="font-semibold">Descargar</span>
                <span className="text-xs text-muted-foreground">Plantilla Excel</span>
              </Button>

              {/* Botón Migrar */}
              <Button 
                onClick={() => router.push('/areas/logistics/fuel/siigo-migration')}
                variant="outline"
                className="h-auto py-6 flex flex-col items-center gap-2"
              >
                <Cloud className="h-6 w-6 text-purple-600" />
                <span className="font-semibold">Migrar</span>
                <span className="text-xs text-muted-foreground">A Siigo Nube</span>
              </Button>

              {/* Botón Importar */}
              <div className="relative">
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  variant="outline"
                  className="h-auto py-6 w-full flex flex-col items-center gap-2"
                >
                  <Upload className="h-6 w-6 text-green-600" />
                  <span className="font-semibold">Importar Datos</span>
                  <span className="text-xs text-muted-foreground">Archivo Excel</span>
                </Button>
              </div>
            </div>

            {/* Estado del archivo seleccionado y validación */}
            {selectedFile && (
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{selectedFile.name}</span>
                  <Badge variant="outline" className="ml-auto">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </Badge>
                </div>

                <Button 
                  onClick={validateFile} 
                  disabled={!selectedFile || uploadStatus === 'validating' || uploadStatus === 'migrating'}
                  className="w-full"
                >
                  {uploadStatus === 'validating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Validando...
                    </>
                  ) : uploadStatus === 'migrating' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Migrando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Validar Archivo
                    </>
                  )}
                </Button>

                {/* Estado de validación */}
                {uploadStatus === 'validated' && validationResult && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-blue-800">
                        Archivo validado. Revisa los resultados antes de migrar.
                      </span>
                    </div>
                    
                    {/* Resumen de la validación */}
                    <div className="grid grid-cols-3 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900 dark:text-white">
                          {validationResult.totalRows}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Total Filas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {validationResult.valid}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Válidas</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {validationResult.errors}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Con Errores</div>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={cancelMigration}
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancelar
                      </Button>
                      <Button
                        onClick={migrateValidRecords}
                        disabled={validationResult.valid === 0}
                        className="flex-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Migrar {validationResult.valid} Registros Válidos
                      </Button>
                    </div>
                  </div>
                )}

                {/* Estado de migración exitosa */}
                {uploadStatus === 'success' && migrationResult && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">
                        Migración completada exitosamente
                      </span>
                    </div>
                    
                    {/* Resumen de la migración */}
                    <div className="grid grid-cols-2 gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {migrationResult.migrated}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Migrados</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {migrationResult.errors}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Errores</div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-800">
                      Error al procesar el archivo
                    </span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <span className="text-sm text-red-800">{error}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadFuelPurchases}
                  className="ml-auto"
                >
                  Reintentar
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabla de Registros */}
        <FuelPurchasesTable 
          fuelPurchases={fuelPurchases}
          onRefresh={loadFuelPurchases}
          isLoading={isLoading}
        />

        {/* Modal de Validación */}
        {showValidationModal && validationResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                    <Info className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Resultados de Validación
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Revisa los errores encontrados antes de migrar los datos
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowValidationModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Resumen */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium">Total de Filas</span>
                      </div>
                      <div className="text-2xl font-bold mt-1">{validationResult.totalRows}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium">Válidas</span>
                      </div>
                      <div className="text-2xl font-bold mt-1 text-green-600">{validationResult.valid}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <span className="text-sm font-medium">Con Errores</span>
                      </div>
                      <div className="text-2xl font-bold mt-1 text-red-600">{validationResult.errors}</div>
                    </CardContent>
                  </Card>
                </div>

                {/* Lista de Errores */}
                {validationResult.details.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Detalles de los Errores
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {validationResult.details.map((error, index) => (
                        <div
                          key={index}
                          className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                        >
                          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-red-800 dark:text-red-200 font-mono">
                            {error}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Registros Válidos */}
                {validationResult.validRecords.length > 0 && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                      Registros Válidos ({validationResult.validRecords.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {validationResult.validRecords.map((record, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-md text-xs"
                        >
                          <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-green-800 dark:text-green-200 truncate">
                              {record.vehicle?.plate}
                            </div>
                            <div className="text-green-600 dark:text-green-400 truncate">
                              {record.quantity}L • ${record.total}
                            </div>
                            <div className="text-green-500 dark:text-green-500 truncate">
                              {new Date(record.date).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-between gap-3 p-6 border-t bg-gray-50 dark:bg-gray-700">
                <Button
                  variant="outline"
                  onClick={cancelMigration}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancelar Migración
                </Button>
                <div className="flex gap-3">
                  {validationResult.errors > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowValidationModal(false)
                        // Aquí podrías agregar lógica para descargar un reporte de errores
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Descargar Reporte de Errores
                    </Button>
                  )}
                  <Button
                    onClick={migrateValidRecords}
                    disabled={validationResult.valid === 0}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Migrar {validationResult.valid} Registros Válidos
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AreaLayout>
  )
}
