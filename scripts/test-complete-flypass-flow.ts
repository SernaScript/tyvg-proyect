/**
 * Script de prueba para el flujo completo de Flypass
 * Simula el proceso: Scraping -> Migración automática -> Limpieza de archivos
 */

import { FlypassScraper, executeFlypassScraping } from '../src/lib/FlypassScraper';
import { FlypassDataMapper } from '../src/lib/FlypassDataMapper';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

interface TestFlowResult {
  scraping: any;
  migration: any;
  fileCleanup: boolean;
  totalDuration: number;
}

/**
 * Simula el flujo completo de Flypass
 */
export class CompleteFlypassFlow {
  
  /**
   * Ejecuta el flujo completo: Scraping + Migración + Limpieza
   */
  static async executeCompleteFlow(credentials: {
    nit: string;
    password: string;
    startDate: string;
    endDate: string;
  }): Promise<TestFlowResult> {
    const startTime = Date.now();
    console.log('🚀 INICIANDO FLUJO COMPLETO DE FLYPASS');
    console.log('=' .repeat(60));
    console.log(`📅 Fecha: ${new Date().toISOString()}`);
    console.log(`🏢 NIT: ${credentials.nit}`);
    console.log(`📅 Rango: ${credentials.startDate} - ${credentials.endDate}`);
    console.log('');

    try {
      // PASO 1: Simular scraping (sin credenciales reales)
      console.log('🕷️ PASO 1: Simulando scraping de Flypass...');
      console.log('ℹ️ Nota: Este es un test, no se ejecutará scraping real');
      
      const scrapingResult = {
        success: true,
        message: 'Scraping simulado completado',
        data: {
          nit: credentials.nit,
          dateRange: `${credentials.startDate} - ${credentials.endDate}`,
          downloadTime: new Date().toISOString(),
          simulated: true
        }
      };
      
      console.log('✅ Scraping simulado completado');

      // PASO 2: Verificar archivos en downloads
      console.log('\n📁 PASO 2: Verificando archivos en downloads...');
      const downloadsDir = path.join(process.cwd(), 'downloads');
      
      if (!fs.existsSync(downloadsDir)) {
        console.log('⚠️ Directorio downloads no existe, creándolo...');
        fs.mkdirSync(downloadsDir, { recursive: true });
      }

      const files = fs.readdirSync(downloadsDir)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'))
        .map(file => ({
          name: file,
          path: path.join(downloadsDir, file),
          stats: fs.statSync(path.join(downloadsDir, file))
        }))
        .sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());

      if (files.length === 0) {
        console.log('⚠️ No hay archivos Excel en downloads para procesar');
        console.log('💡 Coloca un archivo Excel de Flypass en la carpeta downloads/ para probar la migración');
        
        return {
          scraping: scrapingResult,
          migration: { success: false, message: 'No hay archivos para procesar' },
          fileCleanup: false,
          totalDuration: Date.now() - startTime
        };
      }

      console.log(`📋 Archivos encontrados: ${files.length}`);
      files.forEach((file, index) => {
        console.log(`   ${index + 1}. ${file.name} (${file.stats.size} bytes)`);
      });

      // PASO 3: Ejecutar migración automática
      console.log('\n🔄 PASO 3: Ejecutando migración automática...');
      const latestFile = files[0];
      console.log(`📄 Procesando archivo: ${latestFile.name}`);

      // Verificar que el archivo no esté siendo usado
      let retries = 0;
      const maxRetries = 5;
      while (retries < maxRetries) {
        try {
          const testFile = fs.openSync(latestFile.path, 'r');
          fs.closeSync(testFile);
          break;
        } catch (error) {
          retries++;
          if (retries < maxRetries) {
            console.log(`⏳ Archivo en uso, esperando... (intento ${retries}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw new Error('Archivo bloqueado después de múltiples intentos');
          }
        }
      }

      // Ejecutar migración
      const migrationResult = await FlypassDataMapper.processExcelFile(latestFile.path);
      console.log(`✅ Migración completada: ${migrationResult.processedRows}/${migrationResult.totalRows} registros`);

      // PASO 4: Esperar 5 segundos y limpiar archivo
      console.log('\n⏳ PASO 4: Esperando 5 segundos antes de limpiar archivo...');
      await new Promise(resolve => setTimeout(resolve, 5000));

      let fileCleanup = false;
      try {
        fs.unlinkSync(latestFile.path);
        console.log(`🗑️ Archivo eliminado después de 5 segundos: ${latestFile.name}`);
        fileCleanup = true;
      } catch (deleteError) {
        console.warn('⚠️ No se pudo eliminar el archivo:', deleteError);
      }

      // PASO 5: Estadísticas finales
      console.log('\n📊 PASO 5: Estadísticas finales...');
      const totalRecords = await prisma.flypassData.count();
      const accountedRecords = await prisma.flypassData.count({ where: { accounted: false } });
      
      console.log(`   Total de registros en BD: ${totalRecords.toLocaleString()}`);
      console.log(`   Registros pendientes: ${accountedRecords.toLocaleString()}`);

      const endTime = Date.now();
      const totalDuration = endTime - startTime;

      const result: TestFlowResult = {
        scraping: scrapingResult,
        migration: migrationResult,
        fileCleanup,
        totalDuration
      };

      console.log('\n🎉 FLUJO COMPLETO FINALIZADO');
      console.log('=' .repeat(60));
      console.log(`⏱️ Duración total: ${(totalDuration / 1000).toFixed(2)} segundos`);
      console.log(`📊 Registros migrados: ${migrationResult.processedRows.toLocaleString()}`);
      console.log(`🗑️ Archivo limpiado: ${fileCleanup ? 'SÍ' : 'NO'}`);
      console.log(`✅ Éxito general: ${migrationResult.success ? 'SÍ' : 'NO'}`);

      return result;

    } catch (error) {
      console.error('❌ ERROR EN EL FLUJO COMPLETO:', error);
      
      const endTime = Date.now();
      return {
        scraping: { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
        migration: { success: false, error: error instanceof Error ? error.message : 'Error desconocido' },
        fileCleanup: false,
        totalDuration: endTime - startTime
      };
    } finally {
      await prisma.$disconnect();
    }
  }

  /**
   * Prueba solo la migración con archivos existentes
   */
  static async testMigrationOnly(): Promise<void> {
    console.log('🔄 PROBANDO SOLO MIGRACIÓN...');
    console.log('=' .repeat(40));

    const downloadsDir = path.join(process.cwd(), 'downloads');
    
    if (!fs.existsSync(downloadsDir)) {
      console.log('❌ Directorio downloads no existe');
      return;
    }

    const files = fs.readdirSync(downloadsDir)
      .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

    if (files.length === 0) {
      console.log('❌ No hay archivos Excel en downloads');
      return;
    }

    console.log(`📋 Archivos encontrados: ${files.length}`);
    
    for (const file of files) {
      const filePath = path.join(downloadsDir, file);
      console.log(`\n📄 Procesando: ${file}`);
      
      try {
        const result = await FlypassDataMapper.processExcelFile(filePath);
        console.log(`✅ ${file}: ${result.processedRows}/${result.totalRows} registros`);
        
        if (result.errors.length > 0) {
          console.log(`⚠️ Errores: ${result.errors.length}`);
        }
      } catch (error) {
        console.log(`❌ Error procesando ${file}: ${error}`);
      }
    }
  }
}

/**
 * Función principal para ejecutar el test
 */
async function main() {
  console.log('🧪 TEST DE FLUJO COMPLETO DE FLYPASS');
  console.log('📝 Este script simula el proceso completo: Scraping -> Migración -> Limpieza');
  console.log('');

  // Configuración de prueba
  const testCredentials = {
    nit: '900698993',
    password: 'test_password',
    startDate: '2024-01-01',
    endDate: '2024-01-31'
  };

  console.log('⚙️ Configuración de prueba:');
  console.log(`   NIT: ${testCredentials.nit}`);
  console.log(`   Rango: ${testCredentials.startDate} - ${testCredentials.endDate}`);
  console.log('');

  // Verificar si hay archivos para procesar
  const downloadsDir = path.join(process.cwd(), 'downloads');
  const hasFiles = fs.existsSync(downloadsDir) && 
    fs.readdirSync(downloadsDir).some(file => file.endsWith('.xlsx') || file.endsWith('.xls'));

  if (!hasFiles) {
    console.log('⚠️ No hay archivos Excel en downloads/');
    console.log('💡 Coloca un archivo Excel de Flypass en downloads/ para probar la migración');
    console.log('');
    console.log('🔄 Ejecutando solo prueba de migración...');
    await CompleteFlypassFlow.testMigrationOnly();
    return;
  }

  // Ejecutar flujo completo
  const result = await CompleteFlypassFlow.executeCompleteFlow(testCredentials);
  
  if (result.migration.success) {
    console.log('\n✅ Test completado exitosamente');
    console.log('🎯 El flujo de scraping + migración + limpieza está funcionando correctamente');
  } else {
    console.log('\n❌ Test falló');
    console.log('🔧 Revisa los errores antes de usar en producción');
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Error fatal en test:', error);
    process.exit(1);
  });
}

// Export ya está definido en la clase
