"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { AreaModules } from "@/components/navigation/AreasNavigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
export default function LogisticsPage() {

  return (
    <AreaLayout areaId="logistics">
      <div className="space-y-6">

        {/* Modules Section */}
        <Card>
          <CardHeader>
            <CardTitle>Módulos de Logística</CardTitle>
            <CardDescription>
              Herramientas para la gestión de inventarios, almacenes y cadena de suministro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AreaModules areaId="logistics" />
          </CardContent>
        </Card>


      </div>
    </AreaLayout>
  )
}
