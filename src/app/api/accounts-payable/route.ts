import { NextRequest, NextResponse } from 'next/server'
import { SiigoService } from '@/lib/SiigoService'
import { SiigoAccountsPayableService } from '@/lib/SiigoAccountsPayableService'

export async function GET(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    const saveToDatabase = searchParams.get('save') === 'true'
    
    console.log(`Consultando cuentas por pagar desde API route - Página ${page}...`)
    
    const accountsPayable = await SiigoService.getAccountsPayable(parseInt(page))
    const duration = Date.now() - startTime
    
    // Si se solicita guardar en la base de datos
    if (saveToDatabase && accountsPayable.results && accountsPayable.results.length > 0) {
      try {
        const saveResult = await SiigoAccountsPayableService.saveAccountsPayableData(
          accountsPayable.results,
          accountsPayable.pagination,
          {
            endpoint: 'https://api.siigo.com/v1/accounts-payable',
            duration,
            userAgent: request.headers.get('user-agent') || undefined,
            ipAddress: request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
          }
        )
        
        console.log('Datos guardados en la base de datos:', saveResult)
      } catch (saveError) {
        console.error('Error guardando en la base de datos:', saveError)
        // No fallar la respuesta si hay error al guardar
      }
    }
    
    return NextResponse.json({
      success: true,
      data: accountsPayable,
      duration,
      savedToDatabase: saveToDatabase
    })
  } catch (error) {
    console.error('Error en API route de cuentas por pagar:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
