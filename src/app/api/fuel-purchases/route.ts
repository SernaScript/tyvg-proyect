import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las compras de combustible
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const state = searchParams.get('state')
    const skip = (page - 1) * limit


    const whereClause: any = {}
    if (state !== null) {
      whereClause.state = state === 'true'
    }

    const [fuelPurchases, total] = await Promise.all([
      (prisma as any).fuelPurchase.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          vehicle: {
            select: {
              id: true,
              plate: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      }),
      (prisma as any).fuelPurchase.count({
        where: whereClause
      })
    ])

    return NextResponse.json({
      data: fuelPurchases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching fuel purchases:', error)
    return NextResponse.json(
      { error: 'Error al obtener las compras de combustible' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva compra de combustible
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { date, vehicleId, quantity, total, provider, receipt } = body

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
    const vehicle = await (prisma as any).vehicle.findUnique({
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

    const fuelPurchase = await (prisma as any).fuelPurchase.create({
      data: {
        date: new Date(date),
        vehicleId,
        quantity: parseFloat(quantity),
        total: parseFloat(total),
        provider,
        receipt: receipt || null
      },
      include: {
        vehicle: {
          select: {
            id: true,
            plate: true,
          }
        }
      }
    })

    return NextResponse.json(fuelPurchase, { status: 201 })
  } catch (error) {
    console.error('Error creating fuel purchase:', error)
    return NextResponse.json(
      { error: 'Error al crear la compra de combustible' },
      { status: 500 }
    )
  }
}
