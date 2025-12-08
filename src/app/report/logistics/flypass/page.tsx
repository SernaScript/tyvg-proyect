"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/MainLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceArea, ReferenceLine, PieChart, Pie, Label as RechartsLabel } from 'recharts'
import { 
  BarChart3, 
  TrendingUp, 
  Calendar, 
  DollarSign, 
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  ArrowLeft
} from "lucide-react"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useRouter } from "next/navigation"

interface ReportData {
  summary: {
    totalTransactions: number
    totalValue: number
    averageValue: number
    accountedTransactions: number
    accountedValue: number
    pendingTransactions: number
    pendingValue: number
  }
  dailyData: Array<{
    date: string
    transactions: number
    total: number
    fcTransactions: number
    fcTotal: number
    ncTransactions: number
    ncTotal: number
  }>
  tollData: Array<{
    tollName: string
    transactions: number
    total: number
  }>
}

export default function FlypassReportsPage() {
  const router = useRouter()
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedYear, setSelectedYear] = useState('')
  const [selectedMonth, setSelectedMonth] = useState('')

  // Paleta de colores distintivos para los peajes
  const colorPalette = [
    "hsl(220, 70%, 50%)", // Azul
    "hsl(0, 70%, 50%)", // Rojo
    "hsl(120, 70%, 50%)", // Verde
    "hsl(45, 70%, 50%)", // Amarillo
    "hsl(280, 70%, 50%)", // Púrpura
    "hsl(15, 70%, 50%)", // Naranja
    "hsl(180, 70%, 50%)", // Cian
    "hsl(300, 70%, 50%)", // Magenta
    "hsl(60, 70%, 50%)", // Lima
    "hsl(200, 70%, 50%)", // Azul claro
    "hsl(320, 70%, 50%)", // Rosa
    "hsl(140, 70%, 50%)", // Verde esmeralda
    "hsl(30, 70%, 50%)", // Naranja oscuro
    "hsl(260, 70%, 50%)", // Azul violeta
    "hsl(80, 70%, 50%)", // Verde lima
    "hsl(340, 70%, 50%)", // Rojo rosa
    "hsl(160, 70%, 50%)", // Verde azulado
    "hsl(40, 70%, 50%)", // Amarillo dorado
    "hsl(240, 70%, 50%)", // Azul profundo
    "hsl(100, 70%, 50%)", // Verde claro
  ]

  // Configuración del gráfico de torta
  const chartConfig = {
    total: {
      label: "Valor Total",
    },
    tollName: {
      label: "Peaje",
    },
  } satisfies ChartConfig

  // Establecer año y mes por defecto (mes actual)
  useEffect(() => {
    const today = new Date()
    setSelectedYear(today.getFullYear().toString())
    setSelectedMonth((today.getMonth() + 1).toString().padStart(2, '0'))
  }, [])

  const loadReportData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const params = new URLSearchParams()
      if (selectedYear) params.append('year', selectedYear)
      if (selectedMonth) params.append('month', selectedMonth)
      
      const response = await fetch(`/api/flypass-reports?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setReportData(result.data)
      } else {
        setError(result.error || 'Error al cargar los reportes')
      }
    } catch (error) {
      setError('Error de conexión al cargar los reportes')
      console.error('Error loading report data:', error)
    } finally {
      setIsLoading(false)
    }
  }


  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadReportData()
    }
  }, [selectedYear, selectedMonth])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-CO').format(num)
  }

  const formatDate = (dateString: string) => {
    // Si es un string en formato YYYY-MM-DD, crear la fecha en zona horaria local
    const [year, month, day] = dateString.split('-')
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Función para generar todos los días del mes
  const generateAllDaysOfMonth = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate()
    return Array.from({ length: daysInMonth }, (_, i) => i + 1)
  }

  // Función para identificar fines de semana (sábado y domingo)
  const getWeekendRanges = (year: number, month: number) => {
    const daysInMonth = new Date(year, month, 0).getDate()
    const weekendRanges = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month - 1, day)
      const dayOfWeek = date.getDay() // 0 = Domingo, 6 = Sábado
      
      if (dayOfWeek === 0 || dayOfWeek === 6) { // Domingo o Sábado
        weekendRanges.push(day)
      }
    }
    
    return weekendRanges
  }

  // Función para crear datos completos del mes (incluyendo días sin datos)
  const createCompleteMonthData = (dailyData: Array<{ 
    date: string; 
    transactions: number; 
    total: number;
    fcTransactions: number;
    fcTotal: number;
    ncTransactions: number;
    ncTotal: number;
  }>, year: number, month: number) => {
    const allDays = generateAllDaysOfMonth(year, month)
    // Crear mapa usando el día extraído del string YYYY-MM-DD
    const dataMap = new Map(dailyData.map(day => {
      const dayNumber = parseInt(day.date.split('-')[2]) // Extraer día del string YYYY-MM-DD
      return [dayNumber, day]
    }))
    
    return allDays.map(dayNumber => {
      const existingData = dataMap.get(dayNumber)
      if (existingData) {
        return {
          ...existingData,
          dayNumber,
          formattedDate: formatDate(existingData.date),
          formattedTotal: formatCurrency(existingData.total),
          formattedFcTotal: formatCurrency(existingData.fcTotal),
          formattedNcTotal: formatCurrency(existingData.ncTotal)
        }
      } else {
        // Día sin datos
        const date = new Date(year, month - 1, dayNumber)
        const dateString = date.toISOString().split('T')[0] // YYYY-MM-DD
        return {
          dayNumber,
          date: dateString,
          transactions: 0,
          total: 0,
          fcTransactions: 0,
          fcTotal: 0,
          ncTransactions: 0,
          ncTotal: 0,
          formattedDate: formatDate(dateString),
          formattedTotal: formatCurrency(0),
          formattedFcTotal: formatCurrency(0),
          formattedNcTotal: formatCurrency(0)
        }
      }
    })
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/report/logistics')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Reportes de Flypass</h1>
              <p className="text-muted-foreground">
                Análisis y estadísticas de los datos de peajes procesados
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              onClick={loadReportData}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </div>

        {/* Filtros de año y mes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Filtros de Período
            </CardTitle>
            <CardDescription>
              Selecciona el año y mes para generar los reportes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Año</Label>
                <select
                  id="year"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar año</option>
                  {Array.from({ length: 5 }, (_, i) => {
                    const year = new Date().getFullYear() - i
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="month">Mes</Label>
                <select
                  id="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Seleccionar mes</option>
                  {[
                    { value: '01', label: 'Enero' },
                    { value: '02', label: 'Febrero' },
                    { value: '03', label: 'Marzo' },
                    { value: '04', label: 'Abril' },
                    { value: '05', label: 'Mayo' },
                    { value: '06', label: 'Junio' },
                    { value: '07', label: 'Julio' },
                    { value: '08', label: 'Agosto' },
                    { value: '09', label: 'Septiembre' },
                    { value: '10', label: 'Octubre' },
                    { value: '11', label: 'Noviembre' },
                    { value: '12', label: 'Diciembre' }
                  ].map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={loadReportData}
                  disabled={isLoading || !selectedYear || !selectedMonth}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                      Cargando...
                    </>
                  ) : (
                    'Generar Reporte'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error state */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Indicador del período seleccionado */}
        {selectedYear && selectedMonth && (
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-800">
                <Calendar className="h-4 w-4" />
                <span className="font-medium">
                  Reporte para: {new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long' 
                  })}
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de estadísticas */}
        {reportData && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total de Transacciones
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatNumber(reportData.summary.totalTransactions)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Registros en el período
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Valor Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.totalValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Suma de todos los totales
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Promedio por Transacción
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {formatCurrency(reportData.summary.averageValue)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Valor promedio por registro
                  </p>
                </CardContent>
              </Card>

            </div>

            {/* Gráfico de desembolso diario */}
            <Card>
              <CardHeader>
                <CardTitle>Desembolso Diario Neto (FC - NC)</CardTitle>
                <CardDescription>
                  Gráfico de líneas mostrando el valor neto diario (Facturas de Compra - Notas de Crédito)
                </CardDescription>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-blue-600"></div>
                    <span className="text-sm text-muted-foreground">Total neto diario</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-2 bg-orange-500 bg-opacity-20 border border-orange-500"></div>
                    <span className="text-sm text-muted-foreground">Fines de semana (Sábado y Domingo)</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[400px] w-full">
                  {reportData.dailyData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={createCompleteMonthData(
                          reportData.dailyData, 
                          parseInt(selectedYear), 
                          parseInt(selectedMonth)
                        )}
                        margin={{
                          top: 20,
                          right: 30,
                          left: 20,
                          bottom: 20,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="dayNumber" 
                          tick={{ fontSize: 12 }}
                          height={40}
                          domain={['dataMin', 'dataMax']}
                          type="number"
                          scale="linear"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => {
                            const absValue = Math.abs(value);
                            const sign = value < 0 ? '-' : '';
                            return `${sign}$${(absValue / 1000000).toFixed(1)}M`;
                          }}
                          domain={['dataMin - 1000000', 'dataMax + 1000000']}
                        />
                        {/* Línea de referencia en cero */}
                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
                        {/* Áreas resaltadas para fines de semana */}
                        {getWeekendRanges(parseInt(selectedYear), parseInt(selectedMonth)).map(dayNumber => (
                          <ReferenceArea
                            key={dayNumber}
                            x1={dayNumber - 0.4}
                            x2={dayNumber + 0.4}
                            fill="#f97316"
                            fillOpacity={0.2}
                            stroke="#f97316"
                            strokeWidth={1}
                            strokeOpacity={0.5}
                          />
                        ))}
                        <Tooltip
                          formatter={(value: number, name, props) => {
                            if (props && props.payload) {
                              const data = props.payload;
                              return [
                                <div key="tooltip-content" className="space-y-1">
                                  <div className="font-semibold text-sm">
                                    {data.formattedDate}
                                  </div>
                                  <div className="text-xs space-y-1">
                                    <div className="flex justify-between">
                                      <span className="text-green-600">FC (Facturas):</span>
                                      <span className="font-medium">{data.formattedFcTotal}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-red-600">NC (Notas Crédito):</span>
                                      <span className="font-medium">-{data.formattedNcTotal}</span>
                                    </div>
                                    <div className="border-t pt-1 flex justify-between font-semibold">
                                      <span>Total Neto:</span>
                                      <span className={data.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {data.formattedTotal}
                                      </span>
                                    </div>
                                    <div className="text-gray-500 text-xs">
                                      {data.fcTransactions} FC, {data.ncTransactions} NC
                                    </div>
                                  </div>
                                </div>,
                                ''
                              ];
                            }
                            return [formatCurrency(value), 'Total Neto'];
                          }}
                          labelFormatter={() => ''}
                          contentStyle={{
                            backgroundColor: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            padding: '12px'
                          }}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="total" 
                          stroke="#2563eb" 
                          strokeWidth={3}
                          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                          connectNulls={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                        <p>No hay datos para el período seleccionado</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de torta - Top Peajes */}
            <Card className="flex flex-col">
              <CardHeader className="items-center pb-0">
                <CardTitle>Distribución de Valores por Peaje</CardTitle>
                <CardDescription>
                  {selectedYear && selectedMonth && 
                    `Reporte para: ${new Date(parseInt(selectedYear), parseInt(selectedMonth) - 1).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'long' 
                    })}`
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 pb-0">
                {reportData && reportData.tollData.length > 0 ? (
                  <ChartContainer
                    config={chartConfig}
                    className="mx-auto aspect-square max-h-[300px]"
                  >
                    <PieChart>
                      <ChartTooltip
                        cursor={false}
                        content={(props) => {
                          if (props.active && props.payload && props.payload[0]) {
                            const data = props.payload[0].payload;
                            return (
                              <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                                <div className="font-semibold text-sm mb-1">{data.tollName}</div>
                                <div className="text-xs space-y-1">
                                  <div className="flex justify-between">
                                    <span>Valor Total:</span>
                                    <span className="font-medium">{formatCurrency(data.total)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Transacciones:</span>
                                    <span className="font-medium">{data.transactions}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>Promedio:</span>
                                    <span className="font-medium">{formatCurrency(data.average)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Pie
                        data={reportData.tollData.map((toll, index) => {
                          // Asignar color de la paleta basado en el índice
                          const fillColor = colorPalette[index % colorPalette.length]
                          
                          return {
                            tollName: toll.tollName,
                            transactions: toll.transactions,
                            total: toll.total,
                            average: toll.total / toll.transactions,
                            fill: fillColor
                          }
                        })}
                        dataKey="total"
                        nameKey="tollName"
                        innerRadius={60}
                        strokeWidth={5}
                      >
                        <RechartsLabel
                          content={(props: any) => {
                            const { viewBox } = props
                            if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                              const totalTransactions = reportData.tollData.reduce((sum, t) => sum + t.transactions, 0)
                              return (
                                <text
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  textAnchor="middle"
                                  dominantBaseline="middle"
                                >
                                  <tspan
                                    x={viewBox.cx}
                                    y={viewBox.cy}
                                    className="fill-foreground text-3xl font-bold"
                                  >
                                    {formatNumber(totalTransactions)}
                                  </tspan>
                                  <tspan
                                    x={viewBox.cx}
                                    y={(viewBox.cy || 0) + 24}
                                    className="fill-muted-foreground"
                                  >
                                    Transacciones
                                  </tspan>
                                </text>
                              )
                            }
                            return null
                          }}
                        />
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                      <p>No hay datos para el período seleccionado</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex-col gap-4 text-sm">
                {reportData && reportData.tollData.length > 0 && (
                  <>
                    <div className="flex items-center gap-2 leading-none font-medium">
                      <TrendingUp className="h-4 w-4" />
                      Top peaje: {reportData.tollData[0]?.tollName} con {formatCurrency(reportData.tollData[0]?.total)} en valores
                    </div>
                    <div className="text-muted-foreground leading-none">
                      Mostrando distribución de {reportData.tollData.length} peajes
                    </div>
                    
                    {/* Leyenda de colores */}
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-muted-foreground mb-3">Leyenda de Colores:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {reportData.tollData.map((toll, index) => {
                          const fillColor = colorPalette[index % colorPalette.length]
                          const percentage = ((toll.transactions / reportData.tollData.reduce((sum, t) => sum + t.transactions, 0)) * 100).toFixed(1)
                          return (
                            <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                              <div 
                                className="w-4 h-4 rounded-full flex-shrink-0" 
                                style={{ backgroundColor: fillColor }}
                              ></div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium truncate">{toll.tollName}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatNumber(toll.transactions)} ({percentage}%)
                                </p>
                              </div>
                              <div className="text-right text-xs">
                                <p className="font-bold">{formatCurrency(toll.total)}</p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          </>
        )}

        {/* Loading state */}
        {isLoading && !reportData && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Cargando reportes...</p>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

