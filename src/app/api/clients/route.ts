import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/clients - Obtener todos los clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { identification: { contains: search } },
        { email: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Filtro de estado activo
    if (active !== null) {
      where.isActive = active === 'true'
    }

    const clients = await prisma.client.findMany({
      where,
      include: {
        projects: {
          select: {
            id: true,
            name: true,
            isActive: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clients)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/clients - Crear un nuevo cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { identification, name, address, email, phone, isActive = true } = body

    // Validaciones
    if (!identification || !name) {
      return NextResponse.json(
        { error: 'Identificación y nombre son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un cliente con esa identificación
    const existingClient = await prisma.client.findUnique({
      where: { identification }
    })

    if (existingClient) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con esa identificación' },
        { status: 400 }
      )
    }

    // Crear el cliente
    const client = await prisma.client.create({
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

    return NextResponse.json(client, { status: 201 })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
