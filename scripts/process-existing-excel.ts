import { processFlypassExcel } from '../src/lib/ExcelProcessor';
import FlypassDataMapper from '../src/lib/FlypassDataMapper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script para procesar el archivo Excel existente en downloads
 */
async function processExistingExcel() {
  console.log('🔄 PROCESANDO ARCHIVO EXCEL EXISTENTE');
  console.log('=' .repeat(50));
  
  try {
    // Verificar archivo existente
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
      throw new Error('No se encontraron archivos Excel en downloads');
    }
    
    const latestFile = files[0];
    console.log(`📄 Archivo encontrado: ${latestFile.name}`);
    console.log(`📊 Tamaño: ${(latestFile.stats.size / 1024).toFixed(2)} KB`);
    console.log(`📅 Modificado: ${latestFile.stats.mtime.toLocaleString()}`);
    
    // Verificar que el archivo es accesible
    if (!fs.existsSync(latestFile.path)) {
      throw new Error(`El archivo no es accesible: ${latestFile.path}`);
    }
    
    console.log(`✅ Archivo verificado: ${latestFile.path}`);
    
    // Procesar el archivo
    console.log('\n🔄 Procesando archivo a la base de datos...');
    const result = await processFlypassExcel(latestFile.path);
    
    if (!result.success) {
      throw new Error(`Error procesando archivo: ${result.errors.join(', ')}`);
    }
    
    console.log('\n✅ PROCESAMIENTO COMPLETADO');
    console.log('=' .repeat(50));
    console.log(`📊 Total de registros: ${result.totalRecords.toLocaleString()}`);
    console.log(`✅ Registros procesados: ${result.processedRecords.toLocaleString()}`);
    console.log(`❌ Registros con error: ${result.errorRecords.toLocaleString()}`);
    console.log(`📝 Log ID: ${result.logId}`);
    
    // Obtener estadísticas
    console.log('\n📈 ESTADÍSTICAS DE LA BASE DE DATOS:');
    console.log('-' .repeat(40));
    
    const stats = await FlypassDataMapper.getStatistics();
    if (stats) {
      console.log(`📊 Total de registros en BD: ${stats.totalRecords.toLocaleString()}`);
      
      console.log('\n📋 Por Estado:');
      stats.byStatus.forEach((item: any) => {
        console.log(`   ${item.status}: ${item._count.status.toLocaleString()}`);
      });
      
      console.log('\n📋 Por Tipo de Documento:');
      stats.byDocumentType.forEach((item: any) => {
        console.log(`   ${item.documentType}: ${item._count.documentType.toLocaleString()}`);
      });
      
      console.log('\n📋 Por Peaje (Top 5):');
      stats.byToll.slice(0, 5).forEach((item: any) => {
        console.log(`   ${item.tollName}: ${item._count.tollName.toLocaleString()}`);
      });
    }
    
    console.log('\n🎉 ¡Procesamiento completado exitosamente!');
    
  } catch (error) {
    console.error('\n❌ ERROR EN EL PROCESAMIENTO:');
    console.error('=' .repeat(50));
    console.error(error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  processExistingExcel().catch(console.error);
}

export { processExistingExcel };
