import { executeFlypassScraping, FlypassCredentials } from '../src/lib/FlypassScraper';
import { processFlypassExcel } from '../src/lib/ExcelProcessor';
import FlypassDataMapper from '../src/lib/FlypassDataMapper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script completo que ejecuta todo el proceso de Flypass:
 * 1. Scraping y descarga del Excel
 * 2. Procesamiento y mapeo a la base de datos
 * 3. Estadísticas finales
 */
async function completeFlypassProcess() {
  console.log('🚀 INICIANDO PROCESO COMPLETO DE FLYPASS');
  console.log('=' .repeat(60));
  
  try {
    // PASO 1: Configurar credenciales
    const credentials: FlypassCredentials = {
      nit: '900698993',
      password: 'Nutabe*2020',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      processToDatabase: true // Procesar automáticamente a la BD
    };
    
    console.log('📝 Credenciales configuradas:');
    console.log(`   NIT: ${credentials.nit}`);
    console.log(`   Rango: ${credentials.startDate} - ${credentials.endDate}`);
    
    // PASO 2: Ejecutar scraping
    console.log('\n🔄 PASO 1: Ejecutando scraping...');
    console.log('-' .repeat(40));
    
    const scrapingResult = await executeFlypassScraping(credentials);
    
    if (!scrapingResult.success) {
      throw new Error(`Error en scraping: ${scrapingResult.error}`);
    }
    
    console.log('✅ Scraping completado exitosamente');
    console.log(`📊 Mensaje: ${scrapingResult.message}`);
    
    // PASO 3: Verificar archivo descargado
    console.log('\n📁 PASO 2: Verificando archivo descargado...');
    console.log('-' .repeat(40));
    
    const downloadsDir = path.join(process.cwd(), 'downloads');
    console.log(`🔍 Buscando en: ${downloadsDir}`);
    
    if (!fs.existsSync(downloadsDir)) {
      throw new Error(`Directorio de descargas no encontrado: ${downloadsDir}`);
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
      throw new Error('No se encontraron archivos Excel descargados');
    }
    
    const latestFile = files[0];
    console.log(`📄 Archivo encontrado: ${latestFile.name}`);
    console.log(`📊 Tamaño: ${(latestFile.stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Modificado: ${latestFile.stats.mtime.toLocaleString()}`);
    
    // Verificar que el archivo existe y es accesible
    if (!fs.existsSync(latestFile.path)) {
      throw new Error(`El archivo no es accesible: ${latestFile.path}`);
    }
    
    // PASO 4: Procesar archivo a la base de datos
    console.log('\n🗄️ PASO 3: Procesando archivo a la base de datos...');
    console.log('-' .repeat(40));
    
    const processResult = await processFlypassExcel(latestFile.path);
    
    if (!processResult.success) {
      throw new Error(`Error procesando archivo: ${processResult.errors.join(', ')}`);
    }
    
    console.log('✅ Procesamiento completado exitosamente');
    console.log(`📊 Total de registros: ${processResult.totalRecords}`);
    console.log(`✅ Registros procesados: ${processResult.processedRecords}`);
    console.log(`❌ Registros con error: ${processResult.errorRecords}`);
    console.log(`📝 Log ID: ${processResult.logId}`);
    
    // PASO 5: Estadísticas finales
    console.log('\n📈 PASO 4: Estadísticas finales...');
    console.log('-' .repeat(40));
    
    const stats = await FlypassDataMapper.getStatistics();
    if (stats) {
      console.log(`📊 Total de registros en BD: ${stats.totalRecords}`);
      
      console.log('\n📋 Distribución por Estado:');
      stats.byStatus.forEach(item => {
        console.log(`   ${item.status}: ${item._count.status.toLocaleString()}`);
      });
      
      console.log('\n📋 Distribución por Tipo de Documento:');
      stats.byDocumentType.forEach(item => {
        console.log(`   ${item.documentType}: ${item._count.documentType.toLocaleString()}`);
      });
      
      console.log('\n📋 Distribución por Peaje:');
      stats.byToll.forEach(item => {
        console.log(`   ${item.tollName}: ${item._count.tollName.toLocaleString()}`);
      });
    }
    
    // PASO 6: Resumen final
    console.log('\n🎉 PROCESO COMPLETADO EXITOSAMENTE');
    console.log('=' .repeat(60));
    console.log('✅ Scraping de Flypass: Completado');
    console.log('✅ Descarga de Excel: Completado');
    console.log('✅ Procesamiento a BD: Completado');
    console.log('✅ Mapeo de datos: Completado');
    console.log('✅ Estadísticas: Generadas');
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   📄 Archivo procesado: ${latestFile.name}`);
    console.log(`   📊 Registros totales: ${processResult.totalRecords.toLocaleString()}`);
    console.log(`   ✅ Registros exitosos: ${processResult.processedRecords.toLocaleString()}`);
    console.log(`   ❌ Registros con error: ${processResult.errorRecords.toLocaleString()}`);
    console.log(`   📝 Log ID: ${processResult.logId}`);
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL PROCESO:');
    console.error('=' .repeat(60));
    console.error(error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  completeFlypassProcess().catch(console.error);
}

export { completeFlypassProcess };
