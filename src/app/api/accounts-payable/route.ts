import { NextRequest, NextResponse } from 'next/server'
import { SiigoService } from '@/lib/SiigoService'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || '1'
    
    console.log(`Consultando cuentas por pagar desde API route - Página ${page}...`)
    
    const accountsPayable = await SiigoService.getAccountsPayable(parseInt(page))
    
    return NextResponse.json({
      success: true,
      data: accountsPayable
    })
  } catch (error) {
    console.error('Error en API route de cuentas por pagar:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido'
    }, { status: 500 })
  }
}
