import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const generatedRequestId = searchParams.get('generatedRequestId')
    const paid = searchParams.get('paid')

    // Construir filtros
    const whereClause: any = {
      approved: true
    }

    if (generatedRequestId) {
      whereClause.generatedRequestId = generatedRequestId
    }

    if (paid !== null) {
      whereClause.paid = paid === 'true'
    }

    const approvedPayments = await (prisma as any).siigoAccountsPayable.findMany({
      where: whereClause,
      include: {
        generatedRequest: {
          select: {
            id: true,
            state: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: [
        { paid: 'asc' }, // Pendientes primero
        { dueDate: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Transformar los datos para el frontend
    const transformedPayments = approvedPayments.map((payment: any) => ({
      id: payment.id,
      prefix: payment.prefix,
      consecutive: payment.consecutive.toString(),
      quote: payment.quote,
      dueDate: payment.dueDate.toISOString(),
      balance: Number(payment.balance),
      providerName: payment.providerName,
      providerIdentification: payment.providerIdentification,
      providerBranchOffice: payment.providerBranchOffice,
      costCenterName: payment.costCenterName,
      costCenterCode: payment.costCenterCode,
      currencyCode: payment.currencyCode,
      currencyBalance: Number(payment.currencyBalance),
      paymentValue: Number(payment.paymentValue),
      approved: payment.approved,
      paid: payment.paid,
      createdAt: payment.createdAt.toISOString(),
      updatedAt: payment.updatedAt.toISOString(),
      generatedRequestId: payment.generatedRequestId,
      generatedRequest: payment.generatedRequest
    }))

    return NextResponse.json({
      success: true,
      data: transformedPayments,
      count: transformedPayments.length
    })

  } catch (error) {
    console.error('Error fetching approved payments:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
