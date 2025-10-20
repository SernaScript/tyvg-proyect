"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Componente para el icono de Excel
const ExcelIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 50 50" 
    className={className}
  >
    <path d="M 28.8125 0.03125 L 0.8125 5.34375 C 0.339844 5.433594 0 5.863281 0 6.34375 L 0 43.65625 C 0 44.136719 0.339844 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 28.875 49.980469 28.9375 50 29 50 C 29.230469 50 29.445313 49.929688 29.625 49.78125 C 29.855469 49.589844 30 49.296875 30 49 L 30 1 C 30 0.703125 29.855469 0.410156 29.625 0.21875 C 29.394531 0.0273438 29.105469 -0.0234375 28.8125 0.03125 Z M 32 6 L 32 13 L 34 13 L 34 15 L 32 15 L 32 20 L 34 20 L 34 22 L 32 22 L 32 27 L 34 27 L 34 29 L 32 29 L 32 35 L 34 35 L 34 37 L 32 37 L 32 44 L 47 44 C 48.101563 44 49 43.101563 49 42 L 49 8 C 49 6.898438 48.101563 6 47 6 Z M 36 13 L 44 13 L 44 15 L 36 15 Z M 6.6875 15.6875 L 11.8125 15.6875 L 14.5 21.28125 C 14.710938 21.722656 14.898438 22.265625 15.0625 22.875 L 15.09375 22.875 C 15.199219 22.511719 15.402344 21.941406 15.6875 21.21875 L 18.65625 15.6875 L 23.34375 15.6875 L 17.75 24.9375 L 23.5 34.375 L 18.53125 34.375 L 15.28125 28.28125 C 15.160156 28.054688 15.035156 27.636719 14.90625 27.03125 L 14.875 27.03125 C 14.8125 27.316406 14.664063 27.761719 14.4375 28.34375 L 11.1875 34.375 L 6.1875 34.375 L 12.15625 25.03125 Z M 36 20 L 44 20 L 44 22 L 36 22 Z M 36 27 L 44 27 L 44 29 L 36 29 Z M 36 35 L 44 35 L 44 37 L 36 37 Z"/>
  </svg>
)

interface FlypassUploadExcelModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (result: any) => void
}

interface UploadResult {
  success: boolean
  message: string
  data?: {
    fileName: string
    totalRows: number
    processedRows: number
    errorRows: number
    errors: string[]
  }
  error?: string
  details?: string
}

export function FlypassUploadExcelModal({
  open,
  onOpenChange,
  onSuccess
}: FlypassUploadExcelModalProps) {
  const [file, setFile] = useState<File | null>(null)
  const [filePath, setFilePath] = useState<string>('')
  const [uploadMode, setUploadMode] = useState<'upload' | 'path'>('upload')
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      // Validar que sea un archivo Excel
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setResult({
          success: false,
          message: 'Error',
          error: 'El archivo debe ser un Excel (.xlsx o .xls)'
        })
        return
      }
      setFile(selectedFile)
      setResult(null) // Limpiar resultado anterior
    }
  }

  const handleUpload = async () => {
    if (uploadMode === 'upload' && !file) return
    if (uploadMode === 'path' && !filePath.trim()) return

    setUploading(true)
    setResult(null)

    try {
      let response: Response

      if (uploadMode === 'upload') {
        // Modo subida de archivo - usar FormData
        const formData = new FormData()
        formData.append('file', file!)
        response = await fetch('/api/flypass-scraping/upload-excel', {
          method: 'POST',
          body: formData,
        })
      } else {
        // Modo ruta de archivo - usar JSON
        response = await fetch('/api/flypass-scraping/upload-excel', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            filePath: filePath.trim(),
            fileName: filePath.split('\\').pop() || filePath.split('/').pop()
          }),
        })
      }

      const result: UploadResult = await response.json()
      setResult(result)

      if (result.success && onSuccess) {
        onSuccess(result)
      }

    } catch (error) {
      setResult({
        success: false,
        message: 'Error',
        error: 'Error de conexión',
        details: error instanceof Error ? error.message : 'Error desconocido'
      })
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setFilePath('')
    setResult(null)
    setUploading(false)
    setUploadMode('upload')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onOpenChange(false)
  }

  const handleSuccessClose = () => {
    handleClose()
    if (onSuccess && result?.success) {
      onSuccess(result)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExcelIcon className="h-5 w-5" />
            Subir Excel de Flypass
          </DialogTitle>
          <DialogDescription>
            Sube un archivo Excel con los datos de peajes de Flypass para procesarlos automáticamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selector de modo */}
          <div className="space-y-2">
            <Label>Modo de procesamiento</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={uploadMode === 'upload' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('upload')}
                disabled={uploading}
              >
                Subir archivo
              </Button>
              <Button
                type="button"
                variant={uploadMode === 'path' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setUploadMode('path')}
                disabled={uploading}
              >
                Ruta de archivo
              </Button>
            </div>
          </div>

          {/* Selector de archivo o ruta */}
          {uploadMode === 'upload' ? (
            <div className="space-y-2">
              <Label htmlFor="file">Archivo Excel</Label>
              <div className="flex items-center gap-2">
                <Input
                  ref={fileInputRef}
                  id="file"
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileSelect}
                  disabled={uploading}
                  className="flex-1"
                />
                {file && (
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="truncate max-w-[150px]">{file.name}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="filePath">Ruta del archivo Excel</Label>
              <Input
                id="filePath"
                type="text"
                placeholder="C:\ruta\completa\al\archivo.xlsx"
                value={filePath}
                onChange={(e) => setFilePath(e.target.value)}
                disabled={uploading}
              />
            </div>
          )}

          {/* Información sobre columnas esperadas */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Columnas esperadas:</strong> Estado, Tipo, Creacion, Documento, Relacionado, C.Area, Placa, Peaje, Categoria, F.Paso, Transaccion, Subtotal, Impuesto, Total, CUFE, tascode, descripcion, NIT
            </AlertDescription>
          </Alert>

          {/* Resultado del upload */}
          {result && (
            <Alert className={result.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertDescription>
                <div className="space-y-2">
                  <p className={result.success ? "text-green-800" : "text-red-800"}>
                    {result.message}
                  </p>
                  
                  {result.data && (
                    <div className="text-sm space-y-1">
                      <p><strong>Archivo:</strong> {result.data.fileName}</p>
                      <p><strong>Total filas:</strong> {result.data.totalRows}</p>
                      <p><strong>Procesadas:</strong> {result.data.processedRows}</p>
                      {result.data.errorRows > 0 && (
                        <p><strong>Errores:</strong> {result.data.errorRows}</p>
                      )}
                    </div>
                  )}
                  
                  {result.error && (
                    <p className="text-red-800"><strong>Error:</strong> {result.error}</p>
                  )}
                  
                  {result.details && (
                    <p className="text-red-800 text-sm">{result.details}</p>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancelar
          </Button>
          <Button
            onClick={result?.success ? handleSuccessClose : handleUpload}
            disabled={
              (uploadMode === 'upload' && !file) || 
              (uploadMode === 'path' && !filePath.trim()) || 
              uploading
            }
            className="flex items-center gap-2"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : result?.success ? (
              <>
                <CheckCircle className="h-4 w-4" />
                Cerrar
              </>
            ) : (
              <>
                <ExcelIcon className="h-4 w-4" />
                Subir y Procesar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
