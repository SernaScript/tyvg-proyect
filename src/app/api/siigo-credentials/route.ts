import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener credenciales de SIIGO
export async function GET() {
  try {
    const credentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    });

    return NextResponse.json({
      success: true,
      data: credentials
    });
  } catch (error) {
    console.error('Error fetching SIIGO credentials:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Connection')) {
        return NextResponse.json(
          { success: false, error: 'Error de conexión a la base de datos' },
          { status: 503 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al obtener credenciales' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar credenciales de SIIGO
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

    // Verificar si ya existen credenciales activas
    const existingCredentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    });

    let credentials;

    if (existingCredentials) {
      // Actualizar credenciales existentes
      credentials = await prisma.siigoCredentials.update({
        where: { id: existingCredentials.id },
        data: {
          email,
          accessKey,
          platform,
          updatedAt: new Date()
        }
      });
    } else {
      // Crear nuevas credenciales
      credentials = await prisma.siigoCredentials.create({
        data: {
          email,
          accessKey,
          platform
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: credentials,
      message: existingCredentials ? 'Credenciales actualizadas exitosamente' : 'Credenciales creadas exitosamente'
    });
  } catch (error) {
    console.error('Error saving SIIGO credentials:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'Ya existen credenciales activas. Solo se permite una configuración a la vez.' },
          { status: 409 }
        );
      }
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { success: false, error: 'Las credenciales a actualizar no existen' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al guardar credenciales' },
      { status: 500 }
    );
  }
}

// DELETE - Desactivar credenciales de SIIGO
export async function DELETE() {
  try {
    const existingCredentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    });

    if (!existingCredentials) {
      return NextResponse.json(
        { success: false, error: 'No hay credenciales activas para eliminar' },
        { status: 404 }
      );
    }

    await prisma.siigoCredentials.update({
      where: { id: existingCredentials.id },
      data: { isActive: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Credenciales desactivadas exitosamente'
    });
  } catch (error) {
    console.error('Error deleting SIIGO credentials:', error);
    
    // Manejar errores específicos de Prisma
    if (error instanceof Error) {
      if (error.message.includes('Record to update not found')) {
        return NextResponse.json(
          { success: false, error: 'Las credenciales a eliminar no existen' },
          { status: 404 }
        );
      }
    }
    
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor al eliminar credenciales' },
      { status: 500 }
    );
  }
}
