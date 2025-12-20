import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticateRequest, hasPermission } from '@/lib/auth';
import { PermissionAction } from '@/types/auth';
import { RoleName } from '@/types/auth';

export async function GET(request: NextRequest) {
  try {
    // Obtener roles con sus permisos (todos, no solo activos)
    const roles = await prisma.role.findMany({
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
      },
      orderBy: {
        name: 'asc'
      }
    });

    // Transformar la respuesta para que sea más fácil de usar en el frontend
    const transformedRoles = roles.map(role => ({
      id: role.id,
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      isActive: role.isActive,
      permissions: role.permissions.map(rp => rp.permission)
    }));

    return NextResponse.json({
      success: true,
      data: {
        roles: transformedRoles
      }
    });

  } catch (error) {
    console.error('Error obteniendo roles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Verificar permisos para crear roles
    if (!hasPermission(user.role.permissions, 'roles', PermissionAction.CREATE)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tiene permisos para crear roles' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, displayName, description, isActive, permissionIds } = body;

    // Validaciones básicas
    if (!name || !displayName) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre y nombre para mostrar son requeridos' 
        },
        { status: 400 }
      );
    }

    // Validar que el nombre sea un valor válido del enum
    if (!Object.values(RoleName).includes(name as RoleName)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'El nombre del rol debe ser un valor válido del enum RoleName' 
        },
        { status: 400 }
      );
    }

    // Verificar si el rol ya existe
    const existingRole = await prisma.role.findUnique({
      where: { name: name as RoleName }
    });

    if (existingRole) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un rol con este nombre' 
        },
        { status: 409 }
      );
    }

    // Crear el rol
    const newRole = await prisma.role.create({
      data: {
        name: name as RoleName,
        displayName,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
        permissions: permissionIds && permissionIds.length > 0 ? {
          create: permissionIds.map((permissionId: string) => ({
            permissionId
          }))
        } : undefined
      },
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
      id: newRole.id,
      name: newRole.name,
      displayName: newRole.displayName,
      description: newRole.description,
      isActive: newRole.isActive,
      permissions: newRole.permissions.map(rp => rp.permission)
    };

    return NextResponse.json({
      success: true,
      data: transformedRole,
      message: 'Rol creado exitosamente'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando rol:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
