"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface AdminDashboardProps {
  user: User
}


export function AdminDashboard({ user }: AdminDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Construyendo Soluciones Inteligentes!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está desarrollando módulos avanzados que 
              transformarán la forma en que gestionas los procesos administrativos. 
              Cada funcionalidad está diseñada para optimizar tu eficiencia operativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-700 font-medium">
              Bienvenido, {user.name || user.email} • Administrador
            </p>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
