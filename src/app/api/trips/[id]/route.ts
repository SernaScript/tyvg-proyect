import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        tripRequest: {
          include: {
            project: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    identification: true
                  }
                }
              }
            },
            materials: {
              include: {
                material: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    unitOfMeasure: true
                  }
                }
              }
            }
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            identification: true,
            license: true,
            phone: true,
            email: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            capacityTons: true,
            capacityM3: true,
            ownershipType: true
          }
        },
        materials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                type: true,
                unitOfMeasure: true
              }
            }
          }
        },
        evidences: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            description: true,
            createdAt: true
          }
        },
        expenses: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            createdAt: true
          }
        },
        audits: {
          select: {
            id: true,
            action: true,
            details: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!trip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error fetching trip:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const {
      driverId,
      vehicleId,
      waybillNumber,
      scheduledDate,
      actualStartDate,
      actualEndDate,
      status,
      certifiedWeight,
      observations
    } = body

    // Verificar que el viaje existe
    const existingTrip = await prisma.trip.findUnique({
      where: { id: params.id }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Validaciones
    if (driverId) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId },
        include: { user: true }
      })

      if (!driver || !driver.isActive) {
        return NextResponse.json(
          { message: 'El conductor no existe o no está activo' },
          { status: 400 }
        )
      }
    }

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      })

      if (!vehicle || !vehicle.isActive) {
        return NextResponse.json(
          { message: 'El vehículo no existe o no está activo' },
          { status: 400 }
        )
      }
    }

    if (scheduledDate) {
      const scheduledDateTime = new Date(scheduledDate)
      if (scheduledDateTime < new Date()) {
        return NextResponse.json(
          { message: 'La fecha programada no puede ser en el pasado' },
          { status: 400 }
        )
      }
    }

    if (actualStartDate) {
      const startDateTime = new Date(actualStartDate)
      if (startDateTime > new Date()) {
        return NextResponse.json(
          { message: 'La fecha de inicio no puede ser en el futuro' },
          { status: 400 }
        )
      }
    }

    if (actualEndDate) {
      const endDateTime = new Date(actualEndDate)
      if (endDateTime > new Date()) {
        return NextResponse.json(
          { message: 'La fecha de finalización no puede ser en el futuro' },
          { status: 400 }
        )
      }
    }

    if (actualStartDate && actualEndDate) {
      const startDateTime = new Date(actualStartDate)
      const endDateTime = new Date(actualEndDate)
      if (endDateTime < startDateTime) {
        return NextResponse.json(
          { message: 'La fecha de finalización no puede ser anterior a la fecha de inicio' },
          { status: 400 }
        )
      }
    }

    if (certifiedWeight && (isNaN(certifiedWeight) || certifiedWeight <= 0)) {
      return NextResponse.json(
        { message: 'El peso certificado debe ser mayor a 0' },
        { status: 400 }
      )
    }

    if (status && !['SCHEDULED', 'LOADING', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'INVOICED'].includes(status)) {
      return NextResponse.json(
        { message: 'Estado de viaje inválido' },
        { status: 400 }
      )
    }

    // Preparar datos para actualización
    const updateData: any = {}
    
    if (driverId !== undefined) updateData.driverId = driverId
    if (vehicleId !== undefined) updateData.vehicleId = vehicleId
    if (waybillNumber !== undefined) updateData.waybillNumber = waybillNumber
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate)
    if (actualStartDate !== undefined) updateData.actualStartDate = actualStartDate ? new Date(actualStartDate) : null
    if (actualEndDate !== undefined) updateData.actualEndDate = actualEndDate ? new Date(actualEndDate) : null
    if (status !== undefined) updateData.status = status
    if (certifiedWeight !== undefined) updateData.certifiedWeight = certifiedWeight ? parseFloat(certifiedWeight) : null
    if (observations !== undefined) updateData.observations = observations

    // Actualizar el viaje
    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
      include: {
        tripRequest: {
          include: {
            project: {
              include: {
                client: {
                  select: {
                    id: true,
                    name: true,
                    identification: true
                  }
                }
              }
            },
            materials: {
              include: {
                material: {
                  select: {
                    id: true,
                    name: true,
                    type: true,
                    unitOfMeasure: true
                  }
                }
              }
            }
          }
        },
        driver: {
          select: {
            id: true,
            name: true,
            identification: true,
            license: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            capacityTons: true,
            capacityM3: true
          }
        },
        materials: {
          include: {
            material: {
              select: {
                id: true,
                name: true,
                type: true,
                unitOfMeasure: true
              }
            }
          }
        },
        evidences: {
          select: {
            id: true,
            type: true,
            fileUrl: true,
            description: true,
            createdAt: true
          }
        },
        expenses: {
          select: {
            id: true,
            type: true,
            amount: true,
            description: true,
            createdAt: true
          }
        }
      }
    })

    return NextResponse.json(trip)
  } catch (error) {
    console.error('Error updating trip:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar que el viaje existe
    const existingTrip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        tripRequest: true,
        evidences: true,
        expenses: true,
        materials: true,
        audits: true
      }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el viaje se puede eliminar (solo si está programado)
    if (existingTrip.status !== 'SCHEDULED') {
      return NextResponse.json(
        { message: 'Solo se pueden eliminar viajes programados' },
        { status: 400 }
      )
    }

    // Eliminar el viaje (esto eliminará automáticamente las relaciones debido a onDelete: Cascade)
    await prisma.trip.delete({
      where: { id: params.id }
    })

    // Actualizar el estado de la solicitud de viaje a PENDING
    await prisma.tripRequest.update({
      where: { id: existingTrip.tripRequestId },
      data: { status: 'PENDING' }
    })

    return NextResponse.json({ message: 'Viaje eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting trip:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
