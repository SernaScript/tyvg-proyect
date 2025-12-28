import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// DELETE - Desasignar un vehículo de un conductor (marcar como inactivo)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verificar que la relación existe usando $queryRaw
    const existingResult = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id FROM driver_vehicles WHERE id = ${id} LIMIT 1
    `
    
    if (!existingResult || existingResult.length === 0) {
      return NextResponse.json(
        { error: 'Relación no encontrada' },
        { status: 404 }
      )
    }

    // Marcar como inactiva en lugar de eliminar (soft delete)
    await prisma.$executeRaw`
      UPDATE driver_vehicles 
      SET "isActive" = false, "updatedAt" = NOW()
      WHERE id = ${id}
    `
    
    const updated = { id }

    return NextResponse.json({ 
      message: 'Vehículo desasignado correctamente',
      id: updated.id 
    })
  } catch (error) {
    console.error('Error unassigning vehicle:', error)
    return NextResponse.json(
      { error: 'Error al desasignar el vehículo' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar estado de la asignación
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isActive } = body

    if (typeof isActive !== 'boolean') {
      return NextResponse.json(
        { error: 'El campo isActive es requerido y debe ser un booleano' },
        { status: 400 }
      )
    }

    // Actualizar usando $executeRaw
    await prisma.$executeRaw`
      UPDATE driver_vehicles 
      SET "isActive" = ${isActive}, "updatedAt" = NOW()
      WHERE id = ${id}
    `
    
    // Obtener los datos completos
    const updatedResult = await prisma.$queryRaw<Array<{
      id: string
      driverId: string
      vehicleId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }>>`
      SELECT * FROM driver_vehicles WHERE id = ${id}
    `
    
    const updated = updatedResult[0]
    if (!updated) {
      return NextResponse.json(
        { error: 'Relación no encontrada' },
        { status: 404 }
      )
    }
    
    // Obtener datos relacionados
    const [driver, vehicle] = await Promise.all([
      prisma.driver.findUnique({
        where: { id: updated.driverId },
        select: {
          id: true,
          name: true,
          identification: true
        }
      }),
      prisma.vehicle.findUnique({
        where: { id: updated.vehicleId },
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
    ])
    
    const updatedWithRelations = {
      ...updated,
      driver,
      vehicle
    }

    return NextResponse.json(updatedWithRelations)
  } catch (error) {
    console.error('Error updating driver vehicle:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la asignación' },
      { status: 500 }
    )
  }
}

