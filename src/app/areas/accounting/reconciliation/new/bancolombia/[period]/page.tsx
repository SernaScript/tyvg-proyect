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
  Users,
  Settings
} from "lucide-react"

export default function BancolombiaReconciliationPage() {
  const params = useParams()
  const router = useRouter()
  const period = params.period as string
  
  const [selectedAccount, setSelectedAccount] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

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
            <div className="space-y-4">
              <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Arrastre y suelte el archivo aquí</h3>
                <p className="text-gray-600 mb-4">
                  O haga clic para seleccionar el extracto bancario
                </p>
                <Button variant="outline" className="mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </Button>
                <p className="text-xs text-gray-500">
                  Formatos soportados: Excel (.xlsx), CSV, PDF
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Archivos cargados</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Transacciones</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">$0</div>
                  <div className="text-sm text-gray-600">Total importado</div>
                </div>
              </div>
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
            <div className="space-y-4">
              <div className="border-2 border-dashed border-green-300 rounded-lg p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Arrastre y suelte el archivo aquí</h3>
                <p className="text-gray-600 mb-4">
                  O haga clic para seleccionar los registros contables
                </p>
                <Button variant="outline" className="mb-2">
                  <Upload className="w-4 h-4 mr-2" />
                  Seleccionar Archivo
                </Button>
                <p className="text-xs text-gray-500">
                  Formatos soportados: Excel (.xlsx), CSV, TXT
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">0</div>
                  <div className="text-sm text-gray-600">Archivos cargados</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-gray-600">Asientos contables</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">$0</div>
                  <div className="text-sm text-gray-600">Total contabilizado</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AreaLayout>
  )
}
