"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Eye, Plus, Receipt } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { getSales } from "@/lib/api"

export default function SalesPage() {
  const router = useRouter()

  const [sales, setSales] = useState<any[]>([])
  const [stats, setStats] = useState({ total_sales: 0, total_amount: 0, average_sale: 0 })
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
      setSales(response.data.data.sales)
      setStats(response.data.data.statistics)
    } catch (err) {
      setError("Failed to fetch sales data")
      console.error("Error fetching sales data:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <Layout title="Sales Management">
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
      <Layout title="Sales Management">
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
    <Layout title="Sales Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Sales</h2>
            <p className="text-gray-600">Manage and view all sales transactions</p>
          </div>
          <Link href="/dashboard/sales/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Sale
            </Button>
          </Link>
        </div>

        {/* Sales Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total_sales}</div>
              <p className="text-sm text-gray-600">Total Sales</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {parseFloat(stats.total_amount?.toString() || "0").toLocaleString()} TSh
              </div>
              <p className="text-sm text-gray-600">Total Revenue</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">
                {parseFloat(stats.average_sale?.toString() || "0").toLocaleString()} TSh
              </div>
              <p className="text-sm text-gray-600">Average Sale</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{sales.filter((sale) => sale.status === "completed").length}</div>
              <p className="text-sm text-gray-600">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Sales List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sales.map((sale: any) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/dashboard/sales/${sale.id}`)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">{sale.id}</p>
                        <p className="text-sm text-gray-600">{sale.branch?.name || "-"}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        {sale.items.length} item(s) • {formatDate(sale.created_at)}
                      </p>
                      <p className="text-sm text-gray-600">Cashier: {sale.cashier?.name}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-semibold">{parseFloat(sale.total_amount).toLocaleString()} TSh</p>
                    <Badge className={getStatusColor(sale.status)}>{sale.status}</Badge>
                  </div>

                  <div className="ml-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/dashboard/sales/${sale.id}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        // Handle print receipt
                        alert("Receipt printed!")
                      }}
                    >
                      <Receipt className="h-4 w-4" />
                    </Button>
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
