import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// GET /api/drivers/[id] - Obtener un conductor específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const driver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            issueDate: true,
            expirationDate: true,
            fileUrl: true,
            isActive: true,
            isAlerted: true,
            createdAt: true,
            updatedAt: true
          }
        },
        trips: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            tripRequest: {
              select: {
                id: true,
                project: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        advances: {
          select: {
            id: true,
            amount: true,
            status: true,
            period: true
          }
        }
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

// PUT /api/drivers/[id] - Actualizar un conductor
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, identification, license, phone, email, password, isActive } = body

    // Verificar si el conductor existe
    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!existingDriver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe otro conductor con esa cédula
    if (identification && identification !== existingDriver.identification) {
      const existingDriverById = await prisma.driver.findUnique({
        where: { identification }
      })

      if (existingDriverById) {
        return NextResponse.json(
          { error: 'Ya existe otro conductor con esta cédula' },
          { status: 400 }
        )
      }
    }

    // Verificar si ya existe otro conductor con esa licencia
    if (license && license !== existingDriver.license) {
      const existingDriverByLicense = await prisma.driver.findFirst({
        where: { license }
      })

      if (existingDriverByLicense) {
        return NextResponse.json(
          { error: 'Ya existe otro conductor con esta licencia' },
          { status: 400 }
        )
      }
    }

    // Verificar si ya existe otro usuario con ese email
    if (email && email !== existingDriver.user.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email }
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'Ya existe otro usuario con este email' },
          { status: 400 }
        )
      }
    }

    // Preparar datos de actualización
    const updateData: any = {}
    const userUpdateData: any = {}

    if (name !== undefined) {
      updateData.name = name
      userUpdateData.name = name
    }
    if (identification !== undefined) updateData.identification = identification
    if (license !== undefined) updateData.license = license
    if (phone !== undefined) updateData.phone = phone || null
    if (isActive !== undefined) updateData.isActive = isActive
    if (email !== undefined) userUpdateData.email = email
    if (password !== undefined) {
      userUpdateData.password = await bcrypt.hash(password, 12)
    }

    // Actualizar el conductor y su usuario
    const updatedDriver = await prisma.driver.update({
      where: { id: params.id },
      data: {
        ...updateData,
        user: {
          update: userUpdateData
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        documents: {
          select: {
            id: true,
            documentType: true,
            documentNumber: true,
            issueDate: true,
            expirationDate: true,
            fileUrl: true,
            isActive: true,
            isAlerted: true,
            createdAt: true,
            updatedAt: true
          }
        },
        trips: {
          select: {
            id: true,
            status: true,
            scheduledDate: true,
            tripRequest: {
              select: {
                id: true,
                project: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        advances: {
          select: {
            id: true,
            amount: true,
            status: true,
            period: true
          }
        }
      }
    })

    return NextResponse.json(updatedDriver)
  } catch (error) {
    console.error('Error updating driver:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/drivers/[id] - Eliminar un conductor
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el conductor existe
    const existingDriver = await prisma.driver.findUnique({
      where: { id: params.id },
      include: {
        trips: true,
        advances: true,
        documents: true
      }
    })

    if (!existingDriver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene viajes asociados
    if (existingDriver.trips.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un conductor que tiene viajes asociados' },
        { status: 400 }
      )
    }

    // Verificar si tiene anticipos pendientes
    const pendingAdvances = existingDriver.advances.filter(advance => 
      advance.status === 'PENDING' || advance.status === 'PARTIALLY_LEGALIZED'
    )

    if (pendingAdvances.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar un conductor con anticipos pendientes' },
        { status: 400 }
      )
    }

    // Eliminar el conductor (el usuario se elimina por cascade)
    await prisma.driver.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Conductor eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting driver:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
