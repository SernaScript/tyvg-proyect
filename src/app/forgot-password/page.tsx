'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Error al solicitar restablecimiento de contraseña')
      }

      setSuccess(true)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al solicitar restablecimiento de contraseña')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              ¿Olvidaste tu contraseña?
            </CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
            </CardDescription>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 bg-green-600 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                      <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-green-800 font-medium">Correo enviado</p>
                      <p className="text-green-700 text-sm mt-1">
                        Si el email existe en nuestro sistema, recibirás un correo con instrucciones para restablecer tu contraseña.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    ¿No recibiste el correo? Revisa tu carpeta de spam o{' '}
                    <button
                      onClick={() => {
                        setSuccess(false)
                        setEmail('')
                      }}
                      className="text-orange-600 hover:text-orange-800 font-medium"
                    >
                      intenta de nuevo
                    </button>
                  </p>
                  <Link
                    href="/login"
                    className="text-sm text-orange-600 hover:text-orange-800 font-medium block"
                  >
                    Volver al inicio de sesión
                  </Link>
                </div>
              </div>
            ) : (
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                    className="h-12"
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
                      Enviando...
                    </div>
                  ) : (
                    'Enviar enlace de restablecimiento'
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

