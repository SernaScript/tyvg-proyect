import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { paymentIds } = await request.json()

    if (!paymentIds || !Array.isArray(paymentIds) || paymentIds.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Lista de IDs de pagos es requerida'
      }, { status: 400 })
    }

    // Verificar que todos los pagos existan y estén aprobados
    const existingPayments = await (prisma as any).siigoAccountsPayable.findMany({
      where: {
        id: { in: paymentIds },
        approved: true
      },
      select: {
        id: true,
        paid: true,
        paymentValue: true,
        providerName: true
      }
    })

    if (existingPayments.length !== paymentIds.length) {
      return NextResponse.json({
        success: false,
        error: 'Algunos pagos no existen o no están aprobados'
      }, { status: 400 })
    }

    // Verificar que no estén ya marcados como pagados
    const alreadyPaid = existingPayments.filter((p: any) => p.paid)
    if (alreadyPaid.length > 0) {
      return NextResponse.json({
        success: false,
        error: `Algunos pagos ya están marcados como ejecutados: ${alreadyPaid.map((p: any) => p.providerName).join(', ')}`
      }, { status: 400 })
    }

    // Marcar pagos como ejecutados en una transacción
    const result = await prisma.$transaction(async (tx) => {
      const updatedPayments = await (tx as any).siigoAccountsPayable.updateMany({
        where: {
          id: { in: paymentIds },
          approved: true,
          paid: false
        },
        data: {
          paid: true,
          updatedAt: new Date()
        }
      })

      return updatedPayments
    })

    // Obtener los pagos actualizados para el response
    const updatedPayments = await (prisma as any).siigoAccountsPayable.findMany({
      where: {
        id: { in: paymentIds }
      },
      select: {
        id: true,
        providerName: true,
        paymentValue: true,
        paid: true,
        updatedAt: true
      }
    })

    const totalAmount = updatedPayments.reduce((sum: number, payment: any) => 
      sum + Number(payment.paymentValue), 0
    )

    return NextResponse.json({
      success: true,
      message: `${result.count} pagos marcados como ejecutados exitosamente`,
      data: {
        updatedCount: result.count,
        totalAmount: totalAmount,
        payments: updatedPayments.map((p: any) => ({
          id: p.id,
          providerName: p.providerName,
          paymentValue: Number(p.paymentValue),
          paid: p.paid,
          updatedAt: p.updatedAt.toISOString()
        }))
      }
    })

  } catch (error) {
    console.error('Error marking payments as paid:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
