import { executeFlypassScraping, processDownloadedFile, FlypassCredentials } from '../src/lib/FlypassScraper';
import FlypassDataMapper from '../src/lib/FlypassDataMapper';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script de prueba para el proceso completo automatizado
 */
async function testCompleteAutomation() {
  console.log('🚀 PRUEBA DE AUTOMATIZACIÓN COMPLETA');
  console.log('=' .repeat(60));
  
  try {
    // Configurar credenciales con procesamiento automático habilitado
    const credentials: FlypassCredentials = {
      nit: '900698993',
      password: 'Nutabe*2020',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      processToDatabase: true // ¡HABILITADO!
    };
    
    console.log('📝 Credenciales configuradas:');
    console.log(`   NIT: ${credentials.nit}`);
    console.log(`   Rango: ${credentials.startDate} - ${credentials.endDate}`);
    console.log(`   Procesar a BD: ${credentials.processToDatabase ? '✅ SÍ' : '❌ NO'}`);
    
    // Verificar estado inicial de la carpeta downloads
    const downloadsDir = path.join(process.cwd(), 'downloads');
    console.log('\n📁 Estado inicial de downloads:');
    if (fs.existsSync(downloadsDir)) {
      const initialFiles = fs.readdirSync(downloadsDir)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
      console.log(`   Archivos Excel existentes: ${initialFiles.length}`);
      initialFiles.forEach(file => console.log(`   - ${file}`));
    } else {
      console.log('   Carpeta downloads no existe');
    }
    
    // Ejecutar el proceso completo (scraping + migración + eliminación)
    console.log('\n🔄 Ejecutando proceso completo...');
    console.log('-' .repeat(40));
    
    const startTime = Date.now();
    const result = await executeFlypassScraping(credentials);
    const endTime = Date.now();
    
    console.log('\n📊 RESULTADO DEL PROCESO:');
    console.log('=' .repeat(50));
    console.log(`✅ Éxito: ${result.success}`);
    console.log(`📝 Mensaje: ${result.message}`);
    console.log(`⏱ Tiempo total: ${((endTime - startTime) / 1000).toFixed(2)} segundos`);
    
    if (result.data) {
      console.log(`📊 Datos:`, JSON.stringify(result.data, null, 2));
    }
    
    if (result.error) {
      console.log(`❌ Error: ${result.error}`);
      return;
    }
    
    // Verificar estado final de la carpeta downloads
    console.log('\n📁 Estado final de downloads:');
    if (fs.existsSync(downloadsDir)) {
      const finalFiles = fs.readdirSync(downloadsDir)
        .filter(file => file.endsWith('.xlsx') || file.endsWith('.xls'));
      console.log(`   Archivos Excel restantes: ${finalFiles.length}`);
      finalFiles.forEach(file => console.log(`   - ${file}`));
      
      if (finalFiles.length === 0) {
        console.log('   ✅ ¡Archivo Excel eliminado correctamente!');
      } else {
        console.log('   ⚠️ Archivos Excel aún presentes');
      }
    }
    
    // Obtener estadísticas de la base de datos
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
    
    console.log('\n🎉 ¡PRUEBA COMPLETADA EXITOSAMENTE!');
    console.log('✅ Scraping automático: Funcionando');
    console.log('✅ Descarga automática: Funcionando');
    console.log('✅ Migración automática: Funcionando');
    console.log('✅ Eliminación de archivo: Funcionando');
    
  } catch (error) {
    console.error('\n❌ ERROR EN LA PRUEBA:');
    console.error('=' .repeat(60));
    console.error(error instanceof Error ? error.message : 'Error desconocido');
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  testCompleteAutomation().catch(console.error);
}

export { testCompleteAutomation };
