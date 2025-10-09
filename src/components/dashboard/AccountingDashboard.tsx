"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface AccountingDashboardProps {
  user: User
}


export function AccountingDashboard({ user }: AccountingDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Innovando en Contabilidad!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está desarrollando herramientas contables 
              avanzadas que automatizarán tus procesos y mejorarán la precisión de tus 
              registros financieros. Cada módulo está diseñado para optimizar tu eficiencia contable.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-green-700 font-medium">
              Bienvenido, {user.name || user.email} • Contabilidad
            </p>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
