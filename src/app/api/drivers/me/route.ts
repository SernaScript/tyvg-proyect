import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateRequest } from '@/lib/auth'
import { RoleName } from '@/types/auth'

// GET /api/drivers/me - Obtener el conductor asociado al usuario actual
export async function GET(request: NextRequest) {
  try {
    const currentUser = await authenticateRequest(request)
    
    if (!currentUser) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      )
    }

    // Verificar que el usuario sea un conductor
    if (currentUser.role.name !== RoleName.DRIVER) {
      return NextResponse.json(
        { error: 'El usuario no es un conductor' },
        { status: 403 }
      )
    }

    // Obtener el conductor asociado al usuario
    const driver = await prisma.driver.findUnique({
      where: { userId: currentUser.id },
      select: {
        id: true,
        name: true,
        identification: true,
        license: true,
        phone: true,
        isActive: true
      }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error('Error fetching driver:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

