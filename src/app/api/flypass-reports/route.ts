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
    const [fcStats, ncStats, dailyFCStats, dailyNCStats, tollFCStats, tollNCStats] = await Promise.all([
      // Estadísticas de FC (valores positivos)
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
      
      // Estadísticas de NC (valores negativos)
      prisma.flypassData.aggregate({
        where: {
          documentType: 'NC',
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

      // Estadísticas por día - FC (valores positivos)
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
      
      // Estadísticas por día - NC (valores negativos)
      prisma.flypassData.groupBy({
        by: ['passageDate'],
        where: {
          documentType: 'NC',
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

      // Estadísticas por peaje - FC (valores positivos)
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
      }),
      
      // Estadísticas por peaje - NC (valores negativos)
      prisma.flypassData.groupBy({
        by: ['tollName'],
        where: {
          documentType: 'NC',
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

    // Obtener datos de contabilización (FC y NC por separado)
    const [accountedFCStats, accountedNCStats, pendingFCStats, pendingNCStats] = await Promise.all([
      // FC contabilizados
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
      // NC contabilizados
      prisma.flypassData.aggregate({
        where: {
          documentType: 'NC',
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
      // FC pendientes
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
      }),
      // NC pendientes
      prisma.flypassData.aggregate({
        where: {
          documentType: 'NC',
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
        summary: (() => {
          const fcTotal = Number(fcStats._sum.total || 0);
          const ncTotal = Number(ncStats._sum.total || 0);
          const netValue = fcTotal - ncTotal;
          
          console.log('FC Stats:', { count: fcStats._count.id, total: fcTotal });
          console.log('NC Stats:', { count: ncStats._count.id, total: ncTotal });
          console.log('Net Value (FC - NC):', netValue);
          
          return {
            totalTransactions: (fcStats._count.id || 0) + (ncStats._count.id || 0),
            totalValue: netValue, // FC - NC
            averageValue: (() => {
              const totalTransactions = (fcStats._count.id || 0) + (ncStats._count.id || 0);
              return totalTransactions > 0 ? netValue / totalTransactions : 0;
            })(),
            accountedTransactions: (accountedFCStats._count.id || 0) + (accountedNCStats._count.id || 0),
            accountedValue: Number(accountedFCStats._sum.total || 0) - Number(accountedNCStats._sum.total || 0), // FC - NC
            pendingTransactions: (pendingFCStats._count.id || 0) + (pendingNCStats._count.id || 0),
            pendingValue: Number(pendingFCStats._sum.total || 0) - Number(pendingNCStats._sum.total || 0) // FC - NC
          };
        })(),
        dailyData: (() => {
          console.log('dailyFCStats:', dailyFCStats.slice(0, 2));
          console.log('dailyNCStats:', dailyNCStats.slice(0, 2));
          
          // Crear mapas para FC y NC por fecha
          const fcMap = new Map(dailyFCStats.map(item => [
            item.passageDate.toISOString().split('T')[0],
            { transactions: item._count.id, total: item._sum.total || 0 }
          ]));
          
          const ncMap = new Map(dailyNCStats.map(item => [
            item.passageDate.toISOString().split('T')[0],
            { transactions: item._count.id, total: item._sum.total || 0 }
          ]));
          
          // Obtener todas las fechas únicas
          const allDates = new Set([
            ...fcMap.keys(),
            ...ncMap.keys()
          ]);
          
          // Combinar datos por fecha
          const result = Array.from(allDates).map(date => {
            const fcData = fcMap.get(date) || { transactions: 0, total: 0 };
            const ncData = ncMap.get(date) || { transactions: 0, total: 0 };
            
            const combined = {
              date,
              transactions: fcData.transactions + ncData.transactions,
              total: Number(fcData.total) - Number(ncData.total), // FC positivo, NC negativo
              fcTransactions: fcData.transactions,
              fcTotal: Number(fcData.total),
              ncTransactions: ncData.transactions,
              ncTotal: Number(ncData.total)
            };
            
            console.log(`Date ${date}:`, combined);
            return combined;
          }).sort((a, b) => a.date.localeCompare(b.date));
          
          console.log('Final dailyData result:', result.slice(0, 2));
          return result;
        })(),
        tollData: (() => {
          console.log('tollFCStats:', tollFCStats.slice(0, 2));
          console.log('tollNCStats:', tollNCStats.slice(0, 2));
          
          // Crear mapas para FC y NC por peaje
          const fcTollMap = new Map(tollFCStats.map(item => [
            item.tollName,
            { transactions: item._count.id, total: item._sum.total || 0 }
          ]));
          
          const ncTollMap = new Map(tollNCStats.map(item => [
            item.tollName,
            { transactions: item._count.id, total: item._sum.total || 0 }
          ]));
          
          // Obtener todos los peajes únicos
          const allTolls = new Set([
            ...fcTollMap.keys(),
            ...ncTollMap.keys()
          ]);
          
          // Combinar datos por peaje
          const result = Array.from(allTolls).map(tollName => {
            const fcData = fcTollMap.get(tollName) || { transactions: 0, total: 0 };
            const ncData = ncTollMap.get(tollName) || { transactions: 0, total: 0 };
            
            const combined = {
              tollName,
              transactions: fcData.transactions + ncData.transactions,
              total: Number(fcData.total) - Number(ncData.total), // FC positivo, NC negativo
              fcTransactions: fcData.transactions,
              fcTotal: Number(fcData.total),
              ncTransactions: ncData.transactions,
              ncTotal: Number(ncData.total)
            };
            
            console.log(`Toll ${tollName}:`, combined);
            return combined;
          }).sort((a, b) => b.transactions - a.transactions); // Ordenar por número de transacciones
          
          console.log('Final tollData result:', result.slice(0, 2));
          return result;
        })()
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
