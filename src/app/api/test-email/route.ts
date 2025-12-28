import { NextRequest, NextResponse } from 'next/server';
import { EmailService } from '@/lib/EmailService';
import { getBaseUrl } from '@/lib/utils';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email es requerido' 
        },
        { status: 400 }
      );
    }

    // Verificar si SendGrid está configurado
    if (!EmailService.isConfigured()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'SendGrid no está configurado. Verifica SENDGRID_API_KEY en .env' 
        },
        { status: 500 }
      );
    }

    // Enviar correo de prueba
    const baseUrl = getBaseUrl(request);
    const emailSent = await EmailService.sendUserActivationEmail({
      email,
      name: 'Usuario de Prueba',
      password: 'password123',
      roleName: 'Administrador',
      loginUrl: `${baseUrl}/login`
    });

    if (emailSent) {
      return NextResponse.json({
        success: true,
        message: 'Correo de prueba enviado exitosamente'
      });
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error enviando correo de prueba' 
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Error en endpoint de prueba:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
