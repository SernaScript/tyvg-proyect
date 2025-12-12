"use client"

import { User } from "@/types/auth"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { 
  ShoppingCart,
  ShoppingBag,
  Package,
  FileText
} from "lucide-react"

interface WarehouseDashboardProps {
  user: User
}

export function WarehouseDashboard({ user }: WarehouseDashboardProps) {
  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
              Dashboard de Depósito
            </CardTitle>
            <CardDescription className="text-lg text-gray-700 max-w-3xl mx-auto">
              Gestión simplificada de operaciones de depósito
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-blue-700 font-medium">
              Bienvenido, {user.name || user.email} • Usuario de Depósito
            </p>
          </CardContent>
        </Card>

        {/* Main Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Registrar Ventas */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Registrar Ventas</CardTitle>
                  <CardDescription>
                    Registra las ventas de artículos del depósito
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/areas/warehouse/sales">
                  Ir a Ventas
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Registrar Compras */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Registrar Compras</CardTitle>
                  <CardDescription>
                    Registra las compras de artículos al depósito
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/areas/warehouse/purchases">
                  Ir a Compras
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Crear Artículos */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Crear Artículos</CardTitle>
                  <CardDescription>
                    Crea y gestiona los artículos del inventario
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/areas/warehouse/articles">
                  Ir a Artículos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Visualizar Kardex */}
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl">Visualizar Kardex</CardTitle>
                  <CardDescription>
                    Consulta el historial de movimientos de inventario
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full" size="lg">
                <Link href="/areas/warehouse/kardex">
                  Ir a Kardex
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  )
}

