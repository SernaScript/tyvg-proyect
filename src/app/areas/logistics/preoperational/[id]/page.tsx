"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ClipboardList, 
  ArrowLeft,
  FileText,
  Calendar,
  User,
  Truck,
  Gauge
} from "lucide-react"

interface PreoperationalInspection {
  id: string
  inspectionDate: Date
  driverId: string
  vehicleId: string
  initialMileage?: number | null
  finalMileage?: number | null
  createdAt: Date
  updatedAt: Date
  driver: {
    id: string
    name: string
    identification: string
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
  }
  details: Array<{
    id: string
    itemId: number
    passed: boolean
    observations?: string | null
    photoUrl?: string | null
    item: {
      id: number
      name: string
    }
  }>
}

export default function PreoperationalInspectionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const inspectionId = params.id as string

  const [inspection, setInspection] = useState<PreoperationalInspection | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (inspectionId) {
      fetchInspection()
    }
  }, [inspectionId])

  const fetchInspection = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`/api/preoperational-inspections/${inspectionId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('Inspección no encontrada')
        } else {
          setError('Error al cargar la inspección')
        }
        return
      }

      const data = await response.json()
      setInspection(data)
    } catch (err) {
      console.error('Error fetching inspection:', err)
      setError('Error de conexión con la API')
    } finally {
      setIsLoading(false)
    }
  }

  // Función para formatear fecha en formato dd-mm-yy
  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}-${month}-${year}`
  }

  // Calcular recorrido
  const calculateDistance = (): number | null => {
    if (inspection && inspection.initialMileage !== null && inspection.finalMileage !== null) {
      return inspection.finalMileage - inspection.initialMileage
    }
    return null
  }

  if (isLoading) {
    return (
      <AreaLayout areaId="logistics" moduleId="preoperational">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando inspección...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  if (error || !inspection) {
    return (
      <AreaLayout areaId="logistics" moduleId="preoperational">
        <div className="space-y-6">
          <Button
            variant="outline"
            onClick={() => router.push('/areas/logistics/preoperational')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">{error || 'Inspección no encontrada'}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AreaLayout>
    )
  }

  const distance = calculateDistance()

  return (
    <AreaLayout areaId="logistics" moduleId="preoperational">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => router.push('/areas/logistics/preoperational')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Detalles de Inspección Preoperacional
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Inspección realizada el {formatDate(inspection.inspectionDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Información General */}
        <Card>
          <CardHeader>
            <CardTitle>Información General</CardTitle>
            <CardDescription>Datos básicos de la inspección</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm font-medium">Fecha</span>
                </div>
                <p className="text-lg font-semibold">{formatDate(inspection.inspectionDate)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Conductor</span>
                </div>
                <p className="text-lg font-semibold">{inspection.driver.name}</p>
                <p className="text-sm text-gray-500">{inspection.driver.identification}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Truck className="h-4 w-4" />
                  <span className="text-sm font-medium">Vehículo</span>
                </div>
                <p className="text-lg font-semibold">{inspection.vehicle.plate}</p>
                <p className="text-sm text-gray-500">{inspection.vehicle.brand} {inspection.vehicle.model}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Gauge className="h-4 w-4" />
                  <span className="text-sm font-medium">Kilometraje</span>
                </div>
                {inspection.initialMileage !== null && inspection.finalMileage !== null ? (
                  <>
                    <p className="text-lg font-semibold">
                      {inspection.initialMileage.toLocaleString()} - {inspection.finalMileage.toLocaleString()}
                    </p>
                    {distance !== null && (
                      <p className="text-sm text-gray-500">Recorrido: {distance.toLocaleString()} km</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-semibold text-gray-400">No registrado</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Items Evaluados
            </CardTitle>
            <CardDescription>Detalle de cada item evaluado en la inspección</CardDescription>
          </CardHeader>
          <CardContent>
            {inspection.details && inspection.details.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-center">Aprobado</TableHead>
                      <TableHead className="text-center">Denegado</TableHead>
                      <TableHead>Observaciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {inspection.details.map((detail) => (
                      <TableRow key={detail.id}>
                        <TableCell className="font-medium">
                          {detail.item.name}
                        </TableCell>
                        <TableCell className="text-center">
                          {detail.passed ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                              Sí
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {!detail.passed ? (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                              Sí
                            </Badge>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {detail.observations ? (
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {detail.observations}
                            </p>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No hay items evaluados en esta inspección
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}

