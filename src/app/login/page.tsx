"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"
import {
  Truck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  Shield,
  Clock,
  BarChart3,
  Route,
  Package,
  AlertCircle
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await login({
        email: formData.email,
        password: formData.password
      })

      // El login del contexto ya maneja la redirección
      // No necesitamos hacer router.push aquí

    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Limpiar el error cuando el usuario empiece a escribir
    if (error) {
      setError(null)
    }
  }

  return (
    <div className="min-h-screen bg-orange-50 selection:bg-orange-200 relative overflow-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-orange-400 opacity-20 blur-[100px]"></div>
        <div className="absolute right-0 top-0 -z-10 h-full w-full bg-[radial-gradient(circle_800px_at_100%_200px,#ffedd5,transparent)]"></div>
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-blue-400 opacity-10 blur-[120px]"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 md:mb-12">
          <Link href="/" className="group flex items-center gap-2 text-gray-600 hover:text-orange-600 transition-colors px-4 py-2 rounded-full hover:bg-white/50 hover:backdrop-blur-sm">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Volver al inicio</span>
          </Link>
          <div className="flex items-center gap-2.5 bg-white/40 backdrop-blur-md py-1.5 px-3 rounded-xl border border-white/20 shadow-sm">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center shadow-md">
              <Truck className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-orange-900">
              TYVG
            </span>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          {/* Left Side - Login Form */}
          <div className="max-w-md mx-auto w-full order-2 lg:order-1">
            <Card className="rounded-3xl shadow-2xl border-0 bg-white/70 backdrop-blur-xl ring-1 ring-gray-900/5 overflow-hidden">
              <CardHeader className="text-center pb-8 pt-8">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <Lock className="w-8 h-8 text-orange-600" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  Acceso al Portal
                </CardTitle>
                <CardDescription className="text-gray-500 text-base">
                  Ingresa tus credenciales para continuar
                </CardDescription>
              </CardHeader>
              <CardContent className="px-8 pb-10">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-500/20 bg-red-50/50 backdrop-blur-sm">
                      <AlertCircle className="h-4 w-4 text-red-600" />
                      <AlertTitle className="text-red-800 font-semibold text-sm">Error de acceso</AlertTitle>
                      <AlertDescription className="text-red-700 text-sm mt-1">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium pl-1">
                      Correo Electrónico
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                        <Mail className="h-full w-full" />
                      </div>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="ejemplo@correo.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-11 h-12 bg-white/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium pl-1">
                      Contraseña
                    </Label>
                    <div className="relative group">
                      <div className="absolute left-3.5 top-3.5 h-5 w-5 text-gray-400 group-focus-within:text-orange-500 transition-colors pointer-events-none">
                        <Lock className="h-full w-full" />
                      </div>
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-11 pr-11 h-12 bg-white/50 border-gray-200 focus:border-orange-500 focus:ring-orange-500/20 rounded-xl transition-all duration-200"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 transition-colors p-0.5 rounded-full hover:bg-gray-100"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 cursor-pointer"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                        Recordarme
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm font-medium text-orange-600 hover:text-orange-700 underline-offset-4 hover:underline transition-all">
                      ¿Recuperar clave?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Autenticando...</span>
                      </div>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        Acceder
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                      </span>
                    )}
                  </Button>
                </form>

                <div className="mt-8 text-center">
                  <p className="text-sm text-gray-500">
                    ¿No tienes una cuenta activa?
                  </p>
                  <Link href="/contact" className="inline-block mt-2 text-sm font-semibold text-gray-900 hover:text-orange-600 transition-colors">
                    Solicitar registro de proveedor →
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-10 order-1 lg:order-2 text-center lg:text-left">
            <div>
              <div className="inline-flex items-center justify-center lg:justify-start gap-2 mb-6 px-4 py-1.5 rounded-full bg-orange-100/50 border border-orange-200/50 backdrop-blur-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-sm font-medium text-orange-800">Sistema Seguro</span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4 leading-tight">
                Gestiona tu operación <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-orange-800">
                  sin límites
                </span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                Una plataforma unificada para el control total de tus viajes, documentación y facturación.
              </p>
            </div>

            <div className="grid gap-4 max-w-lg mx-auto lg:mx-0">
              {[
                {
                  title: "Gestión de Rutas Inteligente",
                  desc: "Optimización y seguimiento en tiempo real",
                  icon: Route,
                  color: "blue"
                },
                {
                  title: "Control Documental",
                  desc: "Digitalización segura de toda tu carga",
                  icon: Package,
                  color: "orange"
                },
                {
                  title: "Analytics Avanzado",
                  desc: "Reportes detallados de rendimiento",
                  icon: BarChart3,
                  color: "purple"
                }
              ].map((item, i) => (
                <div key={i} className="group flex items-start gap-4 p-4 rounded-2xl bg-white/40 border border-white/40 hover:bg-white/60 hover:border-white/60 hover:shadow-lg transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-50 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className={`w-6 h-6 text-${item.color}-600`} />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden lg:block pt-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs overflow-hidden">
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300"></div>
                    </div>
                  ))}
                </div>
                <p>Confían en nosotros más de <strong className="text-gray-900">120+ proveedores</strong></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
