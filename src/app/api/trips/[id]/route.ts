import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const trip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        material: {
          select: {
            id: true,
            name: true,
            type: true,
            unitOfMeasure: true
          }
        },
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
        driver: {
          select: {
            id: true,
            name: true,
            identification: true,
            license: true,
            phone: true
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updater: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        evidences: {
          select: {
            id: true,
            photoUrl: true,
            description: true,
            latitude: true,
            longitude: true,
            dateTime: true,
            createdAt: true,
            uploadedByUser: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        audits: {
          select: {
            id: true,
            action: true,
            previousData: true,
            newData: true,
            timestamp: true,
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
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      materialId,
      projectId,
      date,
      driverId,
      vehicleId,
      incomingReceiptNumber,
      outcomingReceiptNumber,
      quantity,
      measure,
      salePrice,
      outsourcedPrice,
      invoiceId,
      isApproved,
      observation
    } = body

    // Verify that the trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: params.id }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {}

    if (materialId !== undefined) {
      const material = await prisma.material.findUnique({
        where: { id: materialId }
      })
      if (!material || !material.isActive) {
        return NextResponse.json(
          { message: 'El material no existe o no está activo' },
          { status: 400 }
        )
      }
      updateData.materialId = materialId
    }

    if (projectId !== undefined) {
      const project = await prisma.project.findUnique({
        where: { id: projectId }
      })
      if (!project || !project.isActive) {
        return NextResponse.json(
          { message: 'El proyecto no existe o no está activo' },
          { status: 400 }
        )
      }
      updateData.projectId = projectId
    }

    if (date !== undefined) {
      const tripDate = new Date(date)
      if (isNaN(tripDate.getTime())) {
        return NextResponse.json(
          { message: 'La fecha es inválida' },
          { status: 400 }
        )
      }
      updateData.date = tripDate
    }

    if (driverId !== undefined) {
      const driver = await prisma.driver.findUnique({
        where: { id: driverId }
      })
      if (!driver || !driver.isActive) {
        return NextResponse.json(
          { message: 'El conductor no existe o no está activo' },
          { status: 400 }
        )
      }
      updateData.driverId = driverId
    }

    if (vehicleId !== undefined) {
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      })
      if (!vehicle || !vehicle.isActive) {
        return NextResponse.json(
          { message: 'El vehículo no existe o no está activo' },
          { status: 400 }
        )
      }
      updateData.vehicleId = vehicleId
    }

    if (incomingReceiptNumber !== undefined) {
      updateData.incomingReceiptNumber = incomingReceiptNumber || null
    }

    if (outcomingReceiptNumber !== undefined) {
      updateData.outcomingReceiptNumber = outcomingReceiptNumber || null
    }

    if (quantity !== undefined) {
      if (parseFloat(quantity) <= 0) {
        return NextResponse.json(
          { message: 'La cantidad debe ser mayor a cero' },
          { status: 400 }
        )
      }
      updateData.quantity = parseFloat(quantity)
    }

    if (measure !== undefined) {
      if (!['METROS_CUBICOS', 'TONELADAS'].includes(measure)) {
        return NextResponse.json(
          { message: 'La medida debe ser METROS_CUBICOS o TONELADAS' },
          { status: 400 }
        )
      }
      updateData.measure = measure
    }

    if (salePrice !== undefined) {
      updateData.salePrice = salePrice ? parseFloat(salePrice) : 0
    }

    if (outsourcedPrice !== undefined) {
      updateData.outsourcedPrice = outsourcedPrice ? parseFloat(outsourcedPrice) : 0
    }

    if (invoiceId !== undefined) {
      if (invoiceId) {
        const invoice = await prisma.invoice.findUnique({
          where: { id: invoiceId }
        })
        if (!invoice) {
          return NextResponse.json(
            { message: 'La factura no existe' },
            { status: 400 }
          )
        }
      }
      updateData.invoiceId = invoiceId || null
    }

    // Handle approval
    if (isApproved !== undefined) {
      updateData.isApproved = isApproved
      if (isApproved && !existingTrip.isApproved) {
        // Trip is being approved
        updateData.approvedAt = new Date()
      } else if (!isApproved && existingTrip.isApproved) {
        // Trip is being unapproved
        updateData.approvedAt = null
      }
    }

    if (observation !== undefined) {
      updateData.observation = observation || null
    }

    // Always update updatedBy
    updateData.updatedBy = currentUser.id

    // Update the trip
    const trip = await prisma.trip.update({
      where: { id: params.id },
      data: updateData,
      include: {
        material: {
          select: {
            id: true,
            name: true,
            type: true,
            unitOfMeasure: true
          }
        },
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
        invoice: {
          select: {
            id: true,
            invoiceNumber: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updater: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        evidences: {
          select: {
            id: true,
            photoUrl: true,
            description: true,
            dateTime: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
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
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verify that the trip exists
    const existingTrip = await prisma.trip.findUnique({
      where: { id: params.id },
      include: {
        evidences: true,
        audits: true
      }
    })

    if (!existingTrip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Delete the trip (this will automatically delete related records due to onDelete: Cascade)
    await prisma.trip.delete({
      where: { id: params.id }
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
