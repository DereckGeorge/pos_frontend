"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getBatchDetails } from "@/lib/api"
import { ArrowLeft, Package, User, Phone, Mail, MapPin, Calendar, DollarSign, ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"

interface BatchItem {
  id: string
  batch_id: string
  product_id: string
  quantity: number
  expiry_date?: string
  created_at: string
  updated_at: string
  product: {
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
  created_by: {
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

export default function BatchDetailsPage() {
  const params = useParams()
  const batchId = params.id as string
  const [batch, setBatch] = useState<Batch | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (batchId) {
      fetchBatchDetails()
    }
  }, [batchId])

  const fetchBatchDetails = async () => {
    try {
      setLoading(true)
      setError("")
      
      const response = await getBatchDetails(batchId)
      
      if (response.error) {
        setError(response.error)
        return
      }

      // Handle the correct API response structure
      let batchData = null
      if (response.data && response.data.data && response.data.data.batch) {
        batchData = response.data.data.batch
      } else if (response.data && response.data.batch) {
        batchData = response.data.batch
      } else if (response.data) {
        batchData = response.data
      }

      setBatch(batchData)
    } catch (err) {
      setError("Failed to fetch batch details")
      console.error("Error fetching batch details:", err)
    } finally {
      setLoading(false)
    }
  }

  const getLoanStatus = (remaining: number) => {
    if (remaining === 0) return { label: "Paid", color: "bg-green-100 text-green-800" }
    if (remaining > 0) return { label: "Outstanding", color: "bg-red-100 text-red-800" }
    return { label: "No Loan", color: "bg-gray-100 text-gray-800" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount: string) => {
    return `TSh ${Number(amount).toLocaleString()}`
  }

  if (loading) {
    return (
      <Layout title="Batch Details">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
            <span>Loading batch details...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !batch) {
    return (
      <Layout title="Batch Details">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error || "Batch not found"}</p>
            <Link href="/dashboard/products/batches">
              <Button>Back to Batches</Button>
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  const loanStatus = getLoanStatus(Number(batch.remaining_amount))
  const totalItems = batch.items.reduce((sum, item) => sum + item.quantity, 0)
  const totalValue = batch.items.reduce((sum, item) => {
    const cost = Number(item.product.cost_price) * item.quantity
    return sum + cost
  }, 0)

  return (
    <Layout title={`Batch: ${batch.batch_name}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products/batches">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Batches
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">{batch.batch_name}</h2>
            <p className="text-gray-600">Batch Details</p>
          </div>
        </div>

        {/* Batch Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="text-2xl font-bold">{batch.items.length}</div>
                  <p className="text-sm text-gray-600">Products</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-2xl font-bold">{totalItems}</div>
                  <p className="text-sm text-gray-600">Total Items</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5 text-purple-600" />
                <div>
                  <div className="text-2xl font-bold">{formatCurrency(totalValue.toString())}</div>
                  <p className="text-sm text-gray-600">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-600" />
                <div>
                  <div className="text-2xl font-bold">{formatDate(batch.delivery_date)}</div>
                  <p className="text-sm text-gray-600">Delivery Date</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Batch Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>Batch Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Batch Name</label>
                    <p className="font-semibold">{batch.batch_name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Branch</label>
                    <p className="font-semibold">{batch.branch.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Delivery Date</label>
                    <p className="font-semibold">{formatDate(batch.delivery_date)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="font-semibold">{formatDate(batch.created_at)}</p>
                  </div>
                </div>

                {/* Loan Information */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Loan Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Total Loan</label>
                      <p className="font-semibold text-blue-600">{formatCurrency(batch.total_loan)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Amount Paid</label>
                      <p className="font-semibold text-green-600">{formatCurrency(batch.loan_paid)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Remaining</label>
                      <p className="font-semibold text-red-600">{formatCurrency(batch.remaining_amount)}</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Badge className={loanStatus.color}>{loanStatus.label}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Products List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <ShoppingCart className="h-5 w-5" />
                  <span>Products in Batch ({batch.items.length})</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {batch.items.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                            <h4 className="font-semibold text-lg">{item.product.name}</h4>
                            <Badge variant="outline">{item.product.category}</Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Code:</span> {item.product.code || 'No Code'}
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span> {item.quantity} {item.product.unit}
                            </div>
                            <div>
                              <span className="font-medium">Expiry:</span> {item.expiry_date ? formatDate(item.expiry_date) : 'No expiry'}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Selling Price:</span>
                              <p className="font-semibold">{formatCurrency(item.product.price)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Cost Price:</span>
                              <p className="font-semibold">{formatCurrency(item.product.cost_price)}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Total Cost:</span>
                              <p className="font-semibold">{formatCurrency((Number(item.product.cost_price) * item.quantity).toString())}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Profit:</span>
                              <p className="font-semibold text-green-600">{formatCurrency(item.product.profit.toString())}</p>
                            </div>
                          </div>

                          {item.product.description && (
                            <div className="mt-3 pt-3 border-t">
                              <label className="text-sm font-medium text-gray-600">Description</label>
                              <p className="text-sm">{item.product.description}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Supplier Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Supplier Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Supplier Name</label>
                  <p className="font-semibold">{batch.supplier_name}</p>
                </div>
                
                {batch.supplier_phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{batch.supplier_phone}</span>
                  </div>
                )}
                
                {batch.supplier_email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{batch.supplier_email}</span>
                  </div>
                )}
                
                {batch.supplier_address && (
                  <div className="flex items-start space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-sm">{batch.supplier_address}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Created By Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Created By</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <p className="font-semibold">{batch.created_by.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Email</label>
                  <p className="text-sm">{batch.created_by.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Created At</label>
                  <p className="text-sm">{formatDate(batch.created_at)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Branch Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Branch Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Branch Name</label>
                  <p className="font-semibold">{batch.branch.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Location</label>
                  <p className="text-sm">{batch.branch.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Contact</label>
                  <p className="text-sm">{batch.branch.contact_number}</p>
                </div>
                <div>
                  <Badge variant={batch.branch.is_active ? "default" : "secondary"}>
                    {batch.branch.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
} 