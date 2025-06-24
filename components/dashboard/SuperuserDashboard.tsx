"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { mockLocations, mockUsers, mockSales, mockExpenses, mockUserRequests, formatTSh } from "@/lib/mockData"
import { Building, Users, DollarSign, TrendingUp, MapPin, UserPlus, AlertCircle, Eye } from "lucide-react"
import Link from "next/link"

export function SuperuserDashboard() {
  // Calculate overall statistics
  const totalLocations = mockLocations.filter((loc) => loc.status === "active").length
  const totalUsers = mockUsers.filter((user) => user.status === "active").length
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0)
  const totalExpenses = mockExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const netProfit = totalSales - totalExpenses
  const pendingRequests = mockUserRequests.filter((req) => req.status === "pending").length

  // Sales by location
  const salesByLocation = mockLocations.map((location) => {
    const locationSales = mockSales.filter((sale) => sale.locationId === location.id)
    const totalSales = locationSales.reduce((sum, sale) => sum + sale.total, 0)
    const salesCount = locationSales.length
    return {
      ...location,
      totalSales,
      salesCount,
    }
  })

  // Recent activities across all locations
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

  return (
    <Layout title="Superuser Dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">Karibu, Mohamed Rashid!</h2>
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
