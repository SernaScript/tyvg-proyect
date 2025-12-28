import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener todas las asignaciones conductor-vehículo
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const driverId = searchParams.get('driverId')
    const vehicleId = searchParams.get('vehicleId')
    const activeParam = searchParams.get('active')

    const where: any = {}

    if (driverId) {
      where.driverId = driverId
    }

    if (vehicleId) {
      where.vehicleId = vehicleId
    }

    // Filtrar por isActive solo si se especifica el parámetro
    if (activeParam !== null) {
      where.isActive = activeParam === 'true'
    }

    // Construir condiciones dinámicamente
    const conditions: string[] = []
    const values: any[] = []
    
    if (where.driverId) {
      conditions.push(`"driverId" = $${values.length + 1}`)
      values.push(where.driverId)
    }
    
    if (where.vehicleId) {
      conditions.push(`"vehicleId" = $${values.length + 1}`)
      values.push(where.vehicleId)
    }
    
    if (where.isActive !== undefined) {
      conditions.push(`"isActive" = $${values.length + 1}`)
      values.push(where.isActive)
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // Usar $queryRawUnsafe con parámetros seguros
    const driverVehiclesRaw = await prisma.$queryRawUnsafe<Array<{
      id: string
      driverId: string
      vehicleId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }>>(
      `SELECT * FROM driver_vehicles ${whereClause} ORDER BY "createdAt" DESC`,
      ...values
    )
    
    // Obtener datos relacionados
    const driverVehicles = await Promise.all(
      driverVehiclesRaw.map(async (dv) => {
        const [driver, vehicle] = await Promise.all([
          prisma.driver.findUnique({
            where: { id: dv.driverId },
            select: {
              id: true,
              name: true,
              identification: true,
              license: true,
              isActive: true
            }
          }),
          prisma.vehicle.findUnique({
            where: { id: dv.vehicleId },
            include: {
              owner: {
                select: {
                  id: true,
                  document: true,
                  firstName: true,
                  lastName: true
                }
              }
            }
          })
        ])
        
        return {
          ...dv,
          driver,
          vehicle
        }
      })
    )

    return NextResponse.json(driverVehicles)
  } catch (error) {
    console.error('Error fetching driver vehicles:', error)
    return NextResponse.json(
      { error: 'Error al obtener las asignaciones' },
      { status: 500 }
    )
  }
}

