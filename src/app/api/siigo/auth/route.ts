import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface SiigoAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export async function POST(request: NextRequest) {
  try {
    // Obtener credenciales activas de Siigo
    const credentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    })

    if (!credentials) {
      return NextResponse.json(
        { error: 'No hay credenciales de Siigo configuradas' },
        { status: 400 }
      )
    }

    // Realizar autenticación con Siigo
    const authResponse = await fetch('https://api.siigo.com/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: credentials.email,
        access_key: credentials.accessKey
      })
    })

    if (!authResponse.ok) {
      const errorText = await authResponse.text()
      console.error('Error de autenticación Siigo:', authResponse.status, errorText)
      return NextResponse.json(
        { 
          error: 'Error al autenticar con Siigo',
          details: `Status: ${authResponse.status}, Message: ${errorText}`
        },
        { status: authResponse.status }
      )
    }

    const authData: SiigoAuthResponse = await authResponse.json()

    // Guardar el token en la base de datos (opcional, para tracking)
    await prisma.siigoCredentials.update({
      where: { id: credentials.id },
      data: {
        // Podríamos agregar un campo para almacenar el token si es necesario
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      access_token: authData.access_token,
      token_type: authData.token_type,
      expires_in: authData.expires_in,
      email: credentials.email,
      platform: credentials.platform
    })

  } catch (error) {
    console.error('Error en autenticación de Siigo:', error)
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}
