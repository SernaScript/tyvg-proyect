"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
  Package
} from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await login({
        email: formData.email,
        password: formData.password
      })
      
      // El login del contexto ya maneja la redirección
      // No necesitamos hacer router.push aquí
      
    } catch (error) {
      console.error('Login error:', error)
      alert(error instanceof Error ? error.message : 'Error al iniciar sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Volver al inicio
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">TYVG</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Login Form */}
          <div className="max-w-md mx-auto w-full">
            <Card className="shadow-xl border-0">
              <CardHeader className="text-center pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Acceso al Portal
                </CardTitle>
                <CardDescription className="text-gray-600">
                  Ingresa como proveedor o afiliado de obras
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-700 font-medium">
                      Correo Electrónico
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="proveedor@transportes.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="pl-10 h-12"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Contraseña
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="pl-10 pr-10 h-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <input
                        id="remember"
                        type="checkbox"
                        title="Recordar sesión"
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <Label htmlFor="remember" className="text-sm text-gray-600">
                        Recordarme
                      </Label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 text-lg font-medium bg-orange-600 hover:bg-orange-700"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Accediendo al portal...
                      </div>
                    ) : (
                      "Acceder al Portal"
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-center text-sm text-gray-600">
                    ¿No estás registrado como proveedor?{" "}
                    <Link href="/contact" className="text-orange-600 hover:text-orange-800 font-medium">
                      Solicita tu registro
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Demo Credentials */}
            <Card className="mt-6 bg-orange-50 border-orange-200">
              <CardContent className="p-4">
                <h4 className="font-semibold text-orange-900 mb-2">Credenciales de Demostración</h4>
                <div className="space-y-1 text-sm text-orange-800">
                  <p><strong>Email:</strong> proveedor@demo.com</p>
                  <p><strong>Contraseña:</strong> demo123</p>
                </div>
                <p className="text-xs text-orange-600 mt-2">
                  Usa estas credenciales para explorar el portal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Features */}
          <div className="space-y-8">
            <div>
              <Badge variant="secondary" className="mb-4 bg-orange-100 text-orange-800 border-orange-300">
                <Truck className="w-4 h-4 mr-1" />
                Portal de Transporte
              </Badge>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Bienvenido de vuelta
              </h1>
              <p className="text-xl text-gray-600">
                Accede a tu portal especializado para la gestión de operaciones de transporte de carga por carretera
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Route className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Gestión de Rutas</h3>
                  <p className="text-gray-600">
                    Optimiza tus rutas de transporte y reduce costos operativos con nuestro sistema inteligente
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Control de Carga</h3>
                  <p className="text-gray-600">
                    Seguimiento en tiempo real de tu carga y documentación digital completa
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Reportes Operacionales</h3>
                  <p className="text-gray-600">
                    Análisis detallados de rendimiento, costos y eficiencia de tu flota
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
              <h3 className="font-bold text-xl mb-2">¿Necesitas ayuda?</h3>
              <p className="text-orange-100 mb-4">
                Nuestro equipo especializado está disponible para apoyarte en tus operaciones
              </p>
              <Button variant="secondary" size="sm">
                Contactar Soporte
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
