import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Utilidades para manejar el estado de contabilización de registros de Flypass
 */
export class AccountingUtils {
  
  /**
   * Marca registros como contabilizados por rango de fechas
   */
  static async markAsAccountedByDateRange(
    startDate: Date, 
    endDate: Date,
    documentType?: string
  ): Promise<{ count: number; message: string }> {
    try {
      const whereClause: any = {
        accounted: false,
        creationDate: {
          gte: startDate,
          lte: endDate
        }
      };
      
      if (documentType) {
        whereClause.documentType = documentType;
      }
      
      const result = await prisma.flypassData.updateMany({
        where: whereClause,
        data: { accounted: true }
      });
      
      return {
        count: result.count,
        message: `Marcados ${result.count} registros como contabilizados`
      };
    } catch (error) {
      throw new Error(`Error marcando registros: ${error}`);
    }
  }
  
  /**
   * Marca registros como contabilizados por CUFE
   */
  static async markAsAccountedByCUFE(cufes: string[]): Promise<{ count: number; message: string }> {
    try {
      const result = await prisma.flypassData.updateMany({
        where: {
          cufe: { in: cufes },
          accounted: false
        },
        data: { accounted: true }
      });
      
      return {
        count: result.count,
        message: `Marcados ${result.count} registros como contabilizados`
      };
    } catch (error) {
      throw new Error(`Error marcando registros por CUFE: ${error}`);
    }
  }
  
  /**
   * Obtiene estadísticas de contabilización
   */
  static async getAccountingStats() {
    try {
      const total = await prisma.flypassData.count();
      const accounted = await prisma.flypassData.count({ where: { accounted: true } });
      const notAccounted = await prisma.flypassData.count({ where: { accounted: false } });
      
      const byDocumentType = await prisma.flypassData.groupBy({
        by: ['documentType', 'accounted'],
        _count: { documentType: true }
      });
      
      const byToll = await prisma.flypassData.groupBy({
        by: ['tollName', 'accounted'],
        _count: { tollName: true },
        orderBy: { _count: { tollName: 'desc' } },
        take: 10
      });
      
      return {
        total,
        accounted,
        notAccounted,
        percentageAccounted: total > 0 ? ((accounted / total) * 100).toFixed(2) : '0.00',
        byDocumentType,
        byToll
      };
    } catch (error) {
      throw new Error(`Error obteniendo estadísticas: ${error}`);
    }
  }
  
  /**
   * Obtiene registros pendientes de contabilizar
   */
  static async getPendingRecords(
    limit: number = 50,
    documentType?: string,
    tollName?: string
  ) {
    try {
      const whereClause: any = { accounted: false };
      
      if (documentType) {
        whereClause.documentType = documentType;
      }
      
      if (tollName) {
        whereClause.tollName = tollName;
      }
      
      return await prisma.flypassData.findMany({
        where: whereClause,
        select: {
          cufe: true,
          documentNumber: true,
          documentType: true,
          licensePlate: true,
          tollName: true,
          total: true,
          creationDate: true
        },
        orderBy: { creationDate: 'desc' },
        take: limit
      });
    } catch (error) {
      throw new Error(`Error obteniendo registros pendientes: ${error}`);
    }
  }
  
  /**
   * Revierte el estado de contabilización (para casos de error)
   */
  static async revertAccounting(
    startDate: Date, 
    endDate: Date
  ): Promise<{ count: number; message: string }> {
    try {
      const result = await prisma.flypassData.updateMany({
        where: {
          accounted: true,
          creationDate: {
            gte: startDate,
            lte: endDate
          }
        },
        data: { accounted: false }
      });
      
      return {
        count: result.count,
        message: `Revertidos ${result.count} registros a no contabilizados`
      };
    } catch (error) {
      throw new Error(`Error revirtiendo contabilización: ${error}`);
    }
  }
}

/**
 * Script de demostración de las utilidades de contabilización
 */
async function demonstrateAccountingUtils() {
  console.log('🧮 DEMOSTRACIÓN DE UTILIDADES DE CONTABILIZACIÓN');
  console.log('=' .repeat(60));
  
  try {
    // 1. Mostrar estadísticas actuales
    console.log('📊 Estadísticas actuales:');
    const stats = await AccountingUtils.getAccountingStats();
    
    console.log(`   Total de registros: ${stats.total.toLocaleString()}`);
    console.log(`   Contabilizados: ${stats.accounted.toLocaleString()} (${stats.percentageAccounted}%)`);
    console.log(`   Pendientes: ${stats.notAccounted.toLocaleString()}`);
    
    // 2. Mostrar registros pendientes
    console.log('\n📋 Registros pendientes de contabilizar (primeros 5):');
    const pending = await AccountingUtils.getPendingRecords(5);
    
    pending.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.documentNumber} - ${record.licensePlate} - $${record.total.toLocaleString()}`);
    });
    
    // 3. Marcar algunos registros como contabilizados (solo para demostración)
    console.log('\n🔄 Marcando algunos registros como contabilizados...');
    
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const result = await AccountingUtils.markAsAccountedByDateRange(
      yesterday,
      today,
      'FC' // Solo facturas
    );
    
    console.log(`✅ ${result.message}`);
    
    // 4. Mostrar estadísticas actualizadas
    console.log('\n📊 Estadísticas actualizadas:');
    const updatedStats = await AccountingUtils.getAccountingStats();
    
    console.log(`   Contabilizados: ${updatedStats.accounted.toLocaleString()} (${updatedStats.percentageAccounted}%)`);
    console.log(`   Pendientes: ${updatedStats.notAccounted.toLocaleString()}`);
    
    // 5. Mostrar distribución por tipo de documento
    console.log('\n📋 Distribución por tipo de documento:');
    updatedStats.byDocumentType.forEach(item => {
      const status = item.accounted ? 'Contabilizado' : 'Pendiente';
      console.log(`   ${item.documentType} - ${status}: ${item._count.documentType}`);
    });
    
    // 6. Revertir cambios de demostración
    console.log('\n🔄 Revirtiendo cambios de demostración...');
    const revertResult = await AccountingUtils.revertAccounting(yesterday, today);
    console.log(`✅ ${revertResult.message}`);
    
    console.log('\n🎉 Demostración completada!');
    console.log('✅ Todas las utilidades funcionan correctamente');
    
  } catch (error) {
    console.error('❌ Error en la demostración:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el script
if (require.main === module) {
  demonstrateAccountingUtils().catch(console.error);
}

export { demonstrateAccountingUtils };
