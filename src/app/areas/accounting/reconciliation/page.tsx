"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AreaLayout } from "@/components/layout/AreaLayout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit,
  CheckCircle,
  AlertCircle,
  Clock
} from "lucide-react"

export default function ReconciliationPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Datos ficticios de conciliaciones realizadas
  const reconciliations = [
    {
      id: "1",
      bank: "Banco Santander",
      account: "1234567890",
      accountType: "Cuenta Corriente",
      period: "Enero 2024",
      status: "completed",
      totalTransactions: 145,
      matchedTransactions: 142,
      unmatchedTransactions: 3,
      totalAmount: 12500000,
      matchedAmount: 12450000,
      difference: 50000,
      createdBy: "María González",
      createdAt: "2024-01-15",
      completedAt: "2024-01-15T14:30:00"
    },
    {
      id: "2", 
      bank: "Banco Davivienda",
      account: "9876543210",
      accountType: "Cuenta de Ahorros",
      period: "Enero 2024",
      status: "pending",
      totalTransactions: 89,
      matchedTransactions: 85,
      unmatchedTransactions: 4,
      totalAmount: 8500000,
      matchedAmount: 8400000,
      difference: 100000,
      createdBy: "Carlos Rodríguez",
      createdAt: "2024-01-16",
      completedAt: null
    },
    {
      id: "3",
      bank: "Banco de Bogotá",
      account: "5555444433",
      accountType: "Cuenta Corriente",
      period: "Diciembre 2023",
      status: "completed",
      totalTransactions: 203,
      matchedTransactions: 200,
      unmatchedTransactions: 3,
      totalAmount: 18500000,
      matchedAmount: 18450000,
      difference: 50000,
      createdBy: "Ana Martínez",
      createdAt: "2023-12-30",
      completedAt: "2023-12-30T16:45:00"
    },
    {
      id: "4",
      bank: "BBVA Colombia",
      account: "1111222233",
      accountType: "Cuenta Corriente",
      period: "Enero 2024",
      status: "in_progress",
      totalTransactions: 67,
      matchedTransactions: 60,
      unmatchedTransactions: 7,
      totalAmount: 7200000,
      matchedAmount: 7000000,
      difference: 200000,
      createdBy: "Luis Pérez",
      createdAt: "2024-01-17",
      completedAt: null
    },
    {
      id: "5",
      bank: "Scotiabank Colpatria",
      account: "7777888899",
      accountType: "Cuenta de Ahorros",
      period: "Enero 2024",
      status: "completed",
      totalTransactions: 34,
      matchedTransactions: 34,
      unmatchedTransactions: 0,
      totalAmount: 3200000,
      matchedAmount: 3200000,
      difference: 0,
      createdBy: "Patricia López",
      createdAt: "2024-01-18",
      completedAt: "2024-01-18T10:15:00"
    }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 border-green-200"><CheckCircle className="w-3 h-3 mr-1" />Completada</Badge>
      case "in_progress":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200"><Clock className="w-3 h-3 mr-1" />En Proceso</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Pendiente</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const filteredReconciliations = reconciliations.filter(reconciliation => {
    const matchesSearch = reconciliation.bank.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         reconciliation.account.includes(searchTerm) ||
                         reconciliation.period.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || reconciliation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <AreaLayout 
      areaId="accounting" 
      moduleId="reconciliation"
      actions={
        <Button onClick={() => router.push('/areas/accounting/reconciliation/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Conciliación
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Sección 1: Conciliaciones Realizadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Conciliaciones Realizadas
            </CardTitle>
            <CardDescription>
              Historial de conciliaciones bancarias realizadas y su estado actual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar por banco, cuenta o período..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filtrar por estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="completed">Completadas</SelectItem>
                    <SelectItem value="in_progress">En Proceso</SelectItem>
                    <SelectItem value="pending">Pendientes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Lista de Conciliaciones */}
            <div className="space-y-4">
              {filteredReconciliations.map((reconciliation) => (
                <Card key={reconciliation.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{reconciliation.bank}</h3>
                          {getStatusBadge(reconciliation.status)}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="font-medium">Cuenta: {reconciliation.account}</p>
                            <p className="text-xs">{reconciliation.accountType}</p>
                          </div>
                          <div>
                            <p className="font-medium">Período: {reconciliation.period}</p>
                            <p className="text-xs">Creada: {formatDate(reconciliation.createdAt)}</p>
                          </div>
                          <div>
                            <p className="font-medium">Transacciones: {reconciliation.totalTransactions}</p>
                            <p className="text-xs">
                              Conciliadas: {reconciliation.matchedTransactions} | 
                              Sin conciliar: {reconciliation.unmatchedTransactions}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium">Total: {formatCurrency(reconciliation.totalAmount)}</p>
                            <p className="text-xs">
                              Diferencia: {formatCurrency(reconciliation.difference)}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-1" />
                          Reporte
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

      </div>
    </AreaLayout>
  )
}
