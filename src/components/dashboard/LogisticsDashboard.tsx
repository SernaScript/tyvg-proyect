"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface LogisticsDashboardProps {
  user: User
}


export function LogisticsDashboard({ user }: LogisticsDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Optimizando la Logística!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está desarrollando soluciones logísticas 
              inteligentes que revolucionarán la gestión de inventarios, flota y 
              cadena de suministro. Cada módulo está diseñado para maximizar la 
              eficiencia operativa.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-cyan-700 font-medium">
              Bienvenido, {user.name || user.email} • Logística
            </p>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
