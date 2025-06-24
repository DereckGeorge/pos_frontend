"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Settings, Database, Shield, Activity, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AdminDashboard() {
  const systemStats = {
    totalUsers: 15,
    activeUsers: 8,
    systemHealth: "Good",
    lastBackup: "2 hours ago",
  }

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">across all roles</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">currently online</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Shield className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{systemStats.systemHealth}</div>
              <p className="text-xs text-muted-foreground">all systems operational</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{systemStats.lastBackup}</div>
              <p className="text-xs text-muted-foreground">automatic backup</p>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/dashboard/users">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Users className="h-6 w-6 mr-2" />
                  Manage Users
                </Button>
              </Link>

              <Link href="/dashboard/settings">
                <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                  <Settings className="h-6 w-6 mr-2" />
                  System Settings
                </Button>
              </Link>

              <Button variant="outline" className="w-full h-20 text-lg" size="lg">
                <Database className="h-6 w-6 mr-2" />
                Backup & Restore
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <span>System Alerts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <div>
                  <p className="font-medium">Scheduled Maintenance</p>
                  <p className="text-sm text-muted-foreground">System maintenance scheduled for Sunday 2:00 AM</p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div>
                  <p className="font-medium">New Update Available</p>
                  <p className="text-sm text-muted-foreground">POS System v2.1.0 is ready for installation</p>
                </div>
                <Button variant="outline" size="sm">
                  Update Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Admin Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { time: "10 min ago", action: "User created", details: "New cashier account for John Smith" },
                { time: "1 hour ago", action: "System backup", details: "Automatic backup completed successfully" },
                { time: "3 hours ago", action: "Settings updated", details: "Tax rate configuration modified" },
                { time: "1 day ago", action: "User role changed", details: "Jane Doe promoted to Manager" },
              ].map((activity, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.details}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">{activity.time}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
