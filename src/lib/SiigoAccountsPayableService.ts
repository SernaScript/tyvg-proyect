import { prisma } from '@/lib/prisma'

interface SiigoAccountPayableData {
  due: {
    prefix: string
    consecutive: number
    quote: number
    date: string
    balance: number
  }
  provider: {
    identification: string
    branch_office: number
    name: string
  }
  cost_center: {
    code: number
    name: string
  }
  currency: {
    code: string
    balance: number
  }
}

interface SiigoPaginationData {
  page: number
  page_size: number
  total_results: number
}

export class SiigoAccountsPayableService {
  /**
   * Crea un registro de solicitud HTTP
   */
  static async createRequestRecord(requestData: {
    endpoint: string
    page: number
    pageSize: number
    totalResults: number
    userAgent?: string
    ipAddress?: string
  }): Promise<{ id: string }> {
    try {
      const generatedRequest = await (prisma as any).siigoAccountsPayableGenerated.create({
        data: {
          requestDate: new Date(),
          endpoint: requestData.endpoint,
          page: requestData.page,
          pageSize: requestData.pageSize,
          totalResults: requestData.totalResults,
          recordsProcessed: 0,
          status: 'processing',
          duration: 0,
          userAgent: requestData.userAgent,
          ipAddress: requestData.ipAddress
        }
      })

      return { id: generatedRequest.id }
    } catch (error) {
      console.error('Error creando registro de solicitud:', error)
      throw error
    }
  }

  /**
   * Actualiza un registro de solicitud HTTP
   */
  static async updateRequestRecord(
    requestId: string,
    updateData: {
      recordsProcessed: number
      status: 'success' | 'partial' | 'error'
      duration: number
      errorMessage?: string | null
    }
  ): Promise<void> {
    try {
      await (prisma as any).siigoAccountsPayableGenerated.update({
        where: { id: requestId },
        data: {
          recordsProcessed: updateData.recordsProcessed,
          status: updateData.status,
          duration: updateData.duration,
          errorMessage: updateData.errorMessage,
          updatedAt: new Date()
        }
      })
    } catch (error) {
      console.error('Error actualizando registro de solicitud:', error)
      throw error
    }
  }

  /**
   * Guarda los datos de cuentas por pagar usando un requestId existente
   */
  static async saveAccountsPayableDataForRequest(
    accountsData: SiigoAccountPayableData[],
    generatedRequestId: string
  ): Promise<{ recordsProcessed: number; recordsFailed: number }> {
    try {
      console.log('SiigoAccountsPayableService: Guardando datos para request existente...', {
        accountsCount: accountsData.length,
        requestId: generatedRequestId
      })

      let processedCount = 0
      let errorCount = 0

      for (const account of accountsData) {
        try {
          const savedAccount = await (prisma as any).siigoAccountsPayable.create({
            data: {
              // Campos del objeto due
              prefix: account.due?.prefix || '',
              consecutive: BigInt(account.due?.consecutive || 0),
              quote: account.due?.quote || 0,
              dueDate: account.due?.date ? new Date(account.due.date) : new Date(),
              balance: account.due?.balance || 0,
              
              // Campos del objeto provider (sin id)
              providerIdentification: account.provider?.identification || '',
              providerBranchOffice: account.provider?.branch_office || 0,
              providerName: account.provider?.name || '',
              
              // Campos del objeto cost_center
              costCenterCode: account.cost_center?.code || 0,
              costCenterName: account.cost_center?.name || '',
              
              // Campos del objeto currency
              currencyCode: account.currency?.code || '',
              currencyBalance: account.currency?.balance || 0,
              
              // Nuevos campos de pago
              paymentValue: null,
              approved: false,
              paid: false,
              
              // Relación con la solicitud
              generatedRequestId: generatedRequestId
            }
          })

          processedCount++
        } catch (accountError) {
          console.error('Error guardando cuenta por pagar:', accountError)
          errorCount++
        }
      }

      console.log('Guardado completado:', {
        generatedRequestId,
        recordsProcessed: processedCount,
        recordsFailed: errorCount
      })

      return {
        recordsProcessed: processedCount,
        recordsFailed: errorCount
      }
    } catch (error) {
      console.error('Error en saveAccountsPayableDataForRequest:', error)
      throw error
    }
  }

  /**
   * Guarda los datos de cuentas por pagar en la base de datos
   */
  static async saveAccountsPayableData(
    accountsData: SiigoAccountPayableData[],
    paginationData: SiigoPaginationData,
    requestInfo: {
      endpoint: string
      duration?: number
      userAgent?: string
      ipAddress?: string
    }
  ) {
    const startTime = Date.now()
    
    try {
      console.log('SiigoAccountsPayableService: Iniciando guardado...', {
        accountsCount: accountsData.length,
        pagination: paginationData
      })

      // Crear el registro de la solicitud HTTP
      const generatedRequest = await (prisma as any).siigoAccountsPayableGenerated.create({
        data: {
          requestDate: new Date(),
          endpoint: requestInfo.endpoint,
          page: paginationData.page,
          pageSize: paginationData.page_size,
          totalResults: paginationData.total_results,
          recordsProcessed: 0, // Se actualizará después
          status: 'processing',
          duration: requestInfo.duration,
          userAgent: requestInfo.userAgent,
          ipAddress: requestInfo.ipAddress
        }
      })

      console.log('Registro de solicitud creado:', generatedRequest.id)

      // Procesar y guardar cada cuenta por pagar
      const savedAccounts = []
      let processedCount = 0
      let errorCount = 0

      for (const account of accountsData) {
        try {
          const savedAccount = await (prisma as any).siigoAccountsPayable.create({
            data: {
              // Campos del objeto due
              prefix: account.due?.prefix || '',
              consecutive: BigInt(account.due?.consecutive || 0),
              quote: account.due?.quote || 0,
              dueDate: account.due?.date ? new Date(account.due.date) : new Date(),
              balance: account.due?.balance || 0,
              
              // Campos del objeto provider (sin id)
              providerIdentification: account.provider?.identification || '',
              providerBranchOffice: account.provider?.branch_office || 0,
              providerName: account.provider?.name || '',
              
              // Campos del objeto cost_center
              costCenterCode: account.cost_center?.code || 0,
              costCenterName: account.cost_center?.name || '',
              
              // Campos del objeto currency
              currencyCode: account.currency?.code || '',
              currencyBalance: account.currency?.balance || 0,
              
              // Nuevos campos de pago
              paymentValue: null,
              approved: false,
              paid: false,
              
              // Relación con la solicitud
              generatedRequestId: generatedRequest.id
            }
          })
          
          savedAccounts.push(savedAccount)
          processedCount++
        } catch (error) {
          console.error('Error guardando cuenta por pagar:', error)
          errorCount++
        }
      }

      // Actualizar el registro de la solicitud con el resultado final
      const finalStatus = errorCount === 0 ? 'success' : 
                         processedCount === 0 ? 'error' : 'partial'
      
      const finalDuration = Date.now() - startTime

      await (prisma as any).siigoAccountsPayableGenerated.update({
        where: { id: generatedRequest.id },
        data: {
          recordsProcessed: processedCount,
          status: finalStatus,
          duration: finalDuration,
          errorMessage: errorCount > 0 ? `${errorCount} registros fallaron al guardar` : null
        }
      })

      console.log('Guardado completado:', {
        generatedRequestId: generatedRequest.id,
        recordsProcessed: processedCount,
        recordsFailed: errorCount
      })

      return {
        success: true,
        generatedRequestId: generatedRequest.id,
        recordsProcessed: processedCount,
        recordsFailed: errorCount,
        totalRecords: accountsData.length
      }

    } catch (error) {
      console.error('Error en SiigoAccountsPayableService:', error)
      throw new Error(`Error guardando datos de cuentas por pagar: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  /**
   * Obtiene el historial de solicitudes HTTP
   * NOTA: Temporalmente deshabilitado
   */
  static async getRequestHistory(limit: number = 50) {
    console.log('getRequestHistory: Temporalmente deshabilitado')
    return []
  }

  /**
   * Obtiene las cuentas por pagar de una solicitud específica
   * NOTA: Temporalmente deshabilitado
   */
  static async getAccountsPayableByRequest(requestId: string) {
    console.log('getAccountsPayableByRequest: Temporalmente deshabilitado', requestId)
    return []
  }

  /**
   * Obtiene estadísticas de las solicitudes
   * NOTA: Temporalmente deshabilitado
   */
  static async getRequestStats() {
    console.log('getRequestStats: Temporalmente deshabilitado')
    return {
      totalRequests: 0,
      totalRecordsProcessed: 0,
      totalResultsAvailable: 0,
      statusBreakdown: []
    }
  }
}
