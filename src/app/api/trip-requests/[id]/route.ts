import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/trip-requests/[id] - Obtener una solicitud de viaje específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: params.id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            address: true,
            client: {
              select: {
                id: true,
                name: true,
                identification: true,
                email: true,
                phone: true
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
                type: true,
                unitOfMeasure: true,
                description: true
              }
            }
          }
        },
        trips: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            waybillNumber: true,
            driver: {
              select: {
                id: true,
                identification: true,
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true
              }
            }
          }
        }
      }
    })

    if (!tripRequest) {
      return NextResponse.json(
        { error: 'Solicitud de viaje no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(tripRequest)
  } catch (error) {
    console.error('Error fetching trip request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/trip-requests/[id] - Actualizar una solicitud de viaje
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { priority, status, observations, materials } = body

    // Verificar si la solicitud existe
    const existingTripRequest = await prisma.tripRequest.findUnique({
      where: { id: params.id },
      include: {
        trips: true
      }
    })

    if (!existingTripRequest) {
      return NextResponse.json(
        { error: 'Solicitud de viaje no encontrada' },
        { status: 404 }
      )
    }

    // Validar que no se pueda modificar si ya tiene viajes programados
    if (existingTripRequest.trips.length > 0 && status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'No se puede cancelar una solicitud que ya tiene viajes programados' },
        { status: 400 }
      )
    }

    // Validar prioridad
    if (priority && !['NORMAL', 'URGENT'].includes(priority)) {
      return NextResponse.json(
        { error: 'Prioridad inválida' },
        { status: 400 }
      )
    }

    // Validar estado
    if (status && !['PENDING', 'SCHEDULED', 'CANCELLED'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Si se están actualizando materiales, validar que existan
    if (materials && Array.isArray(materials)) {
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
    }

    // Actualizar la solicitud
    const updatedTripRequest = await prisma.tripRequest.update({
      where: { id: params.id },
      data: {
        priority: priority || existingTripRequest.priority,
        status: status || existingTripRequest.status,
        observations: observations !== undefined ? observations : existingTripRequest.observations,
        ...(materials && {
          materials: {
            deleteMany: {},
            create: materials.map((material: any) => ({
              materialId: material.materialId,
              requestedQuantity: parseFloat(material.requestedQuantity),
              unitOfMeasure: existingMaterials.find(m => m.id === material.materialId)?.unitOfMeasure || 'un'
            }))
          }
        })
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
      }
    })

    return NextResponse.json(updatedTripRequest)
  } catch (error) {
    console.error('Error updating trip request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/trip-requests/[id] - Eliminar una solicitud de viaje
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si la solicitud existe
    const existingTripRequest = await prisma.tripRequest.findUnique({
      where: { id: params.id },
      include: {
        trips: true,
        materials: true
      }
    })

    if (!existingTripRequest) {
      return NextResponse.json(
        { error: 'Solicitud de viaje no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene viajes asociados
    if (existingTripRequest.trips.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una solicitud que tiene viajes asociados' },
        { status: 400 }
      )
    }

    // Eliminar la solicitud (los materiales se eliminan por cascade)
    await prisma.tripRequest.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Solicitud eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting trip request:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
