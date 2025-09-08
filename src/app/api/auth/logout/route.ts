// Logout API route

import { NextRequest, NextResponse } from 'next/server'
import { deleteSession, getTokenFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request)
    
    if (token) {
      await deleteSession(token)
    }

    const response = NextResponse.json({
      message: 'Logout exitoso'
    })

    // Clear the auth cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/'
    })

    return response

  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}




