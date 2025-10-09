"use client"

// Authentication Context for React components

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { 
  User, 
  Role, 
  Permission, 
  AuthContextType, 
  LoginCredentials, 
  PermissionAction 
} from '@/types/auth'
import { 
  hasPermission, 
  canAccessArea, 
  canAccessModule 
} from '@/lib/auth'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Computed values
  const role = user?.role || null
  const permissions = user?.role.permissions || []
  const isAuthenticated = !!user

  // Initialize authentication state
  useEffect(() => {
    checkAuthState()
  }, [])

  // Verificar el estado de autenticación cuando cambie la URL (después de login)
  useEffect(() => {
    const handleRouteChange = () => {
      if (window.location.pathname === '/dashboard' && !user) {
        // Si estamos en el dashboard pero no tenemos usuario, verificar el estado
        checkAuthState()
      }
    }

    // Verificar inmediatamente si estamos en dashboard sin usuario
    handleRouteChange()

    // Escuchar cambios de ruta
    window.addEventListener('popstate', handleRouteChange)
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange)
    }
  }, [user])

  const checkAuthState = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Error checking auth state:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      // Actualizar el estado del usuario inmediatamente
      setUser(data.user)
      
      // Pequeña pausa para asegurar que la cookie se establezca
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to dashboard or intended page
      const urlParams = new URLSearchParams(window.location.search)
      const redirectTo = urlParams.get('redirect') || '/dashboard'
      router.push(redirectTo)
      
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      setIsLoading(true)
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })

      setUser(null)
      router.push('/login')
      
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state
      setUser(null)
      router.push('/login')
    } finally {
      setIsLoading(false)
    }
  }

  // Permission checking functions
  const checkPermission = (resource: string, action: PermissionAction): boolean => {
    if (!permissions.length) return false
    return hasPermission(permissions, resource, action)
  }

  const checkAreaAccess = (areaId: string): boolean => {
    if (!permissions.length) return false
    return canAccessArea(permissions, areaId)
  }

  const checkModuleAccess = (areaId: string, moduleId: string): boolean => {
    if (!permissions.length) return false
    return canAccessModule(permissions, areaId, moduleId)
  }

  const contextValue: AuthContextType = {
    user,
    role,
    permissions,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasPermission: checkPermission,
    canAccessArea: checkAreaAccess,
    canAccessModule: checkModuleAccess,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// HOC for protected components
interface WithAuthProps {
  requiredPermission?: {
    resource: string
    action: PermissionAction
  }
  requiredArea?: string
  requiredModule?: {
    areaId: string
    moduleId: string
  }
  fallback?: ReactNode
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) {
  return function AuthenticatedComponent(props: P) {
    const { 
      user, 
      isLoading, 
      hasPermission, 
      canAccessArea, 
      canAccessModule 
    } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/login')
        return
      }

      if (user) {
        // Check specific permission
        if (options.requiredPermission) {
          const { resource, action } = options.requiredPermission
          if (!hasPermission(resource, action)) {
            router.push('/unauthorized?reason=insufficient-permissions')
            return
          }
        }

        // Check area access
        if (options.requiredArea) {
          if (!canAccessArea(options.requiredArea)) {
            router.push('/unauthorized?reason=area-access-denied')
            return
          }
        }

        // Check module access
        if (options.requiredModule) {
          const { areaId, moduleId } = options.requiredModule
          if (!canAccessModule(areaId, moduleId)) {
            router.push('/unauthorized?reason=module-access-denied')
            return
          }
        }
      }
    }, [user, isLoading, hasPermission, canAccessArea, canAccessModule, router])

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
        </div>
      )
    }

    if (!user) {
      return options.fallback || null
    }

    return <Component {...props} />
  }
}

// Hook for permission-based UI rendering
export function usePermissions() {
  const { permissions, hasPermission, canAccessArea, canAccessModule } = useAuth()

  return {
    permissions,
    hasPermission,
    canAccessArea,
    canAccessModule,
    // Convenience methods for common checks
    canManageUsers: () => hasPermission('users', PermissionAction.MANAGE),
    canManageRoles: () => hasPermission('roles', PermissionAction.MANAGE),
    canViewReports: () => hasPermission('reports', PermissionAction.VIEW),
    canManageSettings: () => hasPermission('settings', PermissionAction.MANAGE),
    // Area-specific checks
    canViewAccounting: () => canAccessArea('accounting'),
    canViewTreasury: () => canAccessArea('treasury'),
    canViewLogistics: () => canAccessArea('logistics'),
    canViewBilling: () => canAccessArea('billing'),
  }
}




