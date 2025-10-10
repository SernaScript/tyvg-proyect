import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trip-requests - Listar solicitudes de viaje
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const projectId = searchParams.get('projectId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { project: { name: { contains: search, mode: 'insensitive' } } },
        { project: { client: { name: { contains: search, mode: 'insensitive' } } } },
        { requestingUser: { name: { contains: search, mode: 'insensitive' } } },
        { observations: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro por proyecto
    if (projectId) {
      where.projectId = projectId
    }

    // Filtro por estado
    if (status) {
      where.status = status
    }

    // Filtro por prioridad
    if (priority) {
      where.priority = priority
    }

    // Filtro por activos
    if (active === 'true') {
      where.status = { not: 'CANCELLED' }
    }

    const tripRequests = await prisma.tripRequest.findMany({
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
        requestingUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        materials: {
          select: {
            id: true,
            requestedQuantity: true,
            unitOfMeasure: true,
            material: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        trips: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            driver: {
              select: {
                id: true,
                user: {
                  select: {
                    name: true
                  }
                }
              }
            },
            vehicle: {
              select: {
                id: true,
                plate: true
              }
            }
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { requestDate: 'desc' }
      ]
    })

    return NextResponse.json(tripRequests)
  } catch (error) {
    console.error('Error fetching trip requests:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/trip-requests - Crear una nueva solicitud de viaje
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { projectId, priority, observations, materials } = body

    // Validaciones
    if (!projectId || !materials || !Array.isArray(materials) || materials.length === 0) {
      return NextResponse.json(
        { error: 'Proyecto y materiales son requeridos' },
        { status: 400 }
      )
    }

    // Validar prioridad
    if (!['NORMAL', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        { error: 'Prioridad inválida' },
        { status: 400 }
      )
    }

    // Verificar si el proyecto existe
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 400 }
      )
    }

    // Verificar que todos los materiales existan
    const materialIds = materials.map((m: any) => m.materialId)
    const existingMaterials = await prisma.material.findMany({
      where: { 
        id: { in: materialIds },
        isActive: true
      }
    })

    if (existingMaterials.length !== materialIds.length) {
      return NextResponse.json(
        { error: 'Uno o más materiales no existen o están inactivos' },
        { status: 400 }
      )
    }

    // Validar cantidades
    for (const material of materials) {
      if (!material.requestedQuantity || parseFloat(material.requestedQuantity) <= 0) {
        return NextResponse.json(
          { error: 'Todas las cantidades deben ser mayores a cero' },
          { status: 400 }
        )
      }
    }

    // Obtener el usuario actual (por ahora usaremos un usuario por defecto)
    // TODO: Implementar autenticación real
    const requestingUser = await prisma.user.findFirst({
      where: { role: { name: 'LOGISTICS' } }
    })

    if (!requestingUser) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 400 }
      )
    }

    // Crear la solicitud con sus materiales
    const tripRequest = await prisma.tripRequest.create({
      data: {
        projectId,
        clientId: project.clientId,
        requestingUserId: requestingUser.id,
        priority,
        observations: observations || null,
        materials: {
          create: materials.map((material: any) => ({
            materialId: material.materialId,
            requestedQuantity: parseFloat(material.requestedQuantity),
            unitOfMeasure: existingMaterials.find(m => m.id === material.materialId)?.unitOfMeasure || 'un'
          }))
        }
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
        requestingUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        materials: {
          select: {
            id: true,
            requestedQuantity: true,
            unitOfMeasure: true,
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

    return NextResponse.json(tripRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating trip request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
