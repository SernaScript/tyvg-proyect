import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SiigoService } from '@/lib/SiigoService';

// POST - Probar conexión con SIIGO API
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'Formato JSON inválido' },
        { status: 400 }
      );
    }

    const { email, accessKey, platform } = body;

    // Validar campos requeridos
    if (!email || !accessKey || !platform) {
      return NextResponse.json(
        { success: false, error: 'Email, accessKey y platform son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Formato de email inválido' },
        { status: 400 }
      );
    }

    // Validar plataforma válida
    const validPlatforms = ['sandbox', 'production', 'data'];
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { success: false, error: `Plataforma inválida. Debe ser una de: ${validPlatforms.join(', ')}` },
        { status: 400 }
      );
    }

    // Determinar la URL base según la plataforma
    let baseUrl: string;
    switch (platform) {
      case 'sandbox':
        baseUrl = 'https://api.siigo.com';
        break;
      case 'production':
        baseUrl = 'https://api.siigo.com';
        break;
      case 'data':
        baseUrl = 'https://api.siigo.com';
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Plataforma no soportada' },
          { status: 400 }
        );
    }

    // Guardar las credenciales temporalmente para la prueba
    const existingCredentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    });

    if (existingCredentials) {
      await prisma.siigoCredentials.update({
        where: { id: existingCredentials.id },
        data: {
          email,
          accessKey,
          platform,
          isActive: true
        }
      });
    } else {
      await prisma.siigoCredentials.create({
        data: {
          email,
          accessKey,
          platform,
          isActive: true
        }
      });
    }

    // Limpiar el token cache para forzar nueva autenticación
    SiigoService.clearToken();

    // Probar conexión usando el servicio
    const testResult = await SiigoService.testConnection();

    if (testResult.success) {
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con SIIGO API',
        data: {
          platform,
          email,
          authenticated: true,
          responseStatus: testResult.status
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: testResult.message,
        status: testResult.status
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Error testing SIIGO connection:', error);
    
    // Manejar diferentes tipos de errores
    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return NextResponse.json(
          { success: false, error: 'Error de conexión de red. Verifica tu conexión a internet' },
          { status: 503 }
        );
      }
      if (error.message.includes('timeout')) {
        return NextResponse.json(
          { success: false, error: 'Timeout de conexión. El servidor de SIIGO no respondió a tiempo' },
          { status: 504 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al probar la conexión' },
      { status: 500 }
    );
  }
}
