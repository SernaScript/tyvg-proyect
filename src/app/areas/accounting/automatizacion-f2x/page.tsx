"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { LoginForm } from "@/components/LoginForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Database, ArrowRight, FileText, BarChart3 } from "lucide-react"
import Link from "next/link"

export default function F2XAutomationPage() {
  const handleFormSubmit = (data: any) => {
    console.log('Datos del formulario F2X:', data)
  }


  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="f2x-automation"
      actions={
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Descargar Logs
        </Button>
      }
    >
      <div className="space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Configuración de Proceso F2X</CardTitle>
                <CardDescription>
                  Complete el NIT, contraseña y seleccione el rango de fechas para iniciar el procesamiento automático
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LoginForm 
                  onSubmit={handleFormSubmit}
                  title=""
                />
              </CardContent>
            </Card>
          </div>

          {/* Panel de Navegación */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  Datos de Flypass
                </CardTitle>
                <CardDescription>
                  Accede a los datos procesados y estadísticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link href="/areas/accounting/flypass-data">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Ver Tabla de Datos
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                
                <Link href="/areas/accounting/flypass-reports">
                  <Button className="w-full justify-between" variant="outline">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Reportes y Estadísticas
                    </div>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-green-500" />
                  Acciones Rápidas
                </CardTitle>
                <CardDescription>
                  Herramientas y utilidades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full justify-between" variant="outline">
                  <div className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Descargar Datos
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button className="w-full justify-between" variant="outline">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Sincronizar Base de Datos
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </AreaLayout>
  )
}
