import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, hasPermission } from '@/lib/auth';
import { PermissionAction } from '@/types/auth';
import { RoleName } from '@/types/auth';

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

    // Verificar permisos para editar roles
    if (!hasPermission(user.role.permissions, 'roles', PermissionAction.EDIT)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tiene permisos para editar roles' 
        },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { name, displayName, description, isActive, permissionIds } = body;

    // Validaciones básicas
    if (!displayName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre para mostrar es requerido' 
        },
        { status: 400 }
      );
    }

    // Verificar que el rol existe
    const existingRole = await prisma.role.findUnique({
      where: { id }
    });

    if (!existingRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rol no encontrado' 
        },
        { status: 404 }
      );
    }

    // Si se proporciona un nombre, validar que sea válido y único
    if (name && name !== existingRole.name) {
      if (!Object.values(RoleName).includes(name as RoleName)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'El nombre del rol debe ser un valor válido del enum RoleName' 
          },
          { status: 400 }
        );
      }

      // Verificar si otro rol ya tiene ese nombre
      const roleWithSameName = await prisma.role.findUnique({
        where: { name: name as RoleName }
      });

      if (roleWithSameName && roleWithSameName.id !== id) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Ya existe otro rol con este nombre' 
          },
          { status: 409 }
        );
      }
    }

    // Actualizar el rol
    const updateData: any = {
      displayName,
      description: description !== undefined ? (description || null) : undefined,
      isActive: isActive !== undefined ? isActive : undefined
    };

    if (name && name !== existingRole.name) {
      updateData.name = name as RoleName;
    }

    // Actualizar permisos si se proporcionan
    if (permissionIds !== undefined) {
      // Eliminar permisos existentes
      await prisma.rolePermission.deleteMany({
        where: { roleId: id }
      });

      // Crear nuevos permisos si hay alguno
      if (permissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: permissionIds.map((permissionId: string) => ({
            roleId: id,
            permissionId
          }))
        });
      }
    }

    // Actualizar el rol
    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
      include: {
        permissions: {
          include: {
            permission: {
              select: {
                id: true,
                name: true,
                resource: true,
                action: true,
                description: true
              }
            }
          }
        }
      }
    });

    // Transformar la respuesta
    const transformedRole = {
      id: updatedRole.id,
      name: updatedRole.name,
      displayName: updatedRole.displayName,
      description: updatedRole.description,
      isActive: updatedRole.isActive,
      permissions: updatedRole.permissions.map(rp => rp.permission)
    };

    return NextResponse.json({
      success: true,
      data: transformedRole,
      message: 'Rol actualizado exitosamente'
    });

  } catch (error) {
    console.error('Error actualizando rol:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

