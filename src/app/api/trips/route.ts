import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { RoleName } from '@/types/auth'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Get current user to filter by driver if needed
    let driverId: string | null = null

    // If user is a driver, get their driverId
    if (currentUser && currentUser.role.name === RoleName.DRIVER) {
      const driver = await prisma.driver.findUnique({
        where: { userId: currentUser.id },
        select: { id: true }
      })
      if (driver) {
        driverId = driver.id
      }
    }

    // If driverId is passed as parameter and user is not a driver, use the parameter
    // If user is a driver, always use their own driverId
    const requestedDriverId = searchParams.get('driverId')
    if (requestedDriverId && !driverId) {
      driverId = requestedDriverId
    }

    const where: any = {}

    // If there is a driverId (from current driver or parameter), filter by it
    if (driverId) {
      where.driverId = driverId
    }

    if (search) {
      where.OR = [
        { waybillNumber: { contains: search, mode: 'insensitive' } },
        { tripRequest: { project: { name: { contains: search, mode: 'insensitive' } } } },
        { tripRequest: { project: { client: { name: { contains: search, mode: 'insensitive' } } } } },
        { driver: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (priority && priority !== 'all') {
      where.tripRequest = { ...where.tripRequest, priority }
    }


    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
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
          }
        },
        orderBy: [
          { scheduledDate: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.trip.count({ where })
    ])

    return NextResponse.json(trips)
  } catch (error) {
    console.error('Error fetching trips:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
      tripRequestId,
      driverId,
      vehicleId,
      waybillNumber,
      scheduledDate,
      certifiedWeight,
      observations
    } = body

    // Validations
    if (!tripRequestId) {
      return NextResponse.json(
        { message: 'La solicitud de viaje es requerida' },
        { status: 400 }
      )
    }

    if (!driverId) {
      return NextResponse.json(
        { message: 'El conductor es requerido' },
        { status: 400 }
      )
    }

    if (!vehicleId) {
      return NextResponse.json(
        { message: 'El vehículo es requerido' },
        { status: 400 }
      )
    }

    if (!scheduledDate) {
      return NextResponse.json(
        { message: 'La fecha programada es requerida' },
        { status: 400 }
      )
    }

    // Verify that the trip request exists and is pending
    const tripRequest = await prisma.tripRequest.findUnique({
      where: { id: tripRequestId },
      include: {
        trips: true
      }
    })

    if (!tripRequest) {
      return NextResponse.json(
        { message: 'La solicitud de viaje no existe' },
        { status: 404 }
      )
    }

    if (tripRequest.status !== 'PENDING') {
      return NextResponse.json(
        { message: 'La solicitud de viaje ya no está pendiente' },
        { status: 400 }
      )
    }

    // Verify that the driver exists and is active
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

    // Verify that the vehicle exists and is active
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle || !vehicle.isActive) {
      return NextResponse.json(
        { message: 'El vehículo no existe o no está activo' },
        { status: 400 }
      )
    }

    // Verify that the scheduled date is not in the past
    const scheduledDateTime = new Date(scheduledDate)
    if (scheduledDateTime < new Date()) {
      return NextResponse.json(
        { message: 'La fecha programada no puede ser en el pasado' },
        { status: 400 }
      )
    }

    // Verify that the certified weight is valid if provided
    if (certifiedWeight && (isNaN(certifiedWeight) || certifiedWeight <= 0)) {
      return NextResponse.json(
        { message: 'El peso certificado debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        tripRequestId,
        driverId,
        vehicleId,
        waybillNumber: waybillNumber || null,
        scheduledDate: scheduledDateTime,
        certifiedWeight: certifiedWeight ? parseFloat(certifiedWeight) : null,
        observations: observations || null,
        status: 'SCHEDULED'
      },
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
        }
      }
    })

    // Update the trip request status to SCHEDULED
    await prisma.tripRequest.update({
      where: { id: tripRequestId },
      data: { status: 'SCHEDULED' }
    })

    return NextResponse.json(trip, { status: 201 })
  } catch (error) {
    console.error('Error creating trip:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
