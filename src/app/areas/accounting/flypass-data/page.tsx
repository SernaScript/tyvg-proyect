"use client"

import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { FlypassDataTable } from "@/components/FlypassDataTable"
import { Button } from "@/components/ui/button"
import { Send, Download, Database, RefreshCw } from "lucide-react"
import Link from "next/link"
import { FlypassScrapingModal } from "@/components/modals/FlypassScrapingModal"
import { FlypassMigrationModal } from "@/components/modals/FlypassMigrationModal"

export default function FlypassDataPage() {
  const [scrapingModalOpen, setScrapingModalOpen] = useState(false)
  const [migrationModalOpen, setMigrationModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleScrapingSuccess = (result: any) => {
    console.log('Scraping completado:', result)
    // Opcional: mostrar notificación de éxito
  }

  const handleMigrationSuccess = (result: any) => {
    console.log('Migración completada:', result)
    // Refrescar la tabla de datos
    setRefreshKey(prev => prev + 1)
  }

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
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => setScrapingModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Scraping
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setMigrationModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Database className="h-4 w-4" />
              Migrar Excel
            </Button>
            <Link href="/areas/accounting/flypass-data/siigo-migration">
              <Button className="flex items-center gap-2">
                <Send className="h-4 w-4" />
                Migración a Siigo
              </Button>
            </Link>
          </div>
        </div>

        <FlypassDataTable key={refreshKey} />

        {/* Modales */}
        <FlypassScrapingModal
          open={scrapingModalOpen}
          onOpenChange={setScrapingModalOpen}
          onSuccess={handleScrapingSuccess}
        />

        <FlypassMigrationModal
          open={migrationModalOpen}
          onOpenChange={setMigrationModalOpen}
          onSuccess={handleMigrationSuccess}
        />
      </div>
    </AreaLayout>
  )
}
