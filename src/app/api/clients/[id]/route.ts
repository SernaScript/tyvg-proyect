import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/clients/[id] - Obtener un cliente específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            isActive: true,
            startDate: true,
            endDate: true
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/clients/[id] - Actualizar un cliente
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { identification, name, address, email, phone, isActive } = body

    // Validaciones
    if (!identification || !name) {
      return NextResponse.json(
        { error: 'Identificación y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe otro cliente con esa identificación
    const duplicateClient = await prisma.client.findFirst({
      where: {
        identification,
        id: { not: params.id }
      }
    })

    if (duplicateClient) {
      return NextResponse.json(
        { error: 'Ya existe otro cliente con esa identificación' },
        { status: 400 }
      )
    }

    // Actualizar el cliente
    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        identification,
        name,
        address: address || null,
        email: email || null,
        phone: phone || null,
        isActive
      },
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      }
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/clients/[id] - Eliminar un cliente
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el cliente existe
    const existingClient = await prisma.client.findUnique({
      where: { id: params.id },
      include: {
        projects: true
      }
    })

    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene proyectos activos
    const activeProjects = existingClient.projects?.filter(project => project.isActive)
    if (activeProjects && activeProjects.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un cliente con proyectos activos' },
        { status: 400 }
      )
    }

    // Eliminar el cliente
    await prisma.client.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Cliente eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
