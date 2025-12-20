'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const router = useRouter()
  const params = useParams()
  const token = params?.token as string

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isValidating, setIsValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userEmail, setUserEmail] = useState('')

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token no válido')
        setIsValidating(false)
        return
      }

      try {
        const response = await fetch(`/api/auth/verify-reset-token?token=${token}`)
        const data = await response.json()

        if (data.valid) {
          setIsValid(true)
          setUserEmail(data.email || '')
        } else {
          setError(data.error || 'Token inválido o expirado')
        }
      } catch (error) {
        setError('Error al validar el token')
      } finally {
        setIsValidating(false)
      }
    }

    validateToken()
  }, [token])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al restablecer la contraseña')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al restablecer la contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="text-center text-gray-600">Validando token...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                Token inválido
              </CardTitle>
              <CardDescription className="text-gray-600">
                {error || 'El enlace de restablecimiento no es válido o ha expirado'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Los enlaces de restablecimiento expiran después de 1 hora. 
                  Por favor, solicita un nuevo enlace.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href="/forgot-password">
                  <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                    Solicitar nuevo enlace
                  </Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline" className="w-full h-12">
                    Volver al inicio de sesión
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-gray-900">
                ¡Contraseña restablecida!
              </CardTitle>
              <CardDescription className="text-gray-600">
                Tu contraseña ha sido actualizada exitosamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                    <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-green-800 font-medium">Éxito</p>
                    <p className="text-green-700 text-sm mt-1">
                      Serás redirigido al inicio de sesión en unos segundos...
                    </p>
                  </div>
                </div>
              </div>
              <Link href="/login">
                <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700">
                  Ir al inicio de sesión
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Restablecer contraseña
            </CardTitle>
            <CardDescription className="text-gray-600">
              {userEmail && `Ingresa tu nueva contraseña para ${userEmail}`}
              {!userEmail && 'Ingresa tu nueva contraseña'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <div className="h-5 w-5 bg-red-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="h-12"
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-medium bg-orange-600 hover:bg-orange-700"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Restableciendo...
                  </div>
                ) : (
                  'Restablecer contraseña'
                )}
              </Button>

              <div className="text-center">
                <Link
                  href="/login"
                  className="text-sm text-orange-600 hover:text-orange-800 font-medium"
                >
                  Volver al inicio de sesión
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

