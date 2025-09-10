import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener una compra de combustible específica
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fuelPurchase = await prisma.fuelPurchase.findUnique({
      where: { id },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    if (!fuelPurchase) {
      return NextResponse.json(
        { error: 'Compra de combustible no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(fuelPurchase)
  } catch (error) {
    console.error('Error fetching fuel purchase:', error)
    return NextResponse.json(
      { error: 'Error al obtener la compra de combustible' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una compra de combustible
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { date, vehicleId, quantity, total, provider, state } = body

    // Validaciones
    if (!date || !vehicleId || !quantity || !total || !provider) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    if (quantity <= 0 || total <= 0) {
      return NextResponse.json(
        { error: 'La cantidad y el total deben ser mayores a 0' },
        { status: 400 }
      )
    }

    // Verificar que el vehículo existe y está activo
    const vehicle = await prisma.vehicle.findUnique({
      where: { 
        id: vehicleId,
        isActive: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'El vehículo seleccionado no existe' },
        { status: 400 }
      )
    }

    const fuelPurchase = await prisma.fuelPurchase.update({
      where: { id },
      data: {
        date: new Date(date),
        vehicleId,
        quantity: parseFloat(quantity),
        total: parseFloat(total),
        provider,
        state: state !== undefined ? state : true
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        }
      }
    })

    return NextResponse.json(fuelPurchase)
  } catch (error) {
    console.error('Error updating fuel purchase:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la compra de combustible' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una compra de combustible
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.fuelPurchase.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Compra de combustible eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting fuel purchase:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la compra de combustible' },
      { status: 500 }
    )
  }
}
