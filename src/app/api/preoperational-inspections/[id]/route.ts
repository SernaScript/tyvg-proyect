import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/preoperational-inspections/[id] - Obtener una inspección específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const inspection = await prisma.preoperationalInspection.findUnique({
      where: { id: params.id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        },
        vehicle: {
          select: {
            id: true,
            plate: true,
            brand: true,
            model: true
          }
        },
        details: {
          include: {
            item: {
              select: {
                id: true,
                name: true
              }
            }
          },
          orderBy: {
            itemId: 'asc'
          }
        }
      }
    })

    if (!inspection) {
      return NextResponse.json(
        { error: 'Inspección preoperacional no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(inspection)
  } catch (error) {
    console.error('Error fetching preoperational inspection:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

