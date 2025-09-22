import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('Obteniendo carteras generadas...')
    
    // Obtener todas las carteras generadas ordenadas por fecha de creación
    const generatedRequests = await (prisma as any).siigoAccountsPayableGenerated.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            accountsPayable: true
          }
        }
      }
    })
    
    console.log(`Total de carteras generadas: ${generatedRequests.length}`)
    
    return NextResponse.json({
      success: true,
      data: generatedRequests
    })
    
  } catch (error) {
    console.error('Error obteniendo carteras generadas:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
