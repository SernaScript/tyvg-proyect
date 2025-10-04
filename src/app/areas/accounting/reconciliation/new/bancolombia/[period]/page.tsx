"use client"

import { useParams, useRouter } from "next/navigation"
import { useState } from "react"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Upload,
  Download,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  Trash2,
  Users,
  Settings
} from "lucide-react"

export default function BancolombiaReconciliationPage() {
  const params = useParams()
  const router = useRouter()
  const period = params.period as string
  
  const [selectedAccount, setSelectedAccount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [bankTransactions, setBankTransactions] = useState<any[]>([])
  const [accountingRecords, setAccountingRecords] = useState<any[]>([])
  const [uploadedFileName, setUploadedFileName] = useState("")
  const [accountingFileName, setAccountingFileName] = useState("")

  // Función para procesar el CSV de Bancolombia
  const processBancolombiaCSV = (csvContent: string) => {
    const lines = csvContent.split('\n').filter(line => line.trim())
    const transactions = lines.map((line, index) => {
      const columns = line.split(',').map(col => col.trim())
      
      // Validar que tenga al menos 8 columnas
      if (columns.length < 8) {
        console.warn(`Línea ${index + 1} no tiene el formato esperado:`, line)
        return null
      }

      return {
        id: index + 1,
        accountNumber: columns[0], // 399-748850-11
        transactionCode: columns[1], // 399
        empty1: columns[2], // (vacía)
        date: columns[3], // 20250930
        empty2: columns[4], // (vacía)
        amount: parseFloat(columns[5]) || 0, // 7800000.00
        internalCode: columns[6], // 2142
        description: columns[7], // PAGO INTERBANC MIGUEL DARIO
        empty3: columns[8] || '', // 0
        formattedDate: formatDateFromYYYYMMDD(columns[3]),
        formattedAmount: formatCurrency(parseFloat(columns[5]) || 0)
      }
    }).filter(transaction => transaction !== null)

    return transactions
  }

  // Función para formatear fecha desde YYYYMMDD
  const formatDateFromYYYYMMDD = (dateStr: string) => {
    if (dateStr.length !== 8) return dateStr
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return `${day}/${month}/${year}`
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  // Función para formatear fecha desde Excel
  const formatDateFromExcel = (dateValue: string | number) => {
    try {
      // Si es un número (serial de Excel), convertirlo a fecha
      if (typeof dateValue === 'number') {
        // Excel serial date: días desde 1900-01-01
        const excelEpoch = new Date(1900, 0, 1)
        const date = new Date(excelEpoch.getTime() + (dateValue - 2) * 24 * 60 * 60 * 1000)
        return date.toLocaleDateString('es-CO')
      }
      
      // Si es string, intentar parsearlo
      const date = new Date(dateValue)
      if (isNaN(date.getTime())) {
        return dateValue // Devolver original si no se puede parsear
      }
      
      return date.toLocaleDateString('es-CO')
    } catch (error) {
      return dateValue // Devolver original en caso de error
    }
  }

  // Función para procesar el archivo Excel del sistema contable
  const processAccountingExcel = (excelData: any[][]) => {
    if (!excelData || excelData.length === 0) {
      throw new Error('El archivo Excel está vacío o no se pudo leer correctamente')
    }
    
    // Buscar la fila de encabezados con múltiples variaciones
    let headerIndex = -1
    let headers: string[] = []
    
    // Variaciones posibles de los nombres de columnas
    const cuentaVariations = ['cuenta contable', 'cuenta', 'cuenta_contable', 'cuentacontable', 'cuenta contable:', 'cuenta:', 'account']
    const debitoVariations = ['débito', 'debito', 'débito:', 'debito:', 'debit', 'debe', 'debe:', 'debitos', 'débitos']
    const creditoVariations = ['crédito', 'credito', 'crédito:', 'credito:', 'credit', 'haber', 'haber:', 'creditos', 'créditos']
    const fechaVariations = ['fecha elaboración', 'fecha elaboracion', 'fecha', 'fecha:', 'fecha elaboración:', 'fecha elaboracion:', 'date', 'elaboración', 'elaboracion']
    const terceroVariations = ['nombre del tercero', 'nombre tercero', 'tercero', 'nombre', 'tercero:', 'nombre:', 'nombre del tercero:', 'third party', 'party']
    
    for (let i = 0; i < excelData.length; i++) {
      const row = excelData[i]
      if (row && row.length > 0) {
        const rowText = row.map(cell => String(cell || '').toLowerCase().trim()).join(' ')
        
        // Buscar si contiene alguna variación de cada columna requerida
        const hasCuenta = cuentaVariations.some(variation => rowText.includes(variation))
        const hasDebito = debitoVariations.some(variation => rowText.includes(variation))
        const hasCredito = creditoVariations.some(variation => rowText.includes(variation))
        const hasFecha = fechaVariations.some(variation => rowText.includes(variation))
        const hasTercero = terceroVariations.some(variation => rowText.includes(variation))
        
        if (hasCuenta && hasDebito && hasCredito) {
          headerIndex = i
          headers = row.map(cell => String(cell || '').trim())
          console.log('Encabezados encontrados:', headers)
          break
        }
      }
    }
    
    if (headerIndex === -1) {
      // Mostrar las primeras filas para debug
      console.log('Primeras 5 filas del archivo:')
      for (let i = 0; i < Math.min(5, excelData.length); i++) {
        console.log(`Fila ${i}:`, excelData[i])
      }
      throw new Error('No se encontraron los encabezados esperados. Buscando: cuenta contable, debito, credito (con variaciones)')
    }
    
    // Obtener índices de las columnas necesarias con búsqueda flexible
    const cuentaContableIndex = headers.findIndex(h => {
      const lowerH = h.toLowerCase()
      return cuentaVariations.some(variation => lowerH.includes(variation))
    })
    
    const debitoIndex = headers.findIndex(h => {
      const lowerH = h.toLowerCase()
      return debitoVariations.some(variation => lowerH.includes(variation))
    })
    
    const creditoIndex = headers.findIndex(h => {
      const lowerH = h.toLowerCase()
      return creditoVariations.some(variation => lowerH.includes(variation))
    })
    
    const fechaIndex = headers.findIndex(h => {
      const lowerH = h.toLowerCase()
      return fechaVariations.some(variation => lowerH.includes(variation))
    })
    
    const terceroIndex = headers.findIndex(h => {
      const lowerH = h.toLowerCase()
      return terceroVariations.some(variation => lowerH.includes(variation))
    })
    
    if (cuentaContableIndex === -1 || debitoIndex === -1 || creditoIndex === -1) {
      console.log('Encabezados encontrados:', headers)
      console.log('Índices encontrados:', { cuentaContableIndex, debitoIndex, creditoIndex, fechaIndex, terceroIndex })
      throw new Error(`No se encontraron las columnas requeridas. Encabezados disponibles: ${headers.join(', ')}`)
    }
    
    // Procesar las filas de datos
    const records = []
    for (let i = headerIndex + 1; i < excelData.length; i++) {
      const row = excelData[i]
      if (!row || row.length === 0) continue
      
      const cuentaContable = String(row[cuentaContableIndex] || '').trim()
      
      // Solo procesar si tiene cuenta contable (no vacía)
      if (cuentaContable && cuentaContable !== '') {
        const debito = parseFloat(String(row[debitoIndex] || '0')) || 0
        const credito = parseFloat(String(row[creditoIndex] || '0')) || 0
        const movimiento = debito - credito
        
        // Obtener fecha y tercero (opcionales)
        const fechaElaboracion = fechaIndex !== -1 ? String(row[fechaIndex] || '').trim() : ''
        const nombreTercero = terceroIndex !== -1 ? String(row[terceroIndex] || '').trim() : ''
        
        records.push({
          id: records.length + 1,
          cuentaContable: cuentaContable,
          debito: debito,
          credito: credito,
          movimiento: movimiento,
          fechaElaboracion: fechaElaboracion,
          nombreTercero: nombreTercero,
          formattedDebito: formatCurrency(debito),
          formattedCredito: formatCurrency(credito),
          formattedMovimiento: formatCurrency(movimiento),
          formattedFecha: fechaElaboracion ? formatDateFromExcel(fechaElaboracion) : '',
          // Incluir todas las columnas originales para referencia
          rawData: row.map(cell => String(cell || ''))
        })
      }
    }
    
    return records
  }

  // Función para procesar archivo
  const processFile = (file: File, type: 'bank' | 'accounting') => {
    // Validar formato de archivo según tipo
    if (type === 'bank' && !file.name.toLowerCase().endsWith('.csv')) {
      alert('Por favor seleccione un archivo CSV válido para el extracto bancario')
      return
    }
    
    if (type === 'accounting' && !file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      alert('Por favor seleccione un archivo Excel (.xlsx) válido para los registros contables')
      return
    }

    if (type === 'bank') {
      setUploadedFileName(file.name)
    } else {
      setAccountingFileName(file.name)
    }
    
    setIsProcessing(true)

    if (type === 'bank') {
      // Procesar archivo CSV bancario
      const reader = new FileReader()
      reader.onload = (e) => {
        const csvContent = e.target?.result as string
        if (csvContent) {
          try {
            const transactions = processBancolombiaCSV(csvContent)
            setBankTransactions(transactions)
            console.log(`Archivo bancario ${file.name} procesado exitosamente. ${transactions.length} transacciones encontradas.`)
          } catch (error) {
            console.error('Error procesando el archivo:', error)
            alert(`Error al procesar el archivo CSV. ${error instanceof Error ? error.message : 'Verifique el formato.'}`)
          }
        }
        setIsProcessing(false)
      }

      reader.onerror = () => {
        console.error('Error leyendo el archivo')
        alert('Error al leer el archivo')
        setIsProcessing(false)
      }

      reader.readAsText(file, 'UTF-8')
    } else {
      // Procesar archivo Excel contable
      const reader = new FileReader()
      reader.onload = (e) => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        if (arrayBuffer) {
          try {
            // Importar XLSX dinámicamente
            import('xlsx').then((XLSX) => {
              const workbook = XLSX.read(arrayBuffer, { type: 'array' })
              const sheetName = workbook.SheetNames[0]
              const worksheet = workbook.Sheets[sheetName]
              const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })
              
              const records = processAccountingExcel(excelData as any[][])
              setAccountingRecords(records)
              console.log(`Archivo contable ${file.name} procesado exitosamente. ${records.length} registros encontrados.`)
              setIsProcessing(false)
            }).catch((error) => {
              console.error('Error procesando el archivo Excel:', error)
              alert(`Error al procesar el archivo Excel. ${error instanceof Error ? error.message : 'Verifique el formato.'}`)
              setIsProcessing(false)
            })
          } catch (error) {
            console.error('Error procesando el archivo:', error)
            alert(`Error al procesar el archivo Excel. ${error instanceof Error ? error.message : 'Verifique el formato.'}`)
            setIsProcessing(false)
          }
        }
      }

      reader.onerror = () => {
        console.error('Error leyendo el archivo')
        alert('Error al leer el archivo')
        setIsProcessing(false)
      }

      reader.readAsArrayBuffer(file)
    }
  }

  // Función para manejar la carga de archivos bancarios
  const handleBankFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    processFile(file, 'bank')
  }

  // Función para manejar la carga de archivos contables
  const handleAccountingFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    processFile(file, 'accounting')
  }

  // Funciones para drag and drop bancario
  const handleBankDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleBankDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleBankDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleBankDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0], 'bank')
    }
  }

  // Funciones para drag and drop contable
  const handleAccountingDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleAccountingDragEnter = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleAccountingDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const handleAccountingDrop = (event: React.DragEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      processFile(files[0], 'accounting')
    }
  }

  const formattedPeriod = new Date(period + '-01').toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'long' 
  })

  // Cuentas de Bancolombia disponibles
  const bancolombiaAccounts = [
    { id: "001", number: "1234567890", type: "Cuenta Corriente", balance: 15000000 },
    { id: "002", number: "0987654321", type: "Cuenta de Ahorros", balance: 8500000 },
    { id: "003", number: "5555444433", type: "Cuenta Corriente", balance: 25000000 },
    { id: "004", number: "1111222233", type: "Cuenta de Ahorros", balance: 12000000 }
  ]

  const handleAccountSelect = (accountId: string) => {
    setSelectedAccount(accountId)
  }

  const handleStartReconciliation = async () => {
    if (!selectedAccount) return
    
    setIsProcessing(true)
    
    // Simular procesamiento
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsProcessing(false)
    
    // Redirigir a la página de resultados o continuar con el proceso
    console.log(`Iniciando conciliación Bancolombia para cuenta ${selectedAccount} - ${formattedPeriod}`)
  }

  const getAccountInfo = (accountId: string) => {
    const accountInfo: { [key: string]: { name: string; type: string; balance: number } } = {
      "5011": { name: "5011", type: "Cuenta Principal", balance: 15000000 },
      "1246": { name: "1246", type: "Cuenta Secundaria", balance: 8500000 },
      "2354": { name: "2354", type: "Cuenta Operativa", balance: 25000000 }
    }
    return accountInfo[accountId] || { name: accountId, type: "Cuenta", balance: 0 }
  }

  const selectedAccountData = getAccountInfo(selectedAccount)

  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="reconciliation"
      actions={
        <Button 
          variant="outline" 
          onClick={() => router.push('/areas/accounting/reconciliation/new')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Header específico de Bancolombia */}
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Building2 className="h-6 w-6" />
              Conciliación Bancolombia
            </CardTitle>
            <CardDescription className="text-blue-700">
              Sistema especializado de conciliación para Bancolombia - {formattedPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                <CheckCircle className="w-3 h-3 mr-1" />
                Integración Activa
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Selección de Cuenta */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              Seleccionar Cuenta
            </CardTitle>
            <CardDescription>
              Elija la cuenta de Bancolombia que desea conciliar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button
                  variant={selectedAccount === "5011" ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center gap-2 ${
                    selectedAccount === "5011" 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleAccountSelect("5011")}
                >
                  <Building2 className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">5011</div>
                    <div className="text-sm opacity-80">Cuenta Principal</div>
                  </div>
                </Button>
                
                <Button
                  variant={selectedAccount === "1246" ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center gap-2 ${
                    selectedAccount === "1246" 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleAccountSelect("1246")}
                >
                  <Building2 className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">1246</div>
                    <div className="text-sm opacity-80">Cuenta Secundaria</div>
                  </div>
                </Button>
                
                <Button
                  variant={selectedAccount === "2354" ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center justify-center gap-2 ${
                    selectedAccount === "2354" 
                      ? "bg-blue-600 hover:bg-blue-700 text-white" 
                      : "hover:bg-blue-50"
                  }`}
                  onClick={() => handleAccountSelect("2354")}
                >
                  <Building2 className="w-6 h-6" />
                  <div className="text-center">
                    <div className="font-semibold">2354</div>
                    <div className="text-sm opacity-80">Cuenta Operativa</div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuración de Conciliación */}
        {selectedAccount && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-500" />
                Configuración de Conciliación
              </CardTitle>
              <CardDescription>
                Configure los parámetros específicos para la conciliación de Bancolombia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Información de la cuenta seleccionada */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Cuenta Seleccionada</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-green-600 font-medium">Número de Cuenta</p>
                      <p className="text-green-800 font-mono">{selectedAccountData.name}</p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Tipo</p>
                      <p className="text-green-800">{selectedAccountData.type}</p>
                    </div>
                    <div>
                      <p className="text-green-600 font-medium">Saldo Actual</p>
                      <p className="text-green-800 font-semibold">
                        ${selectedAccountData.balance.toLocaleString('es-CO')}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Opciones de importación */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Métodos de Importación</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 cursor-pointer transition-colors">
                      <CardContent className="p-6 text-center">
                        <Upload className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                        <h4 className="font-medium mb-2">Importar Archivo</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Cargar extracto bancario en formato Excel o CSV
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Seleccionar Archivo
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-2 border-dashed border-green-300 hover:border-green-400 cursor-pointer transition-colors">
                      <CardContent className="p-6 text-center">
                        <Download className="w-8 h-8 text-green-600 mx-auto mb-3" />
                        <h4 className="font-medium mb-2">API Bancolombia</h4>
                        <p className="text-sm text-gray-600 mb-4">
                          Conectar directamente con la API de Bancolombia
                        </p>
                        <Button variant="outline" size="sm" className="w-full">
                          Conectar API
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Configuraciones adicionales */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuraciones Adicionales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="tolerance">Tolerancia de Diferencias (COP)</Label>
                      <Input 
                        id="tolerance" 
                        placeholder="1000" 
                        type="number"
                        defaultValue="1000"
                      />
                      <p className="text-xs text-gray-500">
                        Monto máximo de diferencia permitida
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="matchingMode">Modo de Conciliación</Label>
                      <Select defaultValue="automatic">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="automatic">Automática</SelectItem>
                          <SelectItem value="manual">Manual</SelectItem>
                          <SelectItem value="hybrid">Híbrida</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button 
                    onClick={handleStartReconciliation}
                    disabled={isProcessing}
                    className="flex-1 h-12"
                  >
                    {isProcessing ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Iniciar Conciliación
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/areas/accounting/reconciliation/new')}
                    className="flex-1 sm:flex-none h-12"
                  >
                    Cambiar Cuenta
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sección 1: Agregar Extracto Bancario */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-500" />
              Agregar Extracto Bancario
            </CardTitle>
            <CardDescription>
              Cargue el extracto bancario de Bancolombia para el período {formattedPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Información del formato CSV */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Formato CSV de Bancolombia
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-blue-700">
                    El archivo CSV debe tener el siguiente formato:
                  </p>
                  <div className="bg-white border border-blue-300 rounded p-3 font-mono text-xs">
                    <div className="text-gray-600 mb-1">Ejemplo de línea:</div>
                    <div className="text-blue-800">
                      399-748850-11, 399, , 20250930, , 7800000.00, 2142, PAGO INTERBANC MIGUEL DARIO, 0,
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div>
                      <span className="font-medium text-blue-600">Columna 1:</span> Número de cuenta
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 2:</span> Código de transacción
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 3:</span> (Vacía)
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 4:</span> Fecha (YYYYMMDD)
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 5:</span> (Vacía)
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 6:</span> Monto
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 7:</span> Código interno
                    </div>
                    <div>
                      <span className="font-medium text-blue-600">Columna 8:</span> Descripción
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors"
                onDragOver={handleBankDragOver}
                onDragEnter={handleBankDragEnter}
                onDragLeave={handleBankDragLeave}
                onDrop={handleBankDrop}
              >
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Arrastre y suelte el archivo aquí</h3>
                <p className="text-gray-600 mb-4">
                  O haga clic para seleccionar el extracto bancario
                </p>
                
                {/* Input de archivo oculto */}
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleBankFileUpload}
                  className="hidden"
                  id="bank-csv-upload"
                  disabled={isProcessing}
                />
                
                <Button 
                  variant="outline" 
                  className="mb-2"
                  onClick={() => document.getElementById('bank-csv-upload')?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Archivo
                    </>
                  )}
                </Button>
                
                {uploadedFileName && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Archivo cargado: {uploadedFileName}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos soportados: CSV (formato Bancolombia), Excel (.xlsx), PDF
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{bankTransactions.length > 0 ? '1' : '0'}</div>
                  <div className="text-sm text-gray-600">Archivos cargados</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{bankTransactions.length}</div>
                  <div className="text-sm text-gray-600">Transacciones</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    ${bankTransactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('es-CO')}
                  </div>
                  <div className="text-sm text-gray-600">Total importado</div>
                </div>
              </div>

              {/* Mostrar transacciones si hay datos */}
              {bankTransactions.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-blue-800">Transacciones Importadas</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setBankTransactions([])
                        setUploadedFileName("")
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Fecha</th>
                          <th className="px-3 py-2 text-left">Descripción</th>
                          <th className="px-3 py-2 text-right">Monto</th>
                          <th className="px-3 py-2 text-left">Código</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bankTransactions.slice(0, 10).map((transaction) => (
                          <tr key={transaction.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-xs">{transaction.formattedDate}</td>
                            <td className="px-3 py-2">{transaction.description}</td>
                            <td className="px-3 py-2 text-right font-medium">{transaction.formattedAmount}</td>
                            <td className="px-3 py-2 font-mono text-xs">{transaction.internalCode}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {bankTransactions.length > 10 && (
                      <div className="px-3 py-2 text-center text-xs text-gray-500 bg-gray-50">
                        Mostrando 10 de {bankTransactions.length} transacciones
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección 2: Agregar Registros Contables */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              Agregar Registros Contables
            </CardTitle>
            <CardDescription>
              Cargue los movimientos contables correspondientes al período {formattedPeriod}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Información del formato contable */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Formato Movimiento Auxiliar por Cuenta Contable (Excel)
                </h4>
                <div className="space-y-2 text-sm">
                  <p className="text-green-700">
                    El archivo Excel debe contener las columnas: <strong>Cuenta Contable</strong>, <strong>Débito</strong> y <strong>Crédito</strong>
                  </p>
                  <div className="bg-white border border-green-300 rounded p-3 text-xs">
                    <div className="text-gray-600 mb-1">Se procesarán solo las filas que tengan cuenta contable:</div>
                    <div className="text-green-800">
                      • Se creará automáticamente la columna <strong>Movimiento</strong> = Débito - Crédito
                    </div>
                    <div className="text-green-800">
                      • Solo se consideran registros con cuenta contable no vacía
                    </div>
                    <div className="text-green-800">
                      • Formato soportado: <strong>Excel (.xlsx, .xls)</strong>
                    </div>
                  </div>
                </div>
              </div>

              <div 
                className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors"
                onDragOver={handleAccountingDragOver}
                onDragEnter={handleAccountingDragEnter}
                onDragLeave={handleAccountingDragLeave}
                onDrop={handleAccountingDrop}
              >
                <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Arrastre y suelte el archivo aquí</h3>
                <p className="text-gray-600 mb-4">
                  O haga clic para seleccionar los registros contables
                </p>
                
                {/* Input de archivo contable oculto */}
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleAccountingFileUpload}
                  className="hidden"
                  id="accounting-excel-upload"
                  disabled={isProcessing}
                />
                
                <Button 
                  variant="outline" 
                  className="mb-2"
                  onClick={() => document.getElementById('accounting-excel-upload')?.click()}
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Seleccionar Archivo
                    </>
                  )}
                </Button>
                
                {accountingFileName && (
                  <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Archivo cargado: {accountingFileName}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Formatos soportados: Excel (.xlsx, .xls)
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{accountingRecords.length > 0 ? '1' : '0'}</div>
                  <div className="text-sm text-gray-600">Archivos cargados</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{accountingRecords.length}</div>
                  <div className="text-sm text-gray-600">Asientos contables</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    ${accountingRecords.reduce((sum, r) => sum + r.debito, 0).toLocaleString('es-CO')}
                  </div>
                  <div className="text-sm text-gray-600">Total Débitos</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ${accountingRecords.reduce((sum, r) => sum + r.credito, 0).toLocaleString('es-CO')}
                  </div>
                  <div className="text-sm text-gray-600">Total Créditos</div>
                </div>
              </div>

              {/* Métrica adicional para el movimiento neto */}
              {accountingRecords.length > 0 && (
                <div className="mt-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-2xl font-bold text-blue-800">
                      ${accountingRecords.reduce((sum, r) => sum + r.movimiento, 0).toLocaleString('es-CO')}
                    </div>
                    <div className="text-sm text-blue-700">Movimiento Neto (Débitos - Créditos)</div>
                  </div>
                </div>
              )}

              {/* Mostrar registros contables si hay datos */}
              {accountingRecords.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-green-800">Registros Contables Importados</h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setAccountingRecords([])
                        setAccountingFileName("")
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Limpiar
                    </Button>
                  </div>
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Cuenta Contable</th>
                          <th className="px-3 py-2 text-left">Fecha Elaboración</th>
                          <th className="px-3 py-2 text-left">Nombre del Tercero</th>
                          <th className="px-3 py-2 text-right">Débito</th>
                          <th className="px-3 py-2 text-right">Crédito</th>
                          <th className="px-3 py-2 text-right">Movimiento</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accountingRecords.slice(0, 10).map((record) => (
                          <tr key={record.id} className="border-t border-gray-100 hover:bg-gray-50">
                            <td className="px-3 py-2 font-mono text-xs">{record.cuentaContable}</td>
                            <td className="px-3 py-2 text-xs">{record.formattedFecha || record.fechaElaboracion || '-'}</td>
                            <td className="px-3 py-2 text-xs max-w-32 truncate" title={record.nombreTercero || ''}>
                              {record.nombreTercero || '-'}
                            </td>
                            <td className="px-3 py-2 text-right">{record.formattedDebito}</td>
                            <td className="px-3 py-2 text-right">{record.formattedCredito}</td>
                            <td className="px-3 py-2 text-right font-medium">
                              <span className={record.movimiento >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {record.formattedMovimiento}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {accountingRecords.length > 10 && (
                      <div className="px-3 py-2 text-center text-xs text-gray-500 bg-gray-50">
                        Mostrando 10 de {accountingRecords.length} registros
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
