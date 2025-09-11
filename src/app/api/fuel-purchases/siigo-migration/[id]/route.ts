import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

// POST - Migrar un registro individual de combustible a Siigo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener el registro específico de combustible
    const fuelPurchase = await (prisma as any).fuelPurchase.findUnique({
      where: { 
        id,
        state: true // Solo registros pendientes de migración
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    if (!fuelPurchase) {
      return NextResponse.json(
        { error: 'Registro no encontrado o ya migrado' },
        { status: 404 }
      )
    }

    // Mapeo de proveedores
    const providerMapping: { [key: string]: string } = {
      'CORALINAS': '811038233',
      'SOTO 13': '901039186'
    }

    // Validar proveedor
    const providerId = providerMapping[fuelPurchase.provider]
    if (!providerId) {
      return NextResponse.json(
        { 
          error: `Proveedor '${fuelPurchase.provider}' no está mapeado. Proveedores válidos: CORALINAS, SOTO 13` 
        },
        { status: 400 }
      )
    }

    // Buscar cost_center en siigo_cost_centers basado en la placa del vehículo
    const costCenter = await (prisma as any).siigoCostCenter.findFirst({
      where: {
        name: fuelPurchase.vehicle.plate
      }
    })

    if (!costCenter) {
      return NextResponse.json(
        { 
          error: `No se encontró cost_center para la placa '${fuelPurchase.vehicle.plate}' en siigo_cost_centers` 
        },
        { status: 400 }
      )
    }

    // Construir el journal para Siigo
    const journalData = {
      document: {
        id: 39068
      },
      date: fuelPurchase.date.toISOString().split('T')[0], // Formato YYYY-MM-DD
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
          description: `COMBUSTIBLE RECIBO ${fuelPurchase.receipt || ''}`.trim(),
          cost_center: costCenter.id,
          value: parseFloat(fuelPurchase.total.toString())
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
          description: `COMBUSTIBLE RECIBO ${fuelPurchase.receipt || ''}`.trim(),
          cost_center: 518,
          value: parseFloat(fuelPurchase.total.toString())
        }
      ],
      observations: `Migración automática - Vehículo: ${fuelPurchase.vehicle.plate} (${fuelPurchase.vehicle.brand} ${fuelPurchase.vehicle.model})`
    }

    // Guardar información de debug
    const debugInfo = {
      request: {
        url: 'https://api.siigo.com/v1/journals',
        method: 'POST',
        body: journalData
      }
    }

    // Crear journal en Siigo usando SiigoService
    try {
      const journalResult = await SiigoService.createJournal(journalData)
      
      // Marcar el registro como migrado (cambiar state a false)
      await (prisma as any).fuelPurchase.update({
        where: { id },
        data: { state: false }
      })

      return NextResponse.json({
        success: true,
        message: 'Registro migrado exitosamente',
        data: {
          id: fuelPurchase.id,
          plate: fuelPurchase.vehicle.plate,
          date: fuelPurchase.date,
          total: fuelPurchase.total,
          provider: fuelPurchase.provider,
          siigoJournalId: journalResult.id || 'N/A'
        },
        debugInfo: {
          ...debugInfo,
          response: {
            status: 200,
            body: journalResult
          }
        }
      })
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Error al crear journal en Siigo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          debugInfo: {
            ...debugInfo,
            error: {
              journalError: error instanceof Error ? error.message : 'Error desconocido'
            }
          }
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en migración individual a Siigo:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor durante la migración',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
