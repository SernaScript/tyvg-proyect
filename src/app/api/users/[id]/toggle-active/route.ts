import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, hasPermission } from '@/lib/auth';
import { PermissionAction } from '@/types/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No autorizado' 
        },
        { status: 401 }
      );
    }

    // Verificar permisos para editar usuarios (necesario para activar/desactivar)
    if (!hasPermission(user.role.permissions, 'users', PermissionAction.EDIT)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tiene permisos para editar usuarios' 
        },
        { status: 403 }
      );
    }

    const { id } = params;

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Usuario no encontrado' 
        },
        { status: 404 }
      );
    }

    // No permitir desactivarse a sí mismo
    if (existingUser.id === user.id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No puede desactivar su propia cuenta' 
        },
        { status: 400 }
      );
    }

    // Cambiar el estado activo
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !existingUser.isActive
      },
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        }
      }
    });

    // Remover la contraseña de la respuesta
    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: `Usuario ${updatedUser.isActive ? 'activado' : 'desactivado'} exitosamente`
    });

  } catch (error) {
    console.error('Error cambiando estado del usuario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

