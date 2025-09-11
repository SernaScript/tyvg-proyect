import { prisma } from '@/lib/prisma'

interface SiigoAuthResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface SiigoCredentials {
  email: string
  accessKey: string
  platform: string
}

export class SiigoService {
  private static accessToken: string | null = null
  private static tokenExpiry: Date | null = null
  private static credentials: SiigoCredentials | null = null

  private static async getCredentials(): Promise<SiigoCredentials> {
    if (this.credentials) {
      return this.credentials
    }

    const dbCredentials = await prisma.siigoCredentials.findFirst({
      where: { isActive: true }
    })

    if (!dbCredentials) {
      throw new Error('No hay credenciales de Siigo configuradas')
    }

    this.credentials = {
      email: dbCredentials.email,
      accessKey: dbCredentials.accessKey,
      platform: dbCredentials.platform
    }

    return this.credentials
  }

  private static async authenticate(): Promise<string> {
    // Verificar si el token actual es válido
    if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
      return this.accessToken
    }

    const credentials = await this.getCredentials()

    try {
      console.log('Intentando autenticar con Siigo:', {
        url: 'https://api.siigo.com/auth',
        email: credentials.email,
        platform: credentials.platform
      })

      const authResponse = await fetch('https://api.siigo.com/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: credentials.email,
          access_key: credentials.accessKey
        })
      })

      console.log('Respuesta de autenticación:', {
        status: authResponse.status,
        statusText: authResponse.statusText,
        url: authResponse.url
      })

      if (!authResponse.ok) {
        const errorText = await authResponse.text()
        console.error('Error de autenticación:', errorText)
        throw new Error(`Error de autenticación: ${authResponse.status} - ${errorText}`)
      }

      const authData: SiigoAuthResponse = await authResponse.json()

      // Guardar el token y su expiración
      this.accessToken = authData.access_token
      this.tokenExpiry = new Date(Date.now() + (authData.expires_in * 1000))

      return this.accessToken

    } catch (error) {
      console.error('Error en autenticación de Siigo:', error)
      throw new Error(`Error al autenticar con Siigo: ${error instanceof Error ? error.message : 'Error desconocido'}`)
    }
  }

  private static async makeAuthenticatedRequest(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = await this.authenticate()
    const credentials = await this.getCredentials()

    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Partner-Id': credentials.platform
    }

    
    const response = await fetch(`https://api.siigo.com/v1${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers
      }
    })

    return response
  }

  static async getWarehouses() {
    try {
      console.log('Consultando bodegas de Siigo...')
      const response = await this.makeAuthenticatedRequest('/warehouses')
      
      console.log('Respuesta de bodegas:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error de Siigo API:', errorText)
        throw new Error(`Error de Siigo API: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Datos de bodegas obtenidos:', data.length, 'bodegas')
      return data
    } catch (error) {
      console.error('Error obteniendo bodegas de Siigo:', error)
      throw error
    }
  }

  static async getCostCenters() {
    try {
      console.log('Consultando centros de costo de Siigo...')
      const response = await this.makeAuthenticatedRequest('/cost-centers')
      
      console.log('Respuesta de centros de costo:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error de Siigo API:', errorText)
        throw new Error(`Error de Siigo API: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Datos de centros de costo obtenidos:', data.length, 'centros de costo')
      return data
    } catch (error) {
      console.error('Error obteniendo centros de costo de Siigo:', error)
      throw error
    }
  }

  static async testConnection() {
    try {
      const response = await this.makeAuthenticatedRequest('/warehouses')
      return {
        success: response.ok,
        status: response.status,
        message: response.ok ? 'Conexión exitosa' : `Error: ${response.status}`
      }
    } catch (error) {
      return {
        success: false,
        status: 0,
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  static async createJournal(journalData: any) {
    try {
      console.log('Creando journal en Siigo...', { journalData })
      const response = await this.makeAuthenticatedRequest('/journals', {
        method: 'POST',
        body: JSON.stringify(journalData)
      })
      
      console.log('Respuesta de creación de journal:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error de Siigo API al crear journal:', errorText)
        throw new Error(`Error de Siigo API: ${response.status} - ${errorText}`)
      }

      const data = await response.json()
      console.log('Journal creado exitosamente:', data)
      return data
    } catch (error) {
      console.error('Error creando journal en Siigo:', error)
      throw error
    }
  }

  // Método para limpiar el token (útil para testing o logout)
  static clearToken() {
    this.accessToken = null
    this.tokenExpiry = null
    this.credentials = null
  }
}
