import { NextRequest, NextResponse } from 'next/server'
import { SiigoService } from '@/lib/SiigoService'
import { SiigoAccountsPayableService } from '@/lib/SiigoAccountsPayableService'

export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    console.log('Iniciando carga completa de cuentas por pagar...')
    
    // Obtener la primera página para conocer la paginación
    const firstPageData = await SiigoService.getAccountsPayable(1)
    const totalPages = Math.ceil(firstPageData.pagination.total_results / firstPageData.pagination.page_size)
    
    console.log(`Total de páginas a procesar: ${totalPages}`)
    
    let allResults: any[] = []
    let totalProcessed = 0
    let totalErrors = 0
    
    // Crear UN SOLO registro de solicitud para toda la operación
    const generatedRequest = await SiigoAccountsPayableService.createRequestRecord({
      endpoint: 'https://api.siigo.com/v1/accounts-payable',
      page: 1, // Página inicial
      pageSize: firstPageData.pagination.page_size,
      totalResults: firstPageData.pagination.total_results,
      userAgent: request.headers.get('user-agent') || undefined,
      ipAddress: request.headers.get('x-forwarded-for') || 
                request.headers.get('x-real-ip') || 
                'unknown'
    })
    
    console.log(`Registro de solicitud creado: ${generatedRequest.id}`)
    
    // Procesar todas las páginas
    for (let page = 1; page <= totalPages; page++) {
      try {
        console.log(`Procesando página ${page} de ${totalPages}...`)
        
        const pageData = await SiigoService.getAccountsPayable(page)
        
        if (pageData.results && pageData.results.length > 0) {
          // Guardar los datos de esta página usando el mismo requestId
          const saveResult = await SiigoAccountsPayableService.saveAccountsPayableDataForRequest(
            pageData.results,
            generatedRequest.id
          )
          
          allResults = [...allResults, ...pageData.results]
          totalProcessed += saveResult.recordsProcessed
          totalErrors += saveResult.recordsFailed
          
          console.log(`Página ${page} procesada: ${saveResult.recordsProcessed} registros guardados`)
        }
        
        // Pequeña pausa para no sobrecargar la API
        if (page < totalPages) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
        
      } catch (pageError) {
        console.error(`Error procesando página ${page}:`, pageError)
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
    
    console.log('Carga completa finalizada:', {
      totalPages,
      totalRecords: allResults.length,
      totalProcessed,
      totalErrors,
      duration: totalDuration,
      requestId: generatedRequest.id
    })
    
    return NextResponse.json({
      success: true,
      data: {
        totalPages,
        totalRecords: allResults.length,
        totalProcessed,
        totalErrors,
        duration: totalDuration,
        requestId: generatedRequest.id,
        pagination: firstPageData.pagination
      }
    })
    
  } catch (error) {
    console.error('Error en carga completa de cuentas por pagar:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
