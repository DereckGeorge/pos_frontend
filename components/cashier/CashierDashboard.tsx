"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart, DollarSign, Receipt, Clock } from "lucide-react"
import Link from "next/link"

export function CashierDashboard() {
  const todayStats = {
    salesCount: 23,
    totalAmount: 1250.75,
    lastSale: "2 minutes ago",
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
              <div className="text-2xl font-bold">{todayStats.salesCount}</div>
              <p className="text-xs text-muted-foreground">transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${todayStats.totalAmount}</div>
              <p className="text-xs text-muted-foreground">today's revenue</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Sale</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.lastSale}</div>
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
              {[
                { time: "2 min ago", action: "Sale completed", amount: "$45.99" },
                { time: "15 min ago", action: "Sale completed", amount: "$123.50" },
                { time: "32 min ago", action: "Expense recorded", amount: "$25.00" },
                { time: "1 hour ago", action: "Sale completed", amount: "$89.75" },
              ].map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                  <div className="font-medium">{activity.amount}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
