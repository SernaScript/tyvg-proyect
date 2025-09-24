"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Calendar, RefreshCw, Database, Eye, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, DollarSign } from "lucide-react"
import { useState } from "react"

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

interface GeneratedRequest {
  id: string
  requestDate: string
  endpoint: string
  page: number
  pageSize: number
  totalResults: number
  recordsProcessed: number
  status: 'success' | 'partial' | 'error' | 'processing'
  errorMessage?: string
  duration: number
  userAgent?: string
  ipAddress?: string
  createdAt: string
  updatedAt: string
  _count: {
    accountsPayable: number
  }
}

interface AccountPayableRecord {
  id: string
  prefix: string
  consecutive: string
  quote: number
  dueDate: string
  balance: number
  providerIdentification: string
  providerBranchOffice: number
  providerName: string
  costCenterCode: number
  costCenterName: string
  currencyCode: string
  currencyBalance: number
  createdAt: string
  updatedAt: string
  generatedRequestId: string
}

interface SiigoAccountsPayableResponse {
  pagination: SiigoPagination
  results: SiigoAccountPayable[]
}

interface ProviderGroup {
  providerName: string
  providerIdentification: string
  totalBalance: number
  documentCount: number
  documents: AccountPayableRecord[]
}

interface ProviderGroupFromAPI {
  providerName: string
  providerIdentification: string
  totalBalance: number
  documentCount: number
  documents: SiigoAccountPayable[]
}

export default function PaymentSchedulingPage() {
  const [accountsPayable, setAccountsPayable] = useState<SiigoAccountPayable[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [dataLoaded, setDataLoaded] = useState(false)
  const [pagination, setPagination] = useState<SiigoPagination | null>(null)
  const [loadingProgress, setLoadingProgress] = useState<string>('')
  const [savedToDatabase, setSavedToDatabase] = useState<boolean>(false)
  
  const [viewMode, setViewMode] = useState<'load' | 'generated'>('load')
  const [generatedRequests, setGeneratedRequests] = useState<GeneratedRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<GeneratedRequest | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<AccountPayableRecord[]>([])
  const [loadingGenerated, setLoadingGenerated] = useState<boolean>(false)
  
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([])
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())

  const fetchAccountsPayable = async (saveToDatabase: boolean = false) => {
    try {
      setLoading(true)
      setError(null)
      setSavedToDatabase(false)
      setLoadingProgress('Cargando datos...')
      
      const url = saveToDatabase ? '/api/accounts-payable?save=true' : '/api/accounts-payable'
      const response = await fetch(url)
      const result = await response.json()
      
      if (result.success) {
        const data: SiigoAccountsPayableResponse = result.data
        setAccountsPayable(data.results || [])
        setPagination(data.pagination)
        setLastUpdated(new Date())
        setDataLoaded(true)
        setSavedToDatabase(result.savedToDatabase || false)
        
        const groupedData = groupDataByProvider(data.results || [])
        setProviderGroups(groupedData.map(group => ({
          ...group,
          documents: []
        })))
        
        if (saveToDatabase) {
          setLoadingProgress(`Cargado y guardado: ${data.results?.length || 0} registros en la base de datos`)
        } else {
          setLoadingProgress(`Cargado: ${data.results?.length || 0} registros de la primera página`)
        }
      } else {
        setError(result.error || 'Error al cargar los datos')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching accounts payable:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setLoadingProgress(''), 3000)
    }
  }

  const fetchAllAccountsPayable = async () => {
    try {
      setLoading(true)
      setError(null)
      setSavedToDatabase(false)
      setLoadingProgress('Iniciando carga completa de todos los datos...')
      
      const response = await fetch('/api/accounts-payable/load-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.success) {
        const data = result.data
        setLastUpdated(new Date())
        setDataLoaded(true)
        setSavedToDatabase(true)
        
        setLoadingProgress(`✅ Completado: ${data.totalProcessed} registros guardados de ${data.totalRecords} totales en ${Math.round(data.duration / 1000)}s`)
        
        setPagination({
          page: 1,
          page_size: data.totalRecords,
          total_results: data.totalRecords
        })
        
        const allRecordsResponse = await fetch('/api/accounts-payable/all-records')
        if (allRecordsResponse.ok) {
          const allRecordsResult = await allRecordsResponse.json()
          if (allRecordsResult.success) {
            setAccountsPayable(allRecordsResult.data || [])
            
            const groupedData = groupDatabaseDataByProvider(allRecordsResult.data || [])
            setProviderGroups(groupedData)
          }
        } else {
          const firstPageResponse = await fetch('/api/accounts-payable')
          const firstPageResult = await firstPageResponse.json()
          
          if (firstPageResult.success) {
            setAccountsPayable(firstPageResult.data.results || [])
            setPagination(firstPageResult.data.pagination)
          }
        }
        
      } else {
        setError(result.error || 'Error al cargar todos los datos')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching all accounts payable:', err)
    } finally {
      setLoading(false)
      setTimeout(() => setLoadingProgress(''), 8000)
    }
  }

  const fetchGeneratedRequests = async () => {
    try {
      setLoadingGenerated(true)
      setError(null)
      
      const response = await fetch('/api/accounts-payable/generated')
      const result = await response.json()
      
      if (result.success) {
        setGeneratedRequests(result.data)
        setViewMode('generated')
      } else {
        setError(result.error || 'Error al cargar las carteras generadas')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching generated requests:', err)
    } finally {
      setLoadingGenerated(false)
    }
  }

  const fetchRequestAccounts = async (requestId: string) => {
    try {
      setLoadingGenerated(true)
      setError(null)
      
      const response = await fetch(`/api/accounts-payable/generated/${requestId}`)
      const result = await response.json()
      
      if (result.success) {
        setSelectedRequest(result.data.generatedRequest)
        setSelectedAccounts(result.data.accountsPayable)
        
        const groupedData = groupDatabaseDataByProvider(result.data.accountsPayable)
        setProviderGroups(groupedData)
      } else {
        setError(result.error || 'Error al cargar los registros de la cartera')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching request accounts:', err)
    } finally {
      setLoadingGenerated(false)
    }
  }

  const backToGeneratedList = () => {
    setSelectedRequest(null)
    setSelectedAccounts([])
  }

  const backToLoadView = () => {
    setViewMode('load')
    setGeneratedRequests([])
    setSelectedRequest(null)
    setSelectedAccounts([])
  }

  const groupDataByProvider = (data: SiigoAccountPayable[]): ProviderGroupFromAPI[] => {
    const groups = new Map<string, ProviderGroupFromAPI>()
    
    data.forEach(account => {
      const providerKey = account.provider?.identification || 'unknown'
      const providerName = account.provider?.name || 'Proveedor Desconocido'
      const balance = Math.round(Number(account.due?.balance || 0))
      
      if (groups.has(providerKey)) {
        const group = groups.get(providerKey)!
        group.totalBalance = Math.round(Number(group.totalBalance) + balance)
        group.documentCount += 1
        group.documents.push(account)
      } else {
        groups.set(providerKey, {
          providerName,
          providerIdentification: providerKey,
          totalBalance: balance,
          documentCount: 1,
          documents: [account]
        })
      }
    })
    
    return Array.from(groups.values()).sort((a, b) => Number(b.totalBalance) - Number(a.totalBalance))
  }

  const groupDatabaseDataByProvider = (data: AccountPayableRecord[]): ProviderGroup[] => {
    const groups = new Map<string, ProviderGroup>()
    
    data.forEach(account => {
      const providerKey = account.providerIdentification
      const providerName = account.providerName
      const balance = Math.round(Number(account.balance))
      
      if (groups.has(providerKey)) {
        const group = groups.get(providerKey)!
        group.totalBalance = Math.round(Number(group.totalBalance) + balance)
        group.documentCount += 1
        group.documents.push(account)
      } else {
        groups.set(providerKey, {
          providerName,
          providerIdentification: providerKey,
          totalBalance: balance,
          documentCount: 1,
          documents: [account]
        })
      }
    })
    
    return Array.from(groups.values()).sort((a, b) => Number(b.totalBalance) - Number(a.totalBalance))
  }

  const toggleProviderExpansion = (providerKey: string) => {
    const newExpanded = new Set(expandedProviders)
    if (newExpanded.has(providerKey)) {
      newExpanded.delete(providerKey)
    } else {
      newExpanded.add(providerKey)
    }
    setExpandedProviders(newExpanded)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'partial':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'error':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  return (
    <AreaLayout 
      areaId="treasury" 
      moduleId="payment-scheduling"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              onClick={backToLoadView}
              variant={viewMode === 'load' ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <Calendar className="h-4 w-4" />
              Cargar Datos
            </Button>
            <Button
              onClick={fetchGeneratedRequests}
              variant={viewMode === 'generated' ? 'default' : 'outline'}
              className="flex items-center gap-2"
              disabled={loadingGenerated}
            >
              {loadingGenerated ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Ver Carteras Generadas
            </Button>
          </div>
          
          {viewMode === 'generated' && selectedRequest && (
            <Button
              onClick={backToGeneratedList}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Volver a Carteras
            </Button>
          )}
        </div>

        {viewMode === 'load' && (
          <>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-5 w-5" />
                  Módulo en Desarrollo
                </CardTitle>
                <CardDescription className="text-yellow-700">
                  Este módulo está en fase de desarrollo. Las funcionalidades pueden cambiar.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Programación de Pagos - Siigo</CardTitle>
                <CardDescription>
                  Carga y gestión de cuentas por pagar desde la API de Siigo
                </CardDescription>
              </CardHeader>
              <CardContent>
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-yellow-700">
                    Progreso: 45% completado
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex gap-2 flex-wrap">
                    <Button 
                      onClick={() => fetchAccountsPayable(false)}
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
                          Solo Cargar
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={() => fetchAccountsPayable(true)}
                      disabled={loading}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Guardando...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Cargar y Guardar
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={fetchAllAccountsPayable}
                      disabled={loading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Cargando Todo...
                        </>
                      ) : (
                        <>
                          <Calendar className="mr-2 h-4 w-4" />
                          Cargar TODOS
                        </>
                      )}
                    </Button>
                  </div>
                  {loadingProgress && (
                    <p className="text-xs text-yellow-600 text-center">
                      {loadingProgress}
                    </p>
                  )}
                  {savedToDatabase && (
                    <p className="text-xs text-green-600 text-center font-medium">
                      ✓ Datos guardados en la base de datos
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

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

                    <div className="space-y-3">
                      {providerGroups.map((group, index) => {
                        const isExpanded = expandedProviders.has(group.providerIdentification)
                        const providerKey = group.providerIdentification
                        
                        return (
                          <div key={providerKey} className="border border-gray-200 rounded-lg overflow-hidden">
                            <div 
                              className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                              onClick={() => toggleProviderExpansion(providerKey)}
                            >
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center gap-3">
                                  {isExpanded ? (
                                    <ChevronDown className="h-5 w-5 text-gray-600" />
                                  ) : (
                                    <ChevronRight className="h-5 w-5 text-gray-600" />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-gray-900">{group.providerName}</h3>
                                    <p className="text-sm text-gray-600">ID: {group.providerIdentification}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6">
                                  <div className="text-right">
                                    <p className="text-sm text-gray-600">{group.documentCount} documentos</p>
                                    <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                                      <DollarSign className="h-4 w-4" />
                                      ${Math.round(Number(group.totalBalance)).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {isExpanded && (
                              <div className="border-t border-gray-200 bg-white">
                                <div className="p-4">
                                  <h4 className="font-medium text-gray-900 mb-3">Documentos del Proveedor</h4>
                                  <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                      <thead>
                                        <tr className="bg-gray-50 border-b">
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Prefijo</th>
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Consecutivo</th>
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Fecha Vencimiento</th>
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Balance</th>
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Centro de Costo</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {group.documents.map((doc, docIndex) => (
                                          <tr key={docIndex} className="hover:bg-gray-50">
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                              {doc.prefix || (doc as any).due?.prefix || ''}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                              {doc.consecutive || (doc as any).due?.consecutive || 0}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                              {doc.dueDate ? 
                                                new Date(doc.dueDate).toLocaleDateString() : 
                                                ((doc as any).due?.date || '')
                                              }
                                            </td>
                                            <td className="px-3 py-2 font-medium text-gray-900">
                                              ${Math.round(Number(doc.balance || (doc as any).due?.balance || 0)).toLocaleString()}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                              {doc.costCenterName || (doc as any).cost_center?.name || ''}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                      
                      {providerGroups.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                          <p>No se encontraron proveedores</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {viewMode === 'generated' && !selectedRequest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Carteras Generadas
              </CardTitle>
              <CardDescription>
                Historial de solicitudes HTTP realizadas a la API de Siigo
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGenerated ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando carteras...</span>
                </div>
              ) : generatedRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No hay carteras generadas</p>
                  <p className="text-sm">Realiza una carga de datos para ver el historial</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {generatedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => fetchRequestAccounts(request.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(request.status)}
                          <div>
                            <h3 className="font-medium">
                              Solicitud del {new Date(request.createdAt).toLocaleDateString()}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {request.recordsProcessed} registros procesados
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded-full text-xs border ${getStatusColor(request.status)}`}>
                            {request.status}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              fetchRequestAccounts(request.id)
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Ver
                          </Button>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Duración: {Math.round(request.duration / 1000)}s | Total: {request.totalResults} registros</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {viewMode === 'generated' && selectedRequest && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Registros de Cartera
              </CardTitle>
              <CardDescription>
                Solicitud del {new Date(selectedRequest.createdAt).toLocaleDateString()} - {selectedRequest.recordsProcessed} registros
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loadingGenerated ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin mr-2" />
                  <span>Cargando registros...</span>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 border rounded-lg">
                    <h4 className="font-medium mb-2">Información de la Solicitud:</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Fecha:</strong> {new Date(selectedRequest.createdAt).toLocaleString()}</p>
                        <p><strong>Estado:</strong> 
                          <span className={`ml-1 px-2 py-1 rounded-full text-xs border ${getStatusColor(selectedRequest.status)}`}>
                            {selectedRequest.status}
                          </span>
                        </p>
                      </div>
                      <div>
                        <p><strong>Duración:</strong> {Math.round(selectedRequest.duration / 1000)}s</p>
                        <p><strong>Registros:</strong> {selectedRequest.recordsProcessed} de {selectedRequest.totalResults}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {providerGroups.map((group, index) => {
                      const isExpanded = expandedProviders.has(group.providerIdentification)
                      const providerKey = group.providerIdentification
                      
                      return (
                        <div key={providerKey} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div 
                            className="bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors"
                            onClick={() => toggleProviderExpansion(providerKey)}
                          >
                            <div className="flex items-center justify-between p-4">
                              <div className="flex items-center gap-3">
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5 text-gray-600" />
                                ) : (
                                  <ChevronRight className="h-5 w-5 text-gray-600" />
                                )}
                                <div>
                                  <h3 className="font-semibold text-gray-900">{group.providerName}</h3>
                                  <p className="text-sm text-gray-600">ID: {group.providerIdentification}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right">
                                  <p className="text-sm text-gray-600">{group.documentCount} documentos</p>
                                  <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                                    <DollarSign className="h-4 w-4" />
                                    ${Number(group.totalBalance).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {isExpanded && (
                            <div className="border-t border-gray-200 bg-white">
                              <div className="p-4">
                                <h4 className="font-medium text-gray-900 mb-3">Documentos del Proveedor</h4>
                                <div className="overflow-x-auto">
                                  <table className="w-full text-sm">
                                    <thead>
                                      <tr className="bg-gray-50 border-b">
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Prefijo</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Consecutivo</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Fecha Vencimiento</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Balance</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Centro de Costo</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                      {group.documents.map((doc, docIndex) => (
                                        <tr key={docIndex} className="hover:bg-gray-50">
                                          <td className="px-3 py-2 font-medium text-gray-900">
                                            {doc.prefix}
                                          </td>
                                          <td className="px-3 py-2 text-gray-900">
                                            {doc.consecutive}
                                          </td>
                                          <td className="px-3 py-2 text-gray-900">
                                            {new Date(doc.dueDate).toLocaleDateString()}
                                          </td>
                                          <td className="px-3 py-2 font-medium text-gray-900">
                                            ${Math.round(Number(doc.balance)).toLocaleString()}
                                          </td>
                                          <td className="px-3 py-2 text-gray-900">
                                            {doc.costCenterName}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                    
                    {providerGroups.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron proveedores</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </AreaLayout>
  )
}
