"use client"

import { useState, useEffect } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckCircle, Clock, DollarSign, Search, Filter, Download, Eye, Check, Table, ChevronDown, ChevronRight } from "lucide-react"

interface ApprovedPayment {
  id: string
  prefix: string
  consecutive: string
  quote: number
  dueDate: string
  balance: number
  providerName: string
  providerIdentification: string
  costCenterName: string
  paymentValue: number
  approved: boolean
  paid: boolean
  createdAt: string
  updatedAt: string
  generatedRequestId: string
}

interface GeneratedRequest {
  id: string
  state: string
  requestDate: string
  createdAt: string
  updatedAt: string
  _count: {
    accountsPayable: number
  }
}

interface ProviderGroup {
  providerName: string
  payments: ApprovedPayment[]
  totalValue: number
  paidCount: number
  pendingCount: number
}

interface GroupedPayments {
  [generatedRequestId: string]: {
    request: GeneratedRequest
    providers: ProviderGroup[]
    totalValue: number
    paidCount: number
    pendingCount: number
  }
}

export default function ApprovedPaymentsPage() {
  const [approvedPayments, setApprovedPayments] = useState<ApprovedPayment[]>([])
  const [generatedRequests, setGeneratedRequests] = useState<GeneratedRequest[]>([])
  const [groupedPayments, setGroupedPayments] = useState<GroupedPayments>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<string>("all")
  const [selectedPayments, setSelectedPayments] = useState<string[]>([])
  const [processingPayments, setProcessingPayments] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [expandedProviders, setExpandedProviders] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchApprovedPayments()
    fetchGeneratedRequests()
  }, [])

  useEffect(() => {
    if (approvedPayments.length > 0 && generatedRequests.length > 0) {
      groupPaymentsByRequest()
    }
  }, [approvedPayments, generatedRequests])

  const groupPaymentsByRequest = () => {
    const grouped: GroupedPayments = {}
    
    generatedRequests.forEach(request => {
      const requestPayments = approvedPayments.filter(payment => 
        payment.generatedRequestId === request.id
      )
      
      if (requestPayments.length > 0) {
        // Agrupar por proveedor
        const providerGroups: { [providerName: string]: ApprovedPayment[] } = {}
        requestPayments.forEach(payment => {
          if (!providerGroups[payment.providerName]) {
            providerGroups[payment.providerName] = []
          }
          providerGroups[payment.providerName].push(payment)
        })
        
        // Crear grupos de proveedores con estadísticas
        const providers: ProviderGroup[] = Object.entries(providerGroups).map(([providerName, payments]) => {
          const totalValue = payments.reduce((sum, payment) => sum + payment.paymentValue, 0)
          const paidCount = payments.filter(p => p.paid).length
          const pendingCount = payments.filter(p => !p.paid).length
          
          return {
            providerName,
            payments,
            totalValue,
            paidCount,
            pendingCount
          }
        })
        
        const totalValue = requestPayments.reduce((sum, payment) => sum + payment.paymentValue, 0)
        const paidCount = requestPayments.filter(p => p.paid).length
        const pendingCount = requestPayments.filter(p => !p.paid).length
        
        grouped[request.id] = {
          request,
          providers,
          totalValue,
          paidCount,
          pendingCount
        }
      }
    })
    
    setGroupedPayments(grouped)
  }

  const fetchApprovedPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts-payable/approved')
      const result = await response.json()
      
      if (result.success) {
        setApprovedPayments(result.data)
      } else {
        setError(result.error || 'Error al cargar pagos aprobados')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching approved payments:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchGeneratedRequests = async () => {
    try {
      const response = await fetch('/api/accounts-payable/generated')
      const result = await response.json()
      
      if (result.success) {
        setGeneratedRequests(result.data)
      }
    } catch (err) {
      console.error('Error fetching generated requests:', err)
    }
  }

  const markAsPaid = async (paymentIds: string[]) => {
    try {
      setProcessingPayments(true)
      const response = await fetch('/api/accounts-payable/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentIds })
      })

      const result = await response.json()

      if (result.success) {
        await fetchApprovedPayments()
        setSelectedPayments([])
      } else {
        setError(result.error || 'Error al marcar pagos como ejecutados')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error marking payments as paid:', err)
    } finally {
      setProcessingPayments(false)
    }
  }

  const filteredGroups = Object.entries(groupedPayments).filter(([groupId, group]) => {
    if (selectedRequest !== "all" && groupId !== selectedRequest) {
      return false
    }
    
    if (searchTerm) {
      const hasMatchingPayment = group.providers.some(provider => 
        provider.payments.some(payment => 
          payment.providerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.providerIdentification.includes(searchTerm) ||
          payment.costCenterName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
      return hasMatchingPayment
    }
    
    return true
  })

  const totalApprovedValue = Object.values(groupedPayments).reduce((sum, group) => sum + group.totalValue, 0)
  const paidCount = Object.values(groupedPayments).reduce((sum, group) => sum + group.paidCount, 0)
  const pendingCount = Object.values(groupedPayments).reduce((sum, group) => sum + group.pendingCount, 0)

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPayments(prev => 
      prev.includes(paymentId) 
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev)
      if (newSet.has(groupId)) {
        newSet.delete(groupId)
      } else {
        newSet.add(groupId)
      }
      return newSet
    })
  }

  const toggleProviderExpansion = (providerKey: string) => {
    setExpandedProviders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(providerKey)) {
        newSet.delete(providerKey)
      } else {
        newSet.add(providerKey)
      }
      return newSet
    })
  }

  const handleSelectAll = () => {
    const allPendingPayments = Object.values(groupedPayments)
      .flatMap(group => group.providers.flatMap(provider => provider.payments.filter(p => !p.paid)))
      .map(p => p.id)
    
    setSelectedPayments(prev => 
      prev.length === allPendingPayments.length ? [] : allPendingPayments
    )
  }

  const handleSelectGroup = (groupId: string) => {
    const group = groupedPayments[groupId]
    if (!group) return
    
    const groupPendingPayments = group.providers.flatMap(provider => provider.payments.filter(p => !p.paid)).map(p => p.id)
    const allGroupPaymentsSelected = groupPendingPayments.every(id => selectedPayments.includes(id))
    
    if (allGroupPaymentsSelected) {
      // Deseleccionar todos los pagos del grupo
      setSelectedPayments(prev => prev.filter(id => !groupPendingPayments.includes(id)))
    } else {
      // Seleccionar todos los pagos pendientes del grupo
      setSelectedPayments(prev => {
        const newSelection = [...prev]
        groupPendingPayments.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }

  const handleSelectProvider = (groupId: string, providerName: string) => {
    const group = groupedPayments[groupId]
    if (!group) return
    
    const provider = group.providers.find(p => p.providerName === providerName)
    if (!provider) return
    
    const providerPendingPayments = provider.payments.filter(p => !p.paid).map(p => p.id)
    const allProviderPaymentsSelected = providerPendingPayments.every(id => selectedPayments.includes(id))
    
    if (allProviderPaymentsSelected) {
      // Deseleccionar todos los pagos del proveedor
      setSelectedPayments(prev => prev.filter(id => !providerPendingPayments.includes(id)))
    } else {
      // Seleccionar todos los pagos pendientes del proveedor
      setSelectedPayments(prev => {
        const newSelection = [...prev]
        providerPendingPayments.forEach(id => {
          if (!newSelection.includes(id)) {
            newSelection.push(id)
          }
        })
        return newSelection
      })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  if (loading) {
    return (
      <AreaLayout areaId="treasury">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando pagos aprobados...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  return (
    <AreaLayout areaId="treasury">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pagos Aprobados</h1>
            <p className="text-muted-foreground">
              Gestión y seguimiento de pagos aprobados pendientes de ejecución
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Aprobado
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalApprovedValue)}</div>
              <p className="text-xs text-muted-foreground">
                {Object.values(groupedPayments).reduce((sum, group) => sum + group.providers.reduce((pSum, provider) => pSum + provider.payments.length, 0), 0)} pagos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pagos Ejecutados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidCount}</div>
              <p className="text-xs text-muted-foreground">
                {Object.values(groupedPayments).reduce((sum, group) => sum + group.providers.reduce((pSum, provider) => pSum + provider.payments.length, 0), 0) > 0 ? 
                  Math.round((paidCount / Object.values(groupedPayments).reduce((sum, group) => sum + group.providers.reduce((pSum, provider) => pSum + provider.payments.length, 0), 0)) * 100) : 0}% completado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pendientes
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">
                Por ejecutar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Seleccionados
              </CardTitle>
              <Filter className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{selectedPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                Para procesar
              </p>
            </CardContent>
          </Card>
        </div>


        {/* Actions */}
        {selectedPayments.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {selectedPayments.length} pagos seleccionados
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total: {formatCurrency(
                      Object.values(groupedPayments)
                        .flatMap(group => group.providers.flatMap(provider => provider.payments))
                        .filter(p => selectedPayments.includes(p.id))
                        .reduce((sum, p) => sum + p.paymentValue, 0)
                    )}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPayments([])}
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => markAsPaid(selectedPayments)}
                    disabled={processingPayments}
                  >
                    {processingPayments ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Marcar como Ejecutados
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setError(null)}
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Payments Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Pagos Aprobados</CardTitle>
                <CardDescription>
                  Lista de pagos aprobados pendientes de ejecución
                </CardDescription>
              </div>
              {filteredGroups.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAll}
                >
                  {selectedPayments.length === Object.values(groupedPayments)
                    .flatMap(group => group.providers.flatMap(provider => provider.payments.filter(p => !p.paid))).length 
                    ? 'Deseleccionar Todo' 
                    : 'Seleccionar Todo'
                  }
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {filteredGroups.length === 0 ? (
              <div className="text-center py-8">
                <Table className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm || selectedRequest !== "all" 
                    ? "No se encontraron pagos con los filtros aplicados"
                    : "No hay pagos aprobados disponibles"
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredGroups.map(([groupId, group]) => {
                  const isExpanded = expandedGroups.has(groupId)
                  const groupPendingPayments = group.providers.flatMap(provider => provider.payments.filter(p => !p.paid))
                  const allGroupSelected = groupPendingPayments.length > 0 && 
                    groupPendingPayments.every(p => selectedPayments.includes(p.id))
                  
                  return (
                    <div key={groupId} className="border rounded-lg overflow-hidden">
                      {/* Group Header */}
                      <div 
                        className="bg-gray-50 p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleGroupExpansion(groupId)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <input
                              type="checkbox"
                              checked={allGroupSelected}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleSelectGroup(groupId)
                              }}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300"
                            />
                            <div>
                              <h3 className="font-medium">
                                Solicitud: {formatDate(group.request.requestDate)}
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {group.providers.reduce((sum, provider) => sum + provider.payments.length, 0)} pagos • 
                                {group.paidCount} ejecutados • 
                                {group.pendingCount} pendientes • 
                                {group.providers.length} proveedores
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">
                                ${Math.round(group.totalValue).toLocaleString('es-CO')}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Total del grupo
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 hover:bg-gray-200"
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleGroupExpansion(groupId)
                              }}
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>

                      {/* Group Content - Providers */}
                      {isExpanded && (
                        <div className="space-y-2 p-4 bg-gray-50">
                          {group.providers.map((provider) => {
                            const providerKey = `${groupId}-${provider.providerName}`
                            const isProviderExpanded = expandedProviders.has(providerKey)
                            const providerPendingPayments = provider.payments.filter(p => !p.paid)
                            const allProviderSelected = providerPendingPayments.length > 0 && 
                              providerPendingPayments.every(p => selectedPayments.includes(p.id))
                            
                            return (
                              <div key={providerKey} className="border rounded-lg overflow-hidden bg-white">
                                {/* Provider Header */}
                                <div 
                                  className="p-3 cursor-pointer hover:bg-gray-50 transition-colors border-b"
                                  onClick={() => toggleProviderExpansion(providerKey)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <input
                                        type="checkbox"
                                        checked={allProviderSelected}
                                        onChange={(e) => {
                                          e.stopPropagation()
                                          handleSelectProvider(groupId, provider.providerName)
                                        }}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                      />
                                      <div>
                                        <h4 className="font-medium text-sm">
                                          {provider.providerName}
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                          {provider.payments.length} pagos • 
                                          {provider.paidCount} ejecutados • 
                                          {provider.pendingCount} pendientes
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <div className="text-right">
                                        <p className="font-bold text-sm">
                                          ${Math.round(provider.totalValue).toLocaleString('es-CO')}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                          Total proveedor
                                        </p>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-6 w-6 p-0 hover:bg-gray-200"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          toggleProviderExpansion(providerKey)
                                        }}
                                      >
                                        {isProviderExpanded ? (
                                          <ChevronDown className="h-3 w-3" />
                                        ) : (
                                          <ChevronRight className="h-3 w-3" />
                                        )}
                                      </Button>
                                    </div>
                                  </div>
                                </div>

                                {/* Provider Content - Payments Table */}
                                {isProviderExpanded && (
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                      <thead>
                                        <tr className="border-b bg-gray-50">
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">
                                            <input
                                              type="checkbox"
                                              checked={allProviderSelected}
                                              onChange={() => handleSelectProvider(groupId, provider.providerName)}
                                              className="h-3 w-3 text-blue-600 rounded border-gray-300"
                                            />
                                          </th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">NIT</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Número de Documento</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Fecha de Vencimiento</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Fecha de Aprobación</th>
                                          <th className="text-right p-2 font-medium text-xs text-muted-foreground">Valor</th>
                                          <th className="text-center p-2 font-medium text-xs text-muted-foreground">Estado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {provider.payments.map((payment) => (
                                          <tr 
                                            key={payment.id}
                                            className={`border-b hover:bg-gray-50 transition-colors ${
                                              selectedPayments.includes(payment.id) ? 'bg-blue-50' : ''
                                            } ${payment.paid ? 'opacity-60' : ''}`}
                                          >
                                            <td className="p-2">
                                              {!payment.paid && (
                                                <input
                                                  type="checkbox"
                                                  checked={selectedPayments.includes(payment.id)}
                                                  onChange={() => handleSelectPayment(payment.id)}
                                                  className="h-3 w-3 text-blue-600 rounded border-gray-300"
                                                />
                                              )}
                                            </td>
                                            <td className="p-2">
                                              <span className="font-medium text-xs">{payment.providerIdentification}</span>
                                            </td>
                                            <td className="p-2">
                                              <span className="font-mono text-xs">
                                                {payment.prefix}-{payment.consecutive}
                                              </span>
                                            </td>
                                            <td className="p-2">
                                              <span className="text-xs">{formatDate(payment.dueDate)}</span>
                                            </td>
                                            <td className="p-2">
                                              <span className="text-xs">{formatDate(payment.updatedAt)}</span>
                                            </td>
                                            <td className="p-2 text-right">
                                              <span className="font-bold text-xs">
                                                ${Math.round(payment.paymentValue).toLocaleString('es-CO')}
                                              </span>
                                            </td>
                                            <td className="p-2 text-center">
                                              <Badge 
                                                variant={payment.paid ? "default" : "secondary"}
                                                className={`text-xs ${payment.paid ? "bg-green-100 text-green-800" : ""}`}
                                              >
                                                {payment.paid ? "Ejecutado" : "Pendiente"}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
