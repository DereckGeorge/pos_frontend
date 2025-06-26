"use client"

import { useAuth } from "@/components/auth/AuthProvider"
import CashierExpenseDashboard from "@/components/cashier/CashierExpenseDashboard"
import ManagerExpenseDashboard from "@/components/expenses/ManagerExpenseDashboard"

export default function ExpensesPage() {
  const { user } = useAuth()

  // Show cashier-specific dashboard for cashiers
  if (user?.role === "cashier") {
    return <CashierExpenseDashboard />
  }

  // Show manager/superuser dashboard for other roles
  return <ManagerExpenseDashboard />
}
