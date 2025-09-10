"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Cloud, 
  AlertCircle,
  Settings
} from "lucide-react"

export default function SiigoMigrationPage() {
  const router = useRouter()
  const [isMigrating, setIsMigrating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credentials, setCredentials] = useState({ isConfigured: false })

  // Función para iniciar migración
  const startMigration = async () => {
    setIsMigrating(true)
    setError(null)
    
    try {
      const response = await fetch('/api/fuel-purchases/siigo-migration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (response.ok) {
        // Migración exitosa
        console.log('Migración completada')
      } else {
        setError(result.error || 'Error al migrar los datos')
      }
    } catch (error) {
      console.error('Error during migration:', error)
      setError('Error al migrar los datos')
    } finally {
      setIsMigrating(false)
    }
  }

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">
        {/* Acciones de Migración */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="h-5 w-5" />
              Acciones de Migración
            </CardTitle>
            <CardDescription>
              Inicia la migración de datos a Siigo nube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!credentials.isConfigured && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm text-yellow-800">
                    Debes configurar las credenciales de Siigo antes de migrar los datos
                  </span>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={startMigration}
                  disabled={!credentials.isConfigured || isMigrating}
                  className="flex-1"
                >
                  {isMigrating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Migrando...
                    </>
                  ) : (
                    <>
                      <Cloud className="h-4 w-4 mr-2" />
                      Iniciar Migración
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/areas/siigo-integration')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configuración Avanzada
                </Button>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-800">{error}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
