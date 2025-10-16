import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/materials/[id] - Obtener un material específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const material = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        projectPrices: {
          select: {
            id: true,
            salePrice: true,
            outsourcedPrice: true,
            startDate: true,
            endDate: true,
            isActive: true,
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!material) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(material)
  } catch (error) {
    console.error('Error fetching material:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/materials/[id] - Actualizar un material
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, type, unitOfMeasure, isActive } = body

    // Validaciones
    if (!name || !type || !unitOfMeasure) {
      return NextResponse.json(
        { error: 'Nombre, tipo y unidad de medida son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo
    if (!['STOCKED', 'NON_STOCKED'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de material inválido' },
        { status: 400 }
      )
    }

    // Validar unidad de medida
    if (!['m³', 'ton'].includes(unitOfMeasure)) {
      return NextResponse.json(
        { error: 'Unidad de medida inválida. Solo se permiten m³ o ton' },
        { status: 400 }
      )
    }

    // Verificar si el material existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id: params.id }
    })

    if (!existingMaterial) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe otro material con ese nombre
    const duplicateMaterial = await prisma.material.findFirst({
      where: {
        name,
        id: { not: params.id }
      }
    })

    if (duplicateMaterial) {
      return NextResponse.json(
        { error: 'Ya existe otro material con ese nombre' },
        { status: 400 }
      )
    }

    // Actualizar el material
    const updatedMaterial = await prisma.material.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        type,
        unitOfMeasure,
        isActive
      },
      include: {
        projectPrices: {
          where: { isActive: true },
          select: {
            id: true,
            salePrice: true,
            outsourcedPrice: true,
            startDate: true,
            endDate: true,
            project: {
              select: {
                id: true,
                name: true,
                client: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedMaterial)
  } catch (error) {
    console.error('Error updating material:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/materials/[id] - Eliminar un material
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el material existe
    const existingMaterial = await prisma.material.findUnique({
      where: { id: params.id },
      include: {
        projectPrices: true,
        tripMaterials: true
      }
    })

    if (!existingMaterial) {
      return NextResponse.json(
        { error: 'Material no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene precios de proyecto activos
    const activePrices = existingMaterial.projectPrices?.filter((pmp: any) => pmp.isActive)
    if (activePrices && activePrices.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un material con precios de proyecto activos' },
        { status: 400 }
      )
    }

    // Verificar si está siendo usado en viajes
    if (existingMaterial.tripMaterials && existingMaterial.tripMaterials.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un material que está siendo usado en viajes' },
        { status: 400 }
      )
    }

    // Eliminar el material
    await prisma.material.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Material eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting material:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

