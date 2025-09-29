import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

// POST - Migrar un registro individual de flypass_data a Siigo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener el registro específico de flypass_data
    const flypassRecord = await prisma.flypassData.findFirst({
      where: { 
        id,
        accounted: false, // Solo registros pendientes de migración
        documentType: "FC" // Solo registros con documentType = "FC"
      }
    })

    if (!flypassRecord) {
      return NextResponse.json(
        { error: 'Registro no encontrado o ya contabilizado' },
        { status: 404 }
      )
    }

    // Buscar cost_center basado en license_plate
    const costCenter = await prisma.siigoCostCenter.findFirst({
      where: {
        name: flypassRecord.licensePlate
      }
    })

    if (!costCenter) {
      return NextResponse.json(
        { 
          error: `No se encontró cost_center para la placa '${flypassRecord.licensePlate}' en siigo_cost_centers` 
        },
        { status: 400 }
      )
    }

    // Parsear documentNumber para obtener prefix y number
    const documentParts = flypassRecord.documentNumber.split('-')
    const prefix = documentParts[0] || ''
    const number = documentParts.slice(1).join('-') || ''

    // Construir el purchase para Siigo
    const purchaseData = {
      document: {
        id: 39037
      },
      date: flypassRecord.creationDate.toISOString().split('T')[0], // YYYY-MM-DD
      supplier: {
        identification: "900219834",
        branch_office: 0
      },
      cost_center: costCenter.id,
      provider_invoice: {
        prefix: prefix,
        number: number
      },
      observations: flypassRecord.cufe,
      discount_type: "Value",
      supplier_by_item: false,
      tax_included: false,
      items: [
        {
          type: "Account",
          code: "61459501",
          description: flypassRecord.description,
          quantity: 1,
          price: Number(flypassRecord.subtotal)
        }
      ],
      payments: [
        {
          id: 71,
          value: Number(flypassRecord.subtotal),
          due_date: flypassRecord.creationDate.toISOString().split('T')[0]
        }
      ]
    }

    const debugInfo = {
      flypassRecord: {
        id: flypassRecord.id,
        licensePlate: flypassRecord.licensePlate,
        documentNumber: flypassRecord.documentNumber,
        subtotal: flypassRecord.subtotal,
        cufe: flypassRecord.cufe
      },
      costCenter: {
        id: costCenter.id,
        name: costCenter.name
      },
      request: {
        method: 'POST',
        url: 'https://api.siigo.com/v1/purchases',
        body: purchaseData
      }
    }

    // Crear purchase en Siigo usando SiigoService
    try {
      const purchaseResult = await SiigoService.createPurchase(purchaseData)
      
      // Marcar el registro como contabilizado (accounted: true)
      await prisma.flypassData.update({
        where: { id },
        data: { accounted: true }
      })

      return NextResponse.json({
        success: true,
        message: 'Registro migrado exitosamente',
        data: {
          id: flypassRecord.id,
          licensePlate: flypassRecord.licensePlate,
          creationDate: flypassRecord.creationDate,
          subtotal: flypassRecord.subtotal,
          cufe: flypassRecord.cufe,
          siigoPurchaseId: purchaseResult.id || 'N/A'
        },
        debugInfo: {
          ...debugInfo,
          response: {
            status: 200,
            body: purchaseResult
          }
        }
      })
    } catch (error) {
      return NextResponse.json(
        { 
          error: 'Error al crear purchase en Siigo',
          details: error instanceof Error ? error.message : 'Error desconocido',
          debugInfo: {
            ...debugInfo,
            error: {
              purchaseError: error instanceof Error ? error.message : 'Error desconocido'
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
