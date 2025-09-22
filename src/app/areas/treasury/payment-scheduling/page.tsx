"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, RefreshCw } from "lucide-react"
import { useState } from "react"

// Interfaces para los datos de Siigo
interface SiigoDue {
  prefix: string
  consecutive: number
  quote: number
  date: string
  balance: number
}

interface SiigoProvider {
  id: string
  identification: string
  branch_office: number
  name: string
}

interface SiigoCostCenter {
  code: string
  name: string
}

interface SiigoCurrency {
  code: string
  balance: number
}

interface SiigoAccountPayable {
  due: SiigoDue
  provider: SiigoProvider
  cost_center: SiigoCostCenter
  currency: SiigoCurrency
}

interface SiigoPagination {
  page: number
  page_size: number
  total_results: number
}

interface SiigoAccountsPayableResponse {
  pagination: SiigoPagination
  results: SiigoAccountPayable[]
}

export default function PaymentSchedulingPage() {
  const [accountsPayable, setAccountsPayable] = useState<SiigoAccountPayable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [pagination, setPagination] = useState<SiigoPagination | null>(null)
  const [loadingProgress, setLoadingProgress] = useState<string>('')

  // Función para cargar datos de la API (solo primera página por el momento)
  const fetchAccountsPayable = async () => {
    try {
      setLoading(true)
      setError(null)
      setLoadingProgress('Cargando datos...')
      
      const response = await fetch('/api/accounts-payable')
      const result = await response.json()
      
      if (result.success) {
        const data: SiigoAccountsPayableResponse = result.data
        setAccountsPayable(data.results || [])
        setPagination(data.pagination)
        setLastUpdated(new Date())
        setDataLoaded(true)
        setLoadingProgress(`Cargado: ${data.results?.length || 0} registros de la primera página`)
      } else {
        setError(result.error || 'Error al cargar los datos')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching accounts payable:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setLoadingProgress(''), 2000) // Limpiar progreso después de 2 segundos
    }
  }





  return (
    <AreaLayout 
      areaId="treasury" 
      moduleId="payment-scheduling"
    >
      <div className="space-y-6">
        {/* Development Notice */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Módulo en Desarrollo
            </CardTitle>
            <CardDescription className="text-yellow-700">
              Este módulo está en fase de desarrollo. Se están implementando las funcionalidades de programación y gestión de pagos a proveedores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm text-yellow-700">
                  Progreso: 45% completado
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <Button 
                  onClick={fetchAccountsPayable}
                  disabled={loading}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    <>
                      <Calendar className="mr-2 h-4 w-4" />
                      Cargar Datos de Siigo
                    </>
                  )}
                </Button>
                {loadingProgress && (
                  <p className="text-xs text-yellow-600 text-center">
                    {loadingProgress}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>


        {/* Tabla de Cuentas por Pagar - Solo mostrar si se han cargado los datos */}
        {dataLoaded && (
          <Card>
            <CardHeader>
              <CardTitle>Cuentas por Pagar - Siigo</CardTitle>
              <CardDescription>
                Datos obtenidos del endpoint /accounts-payable - {pagination && `Mostrando ${accountsPayable.length} registros de ${pagination.total_results} totales`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 border rounded-lg">
                  <h4 className="font-medium mb-2">Información de la consulta:</h4>
                  <code className="text-sm text-blue-600">https://api.siigo.com/v1/accounts-payable</code>
                  {pagination && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p><strong>Total de registros:</strong> {pagination.total_results}</p>
                      <p><strong>Tamaño de página:</strong> {pagination.page_size}</p>
                      <p><strong>Páginas consultadas:</strong> {Math.ceil(pagination.total_results / pagination.page_size)}</p>
                    </div>
                  )}
                </div>
                
                <div className="border rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Factura</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Proveedor</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">ID</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Centro de Costo</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Fecha Vencimiento</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Moneda</th>
                          <th className="px-4 py-3 text-left font-medium text-gray-700">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {(accountsPayable || []).map((account, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {account.due?.prefix || ''}-{account.due?.consecutive || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                Cuota: {account.due?.quote || 0}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {account.provider?.name || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Sucursal: {account.provider?.branch_office || 0}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">
                                {account.provider?.identification || 'Sin ID'}
                              </div>
                              <div className="text-xs text-gray-500 font-mono">
                                {account.provider?.id?.substring(0, 8) || ''}...
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">
                                {account.cost_center?.name || 'Sin nombre'}
                              </div>
                              <div className="text-xs text-gray-500">
                                Código: {account.cost_center?.code || 'N/A'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">
                                {account.due?.date ? new Date(account.due.date).toLocaleDateString('es-ES') : 'Sin fecha'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-gray-900">
                                {account.currency?.code || 'Sin moneda'}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-medium text-gray-900">
                                {account.due?.balance ? 
                                  `$${account.due.balance.toLocaleString()}` : 
                                  'Sin saldo'
                                }
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {accountsPayable.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No se encontraron registros</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AreaLayout>
  )
}
