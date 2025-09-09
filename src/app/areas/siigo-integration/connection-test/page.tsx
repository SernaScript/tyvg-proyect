"use client"

import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TestTube, CheckCircle, XCircle, Clock, RefreshCw, AlertCircle } from "lucide-react"

interface TestResult {
  test: string
  status: 'success' | 'error' | 'warning'
  message: string
  duration?: number
}

export default function SiigoConnectionTestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [overallStatus, setOverallStatus] = useState<'success' | 'error' | 'warning' | null>(null)
  const [lastTestTime, setLastTestTime] = useState<Date | null>(null)

  const runConnectionTest = async () => {
    setIsRunning(true)
    setTestResults([])
    setOverallStatus(null)

    const tests: TestResult[] = []

    try {
      // Test 1: API Connectivity
      const startTime = Date.now()
      const response = await fetch('/api/siigo-credentials/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const duration = Date.now() - startTime
      const data = await response.json()

      if (response.ok) {
        tests.push({
          test: 'Conectividad API',
          status: 'success',
          message: 'Conexión exitosa con la API de Siigo',
          duration
        })
      } else {
        tests.push({
          test: 'Conectividad API',
          status: 'error',
          message: data.error || 'Error al conectar con la API',
          duration
        })
      }

      // Test 2: Authentication
      if (response.ok) {
        tests.push({
          test: 'Autenticación',
          status: 'success',
          message: 'Credenciales válidas y autenticación exitosa'
        })
      } else {
        tests.push({
          test: 'Autenticación',
          status: 'error',
          message: 'Error en la autenticación con las credenciales'
        })
      }

      // Test 3: Data Access
      if (response.ok && data.companyInfo) {
        tests.push({
          test: 'Acceso a Datos',
          status: 'success',
          message: `Acceso exitoso a datos de la empresa: ${data.companyInfo.name || 'N/A'}`
        })
      } else {
        tests.push({
          test: 'Acceso a Datos',
          status: 'warning',
          message: 'No se pudo verificar el acceso a datos de la empresa'
        })
      }

      // Test 4: Environment Check
      const environment = data.environment || 'unknown'
      tests.push({
        test: 'Ambiente',
        status: environment === 'sandbox' ? 'warning' : 'success',
        message: `Conectado al ambiente: ${environment === 'sandbox' ? 'Sandbox (Pruebas)' : 'Producción'}`
      })

    } catch (error) {
      tests.push({
        test: 'Conectividad API',
        status: 'error',
        message: 'Error de red o timeout en la conexión'
      })
    }

    setTestResults(tests)
    setLastTestTime(new Date())

    // Determine overall status
    const hasErrors = tests.some(test => test.status === 'error')
    const hasWarnings = tests.some(test => test.status === 'warning')
    
    if (hasErrors) {
      setOverallStatus('error')
    } else if (hasWarnings) {
      setOverallStatus('warning')
    } else {
      setOverallStatus('success')
    }

    setIsRunning(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Exitoso</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Advertencia</Badge>
      default:
        return <Badge variant="secondary">Pendiente</Badge>
    }
  }

  const getOverallStatusInfo = () => {
    if (!overallStatus) return null

    switch (overallStatus) {
      case 'success':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          title: 'Conexión Exitosa',
          description: 'Todos los tests de conexión han pasado correctamente',
          color: 'text-green-600'
        }
      case 'error':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          title: 'Error de Conexión',
          description: 'Se encontraron errores en la conexión con Siigo',
          color: 'text-red-600'
        }
      case 'warning':
        return {
          icon: <AlertCircle className="h-5 w-5 text-yellow-600" />,
          title: 'Conexión con Advertencias',
          description: 'La conexión funciona pero hay advertencias',
          color: 'text-yellow-600'
        }
      default:
        return null
    }
  }

  return (
    <AreaLayout
      areaId="siigo-integration"
      moduleId="siigo-connection-test"
      title="Prueba de Conexión"
      description="Verificación de conectividad con la API de Siigo"
    >
      <div className="space-y-6">
        {/* Test Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5" />
              Ejecutar Pruebas de Conexión
            </CardTitle>
            <CardDescription>
              Verifica la conectividad y configuración con la API de Siigo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Button 
                onClick={runConnectionTest} 
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4" />
                )}
                {isRunning ? 'Ejecutando Pruebas...' : 'Ejecutar Pruebas'}
              </Button>
              
              {lastTestTime && (
                <div className="text-sm text-muted-foreground">
                  Última prueba: {lastTestTime.toLocaleString()}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Overall Status */}
        {overallStatus && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getOverallStatusInfo()?.icon}
                <span className={getOverallStatusInfo()?.color}>
                  {getOverallStatusInfo()?.title}
                </span>
              </CardTitle>
              <CardDescription>
                {getOverallStatusInfo()?.description}
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados de las Pruebas</CardTitle>
              <CardDescription>
                Detalles de cada prueba ejecutada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testResults.map((result, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(result.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{result.test}</h4>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(result.status)}
                          {result.duration && (
                            <span className="text-xs text-muted-foreground">
                              {result.duration}ms
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {result.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle>Información sobre las Pruebas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-muted-foreground space-y-2">
              <p><strong>Conectividad API:</strong> Verifica que la API de Siigo esté disponible y responda correctamente.</p>
              <p><strong>Autenticación:</strong> Valida que las credenciales configuradas sean correctas.</p>
              <p><strong>Acceso a Datos:</strong> Confirma que se puede acceder a los datos de la empresa.</p>
              <p><strong>Ambiente:</strong> Indica si estás conectado al ambiente de sandbox o producción.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}

