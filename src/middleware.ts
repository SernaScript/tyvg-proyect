// Next.js middleware for authentication and authorization

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import {
  getTokenFromRequest,
  verifyToken
} from '@/lib/auth-middleware'
import { PermissionAction, RoleName } from '@/types/auth'

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/api/auth/login',
  '/api/auth/logout'
]

// Routes that require specific permissions
const PROTECTED_ROUTES: Record<string, { resource: string; action: PermissionAction }> = {
  '/dashboard': { resource: 'dashboard', action: PermissionAction.VIEW },
  '/settings': { resource: 'settings', action: PermissionAction.VIEW },
  '/users': { resource: 'users', action: PermissionAction.VIEW },
  '/reports': { resource: 'reports', action: PermissionAction.VIEW },
  '/database': { resource: 'database', action: PermissionAction.VIEW },
}

// Area-specific route patterns
const AREA_ROUTE_PATTERNS = [
  { pattern: /^\/areas\/accounting(\/.*)?$/, areaId: 'accounting' },
  { pattern: /^\/areas\/treasury(\/.*)?$/, areaId: 'treasury' },
  { pattern: /^\/areas\/logistics(\/.*)?$/, areaId: 'logistics' },
  { pattern: /^\/areas\/billing(\/.*)?$/, areaId: 'billing' }
]

// Module-specific route patterns
const MODULE_ROUTE_PATTERNS = [
  { pattern: /^\/areas\/accounting\/flypass-data$/, areaId: 'accounting', moduleId: 'flypass-data' },
  { pattern: /^\/areas\/accounting\/reconciliation$/, areaId: 'accounting', moduleId: 'reconciliation' },
  { pattern: /^\/areas\/treasury\/portfolio$/, areaId: 'treasury', moduleId: 'portfolio' }
]

// Admin-only routes
const ADMIN_ROUTES = [
  '/settings/permissions',
  '/settings/roles',
  '/settings/users'
]

// Super admin-only routes
const SUPER_ADMIN_ROUTES = [
  '/settings/system'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  console.log(`🔒 Middleware processing: ${pathname}`)

  // Skip middleware for static files and API routes (except auth)
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') && !pathname.startsWith('/api/auth') ||
    pathname.includes('.') // Static files
  ) {
    return NextResponse.next()
  }

  // Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    console.log(`✅ Public route allowed: ${pathname}`)
    return NextResponse.next()
  }

  // Check for auth token
  const token = getTokenFromRequest(request)

  if (!token) {
    console.log(`❌ No auth token found for: ${pathname}`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Verify JWT token (includes expiration check)
  try {
    const payload = await verifyToken(token)
    if (!payload) {
      console.log(`❌ Invalid or expired token for: ${pathname}`)
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    console.log(`✅ Token verified for: ${pathname}`)
  } catch (error) {
    console.log(`❌ Token verification failed for: ${pathname}`)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // For now, we only verify JWT token in middleware
  // Role-based permissions will be checked in the actual pages/components
  console.log(`✅ Access granted to: ${pathname}`)
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}

