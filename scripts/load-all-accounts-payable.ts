import { SiigoService } from '../src/lib/SiigoService'
import { SiigoAccountsPayableService } from '../src/lib/SiigoAccountsPayableService'

async function loadAllAccountsPayable() {
  const startTime = Date.now()
  
  try {
    console.log('🚀 Iniciando carga completa de cuentas por pagar...')
    
    // Obtener la primera página para conocer la paginación
    console.log('📄 Obteniendo primera página...')
    const firstPageData = await SiigoService.getAccountsPayable(1)
    const totalPages = Math.ceil(firstPageData.pagination.total_results / firstPageData.pagination.page_size)
    
    console.log(`📊 Total de páginas a procesar: ${totalPages}`)
    console.log(`📈 Total de registros: ${firstPageData.pagination.total_results}`)
    console.log(`📏 Tamaño de página: ${firstPageData.pagination.page_size}`)
    
    let allResults: any[] = []
    let totalProcessed = 0
    let totalErrors = 0
    
    // Crear UN SOLO registro de solicitud para toda la operación
    const generatedRequest = await SiigoAccountsPayableService.createRequestRecord({
      endpoint: 'https://api.siigo.com/v1/accounts-payable',
      page: 1, // Página inicial
      pageSize: firstPageData.pagination.page_size,
      totalResults: firstPageData.pagination.total_results,
      userAgent: 'Script-LoadAll',
      ipAddress: 'localhost'
    })
    
    console.log(`\n📝 Registro de solicitud creado: ${generatedRequest.id}`)
    
    // Procesar todas las páginas
    for (let page = 1; page <= totalPages; page++) {
      try {
        console.log(`\n🔄 Procesando página ${page} de ${totalPages}...`)
        
        const pageData = await SiigoService.getAccountsPayable(page)
        
        if (pageData.results && pageData.results.length > 0) {
          console.log(`   📋 ${pageData.results.length} registros obtenidos de la API`)
          
          // Guardar los datos de esta página usando el mismo requestId
          const saveResult = await SiigoAccountsPayableService.saveAccountsPayableDataForRequest(
            pageData.results,
            generatedRequest.id
          )
          
          allResults = [...allResults, ...pageData.results]
          totalProcessed += saveResult.recordsProcessed
          totalErrors += saveResult.recordsFailed
          
          console.log(`   ✅ ${saveResult.recordsProcessed} registros guardados en BD`)
          if (saveResult.recordsFailed > 0) {
            console.log(`   ❌ ${saveResult.recordsFailed} registros fallaron`)
          }
        } else {
          console.log(`   ⚠️  No se obtuvieron registros en esta página`)
        }
        
        // Pequeña pausa para no sobrecargar la API
        if (page < totalPages) {
          console.log(`   ⏳ Esperando 500ms antes de la siguiente página...`)
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
      } catch (pageError) {
        console.error(`   ❌ Error procesando página ${page}:`, pageError)
        totalErrors++
      }
    }
    
    const totalDuration = Date.now() - startTime
    
    // Actualizar el registro de solicitud con los resultados finales
    await SiigoAccountsPayableService.updateRequestRecord(generatedRequest.id, {
      recordsProcessed: totalProcessed,
      status: totalErrors > 0 ? 'partial' : 'success',
      duration: totalDuration,
      errorMessage: totalErrors > 0 ? `${totalErrors} registros fallaron` : null
    })
    
    console.log('\n🎉 Carga completa finalizada!')
    console.log('📊 Estadísticas finales:')
    console.log(`   📄 Páginas procesadas: ${totalPages}`)
    console.log(`   📋 Registros obtenidos: ${allResults.length}`)
    console.log(`   ✅ Registros guardados: ${totalProcessed}`)
    console.log(`   ❌ Errores: ${totalErrors}`)
    console.log(`   ⏱️  Tiempo total: ${Math.round(totalDuration / 1000)}s`)
    console.log(`   📈 Promedio: ${Math.round(totalDuration / totalPages)}ms por página`)
    
    if (totalProcessed > 0) {
      console.log('\n✅ ¡Todos los registros han sido guardados exitosamente en la base de datos!')
    } else {
      console.log('\n⚠️  No se guardaron registros. Revisa los errores anteriores.')
    }
    
  } catch (error) {
    console.error('❌ Error en carga completa de cuentas por pagar:', error)
    process.exit(1)
  }
}

// Ejecutar el script
loadAllAccountsPayable()
  .then(() => {
    console.log('\n🏁 Script completado exitosamente')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error)
    process.exit(1)
  })
