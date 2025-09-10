import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// GET - Descargar plantilla de Excel para cargar compras de combustible
export async function GET(request: NextRequest) {
  try {
    // Obtener todos los vehículos activos para la validación
    const vehicles = await (prisma as any).vehicle.findMany({
      where: { isActive: true },
      select: {
        id: true,
        plate: true,
        brand: true,
        model: true
      },
      orderBy: { plate: 'asc' }
    })

    // Crear datos de ejemplo para la plantilla
    const sampleData = [
      {
        'Fecha (dd/mm/aaaa)': '15/01/2024',
        'Vehículo (Placa)': 'ABC-123',
        'Cantidad (Galones)': 25.5,
        'Total ($)': 125000,
        'Proveedor': 'Estación de Servicio Central'
      },
      {
        'Fecha (dd/mm/aaaa)': '16/01/2024',
        'Vehículo (Placa)': 'XYZ-789',
        'Cantidad (Galones)': 30.0,
        'Total ($)': 150000,
        'Proveedor': 'Gasolinera Norte'
      }
    ]

    // Crear hoja de trabajo
    const ws = XLSX.utils.json_to_sheet(sampleData)

    // Configurar ancho de columnas
    const colWidths = [
      { wch: 15 }, // Fecha
      { wch: 15 }, // Vehículo
      { wch: 18 }, // Cantidad
      { wch: 12 }, // Total
      { wch: 25 }  // Proveedor
    ]
    ws['!cols'] = colWidths

    // Crear libro de trabajo
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla Combustible')

    // Crear hoja de validación con vehículos disponibles
    const vehiclesData = vehicles.map((vehicle: any) => ({
      'ID': vehicle.id,
      'Placa': vehicle.plate,
      'Marca': vehicle.brand,
      'Modelo': vehicle.model
    }))

    const vehiclesWs = XLSX.utils.json_to_sheet(vehiclesData)
    vehiclesWs['!cols'] = [
      { wch: 25 }, // ID
      { wch: 12 }, // Placa
      { wch: 15 }, // Marca
      { wch: 15 }  // Modelo
    ]
    XLSX.utils.book_append_sheet(wb, vehiclesWs, 'Vehículos Disponibles')

    // Generar buffer del archivo Excel
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Configurar headers para descarga
    const headers = new Headers()
    headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    headers.set('Content-Disposition', 'attachment; filename="plantilla_combustible.xlsx"')
    headers.set('Content-Length', excelBuffer.length.toString())

    return new NextResponse(excelBuffer, {
      status: 200,
      headers
    })
  } catch (error) {
    console.error('Error generating fuel template:', error)
    return NextResponse.json(
      { error: 'Error al generar la plantilla de combustible' },
      { status: 500 }
    )
  }
}
