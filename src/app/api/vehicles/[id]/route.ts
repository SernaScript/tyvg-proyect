import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un vehículo por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
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
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'Error al obtener el vehículo' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un vehículo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
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
      lastMaintenance,
      nextMaintenance,
      isActive,
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

    // Verificar si el vehículo existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si la placa ya existe en otro vehículo
    const plateVehicle = await prisma.vehicle.findUnique({
      where: { plate }
    })

    if (plateVehicle && plateVehicle.id !== id) {
      return NextResponse.json(
        { error: 'Ya existe otro vehículo con esta placa' },
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

    const updatedVehicle = await prisma.vehicle.update({
      where: { id },
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

    return NextResponse.json(updatedVehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el vehículo' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un vehículo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar si el vehículo existe
    const existingVehicle = await prisma.vehicle.findUnique({
      where: { id }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    await prisma.vehicle.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Vehículo eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el vehículo' },
      { status: 500 }
    )
  }
}
