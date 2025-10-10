import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/materials - Obtener todos los materiales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const type = searchParams.get('type')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { unitOfMeasure: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro por tipo
    if (type) {
      where.type = type
    }

    // Filtro de estado activo
    if (active !== null) {
      where.isActive = active === 'true'
    }

    const materials = await prisma.material.findMany({
      where,
      include: {
        projectPrices: {
          where: { isActive: true },
          select: {
            id: true,
            salePrice: true,
            outsourcedPrice: true,
            startDate: true,
            endDate: true,
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(materials)
  } catch (error) {
    console.error('Error fetching materials:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/materials - Crear un nuevo material
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, unitOfMeasure, isActive = true } = body

    // Validaciones
    if (!name || !type || !unitOfMeasure) {
      return NextResponse.json(
        { error: 'Nombre, tipo y unidad de medida son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['STOCKED', 'NON_STOCKED'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de material inválido' },
        { status: 400 }
      )
    }

    // Validar unidad de medida
    if (!['m³', 'ton'].includes(unitOfMeasure)) {
      return NextResponse.json(
        { error: 'Unidad de medida inválida. Solo se permiten m³ o ton' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un material con ese nombre
    const existingMaterial = await prisma.material.findFirst({
      where: { name }
    })

    if (existingMaterial) {
      return NextResponse.json(
        { error: 'Ya existe un material con ese nombre' },
        { status: 400 }
      )
    }

    // Crear el material
    const material = await prisma.material.create({
      data: {
        name,
        description: description || null,
        type,
        unitOfMeasure,
        isActive
      },
      include: {
        projectPrices: {
          where: { isActive: true },
          select: {
            id: true,
            salePrice: true,
            outsourcedPrice: true,
            startDate: true,
            endDate: true,
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(material, { status: 201 })
  } catch (error) {
    console.error('Error creating material:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

