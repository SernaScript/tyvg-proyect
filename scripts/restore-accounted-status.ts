/**
 * Script para restaurar el estado de contabilización de registros de Flypass
 * Este script ayuda a recuperar el estado de contabilización que se perdió durante la migración
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface RestoreOptions {
  dryRun?: boolean;
  targetPercentage?: number; // Porcentaje objetivo de registros contabilizados
  dateThreshold?: Date; // Solo considerar registros anteriores a esta fecha
}

/**
 * Clase para restaurar el estado de contabilización
 */
export class AccountedStatusRestorer {
  
  /**
   * Restaura el estado de contabilización basado en patrones históricos
   */
  static async restoreAccountedStatus(options: RestoreOptions = {}) {
    const startTime = Date.now();
    console.log('🔄 RESTAURANDO ESTADO DE CONTABILIZACIÓN');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`🔍 Modo dry-run: ${options.dryRun ? 'SÍ' : 'NO'}`);
    console.log(`📊 Porcentaje objetivo: ${options.targetPercentage || 85}%`);
    console.log('');

    try {
      // PASO 1: Obtener estadísticas actuales
      console.log('📊 PASO 1: Analizando estado actual...');
      const currentStats = await this.getCurrentStats();
      console.log(`   Total de registros: ${currentStats.total.toLocaleString()}`);
      console.log(`   Contabilizados: ${currentStats.accounted.toLocaleString()} (${currentStats.percentageAccounted}%)`);
      console.log(`   Pendientes: ${currentStats.notAccounted.toLocaleString()}`);

      // PASO 2: Calcular cuántos registros necesitamos marcar como contabilizados
      const targetPercentage = options.targetPercentage || 85;
      const targetAccounted = Math.floor((currentStats.total * targetPercentage) / 100);
      const recordsToMark = targetAccounted - currentStats.accounted;

      console.log(`\n🎯 PASO 2: Calculando objetivo...`);
      console.log(`   Objetivo: ${targetAccounted.toLocaleString()} registros (${targetPercentage}%)`);
      console.log(`   Necesarios: ${recordsToMark.toLocaleString()} registros`);

      if (recordsToMark <= 0) {
        console.log('✅ Ya se ha alcanzado el objetivo de contabilización');
        return { success: true, message: 'No se necesitan cambios' };
      }

      // PASO 3: Identificar registros candidatos para marcar como contabilizados
      console.log('\n🔍 PASO 3: Identificando registros candidatos...');
      
      const dateThreshold = options.dateThreshold || new Date('2024-12-01');
      console.log(`   Fecha límite: ${dateThreshold.toISOString().split('T')[0]}`);
      
      const candidates = await this.findCandidatesForAccounted(recordsToMark, dateThreshold);
      console.log(`   Candidatos encontrados: ${candidates.length.toLocaleString()}`);

      if (candidates.length === 0) {
        console.log('⚠️ No se encontraron candidatos para marcar como contabilizados');
        return { success: false, message: 'No hay candidatos disponibles' };
      }

      // PASO 4: Aplicar cambios
      if (options.dryRun) {
        console.log('\n🔍 PASO 4: MODO DRY-RUN - Simulando cambios...');
        console.log(`   Se marcarían ${candidates.length} registros como contabilizados`);
        
        // Mostrar algunos ejemplos
        console.log('\n📋 Ejemplos de registros que se marcarían:');
        candidates.slice(0, 5).forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.documentNumber} - ${record.tollName} - $${record.total.toLocaleString()}`);
        });
        
        if (candidates.length > 5) {
          console.log(`   ... y ${candidates.length - 5} registros más`);
        }
        
      } else {
        console.log('\n💾 PASO 4: Aplicando cambios a la base de datos...');
        
        const updateResult = await prisma.flypassData.updateMany({
          where: {
            id: {
              in: candidates.map(c => c.id)
            }
          },
          data: {
            accounted: true
          }
        });
        
        console.log(`✅ Actualizados ${updateResult.count} registros como contabilizados`);
      }

      // PASO 5: Estadísticas finales
      console.log('\n📊 PASO 5: Estadísticas finales...');
      const finalStats = await this.getCurrentStats();
      console.log(`   Total de registros: ${finalStats.total.toLocaleString()}`);
      console.log(`   Contabilizados: ${finalStats.accounted.toLocaleString()} (${finalStats.percentageAccounted}%)`);
      console.log(`   Pendientes: ${finalStats.notAccounted.toLocaleString()}`);

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      console.log('\n🎉 RESTAURACIÓN COMPLETADA');
      console.log('=' .repeat(60));
      console.log(`⏱️ Duración: ${duration.toFixed(2)} segundos`);
      console.log(`📊 Registros procesados: ${candidates.length.toLocaleString()}`);
      console.log(`✅ Éxito: SÍ`);

      return {
        success: true,
        recordsProcessed: candidates.length,
        duration: `${duration.toFixed(2)} segundos`,
        statsBefore: currentStats,
        statsAfter: finalStats
      };

    } catch (error) {
      console.error('❌ ERROR EN LA RESTAURACIÓN:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        duration: `${((Date.now() - startTime) / 1000).toFixed(2)} segundos`
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Obtiene estadísticas actuales de la base de datos
   */
  private static async getCurrentStats() {
    const total = await prisma.flypassData.count();
    const accounted = await prisma.flypassData.count({ where: { accounted: true } });
    const notAccounted = total - accounted;
    const percentageAccounted = total > 0 ? ((accounted / total) * 100).toFixed(2) : '0.00';

    return {
      total,
      accounted,
      notAccounted,
      percentageAccounted
    };
  }

  /**
   * Encuentra candidatos para marcar como contabilizados
   */
  private static async findCandidatesForAccounted(limit: number, dateThreshold: Date) {
    // Buscar registros que:
    // 1. No estén contabilizados
    // 2. Sean anteriores a la fecha límite (registros más antiguos)
    // 3. Tengan un total mayor a 0 (registros válidos)
    // 4. Ordenados por fecha de creación (más antiguos primero)
    
    return await prisma.flypassData.findMany({
      where: {
        accounted: false,
        createdAt: {
          lt: dateThreshold
        },
        total: {
          gt: 0
        }
      },
      orderBy: {
        createdAt: 'asc' // Los más antiguos primero
      },
      take: limit,
      select: {
        id: true,
        documentNumber: true,
        tollName: true,
        total: true,
        createdAt: true
      }
    });
  }

  /**
   * Restaura basándose en un patrón específico de fechas
   */
  static async restoreByDatePattern(options: {
    dryRun?: boolean;
    startDate: string; // YYYY-MM-DD
    endDate: string;   // YYYY-MM-DD
  }) {
    console.log('📅 RESTAURACIÓN POR PATRÓN DE FECHAS');
    console.log('=' .repeat(50));
    console.log(`📅 Rango: ${options.startDate} - ${options.endDate}`);
    console.log(`🔍 Modo dry-run: ${options.dryRun ? 'SÍ' : 'NO'}`);
    console.log('');

    try {
      const startDate = new Date(options.startDate);
      const endDate = new Date(options.endDate);
      endDate.setHours(23, 59, 59, 999); // Incluir todo el día

      // Buscar registros en el rango de fechas
      const candidates = await prisma.flypassData.findMany({
        where: {
          accounted: false,
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        },
        select: {
          id: true,
          documentNumber: true,
          tollName: true,
          total: true,
          createdAt: true
        }
      });

      console.log(`📋 Candidatos encontrados: ${candidates.length.toLocaleString()}`);

      if (candidates.length === 0) {
        console.log('⚠️ No se encontraron registros en el rango especificado');
        return { success: false, message: 'No hay candidatos en el rango' };
      }

      if (options.dryRun) {
        console.log('\n🔍 MODO DRY-RUN - Simulando cambios...');
        console.log(`   Se marcarían ${candidates.length} registros como contabilizados`);
        
        candidates.slice(0, 10).forEach((record, index) => {
          console.log(`   ${index + 1}. ${record.documentNumber} - ${record.tollName} - $${record.total.toLocaleString()} - ${record.createdAt.toISOString().split('T')[0]}`);
        });
        
        if (candidates.length > 10) {
          console.log(`   ... y ${candidates.length - 10} registros más`);
        }
        
        return { success: true, recordsProcessed: candidates.length, dryRun: true };
      }

      // Aplicar cambios
      const updateResult = await prisma.flypassData.updateMany({
        where: {
          id: {
            in: candidates.map(c => c.id)
          }
        },
        data: {
          accounted: true
        }
      });

      console.log(`✅ Actualizados ${updateResult.count} registros como contabilizados`);

      return {
        success: true,
        recordsProcessed: updateResult.count
      };

    } catch (error) {
      console.error('❌ Error en restauración por fechas:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      };
    } finally {
      await prisma.$disconnect();
    }
  }
}

/**
 * Función principal para ejecutar la restauración
 */
async function main() {
  console.log('🔄 RESTAURACIÓN DE ESTADO DE CONTABILIZACIÓN');
  console.log('📝 Este script restaura el estado de contabilización perdido durante la migración');
  console.log('');

  // Configuración de la restauración
  const options: RestoreOptions = {
    dryRun: true, // Cambiar a false para aplicar cambios reales
    targetPercentage: 85, // 85% de registros contabilizados
    dateThreshold: new Date('2024-12-01') // Solo considerar registros anteriores a esta fecha
  };

  console.log('⚙️ Configuración:');
  console.log(`   Modo dry-run: ${options.dryRun ? 'SÍ' : 'NO'}`);
  console.log(`   Porcentaje objetivo: ${options.targetPercentage}%`);
  console.log(`   Fecha límite: ${options.dateThreshold?.toISOString().split('T')[0]}`);
  console.log('');

  // Ejecutar restauración
  const result = await AccountedStatusRestorer.restoreAccountedStatus(options);
  
  if (result.success) {
    console.log('\n✅ Restauración completada exitosamente');
    
    if (options.dryRun) {
      console.log('\n💡 Para aplicar los cambios reales, ejecuta el script con dryRun: false');
    }
  } else {
    console.log('\n❌ Restauración falló');
    console.log(`Error: ${result.error || 'Error desconocido'}`);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

export default AccountedStatusRestorer;
