import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

// POST - Migrar registros de flypass_data a Siigo purchases
export async function POST(request: NextRequest) {
  try {
    // Obtener todos los registros de flypass_data pendientes de migración
    // Solo procesar registros con documentType = "FC"
    const flypassData = await prisma.flypassData.findMany({
      where: { 
        accounted: false,
        documentType: "FC"
      },
      orderBy: {
        creationDate: 'asc'
      }
    })

    if (flypassData.length === 0) {
      return NextResponse.json(
        { error: 'No hay registros pendientes de migración' },
        { status: 400 }
      )
    }

    const results = {
      processed: 0,
      errors: 0,
      errorDetails: [] as string[],
      migrated: [] as any[]
    }

    // Procesar cada registro de flypass_data
    for (const record of flypassData) {
      try {
        // Buscar cost_center basado en license_plate
        const costCenter = await prisma.siigoCostCenter.findFirst({
          where: {
            name: record.licensePlate
          }
        })

        if (!costCenter) {
          results.errors++
          results.errorDetails.push(
            `Registro ${record.id}: No se encontró cost_center para la placa '${record.licensePlate}'`
          )
          continue
        }

        // Parsear documentNumber para obtener prefix y number
        const documentParts = record.documentNumber.split('-')
        const prefix = documentParts[0] || ''
        const number = documentParts.slice(1).join('-') || ''

        // Construir el purchase para Siigo
        const purchaseData = {
          document: {
            id: 39037
          },
          date: record.creationDate.toISOString().split('T')[0], // YYYY-MM-DD
          supplier: {
            identification: "900219834",
            branch_office: 0
          },
          cost_center: costCenter.id,
          provider_invoice: {
            prefix: prefix,
            number: number
          },
          observations: record.cufe,
          discount_type: "Value",
          supplier_by_item: false,
          tax_included: false,
          items: [
            {
              type: "Account",
              code: "61459501",
              description: record.description,
              quantity: 1,
              price: Number(record.subtotal)
            }
          ],
          payments: [
            {
              id: 71,
              value: Number(record.subtotal),
              due_date: record.creationDate.toISOString().split('T')[0]
            }
          ]
        }

        // Crear purchase en Siigo usando SiigoService
        try {
          const purchaseResult = await SiigoService.createPurchase(purchaseData)

          // Marcar el registro como contabilizado (accounted: true)
          await prisma.flypassData.update({
            where: { id: record.id },
            data: { accounted: true }
          })

          results.processed++
          results.migrated.push({
            id: record.id,
            licensePlate: record.licensePlate,
            creationDate: record.creationDate,
            subtotal: record.subtotal,
            cufe: record.cufe,
            siigoPurchaseId: purchaseResult.id || 'N/A'
          })
        } catch (purchaseError) {
          results.errors++
          results.errorDetails.push(
            `Registro ${record.id}: Error al crear purchase en Siigo - ${purchaseError instanceof Error ? purchaseError.message : 'Error desconocido'}`
          )
        }

      } catch (error) {
        results.errors++
        results.errorDetails.push(
          `Registro ${record.id}: Error interno - ${error instanceof Error ? error.message : 'Error desconocido'}`
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Migración completada',
      summary: {
        total: flypassData.length,
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
