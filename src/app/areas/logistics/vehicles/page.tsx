"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Truck, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Users,
  Activity,
  Plus,
  Search,
  UserPlus,
  Building2
} from "lucide-react"
import { CreateOwnerModal } from "@/components/modals/CreateOwnerModal"
import { CreateVehicleModal } from "@/components/modals/CreateVehicleModal"

// Interfaces para los datos reales
interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  type: string
  status: string
  driver?: string
  isActive: boolean
  owner?: {
    id: string
    document: string
    firstName: string
    lastName: string
    isActive: boolean
  }
}

interface Owner {
  id: string
  document: string
  firstName: string
  lastName: string
  isActive: boolean
  vehicles: Vehicle[]
}

export default function VehiclesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'vehicles' | 'owners'>('vehicles')
  const [isCreateOwnerModalOpen, setIsCreateOwnerModalOpen] = useState(false)
  const [isCreateVehicleModalOpen, setIsCreateVehicleModalOpen] = useState(false)
  
  // Estados para datos reales
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [owners, setOwners] = useState<Owner[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Función para cargar vehículos
  const fetchVehicles = async () => {
    try {
      const response = await fetch('/api/vehicles')
      if (response.ok) {
        const data = await response.json()
        setVehicles(data)
      }
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  // Función para cargar propietarios
  const fetchOwners = async () => {
    try {
      const response = await fetch('/api/owners')
      if (response.ok) {
        const data = await response.json()
        setOwners(data)
      }
    } catch (error) {
      console.error('Error fetching owners:', error)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchVehicles(), fetchOwners()])
      setIsLoading(false)
    }
    loadData()
  }, [])

  // Función para descargar plantilla Excel
  const downloadTemplate = () => {
    // Crear datos de plantilla
    const templateData = [
      ['Placa', 'Marca', 'Modelo', 'Año', 'Tipo', 'Estado', 'Conductor', 'Ubicación', 'Odómetro', 'Tipo de Combustible', 'Último Mantenimiento', 'Próximo Mantenimiento'],
      ['ABC-123', 'Toyota', 'Hilux', '2022', 'Camión', 'Activo', 'Juan Pérez', 'Almacén Central', '125000', 'Diesel', '2024-01-10', '2024-04-10'],
      ['DEF-456', 'Ford', 'Transit', '2021', 'Van', 'En Mantenimiento', 'María García', 'Taller', '98000', 'Diesel', '2024-01-15', '2024-04-15']
    ]

    // Convertir a CSV (simulando Excel)
    const csvContent = templateData.map(row => row.join(',')).join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_vehiculos.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // Función para manejar la carga de archivo
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadStatus('idle')
    }
  }

  // Función para procesar el archivo cargado
  const processFile = async () => {
    if (!selectedFile) return

    setUploadStatus('uploading')
    
    // Simular procesamiento
    setTimeout(() => {
      setUploadStatus('success')
      setSelectedFile(null)
      // Resetear el input
      const fileInput = document.getElementById('file-upload') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    }, 2000)
  }

  // Filtrar vehículos por término de búsqueda
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (vehicle.driver && vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Filtrar propietarios por término de búsqueda
  const filteredOwners = owners.filter(owner =>
    `${owner.firstName} ${owner.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    owner.document.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular estadísticas
  const totalVehicles = vehicles.length
  const activeVehicles = vehicles.filter(v => v.status === 'active' && v.isActive).length
  const maintenanceVehicles = vehicles.filter(v => v.status === 'maintenance').length
  // Removed odometer calculations as field was deleted

  // Calcular estadísticas de propietarios
  const totalOwners = owners.length
  const activeOwners = owners.filter(o => o.isActive).length

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  // Función para obtener el texto del estado
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'maintenance':
        return 'En Mantenimiento'
      case 'inactive':
        return 'Inactivo'
      default:
        return status
    }
  }

  // Función para manejar el éxito de crear propietario
  const handleOwnerCreated = () => {
    fetchOwners()
  }

  // Función para manejar el éxito de crear vehículo
  const handleVehicleCreated = () => {
    fetchVehicles()
  }

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
            <Truck className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestión de Vehículos
            </h1>
            <p className="text-muted-foreground">
              Administración de flota vehicular y mantenimiento
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Vehículos
              </CardTitle>
              <Truck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVehicles}</div>
              <p className="text-xs text-muted-foreground">
                En la flota
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vehículos Activos
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Operativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Propietarios
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalOwners}</div>
              <p className="text-xs text-muted-foreground">
                Propietarios registrados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Propietarios Activos
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeOwners}</div>
              <p className="text-xs text-muted-foreground">
                Con vehículos activos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Módulo de Importación/Exportación */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Gestión de Datos
            </CardTitle>
            <CardDescription>
              Descarga plantillas y importa vehículos desde archivos Excel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Descarga de Plantilla */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Descargar Plantilla</h3>
                  <p className="text-sm text-muted-foreground">
                    Obtén la plantilla en formato Excel para cargar datos de vehículos
                  </p>
                </div>
              </div>
              <Button onClick={downloadTemplate} className="w-full md:w-auto">
                <Download className="h-4 w-4 mr-2" />
                Descargar Plantilla Excel
              </Button>
            </div>

            {/* Separador */}
            <div className="border-t"></div>

            {/* Carga de Archivo */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-green-600" />
                <div>
                  <h3 className="font-semibold">Importar Vehículos</h3>
                  <p className="text-sm text-muted-foreground">
                    Carga un archivo Excel con los datos de la flota vehicular
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label htmlFor="file-upload">Seleccionar archivo</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="mt-1"
                  />
                </div>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <FileSpreadsheet className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">{selectedFile.name}</span>
                    <Badge variant="outline" className="ml-auto">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </Badge>
                  </div>
                )}

                <Button 
                  onClick={processFile} 
                  disabled={!selectedFile || uploadStatus === 'uploading'}
                  className="w-full md:w-auto"
                >
                  {uploadStatus === 'uploading' ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Procesar Archivo
                    </>
                  )}
                </Button>

                {/* Estado de carga */}
                {uploadStatus === 'success' && (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-800">
                      Vehículos importados exitosamente
                    </span>
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
            </div>
          </CardContent>
        </Card>

        {/* Lista de Vehículos y Propietarios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Gestión de Flota</CardTitle>
                <CardDescription>
                  Administración de vehículos y propietarios
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={activeTab === 'vehicles' ? "Buscar vehículo..." : "Buscar propietario..."}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-48 sm:w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={activeTab === 'vehicles' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('vehicles')}
                    className="flex items-center"
                  >
                    <Truck className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Vehículos</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant={activeTab === 'owners' ? 'default' : 'outline'}
                    onClick={() => setActiveTab('owners')}
                    className="flex items-center"
                  >
                    <Users className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Propietarios</span>
                  </Button>
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    if (activeTab === 'vehicles') {
                      setIsCreateVehicleModalOpen(true)
                    } else {
                      setIsCreateOwnerModalOpen(true)
                    }
                  }}
                  className="flex items-center"
                >
                  {activeTab === 'vehicles' ? (
                    <>
                      <Plus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar Vehículo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Agregar Propietario</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
                <span className="ml-2 text-muted-foreground">Cargando datos...</span>
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === 'vehicles' ? (
                  <>
                    {filteredVehicles.map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-orange-100 flex-shrink-0">
                          <Truck className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{vehicle.plate}</p>
                            <Badge 
                              variant="outline" 
                              className={`${getStatusBadgeColor(vehicle.status)} hidden sm:inline-flex`}
                            >
                              {getStatusText(vehicle.status)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {vehicle.brand} {vehicle.model} • {vehicle.type}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right flex-shrink-0 ml-4">
                        
                        
                      </div>
                    </div>
                  ))}
                  
                  {filteredVehicles.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron vehículos que coincidan con la búsqueda</p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {filteredOwners.map((owner) => (
                    <div key={owner.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                          <Building2 className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-medium truncate">{owner.firstName} {owner.lastName}</p>
                            <Badge 
                              variant="outline" 
                              className={`${owner.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                            >
                              {owner.isActive ? 'Activo' : 'Inactivo'}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            Documento: {owner.document}
                          </p>
                        </div>
                      </div>
                      
                      
                    </div>
                  ))}
                  
                  {filteredOwners.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No se encontraron propietarios que coincidan con la búsqueda</p>
                    </div>
                  )}
                </>
              )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modales */}
        <CreateOwnerModal
          isOpen={isCreateOwnerModalOpen}
          onClose={() => setIsCreateOwnerModalOpen(false)}
          onSuccess={handleOwnerCreated}
        />

        <CreateVehicleModal
          isOpen={isCreateVehicleModalOpen}
          onClose={() => setIsCreateVehicleModalOpen(false)}
          onSuccess={handleVehicleCreated}
        />
      </div>
    </AreaLayout>
  )
}
