import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authenticateRequest, hasPermission } from '@/lib/auth';
import { PermissionAction } from '@/types/auth';

export async function PUT(
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

    // Verificar permisos para editar usuarios
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
    const body = await request.json();
    const { email, name, password, roleId } = body;

    // Validaciones básicas
    if (!email || !roleId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email y rol son requeridos' 
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Formato de email inválido' 
        },
        { status: 400 }
      );
    }

    // Validar longitud de contraseña si se proporciona
    if (password && password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'La contraseña debe tener al menos 6 caracteres' 
        },
        { status: 400 }
      );
    }

    // Verificar que el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id }
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

    // Verificar si el email ya existe en otro usuario
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe un usuario con este email' 
          },
          { status: 409 }
        );
      }
    }

    // Verificar que el rol existe
    const role = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!role) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El rol especificado no existe' 
        },
        { status: 400 }
      );
    }

    // Preparar datos de actualización
    const updateData: any = {
      email,
      name: name || null,
      roleId
    };

    // Solo actualizar la contraseña si se proporciona
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
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
      message: 'Usuario actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

