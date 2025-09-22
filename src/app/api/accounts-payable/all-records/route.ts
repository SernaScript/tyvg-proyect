import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Obteniendo todos los registros de cuentas por pagar desde la base de datos...')
    
    // Obtener todos los registros de la base de datos
    const allRecords = await (prisma as any).siigoAccountsPayable.findMany({
      orderBy: [
        { dueDate: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`Total de registros obtenidos de la BD: ${allRecords.length}`)
    
    // Convertir BigInt a string para serialización JSON
    const serializedRecords = allRecords.map((record: any) => ({
      ...record,
      consecutive: record.consecutive.toString()
    }))
    
    return NextResponse.json({
      success: true,
      data: serializedRecords,
      total: serializedRecords.length
    })
    
  } catch (error) {
    console.error('Error obteniendo todos los registros:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
