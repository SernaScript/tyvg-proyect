import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { authenticateRequest, hasPermission } from '@/lib/auth';
import { PermissionAction, RoleName } from '@/types/auth';
import { EmailService } from '@/lib/EmailService';

export async function GET(request: NextRequest) {
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

    // Verificar permisos para ver usuarios
    if (!hasPermission(user.role.permissions, 'users', PermissionAction.VIEW)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tiene permisos para ver usuarios' 
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const role = searchParams.get('role');
    const active = searchParams.get('active');

    // Construir filtros
    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (role) {
      // Validar que el rol sea un valor válido del enum
      if (Object.values(RoleName).includes(role as RoleName)) {
        where.role = {
          name: role as RoleName
        };
      }
    }

    if (active === 'true') {
      where.isActive = true;
    }

    // Obtener usuarios con sus roles
    const users = await prisma.user.findMany({
      where,
      include: {
        role: {
          select: {
            id: true,
            name: true,
            displayName: true,
            description: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Contar total de usuarios
    const totalCount = await prisma.user.count({ where });

    return NextResponse.json({
      success: true,
      data: {
        users,
        totalCount
      }
    });

  } catch (error) {
    console.error('Error obteniendo usuarios:', error);
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

    // Verificar permisos para crear usuarios
    if (!hasPermission(user.role.permissions, 'users', PermissionAction.CREATE)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No tiene permisos para crear usuarios' 
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, name, password, roleId } = body;

    // Validaciones básicas
    if (!email || !password || !roleId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Email, contraseña y rol son requeridos' 
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

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Ya existe un usuario con este email' 
        },
        { status: 409 }
      );
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

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Crear usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        roleId,
        isActive: true
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
    const { password: _, ...userWithoutPassword } = newUser;

    // Enviar correo de activación al nuevo usuario
    let emailSent = false;
    let emailError = null;
    
    try {
      const loginUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'}/login`;
      
      emailSent = await EmailService.sendUserActivationEmail({
        email: newUser.email,
        name: newUser.name,
        password: password, // Usar la contraseña original, no la encriptada
        roleName: newUser.role.displayName,
        loginUrl
      });
    } catch (error) {
      console.error('Error enviando correo de activación:', error);
      emailError = error instanceof Error ? error.message : 'Error desconocido';
    }

    return NextResponse.json({
      success: true,
      data: userWithoutPassword,
      message: 'Usuario creado exitosamente',
      emailSent,
      emailError: emailError || null
    }, { status: 201 });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
