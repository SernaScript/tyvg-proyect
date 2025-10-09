import { NextRequest, NextResponse } from 'next/server'
import { FlypassJournalMigrationService } from '@/lib/FlypassJournalMigrationService'

// POST - Migrar registros de flypass_data a Siigo como journals
export async function POST(request: NextRequest) {
  try {
    const result = await FlypassJournalMigrationService.migrateMultipleRecords()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Migración masiva de journals completada',
        results: result.results
      })
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error 
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error en endpoint de migración masiva de journals:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}

// GET - Obtener estadísticas de registros pendientes de migración como journals
export async function GET(request: NextRequest) {
  try {
    const stats = await FlypassJournalMigrationService.getPendingJournalStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error obteniendo estadísticas de journals pendientes:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    )
  }
}
