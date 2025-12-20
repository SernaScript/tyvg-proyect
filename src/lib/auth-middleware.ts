// Authentication utilities for middleware (Edge Runtime compatible)
// These functions don't use Prisma and can run in Edge Runtime

import { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

// JWT Configuration
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'qzqGCqpxpQ5G8v7YJ^RoisxX^o^~C6sa'
)

// Get token from request (Edge Runtime compatible)
export const getTokenFromRequest = (request: NextRequest): string | null => {
  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  // Try to get token from cookie
  const tokenCookie = request.cookies.get('auth-token')
  return tokenCookie?.value || null
}

// Verify JWT token (Edge Runtime compatible - no database access)
export const verifyToken = async (token: string): Promise<{ userId: string } | null> => {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return { userId: payload.userId as string }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

