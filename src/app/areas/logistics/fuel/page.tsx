"use client"

import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Fuel, 
  Download, 
  Upload, 
  FileSpreadsheet, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Car,
  DollarSign,
  Calendar
} from "lucide-react"

// Datos vanilla para demostración
const mockFuelData = [
  {
    id: 1,
    vehicle: "Camión-001",
    driver: "Juan Pérez",
    date: "2024-01-15",
    fuelType: "Diesel",
    quantity: 45.5,
    cost: 125.50,
    station: "Estación Central",
    odometer: 125000
  },
  {
    id: 2,
    vehicle: "Camión-002", 
    driver: "María García",
    date: "2024-01-15",
    fuelType: "Diesel",
    quantity: 38.2,
    cost: 105.20,
    station: "Estación Norte",
    odometer: 98000
  },
  {
    id: 3,
    vehicle: "Van-003",
    driver: "Carlos López",
    date: "2024-01-14",
    fuelType: "Gasolina",
    quantity: 25.0,
    cost: 87.50,
    station: "Estación Sur",
    odometer: 75000
  }
]

export default function FuelPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')

  // Función para descargar plantilla Excel
  const downloadTemplate = () => {
    // Crear datos de plantilla
    const templateData = [
      ['Vehículo', 'Conductor', 'Fecha', 'Tipo de Combustible', 'Cantidad (L)', 'Costo ($)', 'Estación', 'Odómetro'],
      ['Camión-001', 'Juan Pérez', '2024-01-15', 'Diesel', '45.5', '125.50', 'Estación Central', '125000'],
      ['Camión-002', 'María García', '2024-01-15', 'Diesel', '38.2', '105.20', 'Estación Norte', '98000']
    ]

    // Convertir a CSV (simulando Excel)
    const csvContent = templateData.map(row => row.join(',')).join('\n')
    
    // Crear y descargar archivo
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', 'plantilla_combustible.csv')
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

  // Calcular estadísticas
  const totalFuel = mockFuelData.reduce((sum, record) => sum + record.quantity, 0)
  const totalCost = mockFuelData.reduce((sum, record) => sum + record.cost, 0)
  const averageCost = totalCost / mockFuelData.length

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Header */}
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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Combustible
              </CardTitle>
              <Fuel className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalFuel.toFixed(1)} L</div>
              <p className="text-xs text-muted-foreground">
                Este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Costo Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Gastos en combustible
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Costo Promedio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${averageCost.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                Por recarga
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Vehículos Activos
              </CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockFuelData.length}</div>
              <p className="text-xs text-muted-foreground">
                Con registros recientes
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
              Descarga plantillas y importa datos de combustible desde archivos Excel
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
                    Obtén la plantilla en formato Excel para cargar datos de combustible
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
                  <h3 className="font-semibold">Importar Datos</h3>
                  <p className="text-sm text-muted-foreground">
                    Carga un archivo Excel con los datos de combustible
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
                      Archivo procesado exitosamente
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

        {/* Registros Recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
            <CardDescription>
              Últimos registros de combustible cargados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockFuelData.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <Car className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="font-medium">{record.vehicle}</p>
                      <p className="text-sm text-muted-foreground">
                        {record.driver} • {record.fuelType}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{record.quantity}L</p>
                    <p className="text-sm text-muted-foreground">${record.cost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{record.date}</p>
                    <p className="text-xs text-muted-foreground">{record.station}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
