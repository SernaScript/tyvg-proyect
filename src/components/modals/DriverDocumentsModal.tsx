"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  X,
  Plus,
  Trash2,
  FileText,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Upload,
  Info
} from "lucide-react"

interface Driver {
  id: string
  name: string
  identification: string
  documents: DriverDocument[]
}

interface DriverDocument {
  id: string
  documentType: string
  documentNumber: string
  issueDate: Date
  expirationDate: Date
  fileUrl?: string
  isActive: boolean
  isAlerted: boolean
  createdAt: Date
  updatedAt: Date
}

interface DriverDocumentsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  driver: Driver
}

const DOCUMENT_TYPES = [
  { value: 'LICENSE', label: 'Licencia de Conducción' },
  { value: 'MEDICAL_EXAM', label: 'Examen Médico' },
  { value: 'TRAINING', label: 'Certificado de Capacitación' },
  { value: 'CERTIFICATE', label: 'Certificado de Aptitud' },
  { value: 'SOAT', label: 'SOAT' },
  { value: 'TECHNICAL_REVIEW', label: 'Revisión Técnica' }
]

export function DriverDocumentsModal({
  isOpen,
  onClose,
  onSuccess,
  driver
}: DriverDocumentsModalProps) {
  const [documents, setDocuments] = useState<DriverDocument[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isAddingDocument, setIsAddingDocument] = useState(false)
  const [newDocument, setNewDocument] = useState({
    documentType: '',
    documentNumber: '',
    issueDate: '',
    expirationDate: '',
    fileUrl: ''
  })

  useEffect(() => {
    if (isOpen) {
      setDocuments(driver.documents)
    }
  }, [isOpen, driver.documents])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewDocument(prev => ({ ...prev, [name]: value }))
  }

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/driver-documents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          driverId: driver.id,
          ...newDocument
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al agregar el documento')
      }

      const addedDocument = await response.json()
      setDocuments(prev => [...prev, addedDocument])
      setNewDocument({
        documentType: '',
        documentNumber: '',
        issueDate: '',
        expirationDate: '',
        fileUrl: ''
      })
      setIsAddingDocument(false)
      setSuccess('Documento agregado exitosamente')

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al agregar el documento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch(`/api/driver-documents/${documentId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar el documento')
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId))
      setSuccess('Documento eliminado exitosamente')

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al eliminar el documento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setError('')
      setSuccess('')
      setIsAddingDocument(false)
      setNewDocument({
        documentType: '',
        documentNumber: '',
        issueDate: '',
        expirationDate: '',
        fileUrl: ''
      })
      onClose()
    }
  }

  // Función para formatear fechas
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para verificar si un documento está próximo a vencer
  const isExpiringSoon = (expirationDate: Date) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    const expDate = new Date(expirationDate)
    return expDate <= thirtyDaysFromNow && expDate > today
  }

  // Función para verificar si un documento está vencido
  const isExpired = (expirationDate: Date) => {
    const today = new Date()
    const expDate = new Date(expirationDate)
    return expDate < today
  }

  // Función para obtener el color del badge según el estado del documento
  const getDocumentStatusColor = (expirationDate: Date) => {
    if (isExpired(expirationDate)) {
      return 'bg-red-100 text-red-800 border-red-300'
    } else if (isExpiringSoon(expirationDate)) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    } else {
      return 'bg-green-100 text-green-800 border-green-300'
    }
  }

  // Función para obtener el texto del estado del documento
  const getDocumentStatusText = (expirationDate: Date) => {
    if (isExpired(expirationDate)) {
      return 'Vencido'
    } else if (isExpiringSoon(expirationDate)) {
      return 'Por Vencer'
    } else {
      return 'Vigente'
    }
  }

  if (!isOpen) return null

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <Card 
        className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>Documentos de {driver.name}</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Información del conductor */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{driver.name}</h3>
                <p className="text-sm text-gray-600">Cédula: {driver.identification}</p>
              </div>
            </div>
          </div>

          {/* Botón para agregar documento */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              Documentos ({documents.filter(d => d.isActive).length})
            </h3>
            <Button
              onClick={() => setIsAddingDocument(true)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Agregar Documento
            </Button>
          </div>

          {/* Formulario para agregar documento */}
          {isAddingDocument && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-900">Nuevo Documento</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddDocument} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Tipo de Documento *</Label>
                      <select
                        id="documentType"
                        name="documentType"
                        value={newDocument.documentType}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Seleccione un tipo</option>
                        {DOCUMENT_TYPES.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentNumber">Número de Documento *</Label>
                      <Input
                        id="documentNumber"
                        name="documentNumber"
                        type="text"
                        value={newDocument.documentNumber}
                        onChange={handleInputChange}
                        placeholder="Número del documento"
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="issueDate">Fecha de Emisión *</Label>
                      <Input
                        id="issueDate"
                        name="issueDate"
                        type="date"
                        value={newDocument.issueDate}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expirationDate">Fecha de Vencimiento *</Label>
                      <Input
                        id="expirationDate"
                        name="expirationDate"
                        type="date"
                        value={newDocument.expirationDate}
                        onChange={handleInputChange}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fileUrl">URL del Archivo (Opcional)</Label>
                    <Input
                      id="fileUrl"
                      name="fileUrl"
                      type="url"
                      value={newDocument.fileUrl}
                      onChange={handleInputChange}
                      placeholder="https://ejemplo.com/documento.pdf"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingDocument(false)}
                      disabled={isLoading}
                    >
                      Cancelar
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading || !newDocument.documentType || !newDocument.documentNumber || !newDocument.issueDate || !newDocument.expirationDate}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? 'Agregando...' : 'Agregar Documento'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Lista de documentos */}
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay documentos
              </h3>
              <p className="text-gray-600 mb-4">
                Agrega documentos del conductor para mantener un registro actualizado
              </p>
              <Button
                onClick={() => setIsAddingDocument(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Primer Documento
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium text-gray-900">
                          {DOCUMENT_TYPES.find(t => t.value === document.documentType)?.label || document.documentType}
                        </h4>
                        <Badge className={getDocumentStatusColor(document.expirationDate)}>
                          {getDocumentStatusText(document.expirationDate)}
                        </Badge>
                        {!document.isActive && (
                          <Badge variant="outline" className="border-gray-300 text-gray-600">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div className="space-y-1">
                          <p><span className="font-medium">Número:</span> {document.documentNumber}</p>
                          <p><span className="font-medium">Emisión:</span> {formatDate(document.issueDate)}</p>
                        </div>
                        <div className="space-y-1">
                          <p><span className="font-medium">Vencimiento:</span> {formatDate(document.expirationDate)}</p>
                          {document.fileUrl && (
                            <p>
                              <span className="font-medium">Archivo:</span>{' '}
                              <a 
                                href={document.fileUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline"
                              >
                                Ver documento
                              </a>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteDocument(document.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Información sobre documentos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900">Información sobre Documentos</h4>
                <div className="text-sm text-blue-800 mt-1 space-y-1">
                  <p>• Los documentos vencidos aparecen en rojo y requieren renovación inmediata</p>
                  <p>• Los documentos próximos a vencer (30 días) aparecen en amarillo</p>
                  <p>• Los documentos vigentes aparecen en verde</p>
                  <p>• Mantén actualizada la documentación para evitar problemas operacionales</p>
                </div>
              </div>
            </div>
          </div>

          {/* Mensajes de estado */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="text-green-800">{success}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <Button
              onClick={handleClose}
              disabled={isLoading}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Cerrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
