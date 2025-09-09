import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const activeFilter = searchParams.get('active')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = (page - 1) * limit

    // Construir filtros
    const where: any = {}
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (activeFilter !== null && activeFilter !== '') {
      where.active = activeFilter === 'true'
    }

    // Obtener centros de costo
    const costCenters = await prisma.siigoCostCenter.findMany({
      where,
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ],
      skip: offset,
      take: limit
    })

    // Obtener estadísticas
    const stats = await prisma.siigoCostCenter.aggregate({
      _count: {
        id: true
      }
    })

    const activeCount = await prisma.siigoCostCenter.count({
      where: { active: true }
    })

    return NextResponse.json({
      success: true,
      data: costCenters,
      stats: {
        total: stats._count.id,
        active: activeCount,
        inactive: stats._count.id - activeCount
      }
    })
  } catch (error) {
    console.error('Error obteniendo centros de costo:', error)
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
