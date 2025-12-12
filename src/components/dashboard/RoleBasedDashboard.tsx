"use client"

import { useAuth } from "@/contexts/AuthContext"
import { RoleName } from "@/types/auth"
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard"
import { AdminDashboard } from "@/components/dashboard/AdminDashboard"
import { AccountingDashboard } from "@/components/dashboard/AccountingDashboard"
import { TreasuryDashboard } from "@/components/dashboard/TreasuryDashboard"
import { LogisticsDashboard } from "@/components/dashboard/LogisticsDashboard"
import { BillingDashboard } from "@/components/dashboard/BillingDashboard"
import { ViewerDashboard } from "@/components/dashboard/ViewerDashboard"
import { DriverDashboard } from "@/components/dashboard/DriverDashboard"
import { WarehouseDashboard } from "@/components/dashboard/WarehouseDashboard"

export function RoleBasedDashboard() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando información del usuario...</p>
        </div>
      </div>
    )
  }

  const role = user.role.name

  switch (role) {
    case RoleName.SUPER_ADMIN:
      return <SuperAdminDashboard user={user} />
    case RoleName.ADMIN:
      return <AdminDashboard user={user} />
    case RoleName.ACCOUNTING:
      return <AccountingDashboard user={user} />
    case RoleName.TREASURY:
      return <TreasuryDashboard user={user} />
    case RoleName.LOGISTICS:
      return <LogisticsDashboard user={user} />
    case RoleName.BILLING:
      return <BillingDashboard user={user} />
    case RoleName.VIEWER:
      return <ViewerDashboard user={user} />
    case RoleName.DRIVER:
      return <DriverDashboard user={user} />
    case RoleName.WAREHOUSE:
      return <WarehouseDashboard user={user} />
    default:
      return <ViewerDashboard user={user} />
  }
}
