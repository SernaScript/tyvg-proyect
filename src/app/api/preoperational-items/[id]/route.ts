import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/preoperational-items/[id] - Obtener un item específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const item = await prisma.preoperationalItem.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Item preoperacional no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(item)
  } catch (error) {
    console.error('Error fetching preoperational item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/preoperational-items/[id] - Actualizar un item
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, isActive } = body

    // Validaciones
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'El nombre del item es requerido' },
        { status: 400 }
      )
    }

    // Verificar si el item existe
    const existingItem = await prisma.preoperationalItem.findUnique({
      where: { id: parseInt(params.id) }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item preoperacional no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe otro item con ese nombre
    const duplicateItem = await prisma.preoperationalItem.findFirst({
      where: {
        name: name.trim(),
        id: { not: parseInt(params.id) }
      }
    })

    if (duplicateItem) {
      return NextResponse.json(
        { error: 'Ya existe otro item preoperacional con ese nombre' },
        { status: 400 }
      )
    }

    // Actualizar el item
    const updatedItem = await prisma.preoperationalItem.update({
      where: { id: parseInt(params.id) },
      data: {
        name: name.trim(),
        isActive
      }
    })

    return NextResponse.json(updatedItem)
  } catch (error) {
    console.error('Error updating preoperational item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/preoperational-items/[id] - Eliminar un item
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el item existe
    const existingItem = await prisma.preoperationalItem.findUnique({
      where: { id: parseInt(params.id) },
      include: {
        details: true
      }
    })

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item preoperacional no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si está siendo usado en detalles de inspecciones
    if (existingItem.details && existingItem.details.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un item que está siendo usado en inspecciones' },
        { status: 400 }
      )
    }

    // Eliminar el item
    await prisma.preoperationalItem.delete({
      where: { id: parseInt(params.id) }
    })

    return NextResponse.json({ message: 'Item preoperacional eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting preoperational item:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

