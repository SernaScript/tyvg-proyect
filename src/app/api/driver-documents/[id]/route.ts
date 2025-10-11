import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/driver-documents/[id] - Obtener un documento específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const document = await prisma.driverDocument.findUnique({
      where: { id: params.id },
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

    if (!document) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error('Error fetching driver document:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/driver-documents/[id] - Actualizar un documento
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { documentType, documentNumber, issueDate, expirationDate, fileUrl, isActive } = body

    // Verificar si el documento existe
    const existingDocument = await prisma.driverDocument.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Validar tipo de documento si se proporciona
    if (documentType) {
      const validDocumentTypes = ['LICENSE', 'MEDICAL_EXAM', 'TRAINING', 'CERTIFICATE', 'SOAT', 'TECHNICAL_REVIEW']
      if (!validDocumentTypes.includes(documentType)) {
        return NextResponse.json(
          { error: 'Tipo de documento inválido' },
          { status: 400 }
        )
      }
    }

    // Validar fechas si se proporcionan
    if (issueDate && expirationDate) {
      const issue = new Date(issueDate)
      const expiration = new Date(expirationDate)
      
      if (issue >= expiration) {
        return NextResponse.json(
          { error: 'La fecha de emisión debe ser anterior a la fecha de vencimiento' },
          { status: 400 }
        )
      }
    }

    // Actualizar el documento
    const updatedDocument = await prisma.driverDocument.update({
      where: { id: params.id },
      data: {
        documentType: documentType || existingDocument.documentType,
        documentNumber: documentNumber || existingDocument.documentNumber,
        issueDate: issueDate ? new Date(issueDate) : existingDocument.issueDate,
        expirationDate: expirationDate ? new Date(expirationDate) : existingDocument.expirationDate,
        fileUrl: fileUrl !== undefined ? fileUrl : existingDocument.fileUrl,
        isActive: isActive !== undefined ? isActive : existingDocument.isActive
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

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error('Error updating driver document:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/driver-documents/[id] - Eliminar un documento
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar si el documento existe
    const existingDocument = await prisma.driverDocument.findUnique({
      where: { id: params.id }
    })

    if (!existingDocument) {
      return NextResponse.json(
        { error: 'Documento no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar el documento
    await prisma.driverDocument.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Documento eliminado exitosamente' })
  } catch (error) {
    console.error('Error deleting driver document:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
