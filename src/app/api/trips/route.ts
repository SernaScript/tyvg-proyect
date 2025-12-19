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
    const isApproved = searchParams.get('isApproved')
    const projectId = searchParams.get('projectId')
    const driverId = searchParams.get('driverId')
    const materialId = searchParams.get('materialId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    // Get current user to filter by driver if needed
    let currentDriverId: string | null = null

    // If user is a driver, get their driverId
    if (currentUser && currentUser.role.name === RoleName.DRIVER) {
      const driver = await prisma.driver.findUnique({
        where: { userId: currentUser.id },
        select: { id: true }
      })
      if (driver) {
        currentDriverId = driver.id
      }
    }

    // If driverId is passed as parameter and user is not a driver, use the parameter
    // If user is a driver, always use their own driverId
    const requestedDriverId = driverId
    if (requestedDriverId && !currentDriverId) {
      currentDriverId = requestedDriverId
    }

    const where: any = {}

    // If there is a driverId (from current driver or parameter), filter by it
    if (currentDriverId) {
      where.driverId = currentDriverId
    }

    if (search) {
      where.OR = [
        { incomingReceiptNumber: { contains: search, mode: 'insensitive' } },
        { outcomingReceiptNumber: { contains: search, mode: 'insensitive' } },
        { project: { name: { contains: search, mode: 'insensitive' } } },
        { project: { client: { name: { contains: search, mode: 'insensitive' } } } },
        { driver: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: search, mode: 'insensitive' } } },
        { material: { name: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (isApproved !== null && isApproved !== undefined && isApproved !== 'all') {
      where.isApproved = isApproved === 'true'
    }

    if (projectId) {
      where.projectId = projectId
    }

    if (materialId) {
      where.materialId = materialId
    }

    if (dateFrom) {
      where.date = { ...where.date, gte: new Date(dateFrom) }
    }

    if (dateTo) {
      where.date = { ...where.date, lte: new Date(dateTo) }
    }

    const [trips, total] = await Promise.all([
      prisma.trip.findMany({
        where,
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
        },
        orderBy: [
          { date: 'desc' },
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
      observation
    } = body

    // Validations
    if (!materialId) {
      return NextResponse.json(
        { message: 'El material es requerido' },
        { status: 400 }
      )
    }

    if (!projectId) {
      return NextResponse.json(
        { message: 'El proyecto es requerido' },
        { status: 400 }
      )
    }

    if (!date) {
      return NextResponse.json(
        { message: 'La fecha es requerida' },
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

    if (!quantity || parseFloat(quantity) <= 0) {
      return NextResponse.json(
        { message: 'La cantidad debe ser mayor a cero' },
        { status: 400 }
      )
    }

    if (!measure || !['METROS_CUBICOS', 'TONELADAS'].includes(measure)) {
      return NextResponse.json(
        { message: 'La medida debe ser METROS_CUBICOS o TONELADAS' },
        { status: 400 }
      )
    }

    // Verify that the material exists and is active
    const material = await prisma.material.findUnique({
      where: { id: materialId }
    })

    if (!material || !material.isActive) {
      return NextResponse.json(
        { message: 'El material no existe o no está activo' },
        { status: 400 }
      )
    }

    // Verify that the project exists and is active
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })

    if (!project || !project.isActive) {
      return NextResponse.json(
        { message: 'El proyecto no existe o no está activo' },
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

    // Verify invoice if provided
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

    // Parse date
    const tripDate = new Date(date)
    if (isNaN(tripDate.getTime())) {
      return NextResponse.json(
        { message: 'La fecha es inválida' },
        { status: 400 }
      )
    }

    // Create the trip
    const trip = await prisma.trip.create({
      data: {
        materialId,
        projectId,
        date: tripDate,
        driverId,
        vehicleId,
        incomingReceiptNumber: incomingReceiptNumber || null,
        outcomingReceiptNumber: outcomingReceiptNumber || null,
        quantity: parseFloat(quantity),
        measure: measure as 'METROS_CUBICOS' | 'TONELADAS',
        salePrice: salePrice ? parseFloat(salePrice) : 0,
        outsourcedPrice: outsourcedPrice ? parseFloat(outsourcedPrice) : 0,
        invoiceId: invoiceId || null,
        observation: observation || null,
        createdBy: currentUser.id,
        updatedBy: currentUser.id
      },
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
        }
      }
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
