import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/driver-documents - Listar documentos de conductores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const documentType = searchParams.get('documentType')
    const active = searchParams.get('active')
    const expiring = searchParams.get('expiring')

    const where: any = {}

    // Filtro por conductor
    if (driverId) {
      where.driverId = driverId
    }

    // Filtro por tipo de documento
    if (documentType) {
      where.documentType = documentType
    }

    // Filtro por activos
    if (active === 'true') {
      where.isActive = true
    }

    // Filtro por documentos próximos a vencer (30 días)
    if (expiring === 'true') {
      const today = new Date()
      const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
      
      where.expirationDate = {
        lte: thirtyDaysFromNow,
        gte: today
      }
      where.isActive = true
    }

    const documents = await prisma.driverDocument.findMany({
      where,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        }
      },
      orderBy: [
        { expirationDate: 'asc' },
        { documentType: 'asc' }
      ]
    })

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error fetching driver documents:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/driver-documents - Crear un nuevo documento de conductor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { driverId, documentType, documentNumber, issueDate, expirationDate, fileUrl } = body

    // Validaciones
    if (!driverId || !documentType || !documentNumber || !issueDate || !expirationDate) {
      return NextResponse.json(
        { error: 'Conductor, tipo de documento, número, fecha de emisión y vencimiento son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo de documento
    const validDocumentTypes = ['LICENSE', 'MEDICAL_EXAM', 'TRAINING', 'CERTIFICATE', 'SOAT', 'TECHNICAL_REVIEW']
    if (!validDocumentTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Tipo de documento inválido' },
        { status: 400 }
      )
    }

    // Verificar si el conductor existe
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 400 }
      )
    }

    // Verificar si ya existe un documento del mismo tipo para este conductor
    const existingDocument = await prisma.driverDocument.findFirst({
      where: {
        driverId,
        documentType,
        isActive: true
      }
    })

    if (existingDocument) {
      return NextResponse.json(
        { error: 'Ya existe un documento activo de este tipo para este conductor' },
        { status: 400 }
      )
    }

    // Validar fechas
    const issue = new Date(issueDate)
    const expiration = new Date(expirationDate)
    
    if (issue >= expiration) {
      return NextResponse.json(
        { error: 'La fecha de emisión debe ser anterior a la fecha de vencimiento' },
        { status: 400 }
      )
    }

    // Crear el documento
    const document = await prisma.driverDocument.create({
      data: {
        driverId,
        documentType,
        documentNumber,
        issueDate: issue,
        expirationDate: expiration,
        fileUrl: fileUrl || null
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            identification: true
          }
        }
      }
    })

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error('Error creating driver document:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
