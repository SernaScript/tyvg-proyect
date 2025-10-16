"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Search,
  Plus,
  Filter,
  User,
  Calendar,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Truck,
  Phone,
  Mail,
  IdCard
} from "lucide-react"
import { CreateDriverModal } from "@/components/modals/CreateDriverModal"
import { EditDriverModal } from "@/components/modals/EditDriverModal"
import { DriverDocumentsModal } from "@/components/modals/DriverDocumentsModal"

// Interface para los datos de conductores
interface Driver {
  id: string
  name: string
  identification: string
  license: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string
    email: string
  }
  documents: DriverDocument[]
  trips?: Trip[]
  advances?: Advance[]
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

interface Trip {
  id: string
  status: string
  scheduledDate?: Date
  tripRequest: {
    id: string
    project: {
      name: string
    }
  }
}

interface Advance {
  id: string
  amount: number
  status: string
  period: string
}

export default function DriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateDriverModalOpen, setIsCreateDriverModalOpen] = useState(false)
  const [isEditDriverModalOpen, setIsEditDriverModalOpen] = useState(false)
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)

  // Función para cargar conductores
  const fetchDrivers = async () => {
    try {
      const response = await fetch('/api/drivers')
      if (response.ok) {
        const data = await response.json()
        setDrivers(data)
      }
    } catch (error) {
      console.error('Error fetching drivers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDrivers()
  }, [])

  // Prevenir focus automático en elementos
  useEffect(() => {
    // Remover focus de cualquier elemento que pueda tenerlo
    if (document.activeElement && document.activeElement !== document.body) {
      (document.activeElement as HTMLElement).blur()
    }

    // Agregar manejador para prevenir focus no deseado
    const handleFocus = (e: FocusEvent) => {
      const target = e.target as HTMLElement
      // Solo permitir focus en elementos de entrada explícitos
      if (!target.matches('input, textarea, select, button, [tabindex]')) {
        target.blur()
      }
    }

    document.addEventListener('focusin', handleFocus)
    
    return () => {
      document.removeEventListener('focusin', handleFocus)
    }
  }, [])

  // Filtrar conductores
  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = 
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.identification.includes(searchTerm) ||
      driver.license.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !selectedStatus || (selectedStatus === 'active' ? driver.isActive : !driver.isActive)
    const matchesActive = showInactive || driver.isActive
    
    return matchesSearch && matchesStatus && matchesActive
  })

  // Función para manejar la creación exitosa de un conductor
  const handleDriverCreated = () => {
    fetchDrivers()
  }

  // Función para abrir modal de documentos
  const handleOpenDocuments = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsDocumentsModalOpen(true)
  }

  // Función para abrir modal de edición
  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver)
    setIsEditDriverModalOpen(true)
  }

  // Función para formatear fechas
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para obtener el color del badge según el estado
  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
  }

  // Función para verificar documentos próximos a vencer
  const getExpiringDocuments = (documents: DriverDocument[]) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    
    return documents.filter(doc => {
      const expirationDate = new Date(doc.expirationDate)
      return expirationDate <= thirtyDaysFromNow && doc.isActive
    })
  }

  // Función para verificar documentos vencidos
  const getExpiredDocuments = (documents: DriverDocument[]) => {
    const today = new Date()
    
    return documents.filter(doc => {
      const expirationDate = new Date(doc.expirationDate)
      return expirationDate < today && doc.isActive
    })
  }

  // Estadísticas
  const stats = {
    total: drivers.length,
    active: drivers.filter(d => d.isActive).length,
    inactive: drivers.filter(d => !d.isActive).length,
    withExpiringDocs: drivers.filter(d => getExpiringDocuments(d.documents).length > 0).length,
    withExpiredDocs: drivers.filter(d => getExpiredDocuments(d.documents).length > 0).length
  }

  return (
    <AreaLayout areaId="logistics" moduleId="drivers">
      <div 
        className="space-y-6"
        onTouchStart={(e) => {
          // Prevenir que elementos no deseados activen el teclado virtual
          const target = e.target as HTMLElement
          if (!target.matches('input, textarea, select')) {
            e.preventDefault()
          }
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Conductores</h1>
            <p className="text-gray-600 mt-1">
              Gestión de conductores y documentación vehicular
            </p>
          </div>
          <Button
            onClick={() => setIsCreateDriverModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Conductor
          </Button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Inactivos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-gray-600">Docs. por Vencer</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.withExpiringDocs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="text-sm text-gray-600">Docs. Vencidos</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.withExpiredDocs}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">Buscar</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, cédula, licencia, email..."
                    className="pl-10"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="status" className="text-sm font-medium">Estado</label>
                <select
                  id="status"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mostrar Inactivos</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="showInactive"
                    checked={showInactive}
                    onChange={(e) => setShowInactive(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="showInactive" className="text-sm text-gray-700">
                    Incluir conductores inactivos
                  </label>
                </div>
              </div>

              <div className="flex items-end">
                <Button 
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedStatus('')
                    setShowInactive(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Limpiar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de conductores */}
        <Card>
          <CardHeader>
            <CardTitle>
              Conductores ({filteredDrivers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay conductores
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm || selectedStatus
                    ? 'No se encontraron conductores con los filtros aplicados'
                    : 'Comienza agregando tu primer conductor'
                  }
                </p>
                {!searchTerm && !selectedStatus && (
                  <Button
                    onClick={() => setIsCreateDriverModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Primer Conductor
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDrivers.map((driver) => {
                  const expiringDocs = getExpiringDocuments(driver.documents)
                  const expiredDocs = getExpiredDocuments(driver.documents)
                  
                  return (
                    <div key={driver.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg text-gray-900">
                              {driver.name}
                            </h3>
                            <Badge className={getStatusColor(driver.isActive)}>
                              {driver.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                            {expiredDocs.length > 0 && (
                              <Badge className="bg-red-100 text-red-800">
                                {expiredDocs.length} Doc(s) Vencido(s)
                              </Badge>
                            )}
                            {expiringDocs.length > 0 && expiredDocs.length === 0 && (
                              <Badge className="bg-yellow-100 text-yellow-800">
                                {expiringDocs.length} Doc(s) por Vencer
                              </Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <IdCard className="h-3 w-3" />
                                <span className="font-medium">Cédula:</span>
                                <span>{driver.identification}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                <span className="font-medium">Licencia:</span>
                                <span>{driver.license}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span className="font-medium">Usuario:</span>
                                <span className="truncate">{driver.user.name}</span>
                              </div>
                            </div>
                            
                            <div className="space-y-1">
                              {driver.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span className="font-medium">Teléfono:</span>
                                  <span>{driver.phone}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                <span className="font-medium">Email:</span>
                                <span className="truncate">{driver.user.email}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                <span className="font-medium">Registrado:</span>
                                <span>{formatDate(driver.createdAt)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {driver.documents.filter(d => d.isActive).length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-700 mb-2">Documentos ({driver.documents.filter(d => d.isActive).length} activos):</p>
                              <div className="flex flex-wrap gap-2">
                                {driver.documents.filter(d => d.isActive).map((doc) => {
                                  const isExpired = new Date(doc.expirationDate) < new Date()
                                  const isExpiring = new Date(doc.expirationDate) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                                  
                                  return (
                                    <Badge 
                                      key={doc.id} 
                                      variant="outline" 
                                      className={`text-xs ${
                                        isExpired ? 'border-red-300 text-red-700' :
                                        isExpiring ? 'border-yellow-300 text-yellow-700' :
                                        'border-green-300 text-green-700'
                                      }`}
                                    >
                                      {doc.documentType} - {formatDate(doc.expirationDate)}
                                    </Badge>
                                  )
                                })}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-3">
                            <span>Creado: {formatDate(driver.createdAt)}</span>
                            <span>Actualizado: {formatDate(driver.updatedAt)}</span>
                            {driver.trips && driver.trips.length > 0 && (
                              <span>• {driver.trips.length} viaje(s) asignado(s)</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2 flex-shrink-0 ml-4">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenDocuments(driver)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Documentos
                          </Button>
                          <Button size="sm" variant="outline">
                            Ver Detalles
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleEditDriver(driver)}
                          >
                            Editar
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <CreateDriverModal
          isOpen={isCreateDriverModalOpen}
          onClose={() => setIsCreateDriverModalOpen(false)}
          onSuccess={handleDriverCreated}
        />

        {selectedDriver && (
          <EditDriverModal
            isOpen={isEditDriverModalOpen}
            onClose={() => {
              setIsEditDriverModalOpen(false)
              setSelectedDriver(null)
            }}
            onSuccess={handleDriverCreated}
            driver={selectedDriver}
          />
        )}

        {selectedDriver && (
          <DriverDocumentsModal
            isOpen={isDocumentsModalOpen}
            onClose={() => {
              setIsDocumentsModalOpen(false)
              setSelectedDriver(null)
            }}
            onSuccess={handleDriverCreated}
            driver={selectedDriver}
          />
        )}
      </div>
    </AreaLayout>
  )
}
