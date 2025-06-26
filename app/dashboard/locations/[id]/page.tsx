"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building, Users, DollarSign, Package, AlertTriangle, TrendingUp, Phone, MapPin, Calendar } from "lucide-react"
import Link from "next/link"
import { getBranchDetails } from "@/lib/api"
import { formatTSh } from "@/lib/mockData"

interface BranchInfo {
  id: string
  name: string
  location: string
  contact_number: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface BranchStatistics {
  total_staff: number
  managers: number
  cashiers: number
  total_sales: number
  total_revenue: number
  total_expenses: number
  total_products: number
  low_stock_products: number
  out_of_stock_products: number
}

interface StaffMember {
  id: string
  name: string
  email: string
  position: string
  status: string
  created_at: string
}

interface BranchData {
  branch_info: BranchInfo
  statistics: BranchStatistics
  staff: StaffMember[]
  recent_sales: any[]
  recent_expenses: any[]
  top_products: any[]
}

export default function BranchDetailPage() {
  const params = useParams()
  const router = useRouter()
  const branchId = params.id as string
  
  const [branchData, setBranchData] = useState<BranchData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchBranchDetails()
  }, [branchId])

  const fetchBranchDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      console.log("🔍 DEBUG: Starting API call for branch details")
      console.log("📍 Branch ID:", branchId)
      console.log("🔗 API Endpoint:", `/dashboard/branches/${branchId}`)
      
      // Get token for debugging
      const token = localStorage.getItem("pos_token")
      console.log("🔑 Auth Token:", token ? `${token.substring(0, 20)}...` : "No token found")
      
      const response = await getBranchDetails(branchId)
      console.log("📡 API Response:", response)
      console.log("📊 Response Type:", typeof response)
      console.log("🔍 Response Keys:", Object.keys(response || {}))
      
      if (response.error) {
        console.error("❌ API Error:", response.error)
        setError(response.error)
        return
      }

      // The API returns { success, message, data: { branch_info, statistics, staff, ... } }
      // getBranchDetails returns { success, message, data: { ... } }
      // So we need to access response.data to get the actual branch data
      console.log("📋 Response.data:", response.data)
      console.log("🏢 Branch Info:", response.data?.branch_info)
      console.log("📈 Statistics:", response.data?.statistics)
      console.log("👥 Staff:", response.data?.staff)
      
      setBranchData(response.data || null)
      console.log("✅ Branch data set successfully")
    } catch (err) {
      console.error("💥 Error fetching branch details:", err)
      setError("Failed to load branch details")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getPositionColor = (position: string) => {
    switch (position) {
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "cashier":
        return "bg-green-100 text-green-800"
      case "super user":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Layout title="Branch Details">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Branch Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchBranchDetails}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  if (!branchData || !branchData.branch_info) {
    return (
      <Layout title="Branch Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Branch data not found or incomplete</p>
            <Button onClick={fetchBranchDetails}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  const { branch_info, statistics, staff } = branchData

  return (
    <Layout title={`${branch_info.name} - Branch Details`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/locations">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Locations
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">{branch_info.name}</h2>
            <p className="text-gray-600">Branch details and performance</p>
          </div>
        </div>

        {/* Branch Info Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              Branch Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">{branch_info.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Contact Number</p>
                    <p className="text-sm text-gray-600">{branch_info.contact_number}</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Created</p>
                    <p className="text-sm text-gray-600">{formatDate(branch_info.created_at)}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="font-medium">Status</p>
                    <Badge variant={branch_info.is_active ? "default" : "secondary"}>
                      {branch_info.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_staff}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.managers} managers, {statistics.cashiers} cashiers
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTSh(statistics.total_revenue)}</div>
              <p className="text-xs text-muted-foreground">{statistics.total_sales} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statistics.total_products}</div>
              <p className="text-xs text-muted-foreground">
                {statistics.low_stock_products} low stock, {statistics.out_of_stock_products} out of stock
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTSh(statistics.total_expenses)}</div>
              <p className="text-xs text-muted-foreground">operational costs</p>
            </CardContent>
          </Card>
        </div>

        {/* Staff Members */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Staff Members ({staff.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staff.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No staff members assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {staff.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <p className="text-sm text-gray-500">Joined: {formatDate(member.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <Badge className={getPositionColor(member.position)}>
                        {member.position}
                      </Badge>
                      <Badge className={getStatusColor(member.status)}>
                        {member.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stock Alerts */}
        {(statistics.low_stock_products > 0 || statistics.out_of_stock_products > 0) && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Stock Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {statistics.low_stock_products > 0 && (
                  <p className="text-orange-700">
                    ⚠️ {statistics.low_stock_products} product(s) are running low on stock
                  </p>
                )}
                {statistics.out_of_stock_products > 0 && (
                  <p className="text-red-700">
                    🚨 {statistics.out_of_stock_products} product(s) are out of stock
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Activities Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No recent activities</p>
              <p className="text-sm text-gray-500">Sales and expenses will appear here</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
} 