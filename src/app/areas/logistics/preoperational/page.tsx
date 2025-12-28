"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { 
  ClipboardList, 
  Plus, 
  Settings,
  X,
  Calendar,
  User,
  Truck,
  Eye
} from "lucide-react"
import { CreatePreoperationalInspectionModal } from "@/components/modals/CreatePreoperationalInspectionModal"
import { useAuth } from "@/contexts/AuthContext"
import { RoleName } from "@/types/auth"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Interface para las inspecciones preoperacionales
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

export default function PreoperationalPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [inspections, setInspections] = useState<PreoperationalInspection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Filtros
  const [dateFromFilter, setDateFromFilter] = useState<string>('')
  const [dateToFilter, setDateToFilter] = useState<string>('')
  const [selectedDriverId, setSelectedDriverId] = useState<string>('')
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>('')

  // Listas para selects
  const [drivers, setDrivers] = useState<Array<{ id: string; name: string; identification: string }>>([])
  const [vehicles, setVehicles] = useState<Array<{ id: string; plate: string; brand: string; model: string }>>([])

  // Verificar si el usuario es driver (puede crear inspecciones)
  const isDriver = user?.role?.name === RoleName.DRIVER

  // Cargar conductores y vehículos para los filtros
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await fetch('/api/drivers?active=true')
        if (response.ok) {
          const data = await response.json()
          setDrivers(data.filter((d: any) => d.isActive).map((d: any) => ({
            id: d.id,
            name: d.name,
            identification: d.identification
          })))
        }
      } catch (error) {
        console.error('Error fetching drivers:', error)
      }
    }

    const fetchVehicles = async () => {
      try {
        const response = await fetch('/api/vehicles?active=true')
        if (response.ok) {
          const data = await response.json()
          setVehicles(data.filter((v: any) => v.isActive).map((v: any) => ({
            id: v.id,
            plate: v.plate,
            brand: v.brand,
            model: v.model
          })))
        }
      } catch (error) {
        console.error('Error fetching vehicles:', error)
      }
    }

    fetchDrivers()
    fetchVehicles()
  }, [])

  // Función para cargar inspecciones
  const fetchInspections = async (page: number = 1) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', page.toString())
      params.append('limit', limit.toString())
      
      // Agregar filtros
      if (dateFromFilter) {
        params.append('dateFrom', dateFromFilter)
      }
      if (dateToFilter) {
        params.append('dateTo', dateToFilter)
      }
      if (selectedDriverId) {
        params.append('driverId', selectedDriverId)
      }
      if (selectedVehicleId) {
        params.append('vehicleId', selectedVehicleId)
      }
      
      const response = await fetch(`/api/preoperational-inspections?${params}`)
      if (response.ok) {
        const data = await response.json()
        setInspections(data.inspections || [])
        setTotalPages(data.pagination?.totalPages || 1)
        setTotal(data.pagination?.total || 0)
      }
    } catch (error) {
      console.error('Error fetching preoperational inspections:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente y cuando cambien los filtros o la página
  useEffect(() => {
    setCurrentPage(1) // Resetear a página 1 cuando cambien los filtros
  }, [dateFromFilter, dateToFilter, selectedDriverId, selectedVehicleId])

  useEffect(() => {
    fetchInspections(currentPage)
  }, [currentPage, dateFromFilter, dateToFilter, selectedDriverId, selectedVehicleId])

  // Limpiar filtros
  const clearFilters = () => {
    setDateFromFilter('')
    setDateToFilter('')
    setSelectedDriverId('')
    setSelectedVehicleId('')
  }

  // Función para formatear fecha en formato dd-mm-yy
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = String(d.getFullYear()).slice(-2)
    return `${day}-${month}-${year}`
  }

  // Calcular items aprobados vs rechazados
  const getInspectionStatus = (inspection: PreoperationalInspection) => {
    if (!inspection.details || inspection.details.length === 0) {
      return { passed: 0, failed: 0, total: 0 }
    }
    const passed = inspection.details.filter(d => d.passed).length
    const failed = inspection.details.filter(d => !d.passed).length
    return { passed, failed, total: inspection.details.length }
  }

  // Calcular recorrido (kilometraje final - kilometraje inicial)
  const calculateDistance = (inspection: PreoperationalInspection): number | null => {
    if (inspection.initialMileage !== null && inspection.finalMileage !== null) {
      return inspection.finalMileage - inspection.initialMileage
    }
    return null
  }

  return (
    <AreaLayout areaId="logistics" moduleId="preoperational">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
              <ClipboardList className="h-8 w-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Preoperacionales
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Inspecciones preoperacionales realizadas por los conductores
              </p>
            </div>
          </div>
          <Button
            onClick={() => router.push('/areas/logistics/preoperational/items')}
            variant="outline"
            className="bg-orange-50 hover:bg-orange-100 border-orange-200"
          >
            <Settings className="h-4 w-4 mr-2" />
            Gestionar Items
          </Button>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Filtros y Búsqueda</CardTitle>
                <CardDescription>
                  Buscar y filtrar inspecciones preoperacionales
                </CardDescription>
              </div>
              {(dateFromFilter || dateToFilter || selectedDriverId || selectedVehicleId) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                >
                  <X className="h-4 w-4 mr-2" />
                  Limpiar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isDriver && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Inspección
                  </Button>
                </div>
              )}

              {/* Panel de filtros */}
              <div className="pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Fecha Desde
                      </Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={dateFromFilter}
                        onChange={(e) => setDateFromFilter(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">
                        <Calendar className="h-4 w-4 inline mr-2" />
                        Fecha Hasta
                      </Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={dateToFilter}
                        onChange={(e) => setDateToFilter(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="driverId">
                        <User className="h-4 w-4 inline mr-2" />
                        Conductor
                      </Label>
                      <Select 
                        value={selectedDriverId || "all"} 
                        onValueChange={(value) => setSelectedDriverId(value === "all" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los conductores" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los conductores</SelectItem>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.id}>
                              {driver.name} - {driver.identification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vehicleId">
                        <Truck className="h-4 w-4 inline mr-2" />
                        Vehículo
                      </Label>
                      <Select 
                        value={selectedVehicleId || "all"} 
                        onValueChange={(value) => setSelectedVehicleId(value === "all" ? "" : value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todos los vehículos" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos los vehículos</SelectItem>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.plate} - {vehicle.brand} {vehicle.model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabla de inspecciones */}
        <Card>
          <CardHeader>
            <CardTitle>Inspecciones Preoperacionales</CardTitle>
            <CardDescription>
              {total} inspección(es) total(es) - Página {currentPage} de {totalPages}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando inspecciones...</p>
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-8">
                <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron inspecciones preoperacionales</p>
                {isDriver && (
                  <Button 
                    onClick={() => setIsCreateModalOpen(true)}
                    className="mt-4 bg-orange-600 hover:bg-orange-700"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Primera Inspección
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha</TableHead>
                        <TableHead>Placa</TableHead>
                        <TableHead>Conductor</TableHead>
                        <TableHead className="text-right">Km Inicial</TableHead>
                        <TableHead className="text-right">Km Final</TableHead>
                        <TableHead className="text-right">Recorrido</TableHead>
                        <TableHead className="text-right">Aprobados</TableHead>
                        <TableHead className="text-right">Denegados</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {inspections.map((inspection) => {
                        const status = getInspectionStatus(inspection)
                        const distance = calculateDistance(inspection)
                        return (
                          <TableRow key={inspection.id}>
                            <TableCell className="font-medium">
                              {formatDate(inspection.inspectionDate)}
                            </TableCell>
                            <TableCell>
                              {inspection.vehicle.plate}
                            </TableCell>
                            <TableCell>
                              {inspection.driver.name}
                            </TableCell>
                            <TableCell className="text-right">
                              {inspection.initialMileage !== null 
                                ? inspection.initialMileage.toLocaleString() 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {inspection.finalMileage !== null 
                                ? inspection.finalMileage.toLocaleString() 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              {distance !== null 
                                ? `${distance.toLocaleString()} km` 
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                {status.passed}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                {status.failed}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/areas/logistics/preoperational/${inspection.id}`)}
                                className="bg-blue-50 hover:bg-blue-100 border-blue-200"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Ver
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
                
                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-gray-600">
                      Mostrando página {currentPage} de {totalPages} ({total} total)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || isLoading}
                      >
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || isLoading}
                      >
                        Siguiente
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear inspección */}
        <CreatePreoperationalInspectionModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            fetchInspections(currentPage)
            setIsCreateModalOpen(false)
          }}
        />
      </div>
    </AreaLayout>
  )
}
