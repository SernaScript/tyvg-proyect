import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener un propietario por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        vehicles: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            year: true,
            type: true,
            status: true,
            driver: true,
            location: true,
            odometer: true,
            fuelType: true,
            lastMaintenance: true,
            nextMaintenance: true,
            isActive: true
          }
        }
      }
    })

    if (!owner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(owner)
  } catch (error) {
    console.error('Error fetching owner:', error)
    return NextResponse.json(
      { error: 'Error al obtener el propietario' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar un propietario
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { document, firstName, lastName, isActive } = body

    // Validaciones
    if (!document || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Documento, nombre y apellido son requeridos' },
        { status: 400 }
      )
    }

    // Validar que el documento solo contenga números
    if (!/^\d+$/.test(document)) {
      return NextResponse.json(
        { error: 'El documento solo puede contener números' },
        { status: 400 }
      )
    }

    // Verificar si el propietario existe
    const existingOwner = await prisma.owner.findUnique({
      where: { id }
    })

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el documento ya existe en otro propietario
    const documentOwner = await prisma.owner.findUnique({
      where: { document }
    })

    if (documentOwner && documentOwner.id !== id) {
      return NextResponse.json(
        { error: 'Ya existe otro propietario con este documento' },
        { status: 409 }
      )
    }

    const updatedOwner = await prisma.owner.update({
      where: { id },
      data: {
        document,
        firstName,
        lastName,
        isActive
      },
      include: {
        vehicles: true
      }
    })

    return NextResponse.json(updatedOwner)
  } catch (error) {
    console.error('Error updating owner:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el propietario' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar un propietario
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Verificar si el propietario existe
    const existingOwner = await prisma.owner.findUnique({
      where: { id },
      include: {
        vehicles: true
      }
    })

    if (!existingOwner) {
      return NextResponse.json(
        { error: 'Propietario no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene vehículos asociados
    if (existingOwner.vehicles.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un propietario que tiene vehículos asociados' },
        { status: 400 }
      )
    }

    await prisma.owner.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Propietario eliminado exitosamente' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error deleting owner:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el propietario' },
      { status: 500 }
    )
  }
}
