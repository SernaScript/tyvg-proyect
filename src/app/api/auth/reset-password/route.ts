import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token y contraseña son requeridos' 
        },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        },
        { status: 400 }
      );
    }

    // Buscar token válido
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            isActive: true
          }
        }
      }
    });

    if (!resetToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token inválido o expirado' 
        },
        { status: 400 }
      );
    }

    // Verificar que el token no haya sido usado
    if (resetToken.used) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este token ya ha sido utilizado' 
        },
        { status: 400 }
      );
    }

    // Verificar que el token no haya expirado
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token expirado. Solicite un nuevo enlace de restablecimiento' 
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario esté activo
    if (!resetToken.user.isActive) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario inactivo. Contacte al administrador' 
        },
        { status: 403 }
      );
    }

    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Actualizar contraseña del usuario
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: {
        password: hashedPassword
      }
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        used: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Contraseña restablecida exitosamente'
    });

  } catch (error) {
    console.error('Error en reset-password:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

