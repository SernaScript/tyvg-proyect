// Utility functions for formatting data following naming conventions

/**
 * Format currency amount to Colombian Peso format
 */
export const formatCurrency = (amount: number, currency = 'COP'): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date to Colombian locale format
 * Handles timezone issues by creating dates in local timezone when possible
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  let dateObject: Date
  
  if (typeof date === 'string') {
    // Si es un string, crear la fecha de manera que evite problemas de zona horaria
    if (date.includes('T') || date.includes('Z')) {
      // Si incluye información de zona horaria, usarlo directamente
      dateObject = new Date(date)
    } else {
      // Si es solo fecha (YYYY-MM-DD), crear la fecha en zona horaria local
      // para evitar que se interprete como UTC
      const [year, month, day] = date.split('T')[0].split('-')
      dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
  } else {
    dateObject = date
  }
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Intl.DateTimeFormat('es-CO', { ...defaultOptions, ...options }).format(dateObject)
}

/**
 * Format date to short format (DD/MM/YYYY)
 * Handles timezone issues by creating dates in local timezone when possible
 */
export const formatDateShort = (date: Date | string): string => {
  let dateObject: Date
  
  if (typeof date === 'string') {
    // Si es un string, crear la fecha de manera que evite problemas de zona horaria
    if (date.includes('T') || date.includes('Z')) {
      // Si incluye información de zona horaria, usarlo directamente
      dateObject = new Date(date)
    } else {
      // Si es solo fecha (YYYY-MM-DD), crear la fecha en zona horaria local
      // para evitar que se interprete como UTC
      const [year, month, day] = date.split('T')[0].split('-')
      dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    }
  } else {
    dateObject = date
  }
  
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObject)
}

/**
 * Format date to short format with Spanish locale (DD/MM/YYYY)
 * Specifically for cases where we need consistent Spanish formatting
 * Now optimized for YYYY-MM-DD format from API
 */
export const formatDateShortES = (date: Date | string): string => {
  let dateObject: Date
  
  if (typeof date === 'string') {
    // Si es un string en formato YYYY-MM-DD, crear la fecha en zona horaria local
    // para evitar que se interprete como UTC
    const [year, month, day] = date.split('-')
    dateObject = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  } else {
    dateObject = date
  }
  
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObject)
}

/**
 * Format relative time (e.g., "hace 2 días")
 */
export const formatRelativeTime = (date: Date | string): string => {
  const dateObject = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObject.getTime()) / 1000)
  
  const rtf = new Intl.RelativeTimeFormat('es-CO', { numeric: 'auto' })
  
  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Format file size to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  if (bytes === 0) return '0 Bytes'
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Format phone number to Colombian format
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Colombian mobile format: +57 XXX XXX XXXX
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    return `+57 ${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
  }
  
  // Colombian landline format: +57 X XXX XXXX
  if (cleaned.length === 7 || cleaned.length === 8) {
    return `+57 ${cleaned.slice(0, 1)} ${cleaned.slice(1, 4)} ${cleaned.slice(4)}`
  }
  
  return phone // Return original if format doesn't match
}

/**
 * Format tax ID (NIT) to Colombian format
 */
export const formatTaxId = (taxId: string): string => {
  const cleaned = taxId.replace(/\D/g, '')
  
  if (cleaned.length >= 8) {
    // Format: XXX.XXX.XXX-X
    const main = cleaned.slice(0, -1)
    const checkDigit = cleaned.slice(-1)
    
    return main.replace(/(\d{3})(?=\d)/g, '$1.') + '-' + checkDigit
  }
  
  return taxId
}

/**
 * Format percentage
 */
export const formatPercentage = (value: number, decimals = 1): string => {
  return `${value.toFixed(decimals)}%`
}

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Capitalize first letter of each word
 */
export const capitalizeWords = (text: string): string => {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}
