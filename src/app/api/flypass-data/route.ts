import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit
    const showOnlyPending = searchParams.get('pending') !== 'false' // Por defecto true
    
    console.log(`Obteniendo datos de flypass_data - Página ${page}, Límite ${limit}, Solo pendientes: ${showOnlyPending}`)
    
    // Construir filtro where - pendientes = accounted: false, contabilizados = accounted: true
    // Solo mostrar registros con documentType = "FC"
    const whereClause = {
      documentType: "FC",
      ...(showOnlyPending ? { accounted: false } : {})
    }
    
    // Obtener el total de registros con filtro
    const total = await prisma.flypassData.count({ where: whereClause })
    
    // Obtener los registros paginados
    const flypassData = await prisma.flypassData.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: [
        { passageDate: 'asc' },
        { createdAt: 'asc' }
      ]
    })
    
    console.log(`Total de registros: ${total}, Obtenidos: ${flypassData.length}`)
    
    // Convertir Decimal a number para serialización JSON
    const serializedData = flypassData.map(record => ({
      ...record,
      subtotal: Number(record.subtotal),
      tax: record.tax ? Number(record.tax) : null,
      total: Number(record.total),
      accounted: Boolean(record.accounted) // Asegurar que accounted sea boolean
    }))
    
    return NextResponse.json({
      success: true,
      data: serializedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
    
  } catch (error) {
    console.error('Error obteniendo datos de flypass_data:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
