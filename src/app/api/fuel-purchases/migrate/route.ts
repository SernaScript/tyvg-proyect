import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// POST - Migrar registros válidos de combustible a la base de datos
export async function POST(request: NextRequest) {
  try {
    const { validRecords } = await request.json()

    if (!validRecords || !Array.isArray(validRecords)) {
      return NextResponse.json(
        { error: 'No se proporcionaron registros válidos para migrar' },
        { status: 400 }
      )
    }

    if (validRecords.length === 0) {
      return NextResponse.json(
        { error: 'No hay registros válidos para migrar' },
        { status: 400 }
      )
    }

    const results = {
      migrated: 0,
      errors: 0,
      errorDetails: [] as string[],
      created: [] as any[]
    }

    // Migrar cada registro válido
    for (let i = 0; i < validRecords.length; i++) {
      const record = validRecords[i]
      
      try {
        const fuelPurchase = await (prisma as any).fuelPurchase.create({
          data: {
            date: record.date,
            vehicleId: record.vehicleId,
            quantity: record.quantity,
            total: record.total,
            provider: record.provider,
            receipt: record.receipt
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

        results.migrated++
        results.created.push(fuelPurchase)

      } catch (error) {
        results.errors++
        results.errorDetails.push(`Error al migrar registro ${i + 1}: ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Migración completada',
      summary: {
        total: validRecords.length,
        migrated: results.migrated,
        errors: results.errors
      },
      details: results.errorDetails,
      created: results.created
    })

  } catch (error) {
    console.error('Error migrating fuel purchases:', error)
    return NextResponse.json(
      { error: 'Error al migrar los registros de combustible' },
      { status: 500 }
    )
  }
}
