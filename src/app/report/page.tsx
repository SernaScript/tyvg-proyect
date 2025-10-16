"use client"

import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  FileText, 
  Download,
  Calendar,
  Users,
  Clock,
  Wrench
} from "lucide-react"

export default function Reportes() {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-green-500" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reportes
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Generación y análisis de reportes empresariales
            </p>
          </div>
        </div>

        {/* Página de "Estamos trabajando" */}
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-2xl mx-auto">
            {/* Icono animado */}
            <div className="relative mb-8">
              <div className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  <Wrench className="h-16 w-16 text-blue-600 animate-spin" style={{ animationDuration: '20s' }} />
                  
                </div>
              </div>
              {/* Puntos decorativos */}
              
            </div>

            {/* Título principal */}
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              ¡Estamos Trabajando!
            </h2>
            
            {/* Subtítulo */}
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-6">
              El módulo de reportes está en desarrollo
            </p>

            {/* Badge de estado */}
            <Badge className="bg-orange-100 text-orange-800 text-sm px-4 py-2 mb-8">
              <Clock className="h-4 w-4 mr-2" />
              En Desarrollo
            </Badge>

            {/* Descripción */}
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Estamos creando un sistema de reportes completo que incluirá análisis avanzados, 
              gráficos interactivos y exportación de datos para ayudarte a tomar mejores decisiones empresariales.
            </p>

            {/* Características futuras */}
            <Card className="text-left">
              <CardHeader>
                <CardTitle className="text-lg">¿Qué incluirá este módulo?</CardTitle>
                <CardDescription>
                  Funcionalidades que estarán disponibles próximamente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Análisis de Tendencias</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <PieChart className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium">Gráficos Interactivos</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium">Reportes Personalizados</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Download className="h-5 w-5 text-orange-600" />
                    <span className="text-sm font-medium">Exportación de Datos</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Calendar className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium">Reportes Programados</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                    <span className="text-sm font-medium">Análisis de Usuarios</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Mensaje de contacto */}
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>¿Necesitas reportes específicos?</strong> Contacta al equipo de desarrollo 
                para solicitar funcionalidades prioritarias.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
