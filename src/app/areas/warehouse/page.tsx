"use client"

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

export default function WarehousePage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Depósito</h1>
          <p className="text-gray-600 mt-2">Gestión de operaciones de depósito</p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-100 rounded-lg">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Registrar Ventas</CardTitle>
                  <CardDescription>Registra las ventas de artículos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/areas/warehouse/sales">
                  Ir a Ventas
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ShoppingBag className="h-8 w-8 text-blue-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Registrar Compras</CardTitle>
                  <CardDescription>Registra las compras de artículos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/areas/warehouse/purchases">
                  Ir a Compras
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-100 rounded-lg">
                  <Package className="h-8 w-8 text-orange-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Crear Artículos</CardTitle>
                  <CardDescription>Gestiona los artículos del inventario</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/areas/warehouse/articles">
                  Ir a Artículos
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <FileText className="h-8 w-8 text-purple-600" />
                </div>
                <div className="flex-1">
                  <CardTitle>Visualizar Kardex</CardTitle>
                  <CardDescription>Consulta el historial de movimientos</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
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

