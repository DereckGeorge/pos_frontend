"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockSales, mockExpenses, formatTSh } from "@/lib/mockData"
import { getSuperuserDashboard, getPendingUsers } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"
import { Building, Users, DollarSign, TrendingUp, MapPin, UserPlus, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"

interface DashboardData {
  total_branches: number
  total_users: number
  total_revenue: string
  total_expenses: string
  cost_of_goods_sold: string
  gross_profit: number
  net_profit: number
  pending_users: number
  branches: Array<{
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
    manager: {
      id: string
      name: string
      email: string
      position_id: string
      branch_id: string
    } | null
    total_sales: number
    total_revenue: string | number
  }>
}

interface PendingUsersData {
  statistics: {
    total_requests: number
    approved: number
    rejected: number
    pending: number
  }
  users: Array<{
    id: string
    name: string
    email: string
    status: string
    position: {
      name: string
    }
    branch: {
      name: string
      location: string
    }
  }>
}

export function SuperuserDashboard() {
  const { user } = useAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [pendingUsersData, setPendingUsersData] = useState<PendingUsersData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch dashboard data
        const dashboardResponse = await getSuperuserDashboard()
        if (dashboardResponse.error) {
          console.error("Failed to fetch dashboard data:", dashboardResponse.error)
          setError("Failed to load dashboard data")
        } else {
          // Extract data from the nested response structure
          setDashboardData(dashboardResponse.data?.data || null)
        }

        // Fetch pending users data
        const pendingUsersResponse = await getPendingUsers()
        if (pendingUsersResponse.error) {
          console.error("Failed to fetch pending users:", pendingUsersResponse.error)
        } else {
          // Extract data from the nested response structure
          setPendingUsersData(pendingUsersResponse.data?.data || null)
        }
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Use API data if available, otherwise fall back to mock data
  const totalLocations = dashboardData?.total_branches || 0
  const totalUsers = dashboardData?.total_users || 0
  const totalSales = dashboardData ? parseFloat(dashboardData.total_revenue) : mockSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalExpenses = dashboardData ? parseFloat(dashboardData.total_expenses) : mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = dashboardData?.net_profit || (totalSales - totalExpenses)
  const pendingRequests = pendingUsersData?.statistics?.pending || 0

  // Sales by location from API data
  const salesByLocation = dashboardData?.branches?.map((branch) => ({
    id: branch.id,
    name: branch.name,
    city: branch.location,
    region: branch.location,
    phone: branch.contact_number,
    managerId: branch.manager?.id || "",
    managerName: branch.manager?.name || "No Manager",
    status: branch.is_active ? "active" : "inactive",
    createdAt: new Date().toISOString(),
    totalSales: typeof branch.total_revenue === "string" ? parseFloat(branch.total_revenue) : branch.total_revenue,
    salesCount: branch.total_sales,
  })) || []

  // Recent activities (keep mock data for now as API doesn't provide this)
  const recentActivities = [
    ...mockSales.slice(0, 3).map((sale) => ({
      type: "sale",
      description: `Sale ${sale.id} completed`,
      location: sale.locationName,
      amount: sale.total,
      time: new Date(sale.createdAt).toLocaleString(),
    })),
    ...mockExpenses.slice(0, 2).map((expense) => ({
      type: "expense",
      description: expense.description,
      location: expense.locationName,
      amount: expense.amount,
      time: new Date(expense.date).toLocaleString(),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  if (loading) {
    return (
      <Layout title="Superuser Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Superuser Dashboard">
        <div className="flex items-center justify-center h-64">
          <p className="text-red-600">{error}</p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Superuser Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Karibu, {user?.name || "User"}!</h2>
          <p className="text-blue-100">Overview of all POS Tanzania locations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Locations</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalLocations}</div>
              <p className="text-xs text-muted-foreground">across Tanzania</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTSh(totalSales)}</div>
              <p className="text-xs text-muted-foreground">all locations</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${netProfit >= 0 ? "text-green-500" : "text-red-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatTSh(netProfit)}
              </div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Requests Alert */}
        {pendingRequests > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                <span>Pending Requests</span>
                <Badge variant="destructive">{pendingRequests}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-3">
                You have {pendingRequests} pending user creation requests that need your approval.
              </p>
              <Link href="/dashboard/user-requests">
                <Button variant="outline" className="border-orange-300 text-orange-700 hover:bg-orange-100">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Review Requests
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Location Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Location Performance</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesByLocation.map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">{location.name}</p>
                        <p className="text-sm text-gray-600">
                          {location.city}, {location.region}
                        </p>
                        <p className="text-sm text-gray-500">Manager: {location.managerName}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold">{formatTSh(location.totalSales)}</p>
                    <p className="text-sm text-gray-600">{location.salesCount} sales</p>
                  </div>

                  <div className="flex space-x-2">
                    <Link href={`/dashboard/locations/${location.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      {activity.location} • {activity.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${activity.type === "sale" ? "text-green-600" : "text-red-600"}`}>
                      {activity.type === "sale" ? "+" : "-"}
                      {formatTSh(activity.amount)}
                    </p>
                    <Badge variant={activity.type === "sale" ? "default" : "secondary"}>{activity.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/locations">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Building className="h-6 w-6 mr-2" />
                  Manage Locations
                </Button>
              </Link>

              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Users className="h-6 w-6 mr-2" />
                  Manage Users
                </Button>
              </Link>

              <Link href="/dashboard/user-requests">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <UserPlus className="h-6 w-6 mr-2" />
                  User Requests
                  {pendingRequests > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {pendingRequests}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link href="/dashboard/reports">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <TrendingUp className="h-6 w-6 mr-2" />
                  View Reports
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
