import { prisma } from '@/lib/prisma'
import { SiigoService } from '@/lib/SiigoService'

interface FlypassJournalData {
  id: string
  cufe: string
  licensePlate: string
  subtotal: number
  description: string
  creationDate: Date
  documentNumber: string
  documentType: string
}

export class FlypassJournalMigrationService {
  /**
   * Migra un registro individual de flypass_data a Siigo como journal
   */
  static async migrateSingleRecord(recordId: string): Promise<{
    success: boolean
    data?: any
    error?: string
  }> {
    try {
      // Obtener el registro específico de flypass_data
      const flypassRecord = await prisma.flypassData.findFirst({
        where: { 
          id: recordId,
          accounted: false, // Solo registros pendientes de migración
          documentType: { not: "FC" } // Excluir facturas (FC)
        }
      })

      if (!flypassRecord) {
        return {
          success: false,
          error: 'Registro no encontrado, ya contabilizado, o es una factura (FC)'
        }
      }

      // Buscar cost_center basado en license_plate
      const costCenter = await prisma.siigoCostCenter.findFirst({
        where: {
          name: flypassRecord.licensePlate
        }
      })

      if (!costCenter) {
        return {
          success: false,
          error: `No se encontró cost_center para la placa '${flypassRecord.licensePlate}' en siigo_cost_centers`
        }
      }

      // Construir el journal para Siigo
      const journalData = {
        document: {
          id: 39069 // ID específico para journals de Flypass
        },
        date: flypassRecord.creationDate.toISOString().split('T')[0], // YYYY-MM-DD
        items: [
          {
            account: {
              code: '23359501',
              movement: 'Debit'
            },
            customer: {
              identification: '900219834',
              branch_office: 0
            },
            description: `${flypassRecord.documentType} FP - ${flypassRecord.description}`,
            cost_center: costCenter.id,
            value: Number(flypassRecord.subtotal),
            due: {
              prefix: flypassRecord.relatedDocument ? flypassRecord.relatedDocument.substring(0, 4) : "",
              consecutive: flypassRecord.relatedDocument ? parseInt(flypassRecord.relatedDocument.substring(4)) || 0 : 0,
              quote: 1,
              date: flypassRecord.creationDate.toISOString().split('T')[0]
            }
          },
          {
            account: {
              code: '61350603',
              movement: 'Credit'
            },
            customer: {
              identification: '900219834',
              branch_office: 0
            },
            description: `${flypassRecord.documentType} FP- ${flypassRecord.description}`,
            cost_center: 518, // Centro de costo fijo para contrapartida
            value: Number(flypassRecord.subtotal)
          }
        ],
        observations: `Migración automática - CUFE: ${flypassRecord.cufe} - Placa: ${flypassRecord.licensePlate}`
      }

      // Crear journal en Siigo usando SiigoService
      const siigoResponse = await SiigoService.createJournal(journalData)

      // Marcar el registro como contabilizado
      await prisma.flypassData.update({
        where: { id: recordId },
        data: { accounted: true }
      })

      return {
        success: true,
        data: {
          flypassRecord: {
            id: flypassRecord.id,
            licensePlate: flypassRecord.licensePlate,
            documentNumber: flypassRecord.documentNumber,
            subtotal: flypassRecord.subtotal,
            cufe: flypassRecord.cufe,
            documentType: flypassRecord.documentType
          },
          costCenter: {
            id: costCenter.id,
            name: costCenter.name
          },
          siigoResponse
        }
      }

    } catch (error) {
      console.error('Error en migración de journal:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Migra múltiples registros de flypass_data a Siigo como journals
   */
  static async migrateMultipleRecords(): Promise<{
    success: boolean
    results: {
      processed: number
      errors: number
      errorDetails: string[]
      migrated: any[]
    }
    error?: string
  }> {
    try {
      // Obtener todos los registros de flypass_data pendientes de migración (no-FC)
      const flypassData = await prisma.flypassData.findMany({
        where: { 
          accounted: false,
          documentType: { not: "FC" } // Excluir facturas (FC)
        },
        orderBy: {
          creationDate: 'asc'
        }
      })

      if (flypassData.length === 0) {
        return {
          success: true,
          results: {
            processed: 0,
            errors: 0,
            errorDetails: [],
            migrated: []
          }
        }
      }

      const results = {
        processed: 0,
        errors: 0,
        errorDetails: [] as string[],
        migrated: [] as any[]
      }

      // Procesar cada registro de flypass_data
      for (const record of flypassData) {
        try {
          const migrationResult = await this.migrateSingleRecord(record.id)
          
          if (migrationResult.success) {
            results.processed++
            results.migrated.push(migrationResult.data)
          } else {
            results.errors++
            results.errorDetails.push(
              `Registro ${record.id} (${record.licensePlate}): ${migrationResult.error}`
            )
          }
        } catch (error) {
          results.errors++
          results.errorDetails.push(
            `Registro ${record.id} (${record.licensePlate}): Error inesperado - ${error}`
          )
        }
      }

      return {
        success: true,
        results
      }

    } catch (error) {
      console.error('Error en migración masiva de journals:', error)
      return {
        success: false,
        results: {
          processed: 0,
          errors: 0,
          errorDetails: [],
          migrated: []
        },
        error: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  /**
   * Obtiene estadísticas de registros pendientes de migración como journals
   */
  static async getPendingJournalStats(): Promise<{
    totalPending: number
    byDocumentType: Record<string, number>
  }> {
    try {
      const pendingRecords = await prisma.flypassData.findMany({
        where: { 
          accounted: false,
          documentType: { not: "FC" }
        },
        select: {
          documentType: true
        }
      })

      const byDocumentType = pendingRecords.reduce((acc, record) => {
        acc[record.documentType] = (acc[record.documentType] || 0) + 1
        return acc
      }, {} as Record<string, number>)

      return {
        totalPending: pendingRecords.length,
        byDocumentType
      }
    } catch (error) {
      console.error('Error obteniendo estadísticas de journals pendientes:', error)
      return {
        totalPending: 0,
        byDocumentType: {}
      }
    }
  }
}
