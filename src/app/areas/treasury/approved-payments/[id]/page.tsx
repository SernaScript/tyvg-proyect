"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, ArrowLeft, Check, CheckCircle, Clock, FileSpreadsheet } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface AccountPayable {
  id: string
  prefix: string
  consecutive: string
  quote: number
  dueDate: string
  balance: number
  providerName: string
  providerIdentification: string
  providerBranchOffice: number
  costCenterName: string
  costCenterCode: number
  currencyCode: string
  currencyBalance: number
  paymentValue: number
  approved: boolean
  paid: boolean
  createdAt: string
  updatedAt: string
  generatedRequestId: string
  generatedRequest: {
    id: string
    state: string
    requestDate: string
    createdAt: string
    updatedAt: string
  }
}

interface GeneratedRequest {
  id: string
  requestDate: string
  createdAt: string
  updatedAt: string
  state: string
}

export default function PortfolioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const portfolioId = params.id as string

  const [payments, setPayments] = useState<AccountPayable[]>([])
  const [generatedRequest, setGeneratedRequest] = useState<GeneratedRequest | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPaymentIds, setSelectedPaymentIds] = useState<string[]>([])
  const [processingPayments, setProcessingPayments] = useState(false)
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolioPayments()
    }
  }, [portfolioId])

  const fetchPortfolioPayments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/accounts-payable/approved?generatedRequestId=${portfolioId}`)
      const result = await response.json()

      if (result.success) {
        setPayments(result.data)
        if (result.data.length > 0) {
          setGeneratedRequest(result.data[0].generatedRequest)
        }
      } else {
        setError(result.error || 'Error al cargar pagos de la cartera')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching portfolio payments:', err)
    } finally {
      setLoading(false)
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
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es })
  }

  const handleSelectPayment = (paymentId: string) => {
    setSelectedPaymentIds(prev =>
      prev.includes(paymentId)
        ? prev.filter(id => id !== paymentId)
        : [...prev, paymentId]
    )
  }

  const handleSelectAll = () => {
    const pendingPayments = payments.filter(p => !p.paid)
    const allSelected = pendingPayments.every(p => selectedPaymentIds.includes(p.id))

    if (allSelected) {
      setSelectedPaymentIds([])
    } else {
      setSelectedPaymentIds(pendingPayments.map(p => p.id))
    }
  }

  const handleMarkAsPaid = async () => {
    if (selectedPaymentIds.length === 0) {
      setError('Por favor selecciona al menos un pago')
      return
    }

    try {
      setProcessingPayments(true)
      const response = await fetch('/api/accounts-payable/mark-paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ paymentIds: selectedPaymentIds })
      })

      const result = await response.json()

      if (result.success) {
        // Actualizar los pagos en el estado local
        setPayments(prev =>
          prev.map(payment =>
            selectedPaymentIds.includes(payment.id)
              ? { ...payment, paid: true }
              : payment
          )
        )
        setSelectedPaymentIds([])
        // Recargar los datos
        await fetchPortfolioPayments()
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

  const handleExportToExcel = async () => {
    if (payments.length === 0) {
      setError('No hay pagos para exportar')
      return
    }

    try {
      setExporting(true)
      const XLSX = await import('xlsx')

      // Preparar los datos para exportar
      const exportData = payments.map((payment) => ({
        'Proveedor': payment.providerName,
        'NIT': payment.providerIdentification,
        'Documento': `${payment.prefix}-${payment.consecutive}`,
        'Fecha Vencimiento': formatDate(payment.dueDate),
        'Centro de Costo': payment.costCenterName,
        'Valor Pago': payment.paymentValue,
        'Estado': payment.paid ? 'Ejecutado' : 'Pendiente',
        'Fecha Creación': formatDate(payment.createdAt),
        'Fecha Actualización': formatDate(payment.updatedAt)
      }))

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 30 }, // Proveedor
        { wch: 15 }, // NIT
        { wch: 20 }, // Documento
        { wch: 18 }, // Fecha Vencimiento
        { wch: 25 }, // Centro de Costo
        { wch: 15 }, // Valor Pago
        { wch: 12 }, // Estado
        { wch: 18 }, // Fecha Creación
        { wch: 18 }  // Fecha Actualización
      ]
      ws['!cols'] = colWidths

      // Aplicar formato de moneda colombiana a la columna "Valor Pago"
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      const valueColumnIndex = 5 // Columna F (índice 5, 0-based) - "Valor Pago"

      for (let row = 1; row <= range.e.r; row++) { // Empezar desde la fila 1 (después del header)
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: valueColumnIndex })
        if (ws[cellAddress]) {
          // Aplicar formato de moneda colombiana
          ws[cellAddress].z = '"$"#,##0'
        }
      }

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Pagos Aprobados')

      // Generar nombre de archivo con ID de cartera y fecha
      const fileName = `pagos_cartera_${portfolioId.slice(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      // Escribir el archivo y descargarlo
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error al exportar pagos a Excel:', error)
      setError('Error al exportar los pagos a Excel')
    } finally {
      setExporting(false)
    }
  }

  if (loading) {
    return (
      <AreaLayout areaId="treasury">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando pagos de la cartera...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  const pendingPayments = payments.filter(p => !p.paid)
  const paidPayments = payments.filter(p => p.paid)
  const totalValue = payments.reduce((sum, p) => sum + p.paymentValue, 0)
  const selectedTotalValue = payments
    .filter(p => selectedPaymentIds.includes(p.id))
    .reduce((sum, p) => sum + p.paymentValue, 0)

  return (
    <AreaLayout areaId="treasury">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/areas/treasury/approved-payments')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Pagos de la Cartera</h1>
              <p className="text-muted-foreground">
                {generatedRequest && `Cartera aprobada el ${formatDate(generatedRequest.updatedAt)}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={payments.length === 0 || exporting}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              {exporting ? 'Exportando...' : 'Exportar a Excel'}
            </Button>
          </div>
        </div>

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Pagos
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{payments.length}</div>
              <p className="text-xs text-muted-foreground">
                En esta cartera
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
              <div className="text-2xl font-bold text-orange-600">{pendingPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                Por ejecutar
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ejecutados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{paidPayments.length}</div>
              <p className="text-xs text-muted-foreground">
                Completados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Valor
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Valor aprobado
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {pendingPayments.length > 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                  >
                    {pendingPayments.every(p => selectedPaymentIds.includes(p.id))
                      ? 'Deseleccionar Todo'
                      : 'Seleccionar Todo'}
                  </Button>
                  {selectedPaymentIds.length > 0 && (
                    <div className="text-sm">
                      <span className="font-medium">{selectedPaymentIds.length}</span> pagos seleccionados •
                      Total: <span className="font-bold text-green-600">
                        {formatCurrency(selectedTotalValue)}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleMarkAsPaid}
                  disabled={selectedPaymentIds.length === 0 || processingPayments}
                >
                  {processingPayments ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Marcar como Ejecutados ({selectedPaymentIds.length})
                    </>
                  )}
                </Button>
              </div>
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
                  Lista de pagos aprobados de esta cartera
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay pagos aprobados en esta cartera</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground w-12">
                          {pendingPayments.length > 0 && (
                            <input
                              type="checkbox"
                              checked={pendingPayments.every(p => selectedPaymentIds.includes(p.id)) && pendingPayments.length > 0}
                              onChange={handleSelectAll}
                              className="h-4 w-4 text-blue-600 rounded border-gray-300"
                              aria-label="Seleccionar todos los pagos pendientes"
                              title="Seleccionar todos los pagos pendientes"
                            />
                          )}
                        </th>
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground">Proveedor</th>
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground">NIT</th>
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground">Documento</th>
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground">Vencimiento</th>
                        <th className="text-left p-3 font-medium text-xs text-muted-foreground">Centro de Costo</th>
                        <th className="text-right p-3 font-medium text-xs text-muted-foreground">Valor</th>
                        <th className="text-center p-3 font-medium text-xs text-muted-foreground">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payments.map((payment) => (
                        <tr
                          key={payment.id}
                          className={`border-b hover:bg-gray-50 transition-colors ${selectedPaymentIds.includes(payment.id) ? 'bg-blue-50' : ''
                            } ${payment.paid ? 'opacity-60' : ''}`}
                        >
                          <td className="p-3">
                            {!payment.paid && (
                              <input
                                type="checkbox"
                                checked={selectedPaymentIds.includes(payment.id)}
                                onChange={() => handleSelectPayment(payment.id)}
                                className="h-4 w-4 text-blue-600 rounded border-gray-300"
                                aria-label={`Seleccionar pago de ${payment.providerName}`}
                                title={`Seleccionar pago de ${payment.providerName}`}
                              />
                            )}
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-sm">{payment.providerName}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{payment.providerIdentification}</span>
                          </td>
                          <td className="p-3">
                            <span className="font-mono text-sm">
                              {payment.prefix}-{payment.consecutive}
                            </span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{formatDate(payment.dueDate)}</span>
                          </td>
                          <td className="p-3">
                            <span className="text-sm">{payment.costCenterName}</span>
                          </td>
                          <td className="p-3 text-right">
                            <span className="font-bold text-sm text-green-600">
                              {formatCurrency(payment.paymentValue)}
                            </span>
                          </td>
                          <td className="p-3 text-center">
                            <Badge
                              variant={payment.paid ? "default" : "secondary"}
                              className={`text-xs ${payment.paid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                            >
                              {payment.paid ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1 inline" />
                                  Ejecutado
                                </>
                              ) : (
                                <>
                                  <Clock className="h-3 w-3 mr-1 inline" />
                                  Pendiente
                                </>
                              )}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}

