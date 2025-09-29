"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { FlypassDataTable } from "@/components/FlypassDataTable"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"
import Link from "next/link"

export default function FlypassDataPage() {
  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="flypass-data"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Datos de Flypass</h1>
            <p className="text-muted-foreground">
              Visualiza y gestiona todos los datos de peajes procesados desde Flypass
            </p>
          </div>
          <Link href="/areas/accounting/flypass-data/siigo-migration">
            <Button className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Migración a Siigo
            </Button>
          </Link>
        </div>

        <FlypassDataTable />
      </div>
    </AreaLayout>
  )
}
