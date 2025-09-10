import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

interface SiigoCostCenterResponse {
  id: number
  code: string
  name: string
  active: boolean
}

export async function GET(request: NextRequest) {
  try {
    const costCenters: SiigoCostCenterResponse[] = await SiigoService.getCostCenters()

    const syncResults = await Promise.all(
      costCenters.map(async (costCenter) => {
        try {
          return await prisma.siigoCostCenter.upsert({
            where: { id: costCenter.id },
            update: {
              code: costCenter.code,
              name: costCenter.name,
              active: costCenter.active,
            },
            create: {
              id: costCenter.id,
              code: costCenter.code,
              name: costCenter.name,
              active: costCenter.active,
            },
          })
        } catch (dbError) {
          console.error(`Error al sincronizar centro de costo ${costCenter.id}:`, dbError)
          return null
        }
      })
    )

    const successful = syncResults.filter(result => result !== null).length
    const failed = syncResults.length - successful

    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${successful} centros de costo sincronizados, ${failed} fallaron`,
      data: syncResults.filter(result => result !== null),
      syncStats: {
        total: costCenters.length,
        successful,
        failed
      }
    })
  } catch (error) {
    console.error('Error obteniendo centros de costo de Siigo:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: `Error al autenticar con Siigo: ${error instanceof Error ? error.message : 'Error desconocido'}` 
      }, 
      { status: 500 }
    )
  }
}

