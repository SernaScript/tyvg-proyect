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
      where: { id: generatedRequestId },
      include: {
        accountsPayable: true
      }
    })

    if (!generatedRequest) {
      return NextResponse.json({
        success: false,
        error: 'Solicitud generada no encontrada'
      }, { status: 404 })
    }

    const recordsWithPayments = generatedRequest.accountsPayable.filter(
      (record: any) => record.paymentValue !== null && record.paymentValue > 0
    )

    if (recordsWithPayments.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No hay registros con valores de pago para aprobar'
      }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      await (tx as any).siigoAccountsPayable.updateMany({
        where: {
          generatedRequestId: generatedRequestId,
          paymentValue: {
            not: null,
            gt: 0
          }
        },
        data: {
          approved: true,
          updatedAt: new Date()
        }
      })

      await (tx as any).siigoAccountsPayableGenerated.update({
        where: { id: generatedRequestId },
        data: {
          state: 'approved',
          updatedAt: new Date()
        }
      })
    })

    return NextResponse.json({
      success: true,
      message: `${recordsWithPayments.length} pagos aprobados exitosamente`,
      data: {
        approvedCount: recordsWithPayments.length,
        totalRecords: generatedRequest.accountsPayable.length
      }
    })

  } catch (error) {
    console.error('Error approving payments:', error)
    return NextResponse.json({
      success: false,
      error: 'Error interno del servidor'
    }, { status: 500 })
  }
}
