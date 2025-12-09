import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const generatedRequestId = searchParams.get('generatedRequestId')

    if (!date) {
      return NextResponse.json({
        success: false,
        error: 'Fecha es requerida'
      }, { status: 400 })
    }

    // Parsear la fecha (formato: yyyy-MM-dd)
    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    // Construir filtros
    const whereClause: any = {
      approved: true,
      generatedRequest: {
        state: 'approved',
        updatedAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    }

    if (generatedRequestId) {
      whereClause.generatedRequestId = generatedRequestId
    }

    const accountsPayable = await (prisma as any).siigoAccountsPayable.findMany({
      where: whereClause,
      include: {
        generatedRequest: {
          select: {
            id: true,
            state: true,
            requestDate: true,
            createdAt: true,
            updatedAt: true
          }
        }
      },
      orderBy: [
        { paid: 'asc' }, // Pendientes primero
        { dueDate: 'asc' },
        { providerName: 'asc' }
      ]
    })

    // Transformar los datos para el frontend
    const transformedPayments = accountsPayable.map((payment: any) => ({
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
      generatedRequest: {
        id: payment.generatedRequest.id,
        state: payment.generatedRequest.state,
        requestDate: payment.generatedRequest.requestDate.toISOString(),
        createdAt: payment.generatedRequest.createdAt.toISOString(),
        updatedAt: payment.generatedRequest.updatedAt.toISOString()
      }
    }))

    return NextResponse.json({
      success: true,
      data: transformedPayments,
      count: transformedPayments.length
    })

  } catch (error) {
    console.error('Error fetching accounts payable by date:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

