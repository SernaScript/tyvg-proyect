"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface TreasuryDashboardProps {
  user: User
}


export function TreasuryDashboard({ user }: TreasuryDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-purple-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Revolucionando la Tesorería!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está creando herramientas de tesorería 
              inteligentes que optimizarán tu gestión de flujo de efectivo y 
              automatizarán los procesos de pago. Cada módulo está diseñado para 
              maximizar tu control financiero.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-purple-700 font-medium">
              Bienvenido, {user.name || user.email} • Tesorería
            </p>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
