"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { mockSales, mockExpenses, mockLocationStock, mockStockTransfers, formatTSh } from "@/lib/mockData"
import { DollarSign, Package, ShoppingCart, TrendingUp, AlertTriangle, ArrowLeftRight, UserPlus } from "lucide-react"
import Link from "next/link"

export function ManagerDashboard() {
  const { user, userLocation } = useAuth()

  if (!user || !userLocation) return null

  // Filter data for current location
  const locationSales = mockSales.filter((sale) => sale.locationId === user.locationId)
  const locationExpenses = mockExpenses.filter((expense) => expense.locationId === user.locationId)
  const locationStock = mockLocationStock.filter((stock) => stock.locationId === user.locationId)
  const pendingTransfers = mockStockTransfers.filter(
    (transfer) =>
      (transfer.fromLocationId === user.locationId || transfer.toLocationId === user.locationId) &&
      transfer.status === "pending",
  )

  // Calculate statistics
  const totalSales = locationSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalExpenses = locationExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const profit = totalSales - totalExpenses
  const lowStockItems = locationStock.filter((item) => item.stock <= item.minStock)
  const totalProducts = locationStock.length

  // Recent activities
  const recentActivities = [
    ...locationSales.slice(0, 3).map((sale) => ({
      type: "sale",
      description: `Sale ${sale.id}`,
      cashier: sale.cashierName,
      amount: sale.total,
      time: new Date(sale.createdAt).toLocaleString(),
    })),
    ...locationExpenses.slice(0, 2).map((expense) => ({
      type: "expense",
      description: expense.description,
      cashier: expense.createdByName,
      amount: expense.amount,
      time: new Date(expense.date).toLocaleString(),
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
              <div className="text-2xl font-bold">{formatTSh(totalSales)}</div>
              <p className="text-xs text-muted-foreground">{locationSales.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-muted-foreground">in inventory</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Expenses</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTSh(totalExpenses)}</div>
              <p className="text-xs text-muted-foreground">{locationExpenses.length} expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit</CardTitle>
              <TrendingUp className={`h-4 w-4 ${profit >= 0 ? "text-green-500" : "text-red-500"}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatTSh(profit)}
              </div>
              <p className="text-xs text-muted-foreground">this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Low Stock Alert */}
          {lowStockItems.length > 0 && (
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-orange-800">
                  <AlertTriangle className="h-5 w-5" />
                  <span>Low Stock Alert</span>
                  <Badge variant="destructive">{lowStockItems.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {lowStockItems.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm font-medium">{item.productName}</span>
                      <span className="text-sm text-orange-700">Stock: {item.stock}</span>
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
          {pendingTransfers.length > 0 && (
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-blue-800">
                  <ArrowLeftRight className="h-5 w-5" />
                  <span>Pending Transfers</span>
                  <Badge variant="default">{pendingTransfers.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {pendingTransfers.slice(0, 3).map((transfer) => (
                    <div key={transfer.id} className="flex justify-between items-center p-2 bg-white rounded">
                      <span className="text-sm font-medium">{transfer.productName}</span>
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
              {recentActivities.map((activity, index) => (
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
                      {formatTSh(activity.amount)}
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
