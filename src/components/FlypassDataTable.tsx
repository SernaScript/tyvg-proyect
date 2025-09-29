"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "./ui/table"
import { RefreshCw, ChevronLeft, ChevronRight, Database, Send, CheckCircle, XCircle } from "lucide-react"

interface FlypassData {
  id: string
  cufe: string
  status: string
  documentType: string
  creationDate: string | Date
  documentNumber: string
  relatedDocument?: string
  costCenter?: string
  licensePlate: string
  tollName: string
  vehicleCategory: string
  passageDate: string | Date
  transactionId: string
  subtotal: number
  tax?: number
  total: number
  tascode: string
  description: string
  companyNit: string
  createdAt: string | Date
  updatedAt: string | Date
  accounted: boolean
}

interface FlypassDataResponse {
  success: boolean
  data: FlypassData[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function FlypassDataTable() {
  const [data, setData] = useState<FlypassData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [migratingItems, setMigratingItems] = useState<Set<string>>(new Set())
  const [showOnlyPending, setShowOnlyPending] = useState(true) // Por defecto mostrar solo pendientes
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchData = async (page: number = 1) => {
    try {
      setLoading(true)
      setError(null)
      
      const pendingParam = showOnlyPending ? 'true' : 'false'
      const response = await fetch(`/api/flypass-data?page=${page}&limit=${pagination.limit}&pending=${pendingParam}`)
      const result: FlypassDataResponse = await response.json()
      
      if (result.success) {
        console.log('Datos recibidos:', result.data.slice(0, 2)) // Debug: mostrar primeros 2 registros
        setData(result.data)
        setPagination(result.pagination)
      } else {
        setError('Error al cargar los datos')
      }
    } catch (err) {
      setError('Error de conexión')
      console.error('Error fetching flypass data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [showOnlyPending]) // Recargar cuando cambie el filtro

  const formatDate = (dateInput: string | Date) => {
    // Si ya es un objeto Date, usarlo directamente; si es string, convertirlo
    const date = dateInput instanceof Date ? dateInput : new Date(dateInput)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string } } = {
      'Activo': { variant: 'default', label: 'Activo' },
      'Inactivo': { variant: 'secondary', label: 'Inactivo' },
      'Pendiente': { variant: 'outline', label: 'Pendiente' },
      'Procesado': { variant: 'default', label: 'Procesado' }
    }
    
    const config = statusMap[status] || { variant: 'outline' as const, label: status }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage)
    }
  }

  const handleMigrateToSiigo = async (recordId: string) => {
    setMigratingItems(prev => new Set(prev).add(recordId))
    
    try {
      const response = await fetch(`/api/flypass-data/siigo-migration/${recordId}`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Si estamos mostrando solo pendientes, recargar los datos para que desaparezca de la lista
        if (showOnlyPending) {
          fetchData(pagination.page)
        } else {
          // Si mostramos todos, actualizar el estado local
          setData(prevData => 
            prevData.map(item => 
              item.id === recordId 
                ? { ...item, accounted: true }
                : item
            )
          )
        }
        console.log('Migración exitosa:', result.data)
      } else {
        console.error('Error en migración:', result.error)
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      console.error('Error de conexión:', error)
      alert('Error de conexión al migrar')
    } finally {
      setMigratingItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(recordId)
        return newSet
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-500" />
            Datos de Flypass
          </CardTitle>
          <CardDescription>
            Cargando datos de la base de datos...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-red-500" />
            Datos de Flypass
          </CardTitle>
          <CardDescription>
            Error al cargar los datos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchData(pagination.page)} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-500" />
          Datos de Flypass
        </CardTitle>
        <CardDescription>
          {pagination.total} registros encontrados • Página {pagination.page} de {pagination.totalPages}
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Button
            variant={showOnlyPending ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyPending(true)}
          >
            Solo Pendientes
          </Button>
          <Button
            variant={!showOnlyPending ? "default" : "outline"}
            size="sm"
            onClick={() => setShowOnlyPending(false)}
          >
            Todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controles de paginación superior */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <span className="text-sm text-muted-foreground">
              Mostrando {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total}
            </span>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>

          {/* Tabla de datos */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Placa</TableHead>
                  <TableHead>Peaje</TableHead>
                  <TableHead>Fecha Creación</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Contabilizado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.licensePlate}</TableCell>
                    <TableCell>{record.tollName}</TableCell>
                    <TableCell>{formatDate(record.creationDate)}</TableCell>
                    <TableCell>{formatCurrency(record.total)}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell>
                      <Badge variant={record.accounted ? "default" : "secondary"}>
                        {record.accounted ? "Sí" : "No"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {record.accounted ? (
                        <Badge variant="default" className="flex items-center gap-1 w-fit">
                          <CheckCircle className="h-3 w-3" />
                          Migrado
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMigrateToSiigo(record.id)}
                          disabled={migratingItems.has(record.id)}
                          className="flex items-center gap-1"
                        >
                          {migratingItems.has(record.id) ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Migrando...
                            </>
                          ) : (
                            <>
                              <Send className="h-3 w-3" />
                              Migrar
                            </>
                          )}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Controles de paginación inferior */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const pageNum = Math.max(1, pagination.page - 2) + i
                if (pageNum > pagination.totalPages) return null
                
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.page ? "default" : "outline"}
                    size="sm"
                    onClick={() => handlePageChange(pageNum)}
                    className="w-8 h-8 p-0"
                  >
                    {pageNum}
                  </Button>
                )
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
            >
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
