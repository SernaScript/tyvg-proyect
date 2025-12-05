"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

interface SidebarContextType {
    isExpanded: boolean
    toggleSidebar: () => void
    expandSidebar: () => void
    collapseSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

const SIDEBAR_STORAGE_KEY = "sidebar-expanded"

export function SidebarProvider({ children }: { children: ReactNode }) {
    const [isExpanded, setIsExpanded] = useState<boolean>(true)

    // Cargar estado inicial desde localStorage
    useEffect(() => {
        const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY)
        if (saved !== null) {
            setIsExpanded(saved === "true")
        }
    }, [])

    // Guardar estado en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isExpanded))
    }, [isExpanded])

    const toggleSidebar = () => {
        setIsExpanded(prev => !prev)
    }

    const expandSidebar = () => {
        setIsExpanded(true)
    }

    const collapseSidebar = () => {
        setIsExpanded(false)
    }

    return (
        <SidebarContext.Provider
            value={{
                isExpanded,
                toggleSidebar,
                expandSidebar,
                collapseSidebar,
            }}
        >
            {children}
        </SidebarContext.Provider>
    )
}

export function useSidebar(): SidebarContextType {
    const context = useContext(SidebarContext)
    if (context === undefined) {
        throw new Error("useSidebar must be used within a SidebarProvider")
    }
    return context
}

