import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los vehículos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const driverId = searchParams.get('driverId')

    // Si se proporciona driverId, filtrar solo vehículos asignados a ese conductor
    if (driverId) {
      const driverVehicles = await prisma.driverVehicle.findMany({
        where: {
          driverId,
          isActive: true,
          vehicle: {
            isActive: activeOnly !== false // Por defecto solo activos, a menos que se especifique lo contrario
          }
        },
        include: {
          vehicle: {
            include: {
              owner: {
                select: {
                  id: true,
                  document: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        },
        orderBy: {
          vehicle: {
            plate: 'asc'
          }
        }
      })

      const vehicles = driverVehicles.map(dv => dv.vehicle).filter(Boolean)
      return NextResponse.json(vehicles)
    }

    // Comportamiento original: obtener todos los vehículos
    const vehicles = await prisma.vehicle.findMany({
      where: activeOnly ? { isActive: true } : {},
      include: {
        owner: {
          select: {
            id: true,
            document: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: {
        plate: 'asc'
      }
    })

    return NextResponse.json(vehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Error al obtener los vehículos' },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plate, brand, model, type, driver, ownerId } = body

    // Validaciones
    if (!plate || !brand || !model || !type) {
      return NextResponse.json(
        { error: 'Placa, marca, modelo y tipo son obligatorios' },
        { status: 400 }
      )
    }

    // Verificar que la placa no exista
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate }
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo con esta placa' },
        { status: 400 }
      )
    }

    // Verificar que el propietario existe si se proporciona
    if (ownerId) {
      const owner = await prisma.owner.findUnique({
        where: { id: ownerId }
      })

      if (!owner) {
        return NextResponse.json(
          { error: 'El propietario seleccionado no existe' },
          { status: 400 }
        )
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        type,
        driver: driver || null,
        ownerId: ownerId || null
      },
      include: {
        owner: {
          select: {
            id: true,
            document: true,
            firstName: true,
            lastName: true
          }
        }
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Error al crear el vehículo' },
      { status: 500 }
    )
  }
}