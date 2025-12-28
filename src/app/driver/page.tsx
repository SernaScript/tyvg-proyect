"use client"

import { DriverDashboard } from "@/components/dashboard/DriverDashboard"
import { useAuth } from "@/contexts/AuthContext"

export default function DriverPage() {
  const { user } = useAuth()
  
  if (!user) {
    return null
  }
  
  return <DriverDashboard user={user} />
}

