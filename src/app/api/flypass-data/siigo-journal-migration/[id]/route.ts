import { NextRequest, NextResponse } from 'next/server'
import { FlypassJournalMigrationService } from '@/lib/FlypassJournalMigrationService'

// POST - Migrar un registro individual de flypass_data a Siigo como journal
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const result = await FlypassJournalMigrationService.migrateSingleRecord(id)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Registro migrado exitosamente como journal',
        data: result.data
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error en endpoint de migración de journal individual:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
