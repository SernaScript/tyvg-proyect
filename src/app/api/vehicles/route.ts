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
      try {
        // Usar $queryRaw para obtener los vehículos relacionados con el conductor
        const driverVehiclesRaw = await prisma.$queryRaw<Array<{
          vehicleId: string
        }>>`
          SELECT dv."vehicleId"
          FROM driver_vehicles dv
          WHERE dv."driverId" = ${driverId} 
            AND dv."isActive" = true
        `

        console.log('Driver vehicles found:', driverVehiclesRaw.length, 'for driverId:', driverId)

        const vehicleIds = driverVehiclesRaw.map(dv => dv.vehicleId)

        if (vehicleIds.length === 0) {
          console.log('No vehicles found for driver:', driverId)
          return NextResponse.json([])
        }

        // Obtener los vehículos con sus owners, filtrando por isActive si se especifica
        const vehicles = await prisma.vehicle.findMany({
          where: {
            id: { in: vehicleIds },
            ...(activeOnly && { isActive: true })
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
          },
          orderBy: {
            plate: 'asc'
          }
        })

        console.log('Vehicles returned:', vehicles.length)
        return NextResponse.json(vehicles)
      } catch (error) {
        console.error('Error in driver vehicles query:', error)
        throw error
      }
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