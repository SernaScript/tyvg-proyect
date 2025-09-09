"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Key, Eye, EyeOff, Save, TestTube, AlertCircle, CheckCircle } from "lucide-react"

interface SiigoCredentials {
  username: string
  password: string
  companyId: string
  environment: 'sandbox' | 'production'
}

export default function SiigoCredentialsPage() {
  const [credentials, setCredentials] = useState<SiigoCredentials>({
    username: '',
    password: '',
    companyId: '',
    environment: 'sandbox'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null)
  const [hasCredentials, setHasCredentials] = useState(false)

  useEffect(() => {
    // Load existing credentials
    loadCredentials()
  }, [])

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/siigo-credentials')
      if (response.ok) {
        const data = await response.json()
        if (data.credentials) {
          setCredentials(data.credentials)
          setHasCredentials(true)
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/siigo-credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Credenciales guardadas exitosamente' })
        setHasCredentials(true)
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar las credenciales' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al guardar las credenciales' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    setMessage(null)

    try {
      const response = await fetch('/api/siigo-credentials/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: 'success', text: 'Conexión exitosa con Siigo' })
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al conectar con Siigo' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error de conexión al probar las credenciales' })
    } finally {
      setIsTesting(false)
    }
  }

  const getMessageIcon = () => {
    if (!message) return null
    
    switch (message.type) {
      case 'success':
        return <CheckCircle className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const getMessageVariant = () => {
    if (!message) return 'default'
    
    switch (message.type) {
      case 'success':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  return (
    <AreaLayout
      areaId="siigo-integration"
      moduleId="siigo-credentials"
      title="Credenciales Siigo"
      description="Configuración de credenciales y conexión con Siigo"
    >
      <div className="space-y-6">
        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Estado de las Credenciales
            </CardTitle>
            <CardDescription>
              Información sobre la configuración actual de credenciales
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge 
                variant={hasCredentials ? "default" : "secondary"}
                className={hasCredentials ? "bg-green-100 text-green-800 border-green-300" : ""}
              >
                {hasCredentials ? "Configuradas" : "Sin configurar"}
              </Badge>
              <Badge variant="outline">
                {credentials.environment === 'sandbox' ? 'Ambiente de Pruebas' : 'Ambiente de Producción'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Credentials Form */}
        <Card>
          <CardHeader>
            <CardTitle>Configuración de Credenciales</CardTitle>
            <CardDescription>
              Ingresa las credenciales de acceso a la API de Siigo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="Ingresa tu usuario de Siigo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyId">ID de Empresa</Label>
                <Input
                  id="companyId"
                  type="text"
                  value={credentials.companyId}
                  onChange={(e) => setCredentials(prev => ({ ...prev, companyId: e.target.value }))}
                  placeholder="ID de tu empresa en Siigo"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={credentials.password}
                  onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Ingresa tu contraseña de Siigo"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="environment">Ambiente</Label>
              <select
                id="environment"
                value={credentials.environment}
                onChange={(e) => setCredentials(prev => ({ ...prev, environment: e.target.value as 'sandbox' | 'production' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                title="Seleccionar ambiente de Siigo"
              >
                <option value="sandbox">Sandbox (Pruebas)</option>
                <option value="production">Producción</option>
              </select>
            </div>

            {/* Message Alert */}
            {message && (
              <Alert variant={getMessageVariant()}>
                {getMessageIcon()}
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Guardando...' : 'Guardar Credenciales'}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleTestConnection} 
                disabled={isTesting || !credentials.username || !credentials.password}
                className="flex items-center gap-2"
              >
                <TestTube className="h-4 w-4" />
                {isTesting ? 'Probando...' : 'Probar Conexión'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle>Información Importante</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground">
              <p><strong>Ambiente Sandbox:</strong> Utiliza este ambiente para pruebas y desarrollo. Los datos no son reales.</p>
              <p><strong>Ambiente Producción:</strong> Utiliza este ambiente para operaciones reales. Ten cuidado con los datos.</p>
              <p><strong>Seguridad:</strong> Las credenciales se almacenan de forma segura y encriptada.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
