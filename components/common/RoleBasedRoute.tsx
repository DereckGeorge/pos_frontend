"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import type { ReactNode } from "react"

interface RoleBasedRouteProps {
  children: ReactNode
  allowedRoles: ("superuser" | "manager" | "cashier")[]
  fallback?: ReactNode
}

export function RoleBasedRoute({ children, allowedRoles, fallback }: RoleBasedRouteProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      fallback || (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-700">Access Denied</h2>
            <p className="text-gray-500">You don't have permission to view this page.</p>
          </div>
        </div>
      )
    )
  }

  return <>{children}</>
}
