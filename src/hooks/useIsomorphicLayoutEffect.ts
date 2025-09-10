import { useEffect, useLayoutEffect } from 'react'

// Hook para evitar problemas de hidratación
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
