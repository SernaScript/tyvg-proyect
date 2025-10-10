import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/project-material-prices - Obtener todos los precios de materiales por proyecto
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const projectId = searchParams.get('projectId')
    const materialId = searchParams.get('materialId')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { material: { name: { contains: search, mode: 'insensitive' } } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
        { project: { client: { name: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    // Filtro por proyecto
    if (projectId) {
      where.projectId = projectId
    }

    // Filtro por material
    if (materialId) {
      where.materialId = materialId
    }

    // Filtro de estado activo
    if (active !== null) {
      where.isActive = active === 'true'
    }

    const materialPrices = await prisma.projectMaterialPrice.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
                identification: true
              }
            }
          }
        },
        material: {
          select: {
            id: true,
            name: true,
            type: true,
            unitOfMeasure: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(materialPrices)
  } catch (error) {
    console.error('Error fetching material prices:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/project-material-prices - Crear un nuevo precio de material por proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, materialId, salePrice, outsourcedPrice, validFrom, validTo, isActive = true } = body

    // Validaciones
    if (!projectId || !materialId || !salePrice || !outsourcedPrice || !validFrom) {
      return NextResponse.json(
        { error: 'Proyecto, material, precios y fecha de inicio son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 400 }
      )
    }

    // Verificar si el material existe
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 400 }
      )
    }

    // Validar precios
    if (parseFloat(salePrice) <= 0 || parseFloat(outsourcedPrice) <= 0) {
      return NextResponse.json(
        { error: 'Los precios deben ser mayores a cero' },
        { status: 400 }
      )
    }

    // Validar fechas si se proporcionan
    if (validFrom && validTo) {
      const start = new Date(validFrom)
      const end = new Date(validTo)
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
          { status: 400 }
        )
      }
    }

    // Verificar si ya existe un precio activo para el mismo material y proyecto en el mismo período
    const existingPrice = await prisma.projectMaterialPrice.findFirst({
      where: {
        projectId,
        materialId,
        isActive: true,
        OR: [
          {
            startDate: { lte: new Date(validTo || '2099-12-31') },
            endDate: { gte: new Date(validFrom) }
          },
          {
            startDate: { lte: new Date(validTo || '2099-12-31') },
            endDate: null
          }
        ]
      }
    })

    if (existingPrice) {
      return NextResponse.json(
        { error: 'Ya existe un precio activo para este material y proyecto en el período especificado' },
        { status: 400 }
      )
    }

    // Crear el precio
    const materialPrice = await prisma.projectMaterialPrice.create({
      data: {
        projectId,
        materialId,
        salePrice: parseFloat(salePrice),
        outsourcedPrice: parseFloat(outsourcedPrice),
        startDate: new Date(validFrom),
        endDate: validTo ? new Date(validTo) : null,
        isActive
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            client: {
              select: {
                id: true,
                name: true,
                identification: true
              }
            }
          }
        },
        material: {
          select: {
            id: true,
            name: true,
            type: true,
            unitOfMeasure: true
          }
        }
      }
    })

    return NextResponse.json(materialPrice, { status: 201 })
  } catch (error) {
    console.error('Error creating material price:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

