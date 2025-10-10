import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects - Obtener todos los proyectos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const clientId = searchParams.get('clientId')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
        { client: { identification: { contains: search } } }
      ]
    }

    // Filtro por cliente
    if (clientId) {
      where.clientId = clientId
    }

    // Filtro de estado activo
    if (active !== null) {
      where.isActive = active === 'true'
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        client: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        materials: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            material: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(projects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/projects - Crear un nuevo proyecto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, address, clientId, startDate, endDate, isActive = true } = body

    // Validaciones
    if (!name || !clientId) {
      return NextResponse.json(
        { error: 'Nombre y cliente son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un proyecto con ese nombre para el mismo cliente
    const existingProject = await prisma.project.findFirst({
      where: {
        name,
        clientId
      }
    })

    if (existingProject) {
      return NextResponse.json(
        { error: 'Ya existe un proyecto con ese nombre para este cliente' },
        { status: 400 }
      )
    }

    // Validar fechas si se proporcionan
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
          { status: 400 }
        )
      }
    }

    // Crear el proyecto
    const project = await prisma.project.create({
      data: {
        name,
        description: description || null,
        address: address || null,
        clientId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        materials: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            material: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
