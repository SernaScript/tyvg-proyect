import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token es requerido' 
        },
        { status: 400 }
      );
    }

    // Buscar token
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
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token inválido'
      });
    }

    // Verificar que el token no haya sido usado
    if (resetToken.used) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Este token ya ha sido utilizado'
      });
    }

    // Verificar que el token no haya expirado
    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Token expirado'
      });
    }

    // Verificar que el usuario esté activo
    if (!resetToken.user.isActive) {
      return NextResponse.json({
        success: false,
        valid: false,
        error: 'Usuario inactivo'
      });
    }

    return NextResponse.json({
      success: true,
      valid: true,
      email: resetToken.user.email
    });

  } catch (error) {
    console.error('Error verificando token:', error);
    return NextResponse.json(
      { 
        success: false, 
        valid: false,
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

