import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { EmailService } from '@/lib/EmailService'
import { RoleName } from '@/types/auth'

// GET /api/drivers - Listar conductores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const active = searchParams.get('active')

    const where: any = {}

    // Filtro de búsqueda
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { identification: { contains: search, mode: 'insensitive' } },
        { license: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Filtro por activos
    if (active === 'true') {
      where.isActive = true
    }

    const drivers = await prisma.driver.findMany({
      where,
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
            date: true,
            isApproved: true,
            project: {
              select: {
                id: true,
                name: true
              }
            }
          },
          take: 5,
          orderBy: {
            date: 'desc'
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
      },
      orderBy: [
        { isActive: 'desc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(drivers)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/drivers - Crear un nuevo conductor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, identification, license, phone, email, password, isActive = true } = body

    // Validaciones
    if (!name || !identification || !license || !email || !password) {
      return NextResponse.json(
        { error: 'Nombre, cédula, licencia, email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un conductor con esa cédula
    const existingDriverById = await prisma.driver.findUnique({
      where: { identification }
    })

    if (existingDriverById) {
      return NextResponse.json(
        { error: 'Ya existe un conductor con esta cédula' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un conductor con esa licencia
    const existingDriverByLicense = await prisma.driver.findFirst({
      where: { license }
    })

    if (existingDriverByLicense) {
      return NextResponse.json(
        { error: 'Ya existe un conductor con esta licencia' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un usuario con ese email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email' },
        { status: 400 }
      )
    }

    // Obtener el rol de conductor
    const driverRole = await prisma.role.findUnique({
      where: { name: RoleName.DRIVER },
      select: {
        id: true,
        name: true,
        displayName: true
      }
    })

    if (!driverRole) {
      return NextResponse.json(
        { error: 'Rol de conductor no encontrado' },
        { status: 500 }
      )
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12)

    // Crear el conductor con su usuario asociado
    const driver = await prisma.driver.create({
      data: {
        name,
        identification,
        license,
        phone: phone || null,
        isActive,
        user: {
          create: {
            name,
            email,
            password: hashedPassword,
            roleId: driverRole.id
          }
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
          where: { isActive: true },
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
        }
      }
    })

    // Enviar correo de activación al nuevo conductor/usuario
    // NOTA DE SEGURIDAD: No enviamos la contraseña en texto plano por correo
    // Generamos un token de reset para que el usuario establezca su contraseña
    let emailSent = false
    let emailError = null

    try {
      const { randomBytes } = await import('crypto')
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
      const loginUrl = `${baseUrl}/login`

      // Generar token de reset para nuevo usuario
      const token = randomBytes(32).toString('hex')
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Token válido por 24 horas para nuevos usuarios

      // Intentar crear el token de reset
      // Nota: Si el modelo no existe, esto fallará y se capturará en el catch
      await (prisma as any).passwordResetToken.create({
        data: {
          userId: driver.user.id,
          token,
          expiresAt
        }
      })

      const resetPasswordUrl = `${baseUrl}/reset-password/${token}`

      emailSent = await EmailService.sendUserActivationEmail({
        email: driver.user.email,
        name: driver.user.name,
        // No enviamos la contraseña por seguridad
        roleName: driverRole.displayName || 'Conductor',
        loginUrl,
        resetPasswordUrl
      })
    } catch (error: any) {
      console.error('Error enviando correo de activación:', error)
      if (error?.message?.includes('passwordResetToken') || error?.message?.includes('Cannot read properties')) {
        emailError = 'Modelo PasswordResetToken no disponible. Ejecuta: npx prisma generate && npx prisma db push'
      } else {
        emailError = error instanceof Error ? error.message : 'Error desconocido'
      }
    }

    return NextResponse.json({
      success: true,
      data: driver,
      message: 'Conductor creado exitosamente',
      emailSent,
      emailError: emailError || null
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating driver:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
