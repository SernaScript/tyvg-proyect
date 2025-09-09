import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const hasMovements = searchParams.get('has_movements')
    const search = searchParams.get('search')

    // Construir filtros
    const where: any = {}

    if (active !== null) {
      where.active = active === 'true'
    }

    if (hasMovements !== null) {
      where.hasMovements = hasMovements === 'true'
    }

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive'
      }
    }

    const warehouses = await prisma.siigoWarehouse.findMany({
      where,
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ]
    })

    const stats = await prisma.siigoWarehouse.aggregate({
      _count: {
        id: true
      }
    })

    const activeCount = await prisma.siigoWarehouse.count({
      where: { active: true }
    })

    return NextResponse.json({
      success: true,
      data: warehouses,
      stats: {
        total: stats._count.id,
        active: activeCount,
        inactive: stats._count.id - activeCount
      }
    })

  } catch (error) {
    console.error('Error obteniendo bodegas:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
