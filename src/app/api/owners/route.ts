import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todos los propietarios
export async function GET() {
  try {
    const owners = await prisma.owner.findMany({
      include: {
        vehicles: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true,
            status: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(owners)
  } catch (error) {
    console.error('Error fetching owners:', error)
    return NextResponse.json(
      { error: 'Error al obtener los propietarios' },
      { status: 500 }
    )
  }
}

// POST - Crear un nuevo propietario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { document, firstName, lastName, isActive = true } = body

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

    // Verificar si el documento ya existe
    const existingOwner = await prisma.owner.findUnique({
      where: { document }
    })

    if (existingOwner) {
      return NextResponse.json(
        { error: 'Ya existe un propietario con este documento' },
        { status: 409 }
      )
    }

    const owner = await prisma.owner.create({
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

    return NextResponse.json(owner, { status: 201 })
  } catch (error) {
    console.error('Error creating owner:', error)
    return NextResponse.json(
      { error: 'Error al crear el propietario' },
      { status: 500 }
    )
  }
}
