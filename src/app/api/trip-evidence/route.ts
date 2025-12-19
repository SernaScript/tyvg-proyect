import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET /api/trip-evidence?tripId=xxx - Get all evidences for a trip
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const tripId = searchParams.get('tripId')

    if (!tripId) {
      return NextResponse.json(
        { message: 'El ID del viaje es requerido' },
        { status: 400 }
      )
    }

    // Verify that the trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Get all evidences for the trip
    const evidences = await prisma.tripEvidence.findMany({
      where: { tripId },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(evidences)
  } catch (error) {
    console.error('Error fetching trip evidences:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/trip-evidence - Create new evidence
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      tripId,
      photoUrl,
      description,
      latitude,
      longitude,
      dateTime
    } = body

    // Validations
    if (!tripId) {
      return NextResponse.json(
        { message: 'El ID del viaje es requerido' },
        { status: 400 }
      )
    }

    if (!photoUrl) {
      return NextResponse.json(
        { message: 'La URL de la foto es requerida' },
        { status: 400 }
      )
    }

    if (!dateTime) {
      return NextResponse.json(
        { message: 'La fecha y hora son requeridas' },
        { status: 400 }
      )
    }

    // Verify that the trip exists
    const trip = await prisma.trip.findUnique({
      where: { id: tripId }
    })

    if (!trip) {
      return NextResponse.json(
        { message: 'Viaje no encontrado' },
        { status: 404 }
      )
    }

    // Validate latitude and longitude if provided
    if (latitude !== undefined && (isNaN(latitude) || latitude < -90 || latitude > 90)) {
      return NextResponse.json(
        { message: 'La latitud debe ser un valor entre -90 y 90' },
        { status: 400 }
      )
    }

    if (longitude !== undefined && (isNaN(longitude) || longitude < -180 || longitude > 180)) {
      return NextResponse.json(
        { message: 'La longitud debe ser un valor entre -180 y 180' },
        { status: 400 }
      )
    }

    // Parse dateTime
    const evidenceDateTime = new Date(dateTime)
    if (isNaN(evidenceDateTime.getTime())) {
      return NextResponse.json(
        { message: 'La fecha y hora son inválidas' },
        { status: 400 }
      )
    }

    // Create the evidence
    const evidence = await prisma.tripEvidence.create({
      data: {
        tripId,
        photoUrl,
        description: description || null,
        latitude: latitude !== undefined ? parseFloat(latitude.toString()) : null,
        longitude: longitude !== undefined ? parseFloat(longitude.toString()) : null,
        dateTime: evidenceDateTime,
        uploadedByUserId: currentUser.id
      },
      include: {
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(evidence, { status: 201 })
  } catch (error) {
    console.error('Error creating trip evidence:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

