"use client"

import { User } from "@/types/auth"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  MapPin,
  Truck,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Camera,
  LogOut,
  Menu,
  X,
  Plus,
  ChevronLeft,
  ChevronRight,
  Edit,
  ClipboardList
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { EditTripModalDriver } from "@/components/modals/EditTripModalDriver"

interface Trip {
  id: string
  date: string
  quantity: number | string // Prisma Decimal se serializa como string
  measure: 'METROS_CUBICOS' | 'TONELADAS'
  observation?: string
  isApproved: boolean
  incomingReceiptNumber?: string
  outcomingReceiptNumber?: string
  project: {
    id: string
    name: string
    address?: string
    client: {
      id: string
      name: string
      identification: string
    }
  }
  material: {
    id: string
    name: string
    type: string
    unitOfMeasure: string
  }
  vehicle: {
    id: string
    plate: string
    brand: string
    model: string
    capacityTons?: number
    capacityM3?: number
  }
  driver: {
    id: string
    name: string
    identification: string
    license: string
  }
}

interface DriverDashboardProps {
  user: User
}

export function DriverDashboard({ user }: DriverDashboardProps) {
  const { logout } = useAuth()
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [menuOpen, setMenuOpen] = useState(false)
  const [isEditTripModalOpen, setIsEditTripModalOpen] = useState(false)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [driverId, setDriverId] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalTrips, setTotalTrips] = useState(0)
  const tripsPerPage = 10

  const [activeTab, setActiveTab] = useState<'trips' | 'preoperational' | 'expenses'>('trips')
  const [preoperationals, setPreoperationals] = useState<any[]>([])
  const [loadingPreops, setLoadingPreops] = useState(false)

  const fetchPreoperationals = async () => {
    if (!driverId) return
    try {
      setLoadingPreops(true)
      const params = new URLSearchParams()
      params.append('driverId', driverId)
      params.append('limit', '20')

      const response = await fetch(`/api/preoperational-inspections?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        setPreoperationals(data.inspections || [])
      }
    } catch (error) {
      console.error('Error fetching preoperationals:', error)
    } finally {
      setLoadingPreops(false)
    }
  }

  useEffect(() => {
    if (activeTab === 'preoperational' && driverId) {
      fetchPreoperationals()
    }
  }, [activeTab, driverId])

  useEffect(() => {
    fetchDriverId()
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [statusFilter, currentPage])

  const fetchDriverId = async () => {
    try {
      const response = await fetch('/api/drivers/me')
      if (response.ok) {
        const driver = await response.json()
        setDriverId(driver.id)
      }
    } catch (error) {
      console.error('Error fetching driver ID:', error)
    }
  }

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter === 'pending') {
        params.append('isApproved', 'false')
      } else if (statusFilter === 'approved') {
        params.append('isApproved', 'true')
      }
      // Paginación
      params.append('page', currentPage.toString())
      params.append('limit', tripsPerPage.toString())

      const response = await fetch(`/api/trips?${params.toString()}`)
      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data)) {
          setTrips(data)
          setTotalTrips(data.length)
        } else {
          setTrips(data.trips || [])
          setTotalTrips(data.total || 0)
        }
      }
    } catch (error) {
      console.error('Error fetching trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (isApproved: boolean) => {
    return isApproved
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200 hover:bg-emerald-200 hover:text-emerald-900'
      : 'bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 hover:text-amber-900'
  }

  const getStatusText = (isApproved: boolean) => {
    return isApproved ? 'Aprobado' : 'Pendiente'
  }

  const formatDateShort = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
    }).format(date)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Calcular estadísticas
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    total: 0
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = new URLSearchParams()
        params.append('limit', '1000')

        const response = await fetch(`/api/trips?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          const allTrips = Array.isArray(data) ? data : (data.trips || [])
          setStats({
            pending: allTrips.filter(t => !t.isApproved).length,
            approved: allTrips.filter(t => t.isApproved).length,
            total: allTrips.length
          })
        }
      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }
    fetchStats()
  }, [statusFilter])

  const totalPages = totalTrips > 0 ? Math.ceil(totalTrips / tripsPerPage) : 1

  const renderActionButton = () => {
    switch (activeTab) {
      case 'trips':
        return (
          <Button
            onClick={() => router.push('/driver/trip/create')}
            className="w-full py-6 flex items-center justify-center gap-2 bg-gradient-to-br from-orange-500 to-amber-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all active:scale-[0.98] rounded-2xl border border-transparent"
            disabled={!driverId}
          >
            <div className="p-1.5 bg-white/20 rounded-full">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold">Nuevo Viaje</span>
          </Button>
        )
      case 'preoperational':
        return (
          <Button
            onClick={() => router.push('/driver/preoperational/create')}
            className="w-full py-6 flex items-center justify-center gap-2 bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all active:scale-[0.98] rounded-2xl border border-transparent"
            disabled={!driverId}
          >
            <div className="p-1.5 bg-white/20 rounded-full">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold">Nuevo Preoperacional</span>
          </Button>
        )
      case 'expenses':
        return (
          <Button
            onClick={() => { }}
            className="w-full py-6 flex items-center justify-center gap-2 bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all active:scale-[0.98] rounded-2xl border border-transparent opacity-80"
            disabled={true}
          >
            <div className="p-1.5 bg-white/20 rounded-full">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-bold">Registrar Gasto (Próximamente)</span>
          </Button>
        )
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 font-sans leading-relaxed selection:bg-orange-100">

      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[50vh] h-[50vh] rounded-full bg-orange-200/20 blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vh] h-[40vh] rounded-full bg-amber-200/20 blur-3xl"></div>
      </div>

      {/* Header móvil premium */}
      <div className="sticky top-0 z-50 transition-all duration-300">
        <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border-b border-orange-100/50 shadow-sm"></div>
        <div className="relative flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3.5">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400 to-amber-600 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <div className="relative w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-inner border border-white/10">
                <Truck className="w-5 h-5 text-white drop-shadow-md" />
              </div>
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight">
                Panel Conductor
              </h1>
              <p className="text-xs text-slate-500 font-medium truncate max-w-[140px]">
                {user.name || "Bienvenido"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen(!menuOpen)}
            className="rounded-full hover:bg-orange-50 active:scale-95 transition-transform text-slate-600"
          >
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Extended Menu Dropdown */}
        <div className={`
          absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-orange-100 shadow-lg 
          transition-all duration-300 ease-in-out overflow-hidden origin-top
          ${menuOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}
        `}>
          <div className="p-4 space-y-2">
            <div className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wider">Cuenta</div>
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Cerrar Sesión Actual
            </Button>
          </div>
        </div>

        {/* Tab Navigation Segmented Control */}
        <div className="px-5 pb-2 pt-1 relative">
          <div className="flex p-1 bg-slate-200/50 rounded-xl gap-1">
            {(['preoperational', 'trips', 'expenses'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200 capitalize ${activeTab === tab
                  ? 'bg-white text-slate-800 shadow-sm transform scale-[1.02]'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
                  }`}
              >
                {tab === 'preoperational' ? 'Pre-op' : tab === 'trips' ? 'Viajes' : 'Gastos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="relative px-5 pt-4 pb-4 space-y-6 max-w-md mx-auto">

        {/* Dynamic Action Button */}
        {renderActionButton()}

        {/* Content Section */}
        <div className="min-h-[300px]">

          {/* TRIPS VIEW */}
          {activeTab === 'trips' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Resumen Rápido (Stats) */}
              <section>
                <div className="flex items-center justify-between mb-3 px-1">
                  <h2 className="text-sm font-bold text-slate-800">Resumen Viajes</h2>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Pendientes', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100' },
                    { label: 'Aprobados', value: stats.approved, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
                    { label: 'Total', value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' }
                  ].map((stat, idx) => (
                    <div key={idx} className={`relative overflow-hidden rounded-2xl p-3 border ${stat.border} ${stat.bg} shadow-sm flex flex-col items-center justify-center text-center gap-1`}>
                      <stat.icon className={`w-5 h-5 ${stat.color} mb-1`} />
                      <span className={`text-xl font-black ${stat.color} tracking-tight`}>{stat.value}</span>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* Lista de Viajes */}
              <section className="space-y-4">
                <div className="sticky top-[72px] z-30 bg-slate-50/95 backdrop-blur-sm py-2 -mx-5 px-5 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.05)]">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                      <Truck className="w-5 h-5 text-slate-400" />
                      Mis Viajes
                    </h2>
                    <div className="flex p-0.5 bg-slate-200/60 rounded-lg">
                      {[
                        { id: 'all', label: 'Todos' },
                        { id: 'pending', label: 'Pendientes' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => { setStatusFilter(filter.id); setCurrentPage(1); }}
                          className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all duration-200 ${statusFilter === filter.id
                            ? 'bg-white text-slate-800 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {loading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
                    <p className="text-xs text-slate-400 font-medium animate-pulse">Cargando...</p>
                  </div>
                ) : trips.length === 0 ? (
                  <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                    <Package className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-sm text-slate-500">No hay viajes registrados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {trips.map((trip) => (
                      <div
                        key={trip.id}
                        className="group relative bg-white rounded-3xl p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-slate-100 transition-all duration-300"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-600 font-bold text-xs">
                              {trip.vehicle.plate.slice(0, 3)}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-slate-900 leading-tight">{trip.vehicle.plate}</h3>
                              <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {formatDateShort(trip.date)}
                              </p>
                            </div>
                          </div>
                          <Badge className={`${getStatusColor(trip.isApproved)} border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide shadow-none`}>
                            {getStatusText(trip.isApproved)}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                          <div className="space-y-1">
                            <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Proyecto</p>
                            <div className="font-semibold text-slate-700 flex items-center gap-1.5 truncate">
                              <MapPin className="w-3.5 h-3.5 text-orange-500/70" />
                              <span className="truncate">{trip.project.name}</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wider">Carga</p>
                            <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-orange-500/70" />
                              <span>
                                <span className="text-slate-900 font-bold text-sm">
                                  {typeof trip.quantity === 'string' ? parseFloat(trip.quantity) : trip.quantity}
                                </span>
                                <span className="text-[10px] ml-1 text-slate-400">{trip.material.unitOfMeasure}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        {!trip.isApproved && (
                          <div className="pt-3 border-t border-slate-50 flex justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTripId(trip.id);
                                setIsEditTripModalOpen(true);
                              }}
                              className="h-8 text-orange-600 hover:bg-orange-50 hover:text-orange-700 font-medium text-xs px-4 rounded-full"
                            >
                              <Edit className="w-3.5 h-3.5 mr-1.5" />
                              Editar Detalles
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Paginación Simplificada */}
                {!loading && totalPages > 1 && (
                  <div className="flex justify-center pt-4">
                    <div className="flex items-center bg-white rounded-full p-1 shadow-sm border border-slate-100 gap-1">
                      <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="w-8 h-8 rounded-full disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></Button>
                      <div className="px-3 text-xs font-bold text-slate-600">{currentPage} / {totalPages}</div>
                      <Button variant="ghost" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="w-8 h-8 rounded-full disabled:opacity-30"><ChevronRight className="w-4 h-4" /></Button>
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}

          {/* PREOPERATIONAL VIEW */}
          {activeTab === 'preoperational' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-slate-400" />
                  Mis Preoperacionales
                </h2>
              </div>

              {loadingPreops ? (
                <div className="flex flex-col items-center justify-center py-12 gap-4">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-400 font-medium animate-pulse">Cargando...</p>
                </div>
              ) : preoperationals.length === 0 ? (
                <div className="py-12 px-6 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                  <ClipboardList className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">No hay inspecciones registradas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {preoperationals.map((preop: any) => (
                    <div key={preop.id} className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-base font-bold text-slate-900">{preop.vehicle.plate}</h3>
                        <span className="text-xs text-slate-500 font-medium">{formatDateShort(preop.inspectionDate)}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-slate-400 uppercase text-[10px] tracking-wider mb-1">Cumple</p>
                          <div className="flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <p className="font-semibold text-slate-700">{preop.details?.filter((d: any) => d.passed).length || 0}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-slate-400 uppercase text-[10px] tracking-wider mb-1">No cumple</p>
                          <div className="flex items-center gap-1.5">
                            <AlertCircle className="w-4 h-4 text-red-500" />
                            <p className="font-semibold text-slate-700">{preop.details?.filter((d: any) => !d.passed).length || 0}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* EXPENSES VIEW */}
          {activeTab === 'expenses' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <ClipboardList className="w-5 h-5 text-slate-400" />
                  Mis Gastos
                </h2>
              </div>
              <div className="py-16 px-6 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-slate-800 font-bold mb-1">Sección en Construcción</h3>
                <p className="text-sm text-slate-500">Pronto podrás registrar y visualizar tus gastos desde aquí.</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {driverId && selectedTripId && (
        <EditTripModalDriver
          isOpen={isEditTripModalOpen}
          onClose={() => {
            setIsEditTripModalOpen(false)
            setSelectedTripId(null)
          }}
          onSuccess={() => {
            fetchTrips()
            setIsEditTripModalOpen(false)
            setSelectedTripId(null)
          }}
          tripId={selectedTripId}
          driverId={driverId}
        />
      )}
    </div>
  )
}
