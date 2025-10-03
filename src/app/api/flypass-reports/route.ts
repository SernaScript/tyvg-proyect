import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const year = searchParams.get('year');
    const month = searchParams.get('month');

    // Construir filtros de fecha basados en año y mes
    const dateFilter: any = {};
    if (year && month) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      dateFilter.gte = startDate;
      dateFilter.lte = endDate;
    }

    // Obtener datos agregados
    const [totalStats, dailyStats, tollStats] = await Promise.all([
      // Estadísticas generales
      prisma.flypassData.aggregate({
        where: {
          documentType: 'FC',
          ...(Object.keys(dateFilter).length > 0 && {
            passageDate: dateFilter
          })
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        },
        _avg: {
          total: true
        }
      }),

      // Estadísticas por día
      prisma.flypassData.groupBy({
        by: ['passageDate'],
        where: {
          documentType: 'FC',
          ...(Object.keys(dateFilter).length > 0 && {
            passageDate: dateFilter
          })
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        },
        orderBy: {
          passageDate: 'asc'
        }
      }),

      // Estadísticas por peaje
      prisma.flypassData.groupBy({
        by: ['tollName'],
        where: {
          documentType: 'FC',
          ...(Object.keys(dateFilter).length > 0 && {
            passageDate: dateFilter
          })
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        },
        orderBy: {
          _count: {
            id: 'desc'
          }
        },
        take: 10
      })
    ]);

    // Obtener datos de contabilización
    const [accountedStats, pendingStats] = await Promise.all([
      prisma.flypassData.aggregate({
        where: {
          documentType: 'FC',
          accounted: true,
          ...(Object.keys(dateFilter).length > 0 && {
            passageDate: dateFilter
          })
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        }
      }),
      prisma.flypassData.aggregate({
        where: {
          documentType: 'FC',
          accounted: false,
          ...(Object.keys(dateFilter).length > 0 && {
            passageDate: dateFilter
          })
        },
        _count: {
          id: true
        },
        _sum: {
          total: true
        }
      })
    ]);

    // Formatear datos para el frontend
    const response = {
      success: true,
      data: {
        summary: {
          totalTransactions: totalStats._count.id || 0,
          totalValue: totalStats._sum.total || 0,
          averageValue: totalStats._avg.total || 0,
          accountedTransactions: accountedStats._count.id || 0,
          accountedValue: accountedStats._sum.total || 0,
          pendingTransactions: pendingStats._count.id || 0,
          pendingValue: pendingStats._sum.total || 0
        },
        dailyData: dailyStats.map(item => ({
          date: item.passageDate,
          transactions: item._count.id,
          total: item._sum.total || 0
        })),
        tollData: tollStats.map(item => ({
          tollName: item.tollName,
          transactions: item._count.id,
          total: item._sum.total || 0
        }))
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Error en reportes de Flypass:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al generar los reportes',
        data: null
      },
      { status: 500 }
    );
  }
}
