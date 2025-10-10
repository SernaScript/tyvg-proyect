import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/projects/[id] - Obtener un proyecto específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            identification: true,
            email: true,
            phone: true
          }
        },
        materials: {
          select: {
            id: true,
            price: true,
            isActive: true,
            material: {
              select: {
                id: true,
                name: true,
                type: true,
                unit: true
              }
            }
          }
        }
      }
    })

    if (!project) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/projects/[id] - Actualizar un proyecto
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, address, clientId, startDate, endDate, isActive } = body

    // Validaciones
    if (!name || !clientId) {
      return NextResponse.json(
        { error: 'Nombre y cliente son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si el cliente existe
    const client = await prisma.client.findUnique({
      where: { id: clientId }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 400 }
      )
    }

    // Verificar si ya existe otro proyecto con ese nombre para el mismo cliente
    const duplicateProject = await prisma.project.findFirst({
      where: {
        name,
        clientId,
        id: { not: params.id }
      }
    })

    if (duplicateProject) {
      return NextResponse.json(
        { error: 'Ya existe otro proyecto con ese nombre para este cliente' },
        { status: 400 }
      )
    }

    // Validar fechas si se proporcionan
    if (startDate && endDate) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      
      if (start >= end) {
        return NextResponse.json(
          { error: 'La fecha de inicio debe ser anterior a la fecha de fin' },
          { status: 400 }
        )
      }
    }

    // Actualizar el proyecto
    const updatedProject = await prisma.project.update({
      where: { id: params.id },
      data: {
        name,
        description: description || null,
        address: address || null,
        clientId,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        isActive
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        materials: {
          where: { isActive: true },
          select: {
            id: true,
            price: true,
            material: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/projects/[id] - Eliminar un proyecto
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el proyecto existe
    const existingProject = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        materials: true,
        tripRequests: true
      }
    })

    if (!existingProject) {
      return NextResponse.json(
        { error: 'Proyecto no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene solicitudes de viaje activas
    const activeTripRequests = existingProject.tripRequests?.filter(tr => tr.status !== 'CANCELLED')
    if (activeTripRequests && activeTripRequests.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un proyecto con solicitudes de viaje activas' },
        { status: 400 }
      )
    }

    // Eliminar el proyecto (esto eliminará automáticamente los materiales asociados por CASCADE)
    await prisma.project.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Proyecto eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting project:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
