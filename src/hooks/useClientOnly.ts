import { useEffect, useState } from 'react'

// Hook para renderizar contenido solo en el cliente
export function useClientOnly() {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  return hasMounted
}
