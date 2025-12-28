import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - Obtener vehículos asignados a un conductor
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params

    // Usar $queryRaw temporalmente hasta que se regenere el cliente
    const driverVehiclesRaw = await prisma.$queryRaw<Array<{
      id: string
      driverId: string
      vehicleId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }>>`
      SELECT * FROM driver_vehicles 
      WHERE "driverId" = ${driverId} AND "isActive" = true
      ORDER BY "createdAt" DESC
    `
    
    // Obtener los vehículos con sus owners
    const driverVehicles = await Promise.all(
      driverVehiclesRaw.map(async (dv) => {
        const vehicle = await prisma.vehicle.findUnique({
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
        return {
          ...dv,
          vehicle
        }
      })
    )

    return NextResponse.json(driverVehicles)
  } catch (error) {
    console.error('Error fetching driver vehicles:', error)
    return NextResponse.json(
      { error: 'Error al obtener los vehículos del conductor' },
      { status: 500 }
    )
  }
}

// POST - Asignar un vehículo a un conductor
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: driverId } = await params
    const body = await request.json()
    const { vehicleId } = body

    if (!vehicleId) {
      return NextResponse.json(
        { error: 'El ID del vehículo es requerido' },
        { status: 400 }
      )
    }

    // Verificar que el conductor existe
    const driver = await prisma.driver.findUnique({
      where: { id: driverId }
    })

    if (!driver) {
      return NextResponse.json(
        { error: 'Conductor no encontrado' },
        { status: 404 }
      )
    }

    // Verificar que el vehículo existe
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehículo no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si ya existe la relación
    // Usar $queryRaw como alternativa temporal hasta que se regenere el cliente
    const existingRelationResult = await prisma.$queryRaw<Array<{ id: string; isActive: boolean }>>`
      SELECT id, "isActive" 
      FROM driver_vehicles 
      WHERE "driverId" = ${driverId} AND "vehicleId" = ${vehicleId}
      LIMIT 1
    `
    const existingRelation = existingRelationResult[0] || null

    if (existingRelation) {
      // Si existe pero está inactiva, reactivarla
      if (!existingRelation.isActive) {
        await prisma.$executeRaw`
          UPDATE driver_vehicles 
          SET "isActive" = true, "updatedAt" = NOW()
          WHERE "driverId" = ${driverId} AND "vehicleId" = ${vehicleId}
        `
        
        // Obtener los datos completos
        const updatedResult = await prisma.$queryRaw<Array<{
          id: string
          driverId: string
          vehicleId: string
          isActive: boolean
          createdAt: Date
          updatedAt: Date
        }>>`
          SELECT * FROM driver_vehicles 
          WHERE "driverId" = ${driverId} AND "vehicleId" = ${vehicleId}
        `
        
        const updated = updatedResult[0]
        if (updated) {
          // Obtener el vehículo con owner
          const vehicle = await prisma.vehicle.findUnique({
            where: { id: updated.vehicleId },
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
          
          return NextResponse.json({
            ...updated,
            vehicle
          }, { status: 200 })
        }
      }

      return NextResponse.json(
        { error: 'El vehículo ya está asignado a este conductor' },
        { status: 409 }
      )
    }

    // Crear la relación usando $executeRaw
    // Generar ID similar a cuid de Prisma
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 15)
    const newId = `c${timestamp}${random}`
    
    await prisma.$executeRaw`
      INSERT INTO driver_vehicles (id, "driverId", "vehicleId", "isActive", "createdAt", "updatedAt")
      VALUES (${newId}, ${driverId}, ${vehicleId}, true, NOW(), NOW())
    `
    
    // Obtener los datos completos
    const createdResult = await prisma.$queryRaw<Array<{
      id: string
      driverId: string
      vehicleId: string
      isActive: boolean
      createdAt: Date
      updatedAt: Date
    }>>`
      SELECT * FROM driver_vehicles 
      WHERE id = ${newId}
    `
    
    const driverVehicle = createdResult[0]
    if (driverVehicle) {
      // Obtener el vehículo con owner
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: driverVehicle.vehicleId },
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
      
      return NextResponse.json({
        ...driverVehicle,
        vehicle
      }, { status: 201 })
    }

    return NextResponse.json(driverVehicle, { status: 201 })
  } catch (error: any) {
    console.error('Error assigning vehicle to driver:', error)
    
    // Manejar error de constraint único
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El vehículo ya está asignado a este conductor' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Error al asignar el vehículo al conductor' },
      { status: 500 }
    )
  }
}

