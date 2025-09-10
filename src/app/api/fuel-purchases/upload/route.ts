import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

// POST - Procesar archivo Excel con compras de combustible
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No se ha proporcionado ningún archivo' },
        { status: 400 }
      )
    }

    // Verificar que es un archivo Excel
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      return NextResponse.json(
        { error: 'El archivo debe ser un Excel (.xlsx o .xls)' },
        { status: 400 }
      )
    }

    // Leer el archivo Excel
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'El archivo Excel está vacío' },
        { status: 400 }
      )
    }

    // Obtener todos los vehículos para validación
    const vehicles = await (prisma as any).vehicle.findMany({
      where: { isActive: true },
      select: { id: true, plate: true }
    })
    const vehicleMap = new Map(vehicles.map((v: any) => [v.plate.toUpperCase(), v.id]))

    const results = {
      processed: 0,
      errors: 0,
      errorDetails: [] as string[],
      created: [] as any[]
    }

    // Procesar cada fila
    for (let i = 0; i < data.length; i++) {
      const row = data[i] as any
      const rowNumber = i + 2 // +2 porque Excel empieza en 1 y la primera fila son headers

      try {
        // Extraer datos de la fila (manejar diferentes nombres de columnas)
        let fecha = row['Fecha (dd/mm/aaaa)'] || row['Fecha (YYYY-MM-DD)'] || row['Fecha'] || row['fecha']
        const vehiculo = row['Vehículo (Placa)'] || row['Vehículo'] || row['vehiculo'] || row['VehicleId']
        const cantidad = row['Cantidad (Galones)'] || row['Cantidad'] || row['cantidad'] || row['quantity']
        const total = row['Total ($)'] || row['Total'] || row['total']
        const proveedor = row['Proveedor'] || row['proveedor'] || row['provider']

        // Manejar objetos Date de Excel (formato regional)
        if (fecha && typeof fecha === 'object') {
          if (fecha.constructor === Date) {
            // Si es un objeto Date válido, convertirlo a string ISO
            if (!isNaN(fecha.getTime())) {
              fecha = fecha.toISOString().split('T')[0] // Convertir a YYYY-MM-DD
            } else {
              results.errors++
              results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida (objeto Date corrupto): ${fecha}`)
              continue
            }
          } else if (fecha.$type === 'DateTime' && fecha.value) {
            // Manejar formato especial de Excel con $type y value
            try {
              const dateValue = new Date(fecha.value)
              if (!isNaN(dateValue.getTime())) {
                fecha = dateValue.toISOString().split('T')[0]
              } else {
                results.errors++
                results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida (valor corrupto): ${fecha.value}`)
                continue
              }
            } catch (error) {
              results.errors++
              results.errorDetails.push(`Fila ${rowNumber}: Error al procesar fecha: ${fecha.value}`)
              continue
            }
          } else {
            // Intentar convertir cualquier objeto a string y luego procesar
            fecha = fecha.toString()
          }
        }

        // Validaciones
        if (!fecha || !vehiculo || !cantidad || !total || !proveedor) {
          results.errors++
          results.errorDetails.push(`Fila ${rowNumber}: Faltan campos obligatorios`)
          continue
        }

        // Validar y convertir fecha (acepta dd/mm/aaaa, YYYY-MM-DD y números seriales de Excel)
        let fechaObj: Date
        const fechaStr = fecha.toString().trim()
        
        // Verificar si es un número serial de Excel (fecha como número)
        if (!isNaN(Number(fechaStr)) && Number(fechaStr) > 0) {
          const serialNumber = Number(fechaStr)
          // Los números seriales de Excel empiezan desde 1900-01-01 (serial 1)
          // Pero Excel tiene un bug: considera 1900 como año bisiesto, así que ajustamos
          if (serialNumber >= 1 && serialNumber <= 2958465) { // Rango válido para fechas
            try {
              // Crear fecha desde serial de Excel
              const excelEpoch = new Date(1900, 0, 1) // 1 de enero de 1900
              const daysToAdd = serialNumber - 2 // -2 para corregir el bug de Excel
              fechaObj = new Date(excelEpoch.getTime() + daysToAdd * 24 * 60 * 60 * 1000)
              
              // Verificar que la fecha es válida
              if (isNaN(fechaObj.getTime())) {
                results.errors++
                results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida (serial de Excel): ${fecha}`)
                continue
              }
            } catch (error) {
              results.errors++
              results.errorDetails.push(`Fila ${rowNumber}: Error al convertir serial de Excel: ${fecha}`)
              continue
            }
          } else {
            results.errors++
            results.errorDetails.push(`Fila ${rowNumber}: Serial de Excel fuera de rango: ${fecha}`)
            continue
          }
        }
        // Verificar si es formato dd/mm/aaaa
        else if (fechaStr.includes('/')) {
          const parts = fechaStr.split('/')
          if (parts.length === 3) {
            const day = parseInt(parts[0])
            const month = parseInt(parts[1])
            const year = parseInt(parts[2])
            
            // Validar que sean números válidos
            if (isNaN(day) || isNaN(month) || isNaN(year)) {
              results.errors++
              results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida: ${fecha}`)
              continue
            }
            
            // Crear fecha (month - 1 porque Date usa 0-11 para meses)
            fechaObj = new Date(year, month - 1, day)
            
            // Verificar que la fecha es válida
            if (fechaObj.getDate() !== day || fechaObj.getMonth() !== month - 1 || fechaObj.getFullYear() !== year) {
              results.errors++
              results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida: ${fecha}`)
              continue
            }
          } else {
            results.errors++
            results.errorDetails.push(`Fila ${rowNumber}: Formato de fecha inválido. Use dd/mm/aaaa: ${fecha}`)
            continue
          }
        } else {
          // Intentar parsear como YYYY-MM-DD
          fechaObj = new Date(fechaStr)
          if (isNaN(fechaObj.getTime())) {
            results.errors++
            results.errorDetails.push(`Fila ${rowNumber}: Fecha inválida: ${fecha}`)
            continue
          }
        }

        // Validar vehículo
        const vehicleId = vehicleMap.get(vehiculo.toString().toUpperCase())
        if (!vehicleId) {
          results.errors++
          results.errorDetails.push(`Fila ${rowNumber}: Vehículo no encontrado: ${vehiculo}`)
          continue
        }

        // Validar cantidad y total
        const cantidadNum = parseFloat(cantidad)
        const totalNum = parseFloat(total)

        if (isNaN(cantidadNum) || cantidadNum <= 0) {
          results.errors++
          results.errorDetails.push(`Fila ${rowNumber}: Cantidad inválida: ${cantidad}`)
          continue
        }

        if (isNaN(totalNum) || totalNum <= 0) {
          results.errors++
          results.errorDetails.push(`Fila ${rowNumber}: Total inválido: ${total}`)
          continue
        }

        // Crear la compra de combustible
        const fuelPurchase = await (prisma as any).fuelPurchase.create({
          data: {
            date: fechaObj,
            vehicleId,
            quantity: cantidadNum,
            total: totalNum,
            provider: proveedor.toString().trim()
          },
          include: {
            vehicle: {
              select: {
                id: true,
                plate: true,
                brand: true,
                model: true
              }
            }
          }
        })

        results.processed++
        results.created.push(fuelPurchase)

      } catch (error) {
        results.errors++
        results.errorDetails.push(`Fila ${rowNumber}: Error interno - ${error}`)
      }
    }

    return NextResponse.json({
      message: 'Procesamiento completado',
      summary: {
        totalRows: data.length,
        processed: results.processed,
        errors: results.errors
      },
      details: results.errorDetails,
      created: results.created
    })

  } catch (error) {
    console.error('Error processing fuel purchases file:', error)
    return NextResponse.json(
      { error: 'Error al procesar el archivo de compras de combustible' },
      { status: 500 }
    )
  }
}
