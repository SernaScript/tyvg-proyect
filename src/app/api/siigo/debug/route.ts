import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const credentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    })

    if (!credentials) {
      return NextResponse.json({
        success: false,
        message: 'No hay credenciales configuradas'
      })
    }

    return NextResponse.json({
      success: true,
      credentials: {
        email: credentials.email,
        platform: credentials.platform,
        isActive: credentials.isActive,
        createdAt: credentials.createdAt
      }
    })

  } catch (error) {
    console.error('Error obteniendo credenciales:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
