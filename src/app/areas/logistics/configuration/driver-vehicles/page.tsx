"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Search,
  Plus,
  CheckCircle,
  XCircle,
  Edit,
  X,
  User,
  Truck,
  Calendar
} from "lucide-react"
import { AssignVehicleModal } from "@/components/modals/AssignVehicleModal"

interface DriverVehicle {
  id: string
  driverId: string
  vehicleId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  driver: {
    id: string
    name: string
    identification: string
    license: string
    isActive: boolean
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
    type: string
    isActive: boolean
    owner?: {
      id: string
      document: string
      firstName: string
      lastName: string
    }
  }
}

export default function DriverVehiclesPage() {
  const [assignments, setAssignments] = useState<DriverVehicle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<'active' | 'inactive' | 'all'>('active')
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const fetchAssignments = async (filterActive?: boolean | null) => {
    try {
      setIsLoading(true)
      let url = '/api/driver-vehicles'
      
      // Agregar parámetro de filtro solo si se especifica
      if (filterActive !== null && filterActive !== undefined) {
        url += `?active=${filterActive}`
      }
      
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        setAssignments(data)
      }
    } catch (error) {
      console.error('Error fetching assignments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Determinar el filtro según el tab activo
    let filterActive: boolean | null = null
    if (activeTab === 'active') {
      filterActive = true
    } else if (activeTab === 'inactive') {
      filterActive = false
    } else {
      filterActive = null // 'all' - no filtrar
    }
    
    fetchAssignments(filterActive)
  }, [activeTab])

  // Filtrar solo por búsqueda, el filtro de estado se hace en la API
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = 
      assignment.driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.driver.identification.includes(searchTerm) ||
      assignment.vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${assignment.vehicle.brand} ${assignment.vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesSearch
  })

  // Contadores: necesitamos obtener todos para mostrar los contadores
  const [allAssignments, setAllAssignments] = useState<DriverVehicle[]>([])
  
  useEffect(() => {
    // Obtener todas las asignaciones para los contadores
    const fetchAllForCounters = async () => {
      try {
        const response = await fetch('/api/driver-vehicles')
        if (response.ok) {
          const data = await response.json()
          setAllAssignments(data)
        }
      } catch (error) {
        console.error('Error fetching all assignments:', error)
      }
    }
    fetchAllForCounters()
  }, [])

  const activeAssignments = allAssignments.filter(a => a.isActive)
  const inactiveAssignments = allAssignments.filter(a => !a.isActive)

  const updateCounters = async () => {
    try {
      const response = await fetch('/api/driver-vehicles')
      if (response.ok) {
        const data = await response.json()
        setAllAssignments(data)
      }
    } catch (error) {
      console.error('Error updating counters:', error)
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!confirm('¿Estás seguro de inactivar esta asignación?')) {
      return
    }

    try {
      const response = await fetch(`/api/driver-vehicles/${assignmentId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        // Determinar el filtro según el tab activo
        let filterActive: boolean | null = null
        if (activeTab === 'active') {
          filterActive = true
        } else if (activeTab === 'inactive') {
          filterActive = false
        }
        fetchAssignments(filterActive)
        updateCounters()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al inactivar la asignación')
      }
    } catch (error) {
      console.error('Error inactivating assignment:', error)
      alert('Error al inactivar la asignación')
    }
  }

  const handleReactivate = async (assignmentId: string) => {
    try {
      const response = await fetch(`/api/driver-vehicles/${assignmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: true
        })
      })

      if (response.ok) {
        // Determinar el filtro según el tab activo
        let filterActive: boolean | null = null
        if (activeTab === 'active') {
          filterActive = true
        } else if (activeTab === 'inactive') {
          filterActive = false
        }
        fetchAssignments(filterActive)
        updateCounters()
      } else {
        const error = await response.json()
        alert(error.error || 'Error al reactivar la asignación')
      }
    } catch (error) {
      console.error('Error reactivating assignment:', error)
      alert('Error al reactivar la asignación')
    }
  }

  return (
    <AreaLayout areaId="logistics" moduleId="driver-vehicles">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Asignación de Vehículos</h1>
            <p className="text-gray-600 mt-1">
              Gestiona la relación entre conductores y vehículos
            </p>
          </div>
          <Button
            onClick={() => setIsAssignModalOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Asignar Vehículo
          </Button>
        </div>

        {/* Filtros y Búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Asignaciones</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por conductor, vehículo o placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Tabs para Activas/Inactivas */}
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'inactive' | 'all')} className="mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-3">
                <TabsTrigger value="active" className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Activas
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {activeAssignments.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="inactive" className="flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Inactivas
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {inactiveAssignments.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="all" className="flex items-center gap-2">
                  Todas
                  <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                    {assignments.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-4">
                {/* Lista de Asignaciones */}
                {isLoading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-500">Cargando asignaciones...</p>
                  </div>
                ) : filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                      <Truck className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-lg">No se encontraron asignaciones</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {searchTerm ? 'Intenta con otros términos de búsqueda' : 
                       activeTab === 'active' ? 'No hay asignaciones activas' :
                       activeTab === 'inactive' ? 'No hay asignaciones inactivas' :
                       'Comienza asignando un vehículo a un conductor'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredAssignments.map((assignment) => (
                      <Card 
                        key={assignment.id}
                        className={`transition-all duration-200 hover:shadow-md border-l-4 ${
                          assignment.isActive 
                            ? 'border-l-green-500 hover:border-l-green-600' 
                            : 'border-l-gray-400 hover:border-l-gray-500 opacity-75'
                        }`}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            {/* Información Principal */}
                            <div className="flex items-center gap-4 flex-1">
                              {/* Conductor */}
                              <div className="flex items-center gap-2 min-w-[180px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  assignment.isActive ? 'bg-blue-100' : 'bg-gray-100'
                                }`}>
                                  <User className={`h-4 w-4 ${assignment.isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <div className={`font-medium text-sm ${assignment.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {assignment.driver.name}
                                  </div>
                                </div>
                              </div>

                              {/* Separador */}
                              <div className="w-px h-8 bg-gray-200"></div>

                              {/* Placa */}
                              <div className="flex items-center gap-2 min-w-[120px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  assignment.isActive ? 'bg-orange-100' : 'bg-gray-100'
                                }`}>
                                  <Truck className={`h-4 w-4 ${assignment.isActive ? 'text-orange-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <Badge className={`text-sm font-semibold px-2 py-0.5 ${
                                    assignment.isActive 
                                      ? 'bg-gray-100 text-gray-900' 
                                      : 'bg-gray-50 text-gray-500'
                                  }`}>
                                    {assignment.vehicle.plate}
                                  </Badge>
                                </div>
                              </div>

                              {/* Separador */}
                              <div className="w-px h-8 bg-gray-200"></div>

                              {/* Estado */}
                              <div className="flex items-center min-w-[100px]">
                                {assignment.isActive ? (
                                  <Badge className="bg-green-500 text-white px-2 py-1 text-xs font-medium">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Activa
                                  </Badge>
                                ) : (
                                  <Badge variant="outline" className="px-2 py-1 text-xs font-medium border-gray-300 text-gray-600">
                                    <XCircle className="h-3 w-3 mr-1" />
                                    Inactiva
                                  </Badge>
                                )}
                              </div>

                              {/* Separador */}
                              <div className="w-px h-8 bg-gray-200"></div>

                              {/* Fecha */}
                              <div className="flex items-center gap-2 min-w-[130px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  assignment.isActive ? 'bg-purple-100' : 'bg-gray-100'
                                }`}>
                                  <Calendar className={`h-4 w-4 ${assignment.isActive ? 'text-purple-600' : 'text-gray-400'}`} />
                                </div>
                                <div>
                                  <div className={`font-medium text-sm ${assignment.isActive ? 'text-gray-900' : 'text-gray-500'}`}>
                                    {new Date(assignment.createdAt).toLocaleDateString('es-ES', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Acciones */}
                            <div className="flex items-center gap-2 ml-4">
                              {assignment.isActive ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleUnassign(assignment.id)}
                                  className="text-red-600 hover:text-white hover:bg-red-600 transition-colors h-8 px-3"
                                  title="Inactivar"
                                >
                                  <X className="h-3.5 w-3.5 mr-1.5" />
                                  Inactivar
                                </Button>
                              ) : (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReactivate(assignment.id)}
                                  className="text-green-600 hover:text-white hover:bg-green-600 transition-colors h-8 px-3"
                                  title="Reactivar"
                                >
                                  <Edit className="h-3.5 w-3.5 mr-1.5" />
                                  Reactivar
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Asignación */}
      <AssignVehicleModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        onSuccess={() => {
          // Determinar el filtro según el tab activo
          let filterActive: boolean | null = null
          if (activeTab === 'active') {
            filterActive = true
          } else if (activeTab === 'inactive') {
            filterActive = false
          }
          fetchAssignments(filterActive)
          updateCounters()
        }}
      />
    </AreaLayout>
  )
}

