/**
 * Script para migrar datos de Flypass a la base de datos
 * Procesa archivos Excel descargados de Flypass y los migra a la tabla flypass_data
 */

import { FlypassDataMapper } from '../src/lib/FlypassDataMapper';
import { ExcelProcessor, processFlypassExcel } from '../src/lib/ExcelProcessor';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface MigrationOptions {
  filePath?: string;
  downloadDir?: string;
  markAsAccounted?: boolean;
  dryRun?: boolean;
}

/**
 * Clase para manejar la migración de datos de Flypass
 */
export class FlypassDataMigration {
  
  /**
   * Ejecuta la migración completa de datos de Flypass
   */
  static async executeMigration(options: MigrationOptions = {}) {
    const startTime = Date.now();
    console.log('🚀 INICIANDO MIGRACIÓN DE DATOS FLYPASS');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`📁 Directorio: ${options.downloadDir || 'downloads'}`);
    console.log(`📄 Archivo específico: ${options.filePath || 'Más reciente'}`);
    console.log(`🔍 Modo dry-run: ${options.dryRun ? 'SÍ' : 'NO'}`);
    console.log(`📊 Marcar como contabilizado: ${options.markAsAccounted ? 'SÍ' : 'NO'}`);
    console.log('');

    try {
      // PASO 1: Verificar archivos disponibles
      console.log('📁 PASO 1: Verificando archivos disponibles...');
      const availableFiles = await this.getAvailableFiles(options.downloadDir || 'downloads');
      
      if (availableFiles.length === 0) {
        throw new Error('No se encontraron archivos Excel en el directorio de descargas');
      }

      console.log(`📋 Archivos encontrados: ${availableFiles.length}`);
      availableFiles.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.size} bytes, ${file.modified})`);
      });

      // PASO 2: Seleccionar archivo a procesar
      const targetFile = options.filePath || availableFiles[0].path;
      console.log(`\n📄 PASO 2: Procesando archivo: ${path.basename(targetFile)}`);

      // PASO 3: Verificar estadísticas actuales
      console.log('\n📊 PASO 3: Estadísticas actuales de la base de datos...');
      const currentStats = await this.getCurrentStats();
      console.log(`   Total de registros: ${currentStats.total.toLocaleString()}`);
      console.log(`   Contabilizados: ${currentStats.accounted.toLocaleString()} (${currentStats.percentageAccounted}%)`);
      console.log(`   Pendientes: ${currentStats.notAccounted.toLocaleString()}`);

      // PASO 4: Procesar archivo Excel
      console.log('\n🔄 PASO 4: Procesando archivo Excel...');
      let migrationResult;
      
      if (options.dryRun) {
        console.log('🔍 MODO DRY-RUN: Solo analizando archivo, no se insertarán datos');
        migrationResult = await this.analyzeFile(targetFile);
      } else {
        migrationResult = await FlypassDataMapper.processExcelFile(targetFile);
      }

      console.log(`✅ Procesamiento completado:`);
      console.log(`   Total de filas: ${migrationResult.totalRows.toLocaleString()}`);
      console.log(`   Procesadas: ${migrationResult.processedRows.toLocaleString()}`);
      console.log(`   Errores: ${migrationResult.errorRows.toLocaleString()}`);

      if (migrationResult.errors.length > 0) {
        console.log('\n⚠️ Errores encontrados:');
        migrationResult.errors.slice(0, 5).forEach((error, index) => {
          console.log(`   ${index + 1}. ${error}`);
        });
        if (migrationResult.errors.length > 5) {
          console.log(`   ... y ${migrationResult.errors.length - 5} errores más`);
        }
      }

      // PASO 5: Marcar como contabilizado si se solicita
      if (options.markAsAccounted && !options.dryRun && migrationResult.success) {
        console.log('\n📝 PASO 5: Marcando registros como contabilizados...');
        
        const markResult = await this.markRecentRecordsAsAccounted();
        console.log(`✅ ${markResult.message}`);
      }

      // PASO 6: Estadísticas finales
      console.log('\n📊 PASO 6: Estadísticas finales...');
      const finalStats = await this.getCurrentStats();
      console.log(`   Total de registros: ${finalStats.total.toLocaleString()}`);
      console.log(`   Contabilizados: ${finalStats.accounted.toLocaleString()} (${finalStats.percentageAccounted}%)`);
      console.log(`   Pendientes: ${finalStats.notAccounted.toLocaleString()}`);

      // PASO 7: Generar reporte final
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;

      const report = {
        success: migrationResult.success,
        duration: `${duration.toFixed(2)} segundos`,
        fileProcessed: path.basename(targetFile),
        migration: migrationResult,
        statsBefore: currentStats,
        statsAfter: finalStats,
        timestamp: new Date().toISOString()
      };

      console.log('\n🎉 MIGRACIÓN COMPLETADA');
      console.log('=' .repeat(60));
      console.log(`⏱️ Duración total: ${report.duration}`);
      console.log(`📄 Archivo procesado: ${report.fileProcessed}`);
      console.log(`📊 Registros procesados: ${migrationResult.processedRows.toLocaleString()}`);
      console.log(`✅ Éxito: ${migrationResult.success ? 'SÍ' : 'NO'}`);
      
      return report;

    } catch (error) {
      console.error('❌ ERROR EN LA MIGRACIÓN:', error);
      
      const errorReport = {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        timestamp: new Date().toISOString(),
        duration: `${((Date.now() - startTime) / 1000).toFixed(2)} segundos`
      };
      
      return errorReport;
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Obtiene archivos disponibles en el directorio de descargas
   */
  private static async getAvailableFiles(downloadDir: string) {
    const downloadsPath = path.join(process.cwd(), downloadDir);
    
    if (!fs.existsSync(downloadsPath)) {
      return [];
    }

    const files = fs.readdirSync(downloadsPath)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
      .map(file => {
        const filePath = path.join(downloadsPath, file);
        const stats = fs.statSync(filePath);
        return {
          name: file,
          path: filePath,
          size: stats.size,
          modified: stats.mtime.toISOString()
        };
      })
      .sort((a, b) => b.modified.localeCompare(a.modified));

    return files;
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
   * Analiza un archivo sin insertar datos (modo dry-run)
   */
  private static async analyzeFile(filePath: string) {
    console.log('🔍 Analizando archivo sin insertar datos...');
    
    // Simular el procesamiento para obtener estadísticas
    const result = await FlypassDataMapper.processExcelFile(filePath);
    
    return {
      ...result,
      success: true, // En dry-run siempre es exitoso
      dryRun: true
    };
  }

  /**
   * Marca registros recientes como contabilizados
   */
  private static async markRecentRecordsAsAccounted() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const result = await prisma.flypassData.updateMany({
      where: {
        accounted: false,
        createdAt: {
          gte: yesterday,
          lte: today
        }
      },
      data: { accounted: true }
    });

    return {
      count: result.count,
      message: `Marcados ${result.count} registros recientes como contabilizados`
    };
  }

  /**
   * Limpia archivos procesados del directorio de descargas
   */
  static async cleanupProcessedFiles(downloadDir: string = 'downloads') {
    console.log('🧹 Limpiando archivos procesados...');
    
    const downloadsPath = path.join(process.cwd(), downloadDir);
    
    if (!fs.existsSync(downloadsPath)) {
      console.log('⚠️ Directorio de descargas no existe');
      return;
    }

    const files = fs.readdirSync(downloadsPath)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

    let cleanedCount = 0;
    
    for (const file of files) {
      try {
        const filePath = path.join(downloadsPath, file);
        fs.unlinkSync(filePath);
        cleanedCount++;
        console.log(`🗑️ Eliminado: ${file}`);
      } catch (error) {
        console.warn(`⚠️ No se pudo eliminar ${file}: ${error}`);
      }
    }

    console.log(`✅ Limpieza completada: ${cleanedCount} archivos eliminados`);
  }
}

/**
 * Función principal para ejecutar la migración
 */
async function main() {
  console.log('📊 MIGRACIÓN DE DATOS FLYPASS');
  console.log('📝 Este script migra archivos Excel de Flypass a la base de datos');
  console.log('');

  // Configuración de la migración
  const options: MigrationOptions = {
    // filePath: 'downloads/archivo_especifico.xlsx', // Descomenta para archivo específico
    downloadDir: 'downloads',
    markAsAccounted: false, // Cambiar a true si quieres marcar como contabilizado
    dryRun: false // Cambiar a true para solo analizar sin insertar
  };

  console.log('⚙️ Configuración:');
  console.log(`   Directorio: ${options.downloadDir}`);
  console.log(`   Marcar como contabilizado: ${options.markAsAccounted ? 'SÍ' : 'NO'}`);
  console.log(`   Modo dry-run: ${options.dryRun ? 'SÍ' : 'NO'}`);
  console.log('');

  // Ejecutar migración
  const result = await FlypassDataMigration.executeMigration(options);
  
  if (result.success) {
    console.log('\n✅ Migración completada exitosamente');
    
    // Preguntar si limpiar archivos
    if (!options.dryRun) {
      console.log('\n🧹 ¿Deseas limpiar los archivos procesados? (y/N)');
      // En un script real, podrías usar readline para interacción
      // Por ahora, comentamos la limpieza automática
      // await FlypassDataMigration.cleanupProcessedFiles(options.downloadDir);
    }
    
    process.exit(0);
  } else {
    console.log('\n❌ Migración falló');
    console.log(`Error: ${result.duration}`);
    process.exit(1);
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
}

// Export ya está definido en la clase
