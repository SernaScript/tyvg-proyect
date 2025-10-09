"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface ViewerDashboardProps {
  user: User
}

export function ViewerDashboard({ user }: ViewerDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-indigo-50 to-blue-50 border-indigo-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Explorando el Futuro!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está trabajando incansablemente para crear 
              más módulos y funcionalidades que enriquecerán tu experiencia de visualización. 
              Cada día estamos más cerca de ofrecerte una vista completa y detallada del sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-indigo-700 font-medium">
              Bienvenido, {user.name || user.email} • Visualización
            </p>
          </CardContent>
        </Card>

      </div>
    </MainLayout>
  )
}
