"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import { SuperuserDashboard } from "@/components/dashboard/SuperuserDashboard"
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard"
import { CashierDashboard } from "@/components/cashier/CashierDashboard"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  // Route to appropriate dashboard based on role
  switch (user.role) {
    case "superuser":
      return <SuperuserDashboard />
    case "manager":
      return <ManagerDashboard />
    case "cashier":
      return <CashierDashboard />
    default:
      return <SuperuserDashboard />
  }
}
