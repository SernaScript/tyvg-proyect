import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    console.log(`Obteniendo registros para cartera generada: ${id}`)
    
    // Obtener la información de la cartera generada
    const generatedRequest = await (prisma as any).siigoAccountsPayableGenerated.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            accountsPayable: true
          }
        }
      }
    })
    
    if (!generatedRequest) {
      return NextResponse.json({
        success: false,
        error: 'Cartera generada no encontrada'
      }, { status: 404 })
    }
    
    // Obtener todos los registros relacionados
    const accountsPayable = await (prisma as any).siigoAccountsPayable.findMany({
      where: { generatedRequestId: id },
      orderBy: [
        { dueDate: 'desc' },
        { createdAt: 'desc' }
      ]
    })
    
    console.log(`Registros encontrados para cartera ${id}: ${accountsPayable.length}`)
    
    // Convertir BigInt a string para serialización JSON
    const serializedRecords = accountsPayable.map((record: any) => ({
      ...record,
      consecutive: record.consecutive.toString()
    }))
    
    return NextResponse.json({
      success: true,
      data: {
        generatedRequest,
        accountsPayable: serializedRecords,
        total: serializedRecords.length
      }
    })
    
  } catch (error) {
    console.error('Error obteniendo registros de cartera:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
