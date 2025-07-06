"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getBatches, getBatchStatistics } from "@/lib/api"
import { ArrowLeft, Search, Calendar, Package, Eye, Filter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth/AuthProvider"

interface BatchItem {
  id: string
  batch_id: string
  product_id: string
  quantity: number
  expiry_date?: string
  created_at: string
  updated_at: string
  product?: {
    id: string
    name: string
    code: string | null
    description: string | null
    price: string
    cost_price: string
    quantity: number
    is_loan: boolean
    reorder_level: number
    unit: string
    category: string
    branch_id: string
    created_by: string
    updated_by: string
    created_at: string
    updated_at: string
    deleted_at: string | null
    profit: number
  }
}

interface Batch {
  id: string
  batch_name: string
  supplier_name: string
  branch_id: string
  delivery_date: string
  total_loan: string
  loan_paid: string
  remaining_amount: string
  supplier_phone?: string
  supplier_email?: string
  supplier_address?: string
  created_by: string | {
    id: string
    name: string
    email: string
    email_verified_at: string | null
    position_id: string
    branch_id: string
    status: string
    approved_by: string
    approved_at: string
    rejection_reason: string | null
    created_at: string
    updated_at: string
  }
  updated_by: string
  created_at: string
  updated_at: string
  branch: {
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
  items: BatchItem[]
}

interface BatchStatistics {
  total_batches: number
  total_loan: string
  total_loan_paid: string
  total_remaining: string
  total_products: string
  suppliers_count: number
  recent_batches: Batch[]
}

export default function BatchesPage() {
  const { user } = useAuth()
  const [batches, setBatches] = useState<Batch[]>([])
  const [statistics, setStatistics] = useState<BatchStatistics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    supplier_name: "",
    from_date: "",
    to_date: ""
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      await fetchStatistics()
      await fetchBatches()
    }
    loadData()
  }, [filters, searchTerm])

  const fetchBatches = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Build query parameters
      const params = new URLSearchParams()
      if (searchTerm) params.append('supplier_name', searchTerm)
      if (filters.supplier_name) params.append('supplier_name', filters.supplier_name)
      if (filters.from_date) params.append('from_date', filters.from_date)
      if (filters.to_date) params.append('to_date', filters.to_date)
      
      const response = await getBatches(params.toString())
      
      if (response.error) {
        setError(response.error)
        return
      }

      // Handle the correct API response structure
      let batchesData = []
      if (response.data && response.data.data && response.data.data.batches && response.data.data.batches.data) {
        batchesData = response.data.data.batches.data
      } else if (response.data && response.data.batches && response.data.batches.data) {
        batchesData = response.data.batches.data
      } else if (response.data && response.data.batches) {
        batchesData = response.data.batches
      } else if (Array.isArray(response.data)) {
        batchesData = response.data
      }
      
      // If no batches from main API, try to use recent_batches from statistics
      if (batchesData.length === 0 && statistics && statistics.recent_batches) {
        batchesData = statistics.recent_batches
      }
      
      setBatches(batchesData)
    } catch (err) {
      setError("Failed to fetch batches")
    } finally {
      setLoading(false)
    }
  }

  const fetchStatistics = async () => {
    try {
      const params = new URLSearchParams()
      if (filters.from_date) params.append('from_date', filters.from_date)
      if (filters.to_date) params.append('to_date', filters.to_date)
      
      const response = await getBatchStatistics(params.toString())
      
      if (response.error) {
        return
      }

      // Handle the correct API response structure
      let statisticsData = null
      if (response.data && response.data.data && response.data.data.statistics) {
        statisticsData = response.data.data.statistics
      } else if (response.data && response.data.statistics) {
        statisticsData = response.data.statistics
      } else if (response.data) {
        statisticsData = response.data
      }

      setStatistics(statisticsData)
    } catch (err) {
      console.error("Error fetching statistics:", err)
    }
  }

  const handleFilterChange = (field: string, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }))
  }

  const clearFilters = () => {
    setFilters({
      supplier_name: "",
      from_date: "",
      to_date: ""
    })
    setSearchTerm("")
  }

  const getLoanStatus = (remaining: number) => {
    if (remaining === 0) return { label: "Paid", color: "bg-green-100 text-green-800" }
    if (remaining > 0) return { label: "Outstanding", color: "bg-red-100 text-red-800" }
    return { label: "No Loan", color: "bg-gray-100 text-gray-800" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <Layout title="Product Batches">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span>Loading batches...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Product Batches">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Product Batches</h2>
            <p className="text-gray-600">View and manage product batches</p>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{statistics.total_batches}</div>
                <p className="text-sm text-gray-600">Total Batches</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">
                  TSh {Number(statistics.total_loan).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Loan</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">
                  TSh {Number(statistics.total_loan_paid).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Total Paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">
                  TSh {Number(statistics.total_remaining).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600">Remaining</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search by supplier name..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Button onClick={fetchBatches}>
                Search
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Supplier Name</label>
                    <Input
                      placeholder="Filter by supplier"
                      value={filters.supplier_name}
                      onChange={(e) => handleFilterChange("supplier_name", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">From Date</label>
                    <Input
                      type="date"
                      value={filters.from_date}
                      onChange={(e) => handleFilterChange("from_date", e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">To Date</label>
                    <Input
                      type="date"
                      value={filters.to_date}
                      onChange={(e) => handleFilterChange("to_date", e.target.value)}
                    />
                  </div>
                </div>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Batches List */}
        <Card>
          <CardHeader>
            <CardTitle>Batches ({batches.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batches.map((batch) => {
                const loanStatus = getLoanStatus(Number(batch.remaining_amount))
                return (
                  <div
                    key={batch.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-lg">{batch.batch_name}</h3>
                          <Badge className={loanStatus.color}>{loanStatus.label}</Badge>
                          <Badge variant="outline">{batch.branch.name}</Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                          <div>
                            <span className="font-medium">Supplier:</span> {batch.supplier_name}
                          </div>
                          <div>
                            <span className="font-medium">Delivery Date:</span> {formatDate(batch.delivery_date)}
                          </div>
                          <div>
                            <span className="font-medium">Created:</span> {formatDate(batch.created_at)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Total Loan:</span>
                            <p className="font-semibold">TSh {batch.total_loan}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Amount Paid:</span>
                            <p className="font-semibold text-green-600">TSh {batch.loan_paid}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Remaining:</span>
                            <p className="font-semibold text-red-600">TSh {batch.remaining_amount}</p>
                          </div>
                          <div>
                            <span className="text-gray-600">Items:</span>
                            <p className="font-semibold">{batch.items.length} products</p>
                          </div>
                        </div>

                        {batch.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t">
                            <h4 className="font-medium mb-2">Products in Batch:</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                              {batch.items.slice(0, 6).map((item) => (
                                <div key={item.id} className="text-xs bg-gray-100 p-2 rounded">
                                  <div className="font-medium">
                                    {item.product?.name || `Product ID: ${item.product_id}`}
                                  </div>
                                  <div className="text-gray-600">
                                    Qty: {item.quantity} | {item.product?.code || 'No Code'}
                                  </div>
                                </div>
                              ))}
                              {batch.items.length > 6 && (
                                <div className="text-xs text-gray-500 p-2">
                                  +{batch.items.length - 6} more products
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        <Link href={`/dashboard/products/batches/${batch.id}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {batches.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No batches found</p>
                <p className="text-sm">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
} 