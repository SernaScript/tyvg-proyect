xximport { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json(
      { success: false, error: 'Error fetching credentials' },
      { status: 500 }
    );
  }
}

// POST - Crear o actualizar credenciales de SIIGO
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, accessKey, platform } = body;

    // Validar campos requeridos
    if (!email || !accessKey || !platform) {
      return NextResponse.json(
        { success: false, error: 'Email, accessKey y platform son requeridos' },
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
    return NextResponse.json(
      { success: false, error: 'Error saving credentials' },
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
    return NextResponse.json(
      { success: false, error: 'Error deleting credentials' },
      { status: 500 }
    );
  }
}
