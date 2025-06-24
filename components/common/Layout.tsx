"use client"

import type React from "react"

import { useAuth } from "@/components/auth/AuthProvider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  LogOut,
  User,
  Settings,
  Home,
  ShoppingCart,
  Package,
  Users,
  FileText,
  DollarSign,
  MapPin,
  Building,
  UserPlus,
  ArrowLeftRight,
} from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
  title?: string
}

export function Layout({ children, title }: LayoutProps) {
  const { user, userLocation, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  const getNavigationItems = () => {
    const baseItems = [{ href: "/dashboard", icon: Home, label: "Dashboard" }]

    if (user?.role === "superuser") {
      return [
        ...baseItems,
        { href: "/dashboard/locations", icon: Building, label: "Locations" },
        { href: "/dashboard/users", icon: Users, label: "Users" },
        { href: "/dashboard/user-requests", icon: UserPlus, label: "User Requests" },
        { href: "/dashboard/products", icon: Package, label: "Products" },
        { href: "/dashboard/stock-transfers", icon: ArrowLeftRight, label: "Stock Transfers" },
        { href: "/dashboard/expenses", icon: DollarSign, label: "Expenses" },
        { href: "/dashboard/reports", icon: FileText, label: "Reports" },
        { href: "/dashboard/settings", icon: Settings, label: "Settings" },
      ]
    }

    if (user?.role === "manager") {
      return [
        ...baseItems,
        { href: "/dashboard/products", icon: Package, label: "Products" },
        { href: "/dashboard/stock-transfers", icon: ArrowLeftRight, label: "Stock Transfers" },
        { href: "/dashboard/sales", icon: ShoppingCart, label: "Sales" },
        { href: "/dashboard/expenses", icon: DollarSign, label: "Expenses" },
        { href: "/dashboard/reports", icon: FileText, label: "Reports" },
        { href: "/dashboard/user-requests", icon: UserPlus, label: "Cashier Requests" },
      ]
    }

    if (user?.role === "cashier") {
      return [
        ...baseItems,
        { href: "/dashboard/sales", icon: ShoppingCart, label: "Sales" },
        { href: "/dashboard/expenses", icon: DollarSign, label: "Expenses" },
      ]
    }

    return baseItems
  }

  const navigationItems = getNavigationItems()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">{title || "POS Tanzania"}</h1>
              {userLocation && (
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4" />
                  <span>{userLocation.name}</span>
                  <span className="text-gray-400">•</span>
                  <span>{userLocation.city}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">{user?.name}</span>
                <Badge
                  variant={
                    user?.role === "superuser" ? "destructive" : user?.role === "manager" ? "default" : "secondary"
                  }
                >
                  {user?.role}
                </Badge>
              </div>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
