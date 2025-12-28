"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ClipboardList } from "lucide-react"

export default function PreoperationalPage() {
  return (
    <AreaLayout areaId="logistics" moduleId="preoperational">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg border border-orange-200 bg-orange-100">
              <ClipboardList className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Preoperacionales
              </h1>
              <p className="text-muted-foreground">
                Gestión de inspecciones y verificaciones preoperacionales
              </p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <CardTitle>Preoperacionales</CardTitle>
            <CardDescription>
              Sistema de gestión para inspecciones y verificaciones preoperacionales de vehículos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <ClipboardList className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Módulo en desarrollo. Próximamente podrás gestionar las inspecciones preoperacionales.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
