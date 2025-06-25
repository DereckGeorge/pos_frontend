"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, DollarSign, Receipt, Clock } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getSales } from "@/lib/api"

export function CashierDashboard() {
  const [stats, setStats] = useState({ total_sales: 0, total_amount: 0, average_sale: 0 })
  const [sales, setSales] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchSales()
  }, [])

  const fetchSales = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getSales()
      if (response.error) {
        setError(response.error)
        return
      }
      setStats(response.data.data.statistics)
      setSales(response.data.data.sales)
    } catch (err) {
      setError("Failed to fetch sales data")
      console.error("Error fetching sales data:", err)
    } finally {
      setLoading(false)
    }
  }

  // Find the most recent sale
  const lastSale = sales.length > 0 ? sales[0] : null
  const lastSaleTime = lastSale ? new Date(lastSale.created_at).toLocaleString() : "-"

  if (loading) {
    return (
      <Layout title="Cashier Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
            <span>Loading sales data...</span>
          </div>
        </div>
      </Layout>
    )
  }
  if (error) {
    return (
      <Layout title="Cashier Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchSales}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Cashier Dashboard">
      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_sales}</div>
              <p className="text-xs text-muted-foreground">transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{parseFloat(stats.total_amount?.toString() || "0").toLocaleString()} TSh</div>
              <p className="text-xs text-muted-foreground">today's revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lastSaleTime}</div>
              <p className="text-xs text-muted-foreground">most recent</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/sales/new">
                <Button className="w-full h-20 text-lg" size="lg">
                  <ShoppingCart className="h-6 w-6 mr-2" />
                  New Sale
                </Button>
              </Link>

              <Link href="/dashboard/expenses/new">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <DollarSign className="h-6 w-6 mr-2" />
                  Record Expense
                </Button>
              </Link>

              <Link href="/dashboard/sales/recent">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Receipt className="h-6 w-6 mr-2" />
                  Recent Sales
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sales.slice(0, 5).map((sale: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Sale completed</p>
                    <p className="text-sm text-muted-foreground">{new Date(sale.created_at).toLocaleString()}</p>
                  </div>
                  <div className="font-medium">{parseFloat(sale.total_amount).toLocaleString()} TSh</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
