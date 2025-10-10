"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Users, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Building2,
  Phone,
  Mail,
  MapPin,
  Activity,
  Eye,
  EyeOff
} from "lucide-react"
import { CreateClientModal } from "@/components/modals/CreateClientModal"

// Interface para los datos de clientes
interface Client {
  id: string
  identification: string
  name: string
  address?: string
  email?: string
  phone?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
  projects?: Project[]
}

interface Project {
  id: string
  name: string
  isActive: boolean
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showInactive, setShowInactive] = useState(true)
  const [isCreateClientModalOpen, setIsCreateClientModalOpen] = useState(false)

  // Función para cargar clientes
  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const data = await response.json()
        setClients(data)
      }
    } catch (error) {
      console.error('Error fetching clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Cargar datos al montar el componente
  useEffect(() => {
    fetchClients()
  }, [])

  // Filtrar clientes
  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.identification.includes(searchTerm) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesActive = showInactive || client.isActive
    
    return matchesSearch && matchesActive
  })

  // Función para manejar la creación exitosa de un cliente
  const handleClientCreated = () => {
    fetchClients()
  }

  // Función para formatear fecha
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <AreaLayout areaId="logistics" moduleId="clients">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestión de Clientes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administra todos los clientes del sistema de logística
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <CardHeader>
            <CardTitle>Filtros y Búsqueda</CardTitle>
            <CardDescription>
              Buscar y filtrar clientes por diferentes criterios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="search">Buscar cliente</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nombre, identificación o email..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowInactive(!showInactive)}
                  className="w-full"
                >
                  {showInactive ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar Inactivos
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar Inactivos
                    </>
                  )}
                </Button>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={() => setIsCreateClientModalOpen(true)}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Cliente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">{clients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Activity className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Activos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.isActive).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building2 className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Con Proyectos</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {clients.filter(c => c.projects && c.projects.length > 0).length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Search className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Resultados</p>
                  <p className="text-2xl font-bold text-gray-900">{filteredClients.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabla de clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes del Sistema</CardTitle>
            <CardDescription>
              {filteredClients.length} clientes encontrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando clientes...</p>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron clientes</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      <div className="p-2 rounded-lg bg-blue-100 flex-shrink-0">
                        <Building2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium truncate">{client.name}</p>
                          <Badge 
                            variant="outline" 
                            className={`${client.isActive ? 'bg-green-100 text-green-800 border-green-300' : 'bg-red-100 text-red-800 border-red-300'} hidden sm:inline-flex`}
                          >
                            {client.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>ID: {client.identification}</span>
                          {client.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              <span className="truncate">{client.email}</span>
                            </div>
                          )}
                          {client.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{client.phone}</span>
                            </div>
                          )}
                        </div>
                        {client.address && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{client.address}</span>
                          </div>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Creado: {formatDate(client.createdAt)}
                          {client.projects && client.projects.length > 0 && (
                            <span className="ml-2">
                              • {client.projects.length} proyecto(s)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0 ml-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal de crear cliente */}
        <CreateClientModal
          isOpen={isCreateClientModalOpen}
          onClose={() => setIsCreateClientModalOpen(false)}
          onSuccess={handleClientCreated}
        />
      </div>
    </AreaLayout>
  )
}
