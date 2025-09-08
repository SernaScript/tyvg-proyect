import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los vehículos
export async function GET() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        owner: {
          select: {
            id: true,
            document: true,
            firstName: true,
            lastName: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
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

// POST - Crear un nuevo vehículo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      plate,
      brand,
      model,
      year,
      type,
      status = 'active',
      driver,
      location,
      odometer = 0,
      fuelType,
      lastMaintenance,
      nextMaintenance,
      isActive = true,
      ownerId
    } = body

    // Validaciones
    if (!plate || !brand || !model || !year || !type || !fuelType) {
      return NextResponse.json(
        { error: 'Placa, marca, modelo, año, tipo y combustible son requeridos' },
        { status: 400 }
      )
    }

    // Validar año
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json(
        { error: 'El año debe ser válido' },
        { status: 400 }
      )
    }

    // Verificar si la placa ya existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { plate }
    })

    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Ya existe un vehículo con esta placa' },
        { status: 409 }
      )
    }

    // Verificar si el propietario existe (si se proporciona)
    if (ownerId) {
      const owner = await prisma.owner.findUnique({
        where: { id: ownerId }
      })

      if (!owner) {
        return NextResponse.json(
          { error: 'El propietario especificado no existe' },
          { status: 404 }
        )
      }
    }

    const vehicle = await prisma.vehicle.create({
      data: {
        plate,
        brand,
        model,
        year,
        type,
        status,
        driver,
        location,
        odometer,
        fuelType,
        lastMaintenance: lastMaintenance ? new Date(lastMaintenance) : null,
        nextMaintenance: nextMaintenance ? new Date(nextMaintenance) : null,
        isActive,
        ownerId
      },
      include: {
        owner: true
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
