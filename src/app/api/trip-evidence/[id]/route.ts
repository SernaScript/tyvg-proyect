import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'

// GET /api/trip-evidence/[id] - Get a specific evidence
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    const evidence = await prisma.tripEvidence.findUnique({
      where: { id: params.id },
      include: {
        trip: {
          select: {
            id: true,
            date: true
          }
        },
        uploadedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { message: 'Evidencia no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(evidence)
  } catch (error) {
    console.error('Error fetching trip evidence:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/trip-evidence/[id] - Delete an evidence
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const currentUser = await authenticateRequest(request)
    if (!currentUser) {
      return NextResponse.json(
        { message: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verify that the evidence exists
    const evidence = await prisma.tripEvidence.findUnique({
      where: { id: params.id },
      include: {
        trip: {
          select: {
            id: true
          }
        }
      }
    })

    if (!evidence) {
      return NextResponse.json(
        { message: 'Evidencia no encontrada' },
        { status: 404 }
      )
    }

    // Delete the evidence
    // Note: File deletion from storage should be handled separately if needed
    await prisma.tripEvidence.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Evidencia eliminada exitosamente' })
  } catch (error) {
    console.error('Error deleting trip evidence:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

