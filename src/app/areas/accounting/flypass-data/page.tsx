"use client"

import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { FlypassDataTable } from "@/components/FlypassDataTable"
import { Button } from "@/components/ui/button"
import { Send, Download, Database, RefreshCw, Upload } from "lucide-react"
import Link from "next/link"
import { FlypassScrapingModal } from "@/components/modals/FlypassScrapingModal"
import { FlypassMigrationModal } from "@/components/modals/FlypassMigrationModal"
import { FlypassUploadExcelModal } from "@/components/modals/FlypassUploadExcelModal"

// Componente para el icono de Excel
const ExcelIcon = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 50 50" 
    className={className}
  >
    <path d="M 28.8125 0.03125 L 0.8125 5.34375 C 0.339844 5.433594 0 5.863281 0 6.34375 L 0 43.65625 C 0 44.136719 0.339844 44.566406 0.8125 44.65625 L 28.8125 49.96875 C 28.875 49.980469 28.9375 50 29 50 C 29.230469 50 29.445313 49.929688 29.625 49.78125 C 29.855469 49.589844 30 49.296875 30 49 L 30 1 C 30 0.703125 29.855469 0.410156 29.625 0.21875 C 29.394531 0.0273438 29.105469 -0.0234375 28.8125 0.03125 Z M 32 6 L 32 13 L 34 13 L 34 15 L 32 15 L 32 20 L 34 20 L 34 22 L 32 22 L 32 27 L 34 27 L 34 29 L 32 29 L 32 35 L 34 35 L 34 37 L 32 37 L 32 44 L 47 44 C 48.101563 44 49 43.101563 49 42 L 49 8 C 49 6.898438 48.101563 6 47 6 Z M 36 13 L 44 13 L 44 15 L 36 15 Z M 6.6875 15.6875 L 11.8125 15.6875 L 14.5 21.28125 C 14.710938 21.722656 14.898438 22.265625 15.0625 22.875 L 15.09375 22.875 C 15.199219 22.511719 15.402344 21.941406 15.6875 21.21875 L 18.65625 15.6875 L 23.34375 15.6875 L 17.75 24.9375 L 23.5 34.375 L 18.53125 34.375 L 15.28125 28.28125 C 15.160156 28.054688 15.035156 27.636719 14.90625 27.03125 L 14.875 27.03125 C 14.8125 27.316406 14.664063 27.761719 14.4375 28.34375 L 11.1875 34.375 L 6.1875 34.375 L 12.15625 25.03125 Z M 36 20 L 44 20 L 44 22 L 36 22 Z M 36 27 L 44 27 L 44 29 L 36 29 Z M 36 35 L 44 35 L 44 37 L 36 37 Z"/>
  </svg>
)

export default function FlypassDataPage() {
  const [scrapingModalOpen, setScrapingModalOpen] = useState(false)
  const [migrationModalOpen, setMigrationModalOpen] = useState(false)
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
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

  const handleUploadSuccess = (result: any) => {
    console.log('Upload completado:', result)
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
            {/* <Button 
              variant="outline" 
              onClick={() => setScrapingModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Descargar excel
            </Button> */}
            {/* <Button 
              variant="outline" 
              onClick={() => setMigrationModalOpen(true)}
              className="flex items-center gap-2"
            >
              <ExcelIcon className="h-4 w-4" />
              Migrar Excel
            </Button> */}
            <Button 
              variant="outline" 
              onClick={() => setUploadModalOpen(true)}
              className="flex items-center gap-2"
            >
              <ExcelIcon className="h-4 w-4" />
              Subir Excel
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

        <FlypassUploadExcelModal
          open={uploadModalOpen}
          onOpenChange={setUploadModalOpen}
          onSuccess={handleUploadSuccess}
        />
      </div>
    </AreaLayout>
  )
}
