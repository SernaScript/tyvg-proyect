"use client"

import { Sidebar } from "@/components/Sidebar"
import { useSidebar } from "@/contexts/SidebarContext"
import { cn } from "@/lib/utils"

interface MainLayoutProps {
  children: React.ReactNode
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isExpanded } = useSidebar()

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className={cn(
        "flex-1 overflow-auto transition-all duration-300 ease-in-out",
        isExpanded ? "ml-64" : "ml-16"
      )}>
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
