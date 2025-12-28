import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { randomBytes } from 'crypto';
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
          error: 'El email es requerido' 
        },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true
      }
    });

    // Por seguridad, siempre devolvemos éxito aunque el usuario no exista
    // Esto previene enumeración de usuarios
    if (!user) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se ha enviado un correo con instrucciones para restablecer la contraseña'
      });
    }

    // Verificar que el usuario esté activo
    if (!user.isActive) {
      return NextResponse.json({
        success: true,
        message: 'Si el email existe, se ha enviado un correo con instrucciones para restablecer la contraseña'
      });
    }

    // Generar token seguro
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token válido por 1 hora

    // Invalidar tokens anteriores del usuario
    await prisma.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        used: false
      },
      data: {
        used: true
      }
    });

    // Crear nuevo token
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt
      }
    });

    // Enviar correo con el enlace de reset
    const baseUrl = getBaseUrl(request);
    const resetUrl = `${baseUrl}/reset-password/${token}`;

    let emailSent = false;
    let emailError = null;

    try {
      emailSent = await EmailService.sendPasswordResetEmail({
        email: user.email,
        name: user.name,
        resetUrl
      });
    } catch (error) {
      console.error('Error enviando correo de reset:', error);
      emailError = error instanceof Error ? error.message : 'Error desconocido';
    }

    return NextResponse.json({
      success: true,
      message: 'Si el email existe, se ha enviado un correo con instrucciones para restablecer la contraseña',
      emailSent,
      emailError: emailError || null
    });

  } catch (error) {
    console.error('Error en forgot-password:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

