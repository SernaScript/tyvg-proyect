"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  Rocket
} from "lucide-react"

interface BillingDashboardProps {
  user: User
}


export function BillingDashboard({ user }: BillingDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Mensaje del Equipo de Tecnología */}
        <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center">
                <Rocket className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              ¡Transformando la Facturación!
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Nuestro equipo de tecnología está desarrollando un sistema de facturación 
              inteligente que automatizará tus procesos de emisión, seguimiento y 
              análisis. Cada módulo está diseñado para optimizar tu gestión comercial.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-pink-700 font-medium">
              Bienvenido, {user.name || user.email} • Facturación
            </p>
          </CardContent>
        </Card>


      </div>
    </MainLayout>
  )
}
