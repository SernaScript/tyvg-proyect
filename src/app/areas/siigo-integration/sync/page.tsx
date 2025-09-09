"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Zap, Play, Pause, RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface SyncJob {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed' | 'paused'
  lastRun: Date | null
  nextRun: Date | null
  recordsProcessed: number
  errors: number
}

export default function SiigoSyncPage() {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([
    {
      id: 'customers',
      name: 'Sincronización de Clientes',
      status: 'completed',
      lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      nextRun: new Date(Date.now() + 22 * 60 * 60 * 1000), // 22 hours from now
      recordsProcessed: 156,
      errors: 0
    },
    {
      id: 'products',
      name: 'Sincronización de Productos',
      status: 'running',
      lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      nextRun: new Date(Date.now() + 23.5 * 60 * 60 * 1000), // 23.5 hours from now
      recordsProcessed: 89,
      errors: 2
    },
    {
      id: 'invoices',
      name: 'Sincronización de Facturas',
      status: 'paused',
      lastRun: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      nextRun: null,
      recordsProcessed: 0,
      errors: 0
    },
    {
      id: 'payments',
      name: 'Sincronización de Pagos',
      status: 'failed',
      lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour from now
      recordsProcessed: 23,
      errors: 5
    }
  ])
  const [isRunning, setIsRunning] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-300">Ejecutando</Badge>
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Completado</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Fallido</Badge>
      case 'paused':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pausado</Badge>
      default:
        return <Badge variant="secondary">Desconocido</Badge>
    }
  }

  const runSyncJob = async (jobId: string) => {
    setIsRunning(true)
    
    // Update job status to running
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'running' as const }
        : job
    ))

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Update job status to completed
      setSyncJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { 
              ...job, 
              status: 'completed' as const,
              lastRun: new Date(),
              recordsProcessed: job.recordsProcessed + Math.floor(Math.random() * 50),
              errors: Math.floor(Math.random() * 3)
            }
          : job
      ))
    } catch (error) {
      // Update job status to failed
      setSyncJobs(prev => prev.map(job => 
        job.id === jobId 
          ? { ...job, status: 'failed' as const }
          : job
      ))
    } finally {
      setIsRunning(false)
    }
  }

  const pauseSyncJob = (jobId: string) => {
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { ...job, status: 'paused' as const, nextRun: null }
        : job
    ))
  }

  const resumeSyncJob = (jobId: string) => {
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId 
        ? { 
            ...job, 
            status: 'completed' as const, 
            nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
          }
        : job
    ))
  }

  const formatDate = (date: Date | null) => {
    if (!date) return 'No programado'
    return date.toLocaleString()
  }

  return (
    <AreaLayout
      areaId="siigo-integration"
      moduleId="siigo-sync"
      title="Sincronización de Datos"
      description="Sincronización automática de datos con Siigo"
    >
      <div className="space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trabajos Activos</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncJobs.filter(job => job.status === 'running').length}
              </div>
              <p className="text-xs text-muted-foreground">
                de {syncJobs.length} trabajos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Registros Procesados</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncJobs.reduce((sum, job) => sum + job.recordsProcessed, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                en las últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errores</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {syncJobs.reduce((sum, job) => sum + job.errors, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                en las últimas 24h
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasa de Éxito</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round((syncJobs.filter(job => job.status === 'completed').length / syncJobs.length) * 100)}%
              </div>
              <p className="text-xs text-muted-foreground">
                trabajos exitosos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Sync Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Trabajos de Sincronización
            </CardTitle>
            <CardDescription>
              Gestiona los trabajos de sincronización automática con Siigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {syncJobs.map((job) => (
                <div key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      {getStatusIcon(job.status)}
                    </div>
                    <div>
                      <h4 className="font-medium">{job.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Última ejecución: {formatDate(job.lastRun)}</span>
                        <span>Próxima ejecución: {formatDate(job.nextRun)}</span>
                        <span>Registros: {job.recordsProcessed}</span>
                        {job.errors > 0 && (
                          <span className="text-red-600">Errores: {job.errors}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {getStatusBadge(job.status)}
                    
                    <div className="flex gap-1">
                      {job.status === 'paused' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resumeSyncJob(job.id)}
                          className="flex items-center gap-1"
                        >
                          <Play className="h-3 w-3" />
                          Reanudar
                        </Button>
                      ) : job.status === 'running' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => pauseSyncJob(job.id)}
                          className="flex items-center gap-1"
                        >
                          <Pause className="h-3 w-3" />
                          Pausar
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runSyncJob(job.id)}
                          disabled={isRunning}
                          className="flex items-center gap-1"
                        >
                          <RefreshCw className="h-3 w-3" />
                          Ejecutar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Sincronización</CardTitle>
            <CardDescription>
              Ajustes para la sincronización automática
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                La sincronización automática está configurada para ejecutarse cada 24 horas. 
                Los trabajos se ejecutan de forma secuencial para evitar sobrecargar la API de Siigo.
              </AlertDescription>
            </Alert>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Frecuencia de Sincronización</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Seleccionar frecuencia de sincronización"
                >
                  <option value="hourly">Cada hora</option>
                  <option value="daily" selected>Cada 24 horas</option>
                  <option value="weekly">Cada semana</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Hora de Ejecución</label>
                <input 
                  type="time" 
                  defaultValue="02:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  title="Seleccionar hora de ejecución"
                />
              </div>
            </div>
            
            <Button className="w-full">
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
