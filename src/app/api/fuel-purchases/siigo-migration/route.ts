import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

// POST - Migrar registros de combustible a Siigo journals
export async function POST(request: NextRequest) {
  try {

    // Obtener todos los registros de combustible pendientes de migración
    const fuelPurchases = await (prisma as any).fuelPurchase.findMany({
      where: { state: true },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    })

    if (fuelPurchases.length === 0) {
      return NextResponse.json(
        { error: 'No hay registros pendientes de migración' },
        { status: 400 }
      )
    }

    // Mapeo de proveedores
    const providerMapping: { [key: string]: string } = {
      'CORALINAS': '811038233',
      'SOTO 13': '901039186'
    }

    const results = {
      processed: 0,
      errors: 0,
      errorDetails: [] as string[],
      migrated: [] as any[]
    }

    // Procesar cada registro de combustible
    for (const purchase of fuelPurchases) {
      try {
        // Validar proveedor
        const providerId = providerMapping[purchase.provider]
        if (!providerId) {
          results.errors++
          results.errorDetails.push(
            `Registro ${purchase.id}: Proveedor '${purchase.provider}' no está mapeado. Proveedores válidos: CORALINAS, SOTO 13`
          )
          continue
        }

        // Buscar cost_center en siigo_cost_centers basado en la placa del vehículo
        const costCenter = await (prisma as any).siigoCostCenter.findFirst({
          where: {
            name: purchase.vehicle.plate
          }
        })

        if (!costCenter) {
          results.errors++
          results.errorDetails.push(
            `Registro ${purchase.id}: No se encontró cost_center para la placa '${purchase.vehicle.plate}' en siigo_cost_centers`
          )
          continue
        }

        // Construir el journal para Siigo
        const journalData = {
          document: {
            id: 39068
          },
          date: purchase.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
          items: [
            {
              account: {
                code: '62100601',
                movement: 'Debit'
              },
              customer: {
                identification: providerId,
                branch_office: 0
              },
          description: `COMBUSTIBLE RECIBO ${purchase.receipt || ''}`.trim(),
          cost_center: costCenter.id,
          value: parseFloat(purchase.total.toString())
            },
            {
              account: {
                code: '62100601',
                movement: 'Credit'
              },
              customer: {
                identification: providerId,
                branch_office: 0
              },
          description: `COMBUSTIBLE RECIBO ${purchase.receipt || ''}`.trim(),
          cost_center: 518,
          value: parseFloat(purchase.total.toString())
            }
          ],
          observations: `Migración automática - Vehículo: ${purchase.vehicle.plate} (${purchase.vehicle.brand} ${purchase.vehicle.model})`
        }

        // Crear journal en Siigo usando SiigoService
        try {
          const journalResult = await SiigoService.createJournal(journalData)

          // Marcar el registro como migrado (cambiar state a false)
          await (prisma as any).fuelPurchase.update({
            where: { id: purchase.id },
            data: { state: false }
          })

          results.processed++
          results.migrated.push({
            id: purchase.id,
            plate: purchase.vehicle.plate,
            date: purchase.date,
            total: purchase.total,
            provider: purchase.provider,
            siigoJournalId: journalResult.id || 'N/A'
          })
        } catch (journalError) {
          results.errors++
          results.errorDetails.push(
            `Registro ${purchase.id}: Error al crear journal en Siigo - ${journalError instanceof Error ? journalError.message : 'Error desconocido'}`
          )
        }

      } catch (error) {
        results.errors++
        results.errorDetails.push(
          `Registro ${purchase.id}: Error interno - ${error instanceof Error ? error.message : 'Error desconocido'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migración completada',
      summary: {
        total: fuelPurchases.length,
        processed: results.processed,
        errors: results.errors
      },
      details: results.errorDetails,
      migrated: results.migrated
    })

  } catch (error) {
    console.error('Error en migración a Siigo:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor durante la migración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
