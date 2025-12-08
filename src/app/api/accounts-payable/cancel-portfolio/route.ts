import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { generatedRequestId } = await request.json()

    if (!generatedRequestId) {
      return NextResponse.json({
        success: false,
        error: 'ID de solicitud generada es requerido'
      }, { status: 400 })
    }

    const generatedRequest = await (prisma as any).siigoAccountsPayableGenerated.findUnique({
      where: { id: generatedRequestId }
    })

    if (!generatedRequest) {
      return NextResponse.json({
        success: false,
        error: 'Solicitud generada no encontrada'
      }, { status: 404 })
    }

    if (generatedRequest.state === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'No se puede cancelar una cartera aprobada'
      }, { status: 400 })
    }

    if (generatedRequest.state === 'cancelled') {
      return NextResponse.json({
        success: false,
        error: 'La cartera ya está cancelada'
      }, { status: 400 })
    }

    await (prisma as any).siigoAccountsPayableGenerated.update({
      where: { id: generatedRequestId },
      data: {
        state: 'cancelled',
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Cartera cancelada exitosamente',
      data: {
        generatedRequestId,
        state: 'cancelled'
      }
    })

  } catch (error) {
    console.error('Error canceling portfolio:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

