"use client"

import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Car, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  Wrench,
  Calendar,
  Fuel,
  Users,
  MapPin,
  Activity,
  Plus,
  Search
} from "lucide-react"

// Datos vanilla para demostración
const mockVehiclesData = [
  {
    id: 1,
    plate: "ABC-123",
    brand: "Toyota",
    model: "Hilux",
    year: 2022,
    type: "Camión",
    status: "Activo",
    driver: "Juan Pérez",
    location: "Almacén Central",
    odometer: 125000,
    fuelType: "Diesel",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-04-10"
  },
  {
    id: 2,
    plate: "DEF-456",
    brand: "Ford",
    model: "Transit",
    year: 2021,
    type: "Van",
    status: "En Mantenimiento",
    driver: "María García",
    location: "Taller",
    odometer: 98000,
    fuelType: "Diesel",
    lastMaintenance: "2024-01-15",
    nextMaintenance: "2024-04-15"
  },
  {
    id: 3,
    plate: "GHI-789",
    brand: "Chevrolet",
    model: "N300",
    year: 2023,
    type: "Camión",
    status: "Activo",
    driver: "Carlos López",
    location: "Sucursal Norte",
    odometer: 45000,
    fuelType: "Diesel",
    lastMaintenance: "2024-01-05",
    nextMaintenance: "2024-04-05"
  },
  {
    id: 4,
    plate: "JKL-012",
    brand: "Nissan",
    model: "NP300",
    year: 2020,
    type: "Pickup",
    status: "Inactivo",
    driver: "Ana Martínez",
    location: "Almacén Central",
    odometer: 150000,
    fuelType: "Gasolina",
    lastMaintenance: "2023-12-20",
    nextMaintenance: "2024-03-20"
  }
]

export default function VehiclesPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [searchTerm, setSearchTerm] = useState('')

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
  const filteredVehicles = mockVehiclesData.filter(vehicle =>
    vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.driver.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calcular estadísticas
  const totalVehicles = mockVehiclesData.length
  const activeVehicles = mockVehiclesData.filter(v => v.status === 'Activo').length
  const maintenanceVehicles = mockVehiclesData.filter(v => v.status === 'En Mantenimiento').length
  const totalOdometer = mockVehiclesData.reduce((sum, vehicle) => sum + vehicle.odometer, 0)
  const averageOdometer = totalOdometer / totalVehicles

  // Función para obtener el color del badge según el estado
  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'En Mantenimiento':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'Inactivo':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
            <Car className="h-6 w-6 text-orange-600" />
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
              <Car className="h-4 w-4 text-muted-foreground" />
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
                En Mantenimiento
              </CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{maintenanceVehicles}</div>
              <p className="text-xs text-muted-foreground">
                Requieren atención
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Odómetro Promedio
              </CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(averageOdometer).toLocaleString()} km</div>
              <p className="text-xs text-muted-foreground">
                Kilometraje promedio
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

        {/* Lista de Vehículos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Flota Vehicular</CardTitle>
                <CardDescription>
                  Lista completa de vehículos en el sistema
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar vehículo..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Vehículo
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Car className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{vehicle.plate}</p>
                        <Badge 
                          variant="outline" 
                          className={getStatusBadgeColor(vehicle.status)}
                        >
                          {vehicle.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vehicle.brand} {vehicle.model} ({vehicle.year}) • {vehicle.type}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{vehicle.driver}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {vehicle.location}
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-sm font-medium">{vehicle.odometer.toLocaleString()} km</p>
                    <p className="text-xs text-muted-foreground">{vehicle.fuelType}</p>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Último mantenimiento</p>
                    <p className="text-sm font-medium">{vehicle.lastMaintenance}</p>
                    <p className="text-xs text-muted-foreground">Próximo: {vehicle.nextMaintenance}</p>
                  </div>
                </div>
              ))}
              
              {filteredVehicles.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron vehículos que coincidan con la búsqueda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
