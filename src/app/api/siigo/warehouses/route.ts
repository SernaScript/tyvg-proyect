import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

interface SiigoWarehouseResponse {
  id: number
  name: string
  active: boolean
  has_movements: boolean
}

export async function GET(request: NextRequest) {
  try {
    // Obtener bodegas desde Siigo usando el servicio
    const warehouses: SiigoWarehouseResponse[] = await SiigoService.getWarehouses()

    // Sincronizar datos con la base de datos local
    const syncResults = await Promise.all(
      warehouses.map(async (warehouse) => {
        try {
          return await prisma.siigoWarehouse.upsert({
            where: { id: warehouse.id },
            update: {
              name: warehouse.name,
              active: warehouse.active,
              hasMovements: warehouse.has_movements,
              updatedAt: new Date()
            },
            create: {
              id: warehouse.id,
              name: warehouse.name,
              active: warehouse.active,
              hasMovements: warehouse.has_movements
            }
          })
        } catch (error) {
          console.error(`Error sincronizando bodega ${warehouse.id}:`, error)
          return null
        }
      })
    )

    const successfulSyncs = syncResults.filter(result => result !== null)
    const failedSyncs = syncResults.length - successfulSyncs.length

    return NextResponse.json({
      success: true,
      message: `Se sincronizaron ${successfulSyncs.length} bodegas exitosamente`,
      data: warehouses,
      syncStats: {
        total: warehouses.length,
        successful: successfulSyncs.length,
        failed: failedSyncs
      }
    })

  } catch (error) {
    console.error('Error en endpoint de bodegas:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'sync') {
      // Forzar sincronización desde Siigo
      return GET(request)
    }

    return NextResponse.json(
      { error: 'Acción no válida' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error en POST de bodegas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
