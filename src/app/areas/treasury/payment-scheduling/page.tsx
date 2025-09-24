"use client"

import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertTriangle, Calendar, RefreshCw, Database, Eye, ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, ChevronDown, ChevronRight, DollarSign, Edit3, Save, X, Trash2, Filter, Search } from "lucide-react"
import { useState, useEffect } from "react"

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
  paymentValue?: number
  approved: boolean
  paid: boolean
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
  totalPaymentValue: number
  documentCount: number
  documents: AccountPayableRecord[]
}

interface ProviderGroupFromAPI {
  providerName: string
  providerIdentification: string
  totalBalance: number
  totalPaymentValue: number
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
  
  const [viewMode, setViewMode] = useState<'load' | 'generated'>('generated')
  const [generatedRequests, setGeneratedRequests] = useState<GeneratedRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<GeneratedRequest | null>(null)
  const [selectedAccounts, setSelectedAccounts] = useState<AccountPayableRecord[]>([])
  const [loadingGenerated, setLoadingGenerated] = useState<boolean>(false)
  
  const [providerGroups, setProviderGroups] = useState<ProviderGroup[]>([])
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())
  
  const [editingPayment, setEditingPayment] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')
  const [updatingPayment, setUpdatingPayment] = useState<boolean>(false)
  const [paymentMode, setPaymentMode] = useState<'total' | 'partial' | null>(null)
  
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [showFilters, setShowFilters] = useState<boolean>(false)
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false)

  useEffect(() => {
    fetchGeneratedRequests()
  }, [])

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
           totalPaymentValue: 0,
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

  const generateNewPortfolio = async () => {
    try {
      setLoading(true)
      setError(null)
      setLoadingProgress('Generando nueva cartera...')

      const response = await fetch('/api/accounts-payable/load-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (result.success) {
        setLoadingProgress('Cargando registros desde la base de datos...')
        
        const allRecordsResponse = await fetch('/api/accounts-payable/all-records')
        const allRecordsResult = await allRecordsResponse.json()

        if (allRecordsResult.success) {
          const groupedData = groupDatabaseDataByProvider(allRecordsResult.data)
          setProviderGroups(groupedData)
          setPagination({
            page: 1,
            page_size: allRecordsResult.data.length,
            total_results: allRecordsResult.data.length
          })
          setLoadingProgress('')
        }

        await fetchGeneratedRequests()
        setLoadingProgress('')
      } else {
        setError(result.error || 'Error al generar la nueva cartera')
        setLoadingProgress('')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      setLoadingProgress('')
      console.error('Error generating new portfolio:', err)
    } finally {
      setLoading(false)
    }
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
          totalPaymentValue: 0,
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
      const paymentValue = account.paymentValue ? Math.round(Number(account.paymentValue)) : 0
      
      if (groups.has(providerKey)) {
        const group = groups.get(providerKey)!
        group.totalBalance = Math.round(Number(group.totalBalance) + balance)
        group.totalPaymentValue = Math.round(Number(group.totalPaymentValue) + paymentValue)
        group.documentCount += 1
        group.documents.push(account)
      } else {
        groups.set(providerKey, {
          providerName,
          providerIdentification: providerKey,
          totalBalance: balance,
          totalPaymentValue: paymentValue,
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

  const startTotalPayment = async (recordId: string) => {
    try {
      setUpdatingPayment(true)
      setError(null)

      const currentRecord = providerGroups
        .flatMap(group => group.documents)
        .find(doc => doc.id === recordId)
      
      if (currentRecord) {
        const balance = Number(currentRecord.balance || (currentRecord as any).due?.balance || 0)
        
        const response = await fetch(`/api/accounts-payable/${recordId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ paymentValue: balance })
        })

        const result = await response.json()

         if (result.success) {
           const updatedRecord = result.data
           
           setProviderGroups(prevGroups => 
             prevGroups.map(group => {
               const updatedDocuments = group.documents.map(doc => 
                 doc.id === recordId 
                   ? { ...doc, paymentValue: updatedRecord.paymentValue }
                   : doc
               )
               
               const newTotalPaymentValue = updatedDocuments.reduce((sum, doc) => {
                 return sum + (doc.paymentValue ? Number(doc.paymentValue) : 0)
               }, 0)
               
               return {
                 ...group,
                 documents: updatedDocuments,
                 totalPaymentValue: Math.round(newTotalPaymentValue)
               }
             })
           )
         } else {
           setError(result.error || 'Error al actualizar el valor de pago')
         }
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error updating payment value:', err)
    } finally {
      setUpdatingPayment(false)
    }
  }

  const startPartialPayment = (recordId: string, currentValue?: number) => {
    setEditingPayment(recordId)
    setPaymentMode('partial')
    setEditingValue(currentValue ? currentValue.toString() : '')
  }

  const cancelEditingPayment = () => {
    setEditingPayment(null)
    setEditingValue('')
    setPaymentMode(null)
  }

  const clearPaymentValue = async (recordId: string) => {
    try {
      setUpdatingPayment(true)
      setError(null)

      const response = await fetch(`/api/accounts-payable/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentValue: null })
      })

      const result = await response.json()

       if (result.success) {
         const updatedRecord = result.data
         
         setProviderGroups(prevGroups => 
           prevGroups.map(group => {
             const updatedDocuments = group.documents.map(doc => 
               doc.id === recordId 
                 ? { ...doc, paymentValue: updatedRecord.paymentValue }
                 : doc
             )
             
             const newTotalPaymentValue = updatedDocuments.reduce((sum, doc) => {
               return sum + (doc.paymentValue ? Number(doc.paymentValue) : 0)
             }, 0)
             
             return {
               ...group,
               documents: updatedDocuments,
               totalPaymentValue: Math.round(newTotalPaymentValue)
             }
           })
         )
       } else {
         setError(result.error || 'Error al borrar el valor de pago')
       }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error clearing payment value:', err)
    } finally {
      setUpdatingPayment(false)
    }
  }

  const updatePaymentValue = async (recordId: string) => {
    try {
      setUpdatingPayment(true)
      setError(null)

      const paymentValue = editingValue.trim() === '' ? null : parseFloat(editingValue)
      
      const currentRecord = providerGroups
        .flatMap(group => group.documents)
        .find(doc => doc.id === recordId)
      
      if (currentRecord && paymentValue !== null) {
        const balance = Number(currentRecord.balance || (currentRecord as any).due?.balance || 0)
        if (paymentValue > balance) {
          setError(`El valor de pago ($${paymentValue.toLocaleString()}) no puede ser mayor al balance ($${balance.toLocaleString()})`)
          setUpdatingPayment(false)
          return
        }
      }

      const response = await fetch(`/api/accounts-payable/${recordId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentValue })
      })

      const result = await response.json()

       if (result.success) {
         setEditingPayment(null)
         setEditingValue('')
         
         const updatedRecord = result.data
         
         setProviderGroups(prevGroups => 
           prevGroups.map(group => {
             const updatedDocuments = group.documents.map(doc => 
               doc.id === recordId 
                 ? { ...doc, paymentValue: updatedRecord.paymentValue }
                 : doc
             )
             
             const newTotalPaymentValue = updatedDocuments.reduce((sum, doc) => {
               return sum + (doc.paymentValue ? Number(doc.paymentValue) : 0)
             }, 0)
             
             return {
               ...group,
               documents: updatedDocuments,
               totalPaymentValue: Math.round(newTotalPaymentValue)
             }
           })
         )
       } else {
         setError(result.error || 'Error al actualizar el valor de pago')
       }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error updating payment value:', err)
    } finally {
      setUpdatingPayment(false)
    }
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

  const filteredProviders = providerGroups.filter(group => 
    group.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.providerIdentification.includes(searchTerm)
  )

  const clearFilters = () => {
    setSearchTerm('')
    setExpandedProviders(new Set())
  }

  const getPaymentSummary = () => {
    const summary = {
      totalPaymentValue: 0,
      providersWithPayments: [] as Array<{
        providerName: string
        providerIdentification: string
        totalPayment: number
        documentCount: number
      }>,
      totalDocuments: 0,
      totalProviders: 0
    }

    filteredProviders.forEach(group => {
      let groupTotalPayment = 0
      let groupDocumentCount = 0

      group.documents.forEach(doc => {
        if (doc.paymentValue && doc.paymentValue > 0) {
          groupTotalPayment += Number(doc.paymentValue)
          groupDocumentCount++
        }
      })

      if (groupTotalPayment > 0) {
        summary.totalPaymentValue += groupTotalPayment
        summary.providersWithPayments.push({
          providerName: group.providerName,
          providerIdentification: group.providerIdentification,
          totalPayment: groupTotalPayment,
          documentCount: groupDocumentCount
        })
      }
    })

    summary.totalDocuments = summary.providersWithPayments.reduce((sum, provider) => sum + provider.documentCount, 0)
    summary.totalProviders = summary.providersWithPayments.length

    return summary
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
              onClick={generateNewPortfolio}
              variant="default"
              className="flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              Generar Nueva Cartera
            </Button>
          </div>
          
          {selectedRequest && (
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
                                     <div className="flex flex-col gap-1">
                                       <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                                         <DollarSign className="h-4 w-4" />
                                         ${Math.round(Number(group.totalBalance)).toLocaleString()}
                                       </p>
                                       {group.totalPaymentValue > 0 && (
                                         <p className="text-sm font-medium text-blue-600">
                                           Pago: ${Math.round(Number(group.totalPaymentValue)).toLocaleString()}
                                         </p>
                                       )}
                                     </div>
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
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Valor Pago</th>
                                          <th className="px-3 py-2 text-left font-medium text-gray-700">Acciones</th>
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
                                              {editingPayment === doc.id && paymentMode === 'partial' ? (
                                                <div className="flex flex-col">
                                                  <input
                                                    type="number"
                                                    value={editingValue}
                                                    onChange={(e) => setEditingValue(e.target.value)}
                                                    max={Math.round(Number(doc.balance || (doc as any).due?.balance || 0))}
                                                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                                    placeholder="0"
                                                    autoFocus
                                                  />
                                                  <span className="text-xs text-gray-500 mt-1">
                                                    Máx: ${Math.round(Number(doc.balance || (doc as any).due?.balance || 0)).toLocaleString()}
                                                  </span>
                                                </div>
                                              ) : (
                                                <div className="flex items-center gap-2">
                                                  <span>
                                                    {doc.paymentValue ? `$${Math.round(Number(doc.paymentValue)).toLocaleString()}` : '-'}
                                                  </span>
                                                  {doc.paymentValue && (
                                                    <Button
                                                      size="sm"
                                                      variant="outline"
                                                      onClick={() => clearPaymentValue(doc.id)}
                                                      disabled={updatingPayment}
                                                      className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                      title="Borrar valor de pago"
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  )}
                                                </div>
                                              )}
                                            </td>
                                            <td className="px-3 py-2 text-gray-900">
                                              {editingPayment === doc.id ? (
                                                <div className="flex flex-col gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => updatePaymentValue(doc.id)}
                                                    disabled={updatingPayment}
                                                    className="h-6 w-6 p-0"
                                                  >
                                                    {updatingPayment ? (
                                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      <Save className="h-3 w-3" />
                                                    )}
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={cancelEditingPayment}
                                                    disabled={updatingPayment}
                                                    className="h-6 w-6 p-0"
                                                  >
                                                    <X className="h-3 w-3" />
                                                  </Button>
                                                </div>
                                              ) : (
                                                <div className="flex flex-col gap-1">
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startTotalPayment(doc.id)}
                                                    disabled={updatingPayment}
                                                    className="h-6 px-2 text-xs"
                                                    title="Pago total"
                                                  >
                                                    {updatingPayment ? (
                                                      <RefreshCw className="h-3 w-3 animate-spin" />
                                                    ) : (
                                                      'Pago total'
                                                    )}
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => startPartialPayment(doc.id, doc.paymentValue)}
                                                    className="h-6 px-2 text-xs"
                                                    title="Pago parcial"
                                                  >
                                                    Pago parcial
                                                  </Button>
                                                </div>
                                              )}
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

        {!selectedRequest && (
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

        {selectedRequest && (
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
                   <div className="flex items-center justify-between">
                     <div className="flex items-center gap-4">
                       <Button
                         variant="outline"
                         size="sm"
                         onClick={() => setShowFilters(!showFilters)}
                         className="flex items-center gap-2"
                       >
                         <Filter className="h-4 w-4" />
                         Filtros
                       </Button>
                       <div className="text-sm text-gray-600">
                         Mostrando {filteredProviders.length} de {providerGroups.length} proveedores
                       </div>
                     </div>
                   </div>
                   
                   {showFilters && (
                     <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                       <div className="flex items-center gap-2 flex-1">
                         <Search className="h-4 w-4 text-gray-500" />
                         <Input
                           type="text"
                           placeholder="Buscar por nombre o ID del proveedor..."
                           value={searchTerm}
                           onChange={(e) => setSearchTerm(e.target.value)}
                           className="flex-1"
                         />
                       </div>
                       {searchTerm && (
                         <Button
                           variant="outline"
                           size="sm"
                           onClick={clearFilters}
                           className="flex items-center gap-2"
                         >
                           <X className="h-4 w-4" />
                           Limpiar
                         </Button>
                       )}
                     </div>
                   )}


                  <div className="space-y-3">
                    {filteredProviders.map((group, index) => {
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
                                   <div className="flex flex-col gap-1">
                                     <p className="text-lg font-bold text-green-600 flex items-center gap-1">
                                       <DollarSign className="h-4 w-4" />
                                       ${Number(group.totalBalance).toLocaleString()}
                                     </p>
                                     {group.totalPaymentValue > 0 && (
                                       <p className="text-sm font-medium text-blue-600">
                                         Pago: ${Math.round(Number(group.totalPaymentValue)).toLocaleString()}
                                       </p>
                                     )}
                                   </div>
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
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Valor Pago</th>
                                        <th className="px-3 py-2 text-left font-medium text-gray-700">Acciones</th>
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
                                            {editingPayment === doc.id && paymentMode === 'partial' ? (
                                              <div className="flex flex-col">
                                                <input
                                                  type="number"
                                                  value={editingValue}
                                                  onChange={(e) => setEditingValue(e.target.value)}
                                                  max={Math.round(Number(doc.balance))}
                                                  className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                                                  placeholder="0"
                                                  autoFocus
                                                />
                                                <span className="text-xs text-gray-500 mt-1">
                                                  Máx: ${Math.round(Number(doc.balance)).toLocaleString()}
                                                </span>
                                              </div>
                                            ) : (
                                              <div className="flex items-center gap-2">
                                                <span>
                                                  {doc.paymentValue ? `$${Math.round(Number(doc.paymentValue)).toLocaleString()}` : '-'}
                                                </span>
                                                {doc.paymentValue && (
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => clearPaymentValue(doc.id)}
                                                    disabled={updatingPayment}
                                                    className="h-5 w-5 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                    title="Borrar valor de pago"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                  </Button>
                                                )}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-3 py-2 text-gray-900">
                                            {editingPayment === doc.id ? (
                                              <div className="flex flex-col gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => updatePaymentValue(doc.id)}
                                                  disabled={updatingPayment}
                                                  className="h-6 w-6 p-0"
                                                >
                                                  {updatingPayment ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    <Save className="h-3 w-3" />
                                                  )}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={cancelEditingPayment}
                                                  disabled={updatingPayment}
                                                  className="h-6 w-6 p-0"
                                                >
                                                  <X className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="flex flex-col gap-1">
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => startTotalPayment(doc.id)}
                                                  disabled={updatingPayment}
                                                  className="h-6 px-2 text-xs"
                                                  title="Pago total"
                                                >
                                                  {updatingPayment ? (
                                                    <RefreshCw className="h-3 w-3 animate-spin" />
                                                  ) : (
                                                    'Pago total'
                                                  )}
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="outline"
                                                  onClick={() => startPartialPayment(doc.id, doc.paymentValue)}
                                                  className="h-6 px-2 text-xs"
                                                  title="Pago parcial"
                                                >
                                                  Pago parcial
                                                </Button>
                                              </div>
                                            )}
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
                    
                    {filteredProviders.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        <DollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No se encontraron proveedores</p>
                        {searchTerm && (
                          <p className="text-sm mt-2">
                            No hay resultados para "{searchTerm}"
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                </div>
              )}
            </CardContent>
          </Card>
        )}

        {showSummaryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Resumen de Pagos Programados
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSummaryModal(false)}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cerrar
                </Button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {(() => {
                  const summary = getPaymentSummary()
                  return (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-3xl font-bold text-green-600">
                            ${Math.round(summary.totalPaymentValue).toLocaleString()}
                          </p>
                          <p className="text-sm text-green-700 font-medium">Total a Pagar</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-3xl font-bold text-blue-600">
                            {summary.totalProviders}
                          </p>
                          <p className="text-sm text-blue-700 font-medium">Proveedores</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-3xl font-bold text-purple-600">
                            {summary.totalDocuments}
                          </p>
                          <p className="text-sm text-purple-700 font-medium">Documentos</p>
                        </div>
                      </div>

                      {summary.providersWithPayments.length > 0 ? (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4">Detalle por Proveedor:</h4>
                          <div className="space-y-3 max-h-96 overflow-y-auto">
                            {summary.providersWithPayments
                              .sort((a, b) => b.totalPayment - a.totalPayment)
                              .map((provider, index) => (
                              <div key={provider.providerIdentification} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{provider.providerName}</p>
                                  <p className="text-sm text-gray-600">ID: {provider.providerIdentification}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">
                                    ${Math.round(provider.totalPayment).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {provider.documentCount} documento{provider.documentCount !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-lg font-medium">No hay pagos programados</p>
                          <p className="text-sm mt-2">Asigna valores de pago a los documentos para ver el resumen</p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        )}

        {selectedRequest && (
          <div className="fixed bottom-6 right-6 z-50">
            <Button
              onClick={() => setShowSummaryModal(true)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-full w-14 h-14 p-0"
              title="Ver resumen de pagos"
            >
              <DollarSign className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>
    </AreaLayout>
  )
}
