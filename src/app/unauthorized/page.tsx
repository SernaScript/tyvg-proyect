"use client"

// Unauthorized access page

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const REASON_MESSAGES = {
  'insufficient-permissions': {
    title: 'Permisos Insuficientes',
    description: 'No tienes los permisos necesarios para acceder a esta página.',
    icon: Shield,
    color: 'text-yellow-600'
  },
  'area-access-denied': {
    title: 'Acceso al Área Denegado',
    description: 'No tienes permisos para acceder a esta área del sistema.',
    icon: Shield,
    color: 'text-red-600'
  },
  'module-access-denied': {
    title: 'Acceso al Módulo Denegado',
    description: 'No tienes permisos para acceder a este módulo específico.',
    icon: Shield,
    color: 'text-red-600'
  },
  'admin-required': {
    title: 'Acceso de Administrador Requerido',
    description: 'Esta página requiere permisos de administrador.',
    icon: Shield,
    color: 'text-orange-600'
  },
  'super-admin-required': {
    title: 'Acceso de Super Administrador Requerido',
    description: 'Esta página requiere permisos de super administrador.',
    icon: Shield,
    color: 'text-red-600'
  },
  'inactive': {
    title: 'Usuario Inactivo',
    description: 'Tu cuenta está inactiva. Contacta al administrador del sistema.',
    icon: AlertTriangle,
    color: 'text-gray-600'
  },
  'default': {
    title: 'Acceso Denegado',
    description: 'No tienes autorización para acceder a esta página.',
    icon: Shield,
    color: 'text-red-600'
  }
}

export default function UnauthorizedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user, logout } = useAuth()
  const [reason, setReason] = useState<string>('default')

  useEffect(() => {
    const reasonParam = searchParams.get('reason')
    if (reasonParam && reasonParam in REASON_MESSAGES) {
      setReason(reasonParam)
    }
  }, [searchParams])

  const reasonConfig = REASON_MESSAGES[reason as keyof typeof REASON_MESSAGES] || REASON_MESSAGES.default
  const IconComponent = reasonConfig.icon

  const handleGoBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push('/dashboard')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Main Error Card */}
        <Card className="border-red-200 shadow-lg">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-red-100 rounded-full">
                <IconComponent className={`h-8 w-8 ${reasonConfig.color}`} />
              </div>
            </div>
            <CardTitle className="text-2xl text-gray-900">
              {reasonConfig.title}
            </CardTitle>
            <CardDescription className="text-base text-gray-600">
              {reasonConfig.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Usuario actual:</strong> {user.name || user.email}<br />
                  <strong>Rol:</strong> {user.role.displayName}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-3">
              <Button 
                onClick={handleGoBack}
                className="w-full"
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver Atrás
              </Button>

              <Link href="/dashboard" className="block">
                <Button variant="outline" className="w-full">
                  <Home className="mr-2 h-4 w-4" />
                  Ir al Dashboard
                </Button>
              </Link>

              {reason === 'inactive' && (
                <Button 
                  onClick={handleLogout}
                  variant="destructive"
                  className="w-full"
                >
                  Cerrar Sesión
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Help Card */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">
              ¿Necesitas Ayuda?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-blue-800">
            <p>
              Si crees que deberías tener acceso a esta página:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Contacta al administrador del sistema</li>
              <li>Verifica que tu rol tenga los permisos necesarios</li>
              <li>Asegúrate de que tu cuenta esté activa</li>
            </ul>
          </CardContent>
        </Card>

        {/* Debug Info - Only in development */}
        {process.env.NODE_ENV === 'development' && user && (
          <Card className="border-gray-200 bg-gray-50">
            <CardHeader>
              <CardTitle className="text-sm text-gray-600">
                Información de Debug (Solo Desarrollo)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-1">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Role:</strong> {user.role.name}</p>
              <p><strong>Permissions:</strong> {user.role.permissions.length}</p>
              <p><strong>Reason:</strong> {reason}</p>
              <div className="mt-2">
                <strong>User Permissions:</strong>
                <ul className="list-disc list-inside ml-2">
                  {user.role.permissions.map(permission => (
                    <li key={permission.id}>
                      {permission.resource}:{permission.action}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}



