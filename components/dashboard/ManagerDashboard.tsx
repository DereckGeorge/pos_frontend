"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowLeftRight, UserPlus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getManagerDashboardOverview } from "@/lib/api"

export function ManagerDashboard() {
  const { user, userLocation } = useAuth()
  const [dashboardData, setDashboardData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user || !userLocation) return
    fetchDashboardData()
  }, [user, userLocation])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getManagerDashboardOverview()
      if (response.error) {
        setError(response.error)
        return
      }
      setDashboardData(response.data.data)
    } catch (err) {
      setError("Failed to fetch dashboard data")
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  if (!user || !userLocation) return null

  if (loading) {
    return (
      <Layout title={`Manager Dashboard - ${userLocation.name}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
            <span>Loading dashboard data...</span>
          </div>
        </div>
      </Layout>
    )
  }
  if (error) {
    return (
      <Layout title={`Manager Dashboard - ${userLocation.name}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchDashboardData}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }
  if (!dashboardData) return null

  // Use API data
  const overview = dashboardData.overview
  const recentActivities = dashboardData.recent_activities
  const topProducts = dashboardData.top_selling_products || []

  // Recent activities from API
  const activities = [
    ...(recentActivities.recent_sales || []).map((sale: any) => ({
      type: "sale",
      description: `Sale ${sale.sale_id}`,
      cashier: sale.cashier,
      amount: parseFloat(sale.total_amount),
      time: new Date(sale.created_at).toLocaleString(),
    })),
    ...(recentActivities.recent_expenses || []).map((expense: any) => ({
      type: "expense",
      description: expense.description,
      cashier: expense.created_by,
      amount: parseFloat(expense.amount),
      time: new Date(expense.created_at).toLocaleString(),
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())

  return (
    <Layout title={`Manager Dashboard - ${userLocation.name}`}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Karibu, {user.name}!</h2>
          <p className="text-green-100">
            Managing {userLocation.name} in {userLocation.city}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(overview.total_sales_revenue).toLocaleString()} TSh</div>
              <p className="text-xs text-muted-foreground">{overview.total_items_sold} items sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overview.total_products}</div>
              <p className="text-xs text-muted-foreground">in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(overview.total_expenses).toLocaleString()} TSh</div>
              <p className="text-xs text-muted-foreground">total expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${overview.total_profit >= 0 ? "text-green-500" : "text-red-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${overview.total_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {overview.total_profit.toLocaleString()} TSh
              </div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {parseInt(overview.low_stock_products) > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                  <Badge variant="destructive">{overview.low_stock_products}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(recentActivities.low_stock_alerts || []).slice(0, 3).map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm font-medium">{item.product_name || "Product"}</span>
                      <span className="text-sm text-orange-700">Stock: {item.quantity || 0}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/products">
                  <Button variant="outline" className="w-full mt-3 border-orange-300 text-orange-700">
                    Manage Stock
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Pending Transfers */}
          {overview.pending_transfers > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <ArrowLeftRight className="h-5 w-5" />
                  <span>Pending Transfers</span>
                  <Badge variant="default">{overview.pending_transfers}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {(recentActivities.recent_transfers || []).slice(0, 3).map((transfer: any) => (
                    <div key={transfer.transfer_id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm font-medium">{transfer.product_name}</span>
                      <span className="text-sm text-blue-700">Qty: {transfer.quantity}</span>
                    </div>
                  ))}
                </div>
                <Link href="/dashboard/stock-transfers">
                  <Button variant="outline" className="w-full mt-3 border-blue-300 text-blue-700">
                    View Transfers
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/products">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Package className="h-6 w-6 mr-2" />
                  Manage Products
                </Button>
              </Link>

              <Link href="/dashboard/stock-transfers">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <ArrowLeftRight className="h-6 w-6 mr-2" />
                  Stock Transfers
                </Button>
              </Link>

              <Link href="/dashboard/user-requests">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <UserPlus className="h-6 w-6 mr-2" />
                  Request Cashier
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

        {/* Recent Activities */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.description}</p>
                    <p className="text-sm text-gray-600">
                      By {activity.cashier} • {activity.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${activity.type === "sale" ? "text-green-600" : "text-red-600"}`}>
                      {activity.type === "sale" ? "+" : "-"}
                      {activity.amount.toLocaleString()} TSh
                    </p>
                    <Badge variant={activity.type === "sale" ? "default" : "secondary"}>{activity.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
