import { NextRequest, NextResponse } from 'next/server';

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

    // Realizar la petición de autenticación a SIIGO
    const authUrl = `${baseUrl}/auth`;
    
    const authResponse = await fetch(authUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Partner-Id': 'TYVG-APP' // Nombre de la aplicación
      },
      body: JSON.stringify({
        username: email,
        access_key: accessKey
      })
    });

    // Verificar el estado de la respuesta
    if (authResponse.ok) {
      const authData = await authResponse.json();
      
      return NextResponse.json({
        success: true,
        message: 'Conexión exitosa con SIIGO API',
        data: {
          platform,
          email,
          // No devolvemos el accessKey por seguridad
          authenticated: true,
          responseStatus: authResponse.status
        }
      });
    } else {
      // Obtener detalles del error
      let errorMessage = 'Error de autenticación con SIIGO API';
      let errorDetails = null;
      
      try {
        const errorData = await authResponse.json();
        errorDetails = errorData;
        
        // Mensajes de error más específicos según el código de estado
        switch (authResponse.status) {
          case 401:
            errorMessage = 'Credenciales inválidas. Verifica tu email y access key';
            break;
          case 403:
            errorMessage = 'Acceso denegado. Verifica los permisos de tu cuenta';
            break;
          case 404:
            errorMessage = 'Endpoint no encontrado. Verifica la plataforma seleccionada';
            break;
          case 429:
            errorMessage = 'Límite de solicitudes excedido. Intenta más tarde';
            break;
          case 500:
            errorMessage = 'Error interno del servidor de SIIGO';
            break;
          default:
            errorMessage = `Error de conexión: ${authResponse.status}`;
        }
      } catch (parseError) {
        // Si no se puede parsear la respuesta de error
        errorMessage = `Error de conexión: ${authResponse.status} ${authResponse.statusText}`;
      }

      return NextResponse.json({
        success: false,
        error: errorMessage,
        details: errorDetails,
        status: authResponse.status
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
