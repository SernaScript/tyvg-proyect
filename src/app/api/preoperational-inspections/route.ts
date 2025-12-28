import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/preoperational-inspections - Obtener todas las inspecciones preoperacionales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const vehicleId = searchParams.get('vehicleId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: any = {}

    // Filtro por conductor
    if (driverId) {
      where.driverId = driverId
    }

    // Filtro por vehículo
    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    // Filtro por rango de fechas
    if (dateFrom || dateTo) {
      where.inspectionDate = {}
      if (dateFrom) {
        where.inspectionDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.inspectionDate.lte = new Date(dateTo)
      }
    }

    // Obtener total de registros
    const total = await prisma.preoperationalInspection.count({ where })

    // Obtener inspecciones paginadas
    const inspections = await prisma.preoperationalInspection.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        },
        details: {
          include: {
            item: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        inspectionDate: 'desc' // Más reciente primero
      },
      skip,
      take: limit
    })

    return NextResponse.json({
      inspections,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching preoperational inspections:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/preoperational-inspections - Crear una nueva inspección preoperacional
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      inspectionDate, 
      driverId, 
      vehicleId, 
      initialMileage, 
      finalMileage,
      details 
    } = body

    // Validaciones
    if (!inspectionDate || !driverId || !vehicleId) {
      return NextResponse.json(
        { error: 'Fecha de inspección, conductor y vehículo son requeridos' },
        { status: 400 }
      )
    }

    // Verificar que el conductor existe
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    // Crear la inspección con sus detalles
    const inspection = await prisma.preoperationalInspection.create({
      data: {
        inspectionDate: new Date(inspectionDate),
        driverId,
        vehicleId,
        initialMileage: initialMileage ? parseFloat(initialMileage) : null,
        finalMileage: finalMileage ? parseFloat(finalMileage) : null,
        details: details ? {
          create: details.map((detail: any) => ({
            itemId: detail.itemId,
            passed: detail.passed,
            observations: detail.observations || null,
            photoUrl: detail.photoUrl || null
          }))
        } : undefined
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        },
        details: {
          include: {
            item: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(inspection, { status: 201 })
  } catch (error) {
    console.error('Error creating preoperational inspection:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

