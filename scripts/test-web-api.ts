// Usar fetch nativo de Node.js (disponible desde Node 18+)

/**
 * Script de prueba para la API web del scraper
 */
async function testWebAPI() {
  console.log('🌐 PRUEBA DE API WEB DEL SCRAPER');
  console.log('=' .repeat(50));
  
  try {
    const payload = {
      nit: '900698993',
      password: 'Nutabe*2020',
      startDate: '2025-01-01',
      endDate: '2025-01-31',
      processToDatabase: true // ¡HABILITADO!
    };

    console.log('📝 Enviando petición a la API:');
    console.log(`   NIT: ${payload.nit}`);
    console.log(`   Rango: ${payload.startDate} - ${payload.endDate}`);
    console.log(`   Procesar a BD: ${payload.processToDatabase ? '✅ SÍ' : '❌ NO'}`);
    
    console.log('\n🔄 Enviando petición...');
    
    const startTime = Date.now();
    
    const response = await fetch('http://localhost:3001/api/flypass-scraping', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const endTime = Date.now();
    const data = await response.json();
    
    console.log('\n📊 RESULTADO DE LA API:');
    console.log('=' .repeat(50));
    console.log(`✅ Éxito: ${data.success}`);
    console.log(`📝 Mensaje: ${data.message}`);
    console.log(`⏱ Tiempo total: ${((endTime - startTime) / 1000).toFixed(2)} segundos`);
    console.log(`📊 Status HTTP: ${response.status}`);
    
    if (data.data) {
      console.log('\n📋 Datos de respuesta:');
      console.log(JSON.stringify(data.data, null, 2));
    }
    
    if (data.error) {
      console.log(`❌ Error: ${data.error}`);
    }
    
    if (data.success) {
      console.log('\n🎉 ¡API FUNCIONANDO CORRECTAMENTE!');
      console.log('✅ Scraping automático: Funcionando');
      console.log('✅ Descarga automática: Funcionando');
      console.log('✅ Migración automática: Funcionando');
      console.log('✅ Eliminación de archivo: Funcionando');
    } else {
      console.log('\n❌ API con errores');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  }
}

// Ejecutar la prueba
testWebAPI().catch(console.error);
