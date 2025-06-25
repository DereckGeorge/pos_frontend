"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getProducts, getBranches, createStockTransfer } from "@/lib/api"

interface Product {
  id: string
  name: string
  code: string
  price: string
  cost_price: string
  quantity: number
  unit: string
  category: string
  branch_id: string
}

interface Branch {
  id: string
  name: string
  location: string
  contact_number: string
  is_active: boolean
}

interface ApiProductsResponse {
  status: string
  data: {
    products: Product[]
  }
}

interface ApiBranchesResponse {
  status: string
  data: {
    branches: Branch[]
  }
}

export default function NewStockTransferPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  
  const [formData, setFormData] = useState({
    product_id: "",
    from_branch_id: "",
    to_branch_id: "",
    quantity: "",
    reason: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")
      
      const [productsResponse, branchesResponse] = await Promise.all([
        getProducts(),
        getBranches()
      ])
      
      if (productsResponse.error) {
        setError(productsResponse.error)
        return
      }

      if (branchesResponse.error) {
        setError(branchesResponse.error)
        return
      }

      const productsData = productsResponse.data as ApiProductsResponse
      const branchesData = branchesResponse.data as ApiBranchesResponse

      setProducts(productsData.data.products)
      setBranches(branchesData.data.branches)
    } catch (err) {
      setError("Failed to fetch data")
      console.error("Error fetching data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.product_id || !formData.from_branch_id || !formData.to_branch_id || !formData.quantity || !formData.reason) {
      setError("Please fill in all required fields")
      return
    }

    if (formData.from_branch_id === formData.to_branch_id) {
      setError("From and To branches cannot be the same")
      return
    }

    const quantity = parseInt(formData.quantity)
    if (quantity <= 0) {
      setError("Quantity must be greater than 0")
      return
    }

    const selectedProduct = products.find(p => p.id === formData.product_id)
    if (selectedProduct && quantity > selectedProduct.quantity) {
      setError(`Insufficient stock. Available: ${selectedProduct.quantity} ${selectedProduct.unit}`)
      return
    }

    try {
      setSubmitting(true)
      setError("")
      setSuccess("")
      
      const response = await createStockTransfer({
        product_id: formData.product_id,
        from_branch_id: formData.from_branch_id,
        to_branch_id: formData.to_branch_id,
        quantity: quantity,
        reason: formData.reason
      })
      
      if (response.error) {
        setError(response.error)
        return
      }
      
      setSuccess("Stock transfer request created successfully!")
      setFormData({
        product_id: "",
        from_branch_id: "",
        to_branch_id: "",
        quantity: "",
        reason: ""
      })
    } catch (err) {
      setError("Failed to create stock transfer request")
      console.error("Error creating stock transfer:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const getSelectedProduct = () => {
    return products.find(p => p.id === formData.product_id)
  }

  if (loading) {
    return (
      <Layout title="New Stock Transfer">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="New Stock Transfer">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/stock-transfers">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">New Stock Transfer</h2>
            <p className="text-gray-600">Request a product transfer between branches</p>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Transfer Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Selection */}
              <div className="space-y-2">
                <Label htmlFor="product">Product *</Label>
                <Select
                  value={formData.product_id}
                  onValueChange={(value) => handleInputChange("product_id", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{product.name}</span>
                          <span className="text-sm text-gray-500">
                            {product.code} • Stock: {product.quantity} {product.unit}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Product Details */}
              {getSelectedProduct() && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Product Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2 font-medium">
                        TSh {parseFloat(getSelectedProduct()!.price).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Available Stock:</span>
                      <span className="ml-2 font-medium">
                        {getSelectedProduct()!.quantity} {getSelectedProduct()!.unit}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Branch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="from_branch">From Branch *</Label>
                  <Select
                    value={formData.from_branch_id}
                    onValueChange={(value) => handleInputChange("from_branch_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select source branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.filter(branch => branch.is_active).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{branch.name}</span>
                            <span className="text-sm text-gray-500">{branch.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="to_branch">To Branch *</Label>
                  <Select
                    value={formData.to_branch_id}
                    onValueChange={(value) => handleInputChange("to_branch_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination branch" />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.filter(branch => branch.is_active).map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{branch.name}</span>
                            <span className="text-sm text-gray-500">{branch.location}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange("quantity", e.target.value)}
                  placeholder="Enter quantity"
                />
                {getSelectedProduct() && (
                  <p className="text-sm text-gray-500">
                    Available: {getSelectedProduct()!.quantity} {getSelectedProduct()!.unit}
                  </p>
                )}
              </div>

              {/* Reason */}
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Transfer *</Label>
                <Textarea
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                  placeholder="Explain why this transfer is needed..."
                  rows={3}
                />
              </div>

              {/* Total Value */}
              {getSelectedProduct() && formData.quantity && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Transfer Summary</h4>
                  <div className="text-sm text-blue-700">
                    <p>Total Value: TSh {(parseFloat(getSelectedProduct()!.price) * parseInt(formData.quantity)).toLocaleString()}</p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Link href="/dashboard/stock-transfers">
                  <Button variant="outline" type="button">
                    Cancel
                  </Button>
                </Link>
                <Button type="submit" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Create Transfer Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
} 