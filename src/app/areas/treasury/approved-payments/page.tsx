"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DollarSign, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, ArrowRight, FileSpreadsheet, ChevronDown, ChevronUp } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek, addMonths, subMonths } from "date-fns"
import { es } from "date-fns/locale"

interface ApprovedGeneratedRequest {
  id: string
  requestDate: string
  createdAt: string
  updatedAt: string
  state: string
  totalApprovedValue: number
  approvedCount: number
  totalRecords: number
}

interface DayData {
  date: Date
  requests: ApprovedGeneratedRequest[]
  totalValue: number
}

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
}


export default function ApprovedPaymentsPage() {
  const router = useRouter()
  const [approvedRequests, setApprovedRequests] = useState<ApprovedGeneratedRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [daysData, setDaysData] = useState<Map<string, DayData>>(new Map())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedDateRequests, setSelectedDateRequests] = useState<ApprovedGeneratedRequest[]>([])
  const [loadingRequests, setLoadingRequests] = useState(false)
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(new Set())
  const [requestPayments, setRequestPayments] = useState<Map<string, AccountPayable[]>>(new Map())
  const [loadingPayments, setLoadingPayments] = useState<Set<string>>(new Set())

  const fetchApprovedRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/accounts-payable/approved-generated')
      const result = await response.json()

      if (result.success) {
        setApprovedRequests(result.data)
      } else {
        setError(result.error || 'Error al cargar solicitudes aprobadas')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching approved requests:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApprovedRequests()
  }, [])

  // Agrupar requests por fecha de actualización (fecha de aprobación)
  useEffect(() => {
    if (approvedRequests.length === 0) {
      setDaysData(new Map())
      return
    }

    const grouped = new Map<string, DayData>()

    approvedRequests.forEach(request => {
      const approvalDate = new Date(request.updatedAt)
      const dateKey = format(approvalDate, 'yyyy-MM-dd')

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, {
          date: approvalDate,
          requests: [],
          totalValue: 0
        })
      }

      const dayData = grouped.get(dateKey)!
      dayData.requests.push(request)
      dayData.totalValue += request.totalApprovedValue
    })

    setDaysData(grouped)
  }, [approvedRequests])

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

  const getTotalMonthValue = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    let total = 0
    daysData.forEach((dayData, dateKey) => {
      const date = new Date(dateKey)
      if (date >= monthStart && date <= monthEnd) {
        total += dayData.totalValue
      }
    })

    return total
  }

  const getMonthRequestsCount = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)

    let count = 0
    daysData.forEach((dayData, dateKey) => {
      const date = new Date(dateKey)
      if (date >= monthStart && date <= monthEnd) {
        count += dayData.requests.length
      }
    })

    return count
  }

  const getDayData = (date: Date): DayData | null => {
    const dateKey = format(date, 'yyyy-MM-dd')
    return daysData.get(dateKey) || null
  }

  const handleDateClick = async (date: Date) => {
    const dayData = getDayData(date)
    if (!dayData) return

    setSelectedDate(date)
    setIsModalOpen(true)
    setLoadingRequests(true)
    setSelectedDateRequests([])

    // Usar las carteras que ya tenemos en dayData
    setSelectedDateRequests(dayData.requests)
    setLoadingRequests(false)
  }

  const handleRequestClick = (requestId: string) => {
    router.push(`/areas/treasury/approved-payments/${requestId}`)
  }

  const toggleRequestExpansion = async (requestId: string) => {
    const isExpanded = expandedRequests.has(requestId)

    if (isExpanded) {
      // Colapsar
      setExpandedRequests(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    } else {
      // Expandir - cargar pagos si no están cargados
      setExpandedRequests(prev => new Set(prev).add(requestId))

      if (!requestPayments.has(requestId)) {
        await fetchRequestPayments(requestId)
      }
    }
  }

  const fetchRequestPayments = async (requestId: string) => {
    try {
      setLoadingPayments(prev => new Set(prev).add(requestId))
      const response = await fetch(`/api/accounts-payable/approved?generatedRequestId=${requestId}`)
      const result = await response.json()

      if (result.success) {
        setRequestPayments(prev => {
          const newMap = new Map(prev)
          newMap.set(requestId, result.data)
          return newMap
        })
      } else {
        setError(result.error || 'Error al cargar pagos de la cartera')
      }
    } catch (err) {
      setError('Error de conexión con la API')
      console.error('Error fetching request payments:', err)
    } finally {
      setLoadingPayments(prev => {
        const newSet = new Set(prev)
        newSet.delete(requestId)
        return newSet
      })
    }
  }

  const handleExportPaymentsToExcel = async (
    requestId: string,
    payments: AccountPayable[],
    request: ApprovedGeneratedRequest
  ) => {
    try {
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
      const fileName = `pagos_cartera_${requestId.slice(0, 8)}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      // Escribir el archivo y descargarlo
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error al exportar pagos a Excel:', error)
      setError('Error al exportar los pagos a Excel')
    }
  }

  const handleExportToExcel = async () => {
    try {
      const XLSX = await import('xlsx')

      // Prepare the values

      const exportData = approvedRequests.map((request) => ({
        'ID Cartera': request.id,
        'Fecha Solicitud': formatDate(request.requestDate),
        'Fecha Aprobación': formatDate(request.updatedAt),
        'Estado': request.state,
        'Pagos Aprobados': request.approvedCount,
        'Valor Total Aprobado': request.totalApprovedValue
      }))

      // Crear hoja de trabajo
      const ws = XLSX.utils.json_to_sheet(exportData)

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 30 }, // ID Cartera
        { wch: 18 }, // Fecha Solicitud
        { wch: 18 }, // Fecha Aprobación
        { wch: 15 }, // Estado
        { wch: 18 }, // Pagos Aprobados
        { wch: 20 }  // Valor Total Aprobado
      ]
      ws['!cols'] = colWidths

      // Aplicar formato de moneda colombiana a la columna "Valor Total Aprobado"
      // El formato "$#,##0" muestra pesos colombianos sin decimales
      const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
      const valueColumnIndex = 5 // Columna F (índice 5, 0-based) - "Valor Total Aprobado"

      for (let row = 1; row <= range.e.r; row++) { // Empezar desde la fila 1 (después del header)
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: valueColumnIndex })
        if (ws[cellAddress]) {
          // Aplicar formato de moneda colombiana
          ws[cellAddress].z = '"$"#,##0'
        }
      }

      // Crear libro de trabajo
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Carteras Aprobadas')

      // Generar nombre de archivo con fecha
      const fileName = `carteras_aprobadas_${format(new Date(), 'yyyy-MM-dd')}.xlsx`

      // Escribir el archivo y descargarlo
      XLSX.writeFile(wb, fileName)
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      setError('Error al exportar los datos a Excel')
    }
  }

  const renderCalendarDay = (date: Date) => {
    const dayData = getDayData(date)
    const isCurrentMonth = isSameMonth(date, currentMonth)
    const isToday = isSameDay(date, new Date())
    const isSelected = selectedDate && isSameDay(date, selectedDate)

    if (!dayData || !isCurrentMonth) {
      return (
        <div
          className={`h-full w-full p-1 text-sm ${!isCurrentMonth ? 'text-gray-300' : ''
            } ${isToday ? 'font-bold' : ''}`}
        >
          {format(date, 'd')}
        </div>
      )
    }

    return (
      <div
        onClick={() => handleDateClick(date)}
        className={`h-full w-full p-1 cursor-pointer rounded-md hover:bg-gray-100 transition-colors ${isSelected ? 'bg-blue-100 border-2 border-blue-500' : ''
          } ${isToday ? 'ring-2 ring-green-500' : ''}`}
      >
        <div className="text-sm font-medium">{format(date, 'd')}</div>
        <div className="text-xs text-green-600 font-semibold mt-1">
          {formatCurrency(dayData.totalValue)}
        </div>
        <div className="text-xs text-gray-500">
          {dayData.requests.length} solicitud{dayData.requests.length !== 1 ? 'es' : ''}
        </div>
      </div>
    )
  }

  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

    const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date) => (
            <div
              key={date.toISOString()}
              className={`min-h-[100px] border rounded-md ${!isSameMonth(date, currentMonth) ? 'bg-gray-50' : 'bg-white'
                }`}
            >
              {renderCalendarDay(date)}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <AreaLayout areaId="treasury">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando solicitudes aprobadas...</p>
          </div>
        </div>
      </AreaLayout>
    )
  }

  const totalMonthValue = getTotalMonthValue()
  const monthRequestsCount = getMonthRequestsCount()

  return (
    <AreaLayout areaId="treasury">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pagos Aprobados</h1>
            <p className="text-muted-foreground">
              Vista de calendario de solicitudes aprobadas con valores de pago
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportToExcel}
              disabled={approvedRequests.length === 0 || loading}
            >
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Exportar a Excel
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total del Mes
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(totalMonthValue)}</div>
              <p className="text-xs text-muted-foreground">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Solicitudes Aprobadas
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{monthRequestsCount}</div>
              <p className="text-xs text-muted-foreground">
                En el mes actual
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total General
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(
                  Array.from(daysData.values()).reduce((sum, day) => sum + day.totalValue, 0)
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Todas las solicitudes aprobadas
              </p>
            </CardContent>
          </Card>
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

        {/* Calendar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Calendario de Pagos Aprobados</CardTitle>
                <CardDescription>
                  Haz clic en un día para ver los detalles de las solicitudes aprobadas
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(new Date())}
                >
                  Hoy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                {format(currentMonth, 'MMMM yyyy', { locale: es })}
              </h3>
            </div>
          </CardHeader>
          <CardContent>
            {daysData.size === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  No hay solicitudes aprobadas disponibles
                </p>
              </div>
            ) : (
              renderCalendar()
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">
                  Información sobre la vista
                </p>
                <p className="text-xs text-blue-700">
                  Esta vista muestra únicamente los <strong>SiigoAccountsPayableGenerated</strong> que han sido aprobados (state = 'approved').
                  Cada día muestra el valor total aprobado de todas las solicitudes aprobadas en esa fecha.
                  Haz clic en cualquier día con datos para ver y aprobar los pagos individuales.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modal de Carteras Aprobadas */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Carteras Aprobadas - {selectedDate ? format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es }) : ''}
              </DialogTitle>
              <DialogDescription>
                Lista de carteras (solicitudes generadas) aprobadas para esta fecha. Haz clic en una cartera para ver sus pagos.
              </DialogDescription>
            </DialogHeader>

            {loadingRequests ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Cargando carteras...</p>
                </div>
              </div>
            ) : selectedDateRequests.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No hay carteras aprobadas para esta fecha</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Carteras</p>
                    <p className="text-lg font-bold">{selectedDateRequests.length}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Pagos</p>
                    <p className="text-lg font-bold text-blue-600">
                      {selectedDateRequests.reduce((sum, req) => sum + req.approvedCount, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Valor</p>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(
                        selectedDateRequests.reduce((sum, req) => sum + req.totalApprovedValue, 0)
                      )}
                    </p>
                  </div>
                </div>

                {/* Lista de Carteras */}
                <div className="space-y-3">
                  {selectedDateRequests.map((request) => {
                    const isExpanded = expandedRequests.has(request.id)
                    const payments = requestPayments.get(request.id) || []
                    const isLoading = loadingPayments.has(request.id)

                    return (
                      <Card
                        key={request.id}
                        className="border-l-4 border-l-green-500"
                      >
                        <CardContent className="p-0">
                          {/* Header de la Cartera */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleRequestExpansion(request.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-sm">
                                    Cartera #{request.id.slice(0, 8)}
                                  </h4>
                                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                    Aprobada
                                  </Badge>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <p className="text-muted-foreground text-xs">Fecha Solicitud</p>
                                    <p className="font-medium">{formatDate(request.requestDate)}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Pagos Aprobados</p>
                                    <p className="font-medium">{request.approvedCount} de {request.totalRecords}</p>
                                  </div>
                                  <div>
                                    <p className="text-muted-foreground text-xs">Valor Total</p>
                                    <p className="font-bold text-green-600">
                                      {formatCurrency(request.totalApprovedValue)}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-4 flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRequestClick(request.id)
                                  }}
                                  title="Ver página completa"
                                >
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="sm">
                                  {isExpanded ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* Contenido Expandido - Pagos */}
                          {isExpanded && (
                            <div className="border-t bg-gray-50">
                              {isLoading ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="text-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
                                    <p className="text-xs text-muted-foreground">Cargando pagos...</p>
                                  </div>
                                </div>
                              ) : payments.length === 0 ? (
                                <div className="text-center py-8">
                                  <p className="text-sm text-muted-foreground">No hay pagos aprobados en esta cartera</p>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="mb-3 flex items-center justify-between">
                                    <p className="text-sm font-medium text-muted-foreground">
                                      {payments.length} pago{payments.length !== 1 ? 's' : ''} aprobado{payments.length !== 1 ? 's' : ''}
                                    </p>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleExportPaymentsToExcel(request.id, payments, request)}
                                    >
                                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                                      Exportar a Excel
                                    </Button>
                                  </div>
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-sm">
                                      <thead>
                                        <tr className="border-b bg-white">
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Proveedor</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">NIT</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Documento</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Vencimiento</th>
                                          <th className="text-left p-2 font-medium text-xs text-muted-foreground">Centro de Costo</th>
                                          <th className="text-right p-2 font-medium text-xs text-muted-foreground">Valor</th>
                                          <th className="text-center p-2 font-medium text-xs text-muted-foreground">Estado</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {payments.map((payment) => (
                                          <tr
                                            key={payment.id}
                                            className={`border-b hover:bg-white transition-colors ${payment.paid ? 'opacity-60' : ''
                                              }`}
                                          >
                                            <td className="p-2">
                                              <span className="font-medium text-xs">{payment.providerName}</span>
                                            </td>
                                            <td className="p-2">
                                              <span className="text-xs">{payment.providerIdentification}</span>
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
                                              <span className="text-xs">{payment.costCenterName}</span>
                                            </td>
                                            <td className="p-2 text-right">
                                              <span className="font-bold text-xs text-green-600">
                                                {formatCurrency(payment.paymentValue)}
                                              </span>
                                            </td>
                                            <td className="p-2 text-center">
                                              <Badge
                                                variant={payment.paid ? "default" : "secondary"}
                                                className={`text-xs ${payment.paid ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}`}
                                              >
                                                {payment.paid ? "Ejecutado" : "Pendiente"}
                                              </Badge>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AreaLayout>
  )
}
