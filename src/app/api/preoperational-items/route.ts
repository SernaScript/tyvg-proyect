import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/preoperational-items - Obtener todos los items preoperacionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    // Filtro de estado activo
    if (active !== null) {
      where.isActive = active === 'true'
    }

    const items = await prisma.preoperationalItem.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Error fetching preoperational items:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/preoperational-items - Crear un nuevo item preoperacional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, isActive = true } = body

    // Validaciones
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del item es requerido' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un item con ese nombre
    const existingItem = await prisma.preoperationalItem.findFirst({
      where: { name: name.trim() }
    })

    if (existingItem) {
      return NextResponse.json(
        { error: 'Ya existe un item preoperacional con ese nombre' },
        { status: 400 }
      )
    }

    // Crear el item
    const item = await prisma.preoperationalItem.create({
      data: {
        name: name.trim(),
        isActive
      }
    })

    return NextResponse.json(item, { status: 201 })
  } catch (error) {
    console.error('Error creating preoperational item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

