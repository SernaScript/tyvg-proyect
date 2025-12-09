import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los generated requests aprobados
    const approvedRequests = await (prisma as any).siigoAccountsPayableGenerated.findMany({
      where: {
        state: 'approved'
      },
      include: {
        accountsPayable: {
          where: {
            approved: true,
            paymentValue: {
              not: null,
              gt: 0
            }
          },
          select: {
            paymentValue: true
          }
        },
        _count: {
          select: {
            accountsPayable: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Transformar los datos calculando el valor total aprobado
    const transformedRequests = approvedRequests.map((request: any) => {
      const totalApprovedValue = request.accountsPayable.reduce(
        (sum: number, account: any) => sum + Number(account.paymentValue || 0),
        0
      )

      return {
        id: request.id,
        requestDate: request.requestDate.toISOString(),
        createdAt: request.createdAt.toISOString(),
        updatedAt: request.updatedAt.toISOString(),
        state: request.state,
        totalApprovedValue,
        approvedCount: request.accountsPayable.length,
        totalRecords: request._count.accountsPayable
      }
    })

    return NextResponse.json({
      success: true,
      data: transformedRequests
    })

  } catch (error) {
    console.error('Error fetching approved generated requests:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}

