import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const { paymentValue } = body

    console.log(`Actualizando valor de pago para registro ${id}:`, paymentValue)

    if (paymentValue === undefined) {
      return NextResponse.json({
        success: false,
        error: 'paymentValue es requerido'
      }, { status: 400 })
    }

    const currentRecord = await (prisma as any).siigoAccountsPayable.findUnique({
      where: { id }
    })

    if (!currentRecord) {
      return NextResponse.json({
        success: false,
        error: 'Registro no encontrado'
      }, { status: 404 })
    }

    if (paymentValue !== null) {
      const numericPaymentValue = Number(paymentValue)
      const balance = Number(currentRecord.balance)
      
      if (numericPaymentValue > balance) {
        return NextResponse.json({
          success: false,
          error: `El valor de pago ($${numericPaymentValue.toLocaleString()}) no puede ser mayor al balance ($${balance.toLocaleString()})`
        }, { status: 400 })
      }
    }

    const updatedRecord = await (prisma as any).siigoAccountsPayable.update({
      where: { id },
      data: {
        paymentValue: paymentValue ? Number(paymentValue) : null,
        updatedAt: new Date()
      }
    })

    console.log('Registro actualizado exitosamente:', updatedRecord.id)

    return NextResponse.json({
      success: true,
      data: {
        ...updatedRecord,
        consecutive: updatedRecord.consecutive.toString()
      }
    })

  } catch (error) {
    console.error('Error actualizando valor de pago:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
