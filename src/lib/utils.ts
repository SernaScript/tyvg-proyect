import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { NextRequest } from "next/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Obtiene la URL base de la aplicación
 * Prioriza la variable de entorno, luego el host del request, y finalmente localhost
 */
export function getBaseUrl(request?: NextRequest): string {
  // 1. Prioridad: Variable de entorno
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // 2. Si tenemos el request, usar el host del request (útil en producción)
  if (request) {
    try {
      const url = new URL(request.url)
      // Si la URL ya tiene protocolo y host, usarla directamente
      if (url.protocol && url.host) {
        return `${url.protocol}//${url.host}`
      }
    } catch {
      // Si falla al parsear la URL, intentar con headers
    }

    // Intentar obtener protocolo y host de los headers (útil en Vercel/producción)
    const protocol = request.headers.get('x-forwarded-proto') || 
                     (request.url?.startsWith('https') ? 'https' : 'http')
    const host = request.headers.get('host') || 
                 request.headers.get('x-forwarded-host') ||
                 request.headers.get('x-vercel-deployment-url')
    
    if (host) {
      return `${protocol}://${host}`
    }
  }

  // 3. Fallback: localhost con el puerto correcto
  const port = process.env.PORT || '3001'
  return `http://localhost:${port}`
}
