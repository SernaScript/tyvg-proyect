import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Obtener todos los permisos
    const permissions = await prisma.permission.findMany({
      orderBy: [
        { resource: 'asc' },
        { action: 'asc' }
      ]
    });

    return NextResponse.json({
      success: true,
      data: {
        permissions
      }
    });

  } catch (error) {
    console.error('Error obteniendo permisos:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
