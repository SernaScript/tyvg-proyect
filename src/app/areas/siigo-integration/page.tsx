"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  LinkIcon, 
  Key, 
  TestTube, 
  Zap, 
  FileBarChart, 
  Database,
  ArrowUpDown,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Activity,
  TrendingUp,
  AlertTriangle
} from "lucide-react"

interface IntegrationStatus {
  isConnected: boolean
  lastCheck: Date | null
  syncCountToday: number
  errorCount24h: number
  lastTestStatus: 'success' | 'error' | 'pending'
  lastTestTime: Date | null
}

interface RecentActivity {
  id: string
  type: 'sync' | 'test' | 'error' | 'config'
  message: string
  timestamp: Date
  status: 'success' | 'error' | 'warning'
}

export default function SiigoIntegrationPage() {
  const router = useRouter()
  const [integrationStatus, setIntegrationStatus] = useState<IntegrationStatus>({
    isConnected: true,
    lastCheck: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
    syncCountToday: 12,
    errorCount24h: 0,
    lastTestStatus: 'success',
    lastTestTime: new Date(Date.now() - 1 * 60 * 60 * 1000) // 1 hour ago
  })

  const [recentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'sync',
      message: 'Sincronización de clientes completada exitosamente',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      status: 'success'
    },
    {
      id: '2',
      type: 'test',
      message: 'Prueba de conexión con API de Siigo exitosa',
      timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
      status: 'success'
    },
    {
      id: '3',
      type: 'sync',
      message: 'Sincronización de productos en progreso',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'warning'
    },
    {
      id: '4',
      type: 'config',
      message: 'Credenciales de Siigo actualizadas',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      status: 'success'
    }
  ])

  const [isLoading, setIsLoading] = useState(false)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sync':
        return <ArrowUpDown className="h-4 w-4" />
      case 'test':
        return <TestTube className="h-4 w-4" />
      case 'error':
        return <XCircle className="h-4 w-4" />
      case 'config':
        return <Key className="h-4 w-4" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIntegrationStatus(prev => ({
        ...prev,
        isConnected: true,
        lastCheck: new Date(),
        lastTestStatus: 'success',
        lastTestTime: new Date()
      }))
    } catch (error) {
      setIntegrationStatus(prev => ({
        ...prev,
        isConnected: false,
        lastCheck: new Date(),
        lastTestStatus: 'error',
        lastTestTime: new Date()
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'test':
        handleTestConnection()
        break
      case 'credentials':
        router.push('/areas/siigo-integration/credentials')
        break
      case 'logs':
        router.push('/areas/siigo-integration/logs')
        break
      case 'sync':
        router.push('/areas/siigo-integration/sync')
        break
      case 'database':
        router.push('/areas/siigo-integration/database-integration')
        break
    }
  }

  const formatTimeAgo = (date: Date | null) => {
    if (!date) return 'Nunca'
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 1) return 'Hace un momento'
    if (diffInMinutes < 60) return `Hace ${diffInMinutes} minutos`
    if (diffInMinutes < 1440) return `Hace ${Math.floor(diffInMinutes / 60)} horas`
    return `Hace ${Math.floor(diffInMinutes / 1440)} días`
  }

  return (
    <AreaLayout
      areaId="siigo-integration"
      title="Integración Siigo"
      description="Configuración y gestión de integración con Siigo"
    >
      <div className="space-y-8">
        {/* Status Alert */}
        {!integrationStatus.isConnected && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La conexión con Siigo no está disponible. Verifica las credenciales y la conectividad.
            </AlertDescription>
          </Alert>
        )}

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estado de Conexión</CardTitle>
              <Key className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">
                  {integrationStatus.isConnected ? 'Conectado' : 'Desconectado'}
                </div>
                {getStatusIcon(integrationStatus.isConnected ? 'success' : 'error')}
              </div>
              <p className="text-xs text-muted-foreground">
                Última verificación: {formatTimeAgo(integrationStatus.lastCheck)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sincronizaciones Hoy</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStatus.syncCountToday}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                +2 desde ayer
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Errores Recientes</CardTitle>
              <FileBarChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{integrationStatus.errorCount24h}</div>
              <p className="text-xs text-muted-foreground">
                {integrationStatus.errorCount24h === 0 
                  ? 'Sin errores en las últimas 24h' 
                  : 'Errores en las últimas 24h'
                }
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Última Prueba</CardTitle>
              <TestTube className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="outline" 
                  className={
                    integrationStatus.lastTestStatus === 'success' 
                      ? "bg-green-100 text-green-800 border-green-300"
                      : integrationStatus.lastTestStatus === 'error'
                      ? "bg-red-100 text-red-800 border-red-300"
                      : "bg-yellow-100 text-yellow-800 border-yellow-300"
                  }
                >
                  {integrationStatus.lastTestStatus === 'success' ? 'Exitosa' : 
                   integrationStatus.lastTestStatus === 'error' ? 'Fallida' : 'Pendiente'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatTimeAgo(integrationStatus.lastTestTime)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Modules Navigation */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Módulos de Integración
            </h2>
            <p className="text-muted-foreground">
              Gestiona la configuración y monitoreo de la integración con Siigo
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/credentials')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Credenciales Siigo</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Configuración de credenciales y conexión con Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/connection-test')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Prueba de Conexión</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Verificación de conectividad con la API de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/sync')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Sincronización de Datos</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                    En Desarrollo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Sincronización automática de datos con Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/logs')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <FileBarChart className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Logs de Integración</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800 border-yellow-300">
                    En Desarrollo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Registro de actividades y errores de integración
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/database-integration')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Integración de Bases de Datos</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Consultas y sincronización con endpoints de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-lg transition-all cursor-pointer h-full border-blue-200 hover:border-blue-300"
              onClick={() => router.push('/areas/siigo-integration/warehouses')}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                    <CardTitle className="text-base">Bodegas</CardTitle>
                  </div>
                  <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                    Activo
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  Gestión y sincronización de bodegas desde Siigo
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button variant="outline" size="sm" className="w-full">
                  Acceder
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acciones Rápidas
            </h2>
            <p className="text-muted-foreground">
              Herramientas para gestión rápida de la integración
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card 
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleQuickAction('test')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Probar Conexión
                </CardTitle>
                <CardDescription>
                  Verifica la conectividad con la API de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  size="sm" 
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <TestTube className="h-4 w-4 mr-2" />
                  )}
                  {isLoading ? 'Probando...' : 'Probar Ahora'}
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleQuickAction('credentials')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Configurar Credenciales
                </CardTitle>
                <CardDescription>
                  Actualiza las credenciales de acceso a Siigo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  <Key className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleQuickAction('database')}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Consultar Datos
                </CardTitle>
                <CardDescription>
                  Ejecuta consultas en endpoints de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" size="sm" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Consultar
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Actividad Reciente
            </h2>
            <p className="text-muted-foreground">
              Últimas actividades de integración con Siigo
            </p>
          </div>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      {getStatusIcon(activity.status)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AreaLayout>
  )
}

