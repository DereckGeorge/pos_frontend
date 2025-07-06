"use client"

import type React from "react"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productCategories } from "@/lib/mockData"
import { ArrowLeft, Save, Plus, Trash2, Package } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBatch, getProducts, getAllBranches } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"

interface Product {
  id: string
  name: string
  code: string
  description: string
  price: string
  cost_price: string
  quantity: number
  reorder_level: number
  unit: string
  category: string
  branch_id: string
}

interface BatchItem {
  id: string
  type: "existing" | "new"
  product_id?: string
  name?: string
  code?: string
  description?: string
  price?: string
  cost_price?: string
  quantity: string
  reorder_level?: string
  unit?: string
  category?: string
  expiry_date?: string
  loan_amount?: string
  loan_paid?: string
}

const UNITS = ["pcs", "kg", "g", "l", "ml", "box", "pack", "bottle", "can", "bag"]

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [existingProducts, setExistingProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [productsLoading, setProductsLoading] = useState(true)
  const [batchItems, setBatchItems] = useState<BatchItem[]>([])
  const [supplierInfo, setSupplierInfo] = useState({
    supplier_name: "",
    supplier_phone: "",
    supplier_email: "",
    supplier_address: "",
    delivery_date: new Date().toISOString().split('T')[0],
    branch_id: ""
  })
  const [branches, setBranches] = useState<{ id: string, name: string }[]>([])
  const [productSearchTerm, setProductSearchTerm] = useState("")
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null)
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<string>("")

  useEffect(() => {
    fetchExistingProducts()
    console.log("User role:", user?.role)
    if (user?.role === "superuser") {
      console.log("Fetching branches for superuser")
      fetchBranches()
    }
  }, [])

  // Debounced search effect
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout)
    }

    const timeout = setTimeout(() => {
      fetchExistingProducts()
    }, 500) // 500ms delay

    setSearchTimeout(timeout)

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [productSearchTerm])

  // Handle clicking outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (!target.closest('.product-search-container')) {
        setShowProductDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchExistingProducts = async () => {
    try {
      setProductsLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (productSearchTerm) {
        params.append('search', productSearchTerm)
      }
      
      const response = await getProducts(params.toString())
        
        if (response.error) {
        console.error("Error fetching products:", response.error)
        setExistingProducts([])
          return
        }

      // Handle the API response structure
      let productsData = []
      if (response.data && response.data.data && response.data.data.products) {
        productsData = response.data.data.products
      } else if (response.data && response.data.products) {
        productsData = response.data.products
        } else if (Array.isArray(response.data)) {
        productsData = response.data
      }

      // Filter products for the current user's branch if they're a manager
      if (user?.role === "manager" && user?.locationId) {
        productsData = productsData.filter((product: Product) => 
          product.branch_id === user.locationId
        )
      }

      setExistingProducts(productsData)
      } catch (error) {
      console.error("Error in fetchExistingProducts:", error)
      setExistingProducts([])
    } finally {
      setProductsLoading(false)
    }
  }

  const fetchBranches = async () => {
    try {
      console.log("Making API call to fetch branches")
      const response = await getAllBranches()
      console.log("Branches API response:", response)
      
      let branchesData = []
      if (response.data && response.data.data && response.data.data.branches) {
        branchesData = response.data.data.branches
        console.log("Extracted branches from response.data.data.branches:", branchesData)
      } else if (response.data && response.data.branches) {
        branchesData = response.data.branches
        console.log("Extracted branches from response.data.branches:", branchesData)
      } else if (Array.isArray(response.data)) {
        branchesData = response.data
        console.log("Extracted branches from response.data array:", branchesData)
      }
      
      console.log("Final branches data to set:", branchesData)
      setBranches(branchesData)
    } catch (error) {
      console.error("Error fetching branches:", error)
      setBranches([])
    }
  }

  const addExistingProduct = () => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      type: "existing",
      product_id: "",
      quantity: "1",
      expiry_date: "",
      loan_amount: "0",
      loan_paid: "0"
    }
    setBatchItems([...batchItems, newItem])
  }

  const addNewProduct = () => {
    const newItem: BatchItem = {
      id: Date.now().toString(),
      type: "new",
      name: "",
      code: "",
      description: "",
      price: "",
      cost_price: "",
      quantity: "1",
      reorder_level: "0",
      unit: "pcs",
      category: "",
      expiry_date: "",
      loan_amount: "0",
      loan_paid: "0"
    }
    setBatchItems([...batchItems, newItem])
  }

  const removeItem = (id: string) => {
    setBatchItems(batchItems.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: string, value: string) => {
    setBatchItems(batchItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const generateBarcode = (id: string) => {
    const barcode = Math.random().toString().slice(2, 14)
    updateItem(id, "code", barcode)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!supplierInfo.supplier_name || !supplierInfo.delivery_date) {
      setError("Please fill in supplier name and delivery date")
      setLoading(false)
      return
    }

    if (user?.role === "superuser" && !supplierInfo.branch_id) {
      setError("Please select a branch")
      setLoading(false)
      return
    }

    if (batchItems.length === 0) {
      setError("Please add at least one product to the batch")
      setLoading(false)
      return
    }

    // Validate all items
    for (const item of batchItems) {
      if (!item.quantity || Number(item.quantity) <= 0) {
        setError("All products must have a valid quantity")
        setLoading(false)
        return
      }

      if (item.type === "existing" && !item.product_id) {
        setError("Please select a product for all existing product items")
        setLoading(false)
        return
      }

      if (item.type === "new") {
        if (!item.name || !item.code || !item.price || !item.cost_price || !item.category) {
          setError("Please fill in all required fields for new products")
          setLoading(false)
          return
        }
      }
    }

    const payload = {
      supplier_name: supplierInfo.supplier_name,
      branch_id: user?.role === "superuser" ? supplierInfo.branch_id : user?.locationId || "",
      delivery_date: supplierInfo.delivery_date,
      supplier_phone: supplierInfo.supplier_phone || undefined,
      supplier_email: supplierInfo.supplier_email || undefined,
      supplier_address: supplierInfo.supplier_address || undefined,
      items: batchItems.map(item => {
        if (item.type === "existing") {
          return {
            product_id: item.product_id,
            quantity: Number(item.quantity),
            expiry_date: item.expiry_date || undefined,
            loan_amount: Number(item.loan_amount || 0),
            loan_paid: Number(item.loan_paid || 0)
          }
        } else {
          return {
            name: item.name,
            code: item.code,
            description: item.description || undefined,
            price: Number(item.price),
            cost_price: Number(item.cost_price),
            quantity: Number(item.quantity),
            reorder_level: Number(item.reorder_level || 0),
            unit: item.unit || "pcs",
            category: item.category,
            expiry_date: item.expiry_date || undefined,
            loan_amount: Number(item.loan_amount || 0),
            loan_paid: Number(item.loan_paid || 0)
          }
        }
      })
    }

    const response = await createBatch(payload)
    setLoading(false)
    
    if (response.error) {
      setError(response.error)
      return
    }
    
    router.push("/dashboard/products")
  }

  const handleSupplierChange = (field: string, value: string) => {
    setSupplierInfo(prev => ({ ...prev, [field]: value }))
  }

  const calculateTotalLoan = () => {
    return batchItems.reduce((total, item) => 
      total + Number(item.loan_amount || 0), 0
    )
  }

  const calculateTotalPaid = () => {
    return batchItems.reduce((total, item) => 
      total + Number(item.loan_paid || 0), 0
    )
  }

  const handleProductSearch = (value: string) => {
    setProductSearchTerm(value)
    setShowProductDropdown(true)
  }

  const selectProduct = (product: Product) => {
    setSelectedProductId(product.id)
    setProductSearchTerm(product.name)
    setShowProductDropdown(false)
    // Update the batch item with the selected product
    setBatchItems(batchItems.map(item => 
      item.type === "existing" ? { ...item, product_id: product.id } : item
    ))
  }

  return (
    <Layout title="Create Product Batch">
      <div className="max-w-6xl mx-auto space-y-6">
        

        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Create Product Batch</h2>
            <p className="text-gray-600">Add stock to existing products and create new products in one batch</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Information */}
        <Card>
          <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
          </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Branch selection for superuser */}
                {user?.role === "superuser" && (
                  <div className="space-y-2">
                    <Label htmlFor="branch_id">Branch *</Label>
                    <Select
                      value={supplierInfo.branch_id}
                      onValueChange={value => handleSupplierChange("branch_id", value)}
                    >
                      <SelectTrigger id="branch_id">
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {/* End branch selection */}
                <div className="space-y-2">
                  <Label htmlFor="supplier_name">Supplier Name *</Label>
                  <Input
                    id="supplier_name"
                    placeholder="Enter supplier name"
                    value={supplierInfo.supplier_name}
                    onChange={(e) => handleSupplierChange("supplier_name", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delivery_date">Delivery Date *</Label>
                  <Input
                    id="delivery_date"
                    type="date"
                    value={supplierInfo.delivery_date}
                    onChange={(e) => handleSupplierChange("delivery_date", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_phone">Supplier Phone</Label>
                  <Input
                    id="supplier_phone"
                    placeholder="Enter supplier phone"
                    value={supplierInfo.supplier_phone}
                    onChange={(e) => handleSupplierChange("supplier_phone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supplier_email">Supplier Email</Label>
                  <Input
                    id="supplier_email"
                    type="email"
                    placeholder="Enter supplier email"
                    value={supplierInfo.supplier_email}
                    onChange={(e) => handleSupplierChange("supplier_email", e.target.value)}
                  />
                </div>
              </div>

                <div className="space-y-2">
                <Label htmlFor="supplier_address">Supplier Address</Label>
                <Textarea
                  id="supplier_address"
                  placeholder="Enter supplier address"
                  value={supplierInfo.supplier_address}
                  onChange={(e) => handleSupplierChange("supplier_address", e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Batch Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Batch Items ({batchItems.length})</CardTitle>
                <div className="space-x-2">
                  <Button type="button" variant="outline" onClick={addExistingProduct}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Existing Product
                  </Button>
                  <Button type="button" variant="outline" onClick={addNewProduct}>
                    <Package className="h-4 w-4 mr-2" />
                    Add New Product
                    </Button>
                  </div>
                </div>
            </CardHeader>
            <CardContent>
              {batchItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No products added to batch yet</p>
                  <p className="text-sm">Click the buttons above to add products</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batchItems.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium">
                          {item.type === "existing" ? "Existing Product" : "New Product"} #{index + 1}
                        </h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeItem(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
              </div>

                      {item.type === "existing" ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                              <Label>Search Products</Label>
                              <div className="relative product-search-container">
                                <Input
                                  placeholder="Search by product name..."
                                  value={productSearchTerm}
                                  onChange={(e) => handleProductSearch(e.target.value)}
                                  onFocus={() => setShowProductDropdown(true)}
                                />
                                {showProductDropdown && (
                                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                                    {productsLoading ? (
                                      <div className="p-3 text-sm text-gray-500">Loading products...</div>
                                    ) : existingProducts.length === 0 ? (
                                      <div className="p-3 text-sm text-gray-500">No products found</div>
                                    ) : (
                                      existingProducts.map((product) => (
                                        <div
                                          key={product.id}
                                          className="p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
                                          onClick={() => selectProduct(product)}
                                        >
                                          <div className="font-medium">{product.name}</div>
                                          <div className="text-sm text-gray-600">
                                            Code: {product.code} | Category: {product.category}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            Stock: {product.quantity} | Price: TSh {parseFloat(product.price).toLocaleString()}
                                          </div>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <Label>Quantity *</Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                min="1"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Expiry Date</Label>
                              <Input
                                type="date"
                                value={item.expiry_date || ""}
                                onChange={(e) => updateItem(item.id, "expiry_date", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Product Name *</Label>
                              <Input
                                placeholder="Enter product name"
                                value={item.name || ""}
                                onChange={(e) => updateItem(item.id, "name", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Product Code *</Label>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Enter product code"
                                  value={item.code || ""}
                                  onChange={(e) => updateItem(item.id, "code", e.target.value)}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => generateBarcode(item.id)}
                                >
                                  Generate
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                              placeholder="Enter product description"
                              value={item.description || ""}
                              onChange={(e) => updateItem(item.id, "description", e.target.value)}
                              rows={2}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-2">
                              <Label>Selling Price *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.price || ""}
                                onChange={(e) => updateItem(item.id, "price", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Cost Price *</Label>
                              <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={item.cost_price || ""}
                                onChange={(e) => updateItem(item.id, "cost_price", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Quantity *</Label>
                              <Input
                                type="number"
                                placeholder="1"
                                value={item.quantity}
                                onChange={(e) => updateItem(item.id, "quantity", e.target.value)}
                                min="1"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Min Stock</Label>
                              <Input
                                type="number"
                                placeholder="0"
                                value={item.reorder_level || ""}
                                onChange={(e) => updateItem(item.id, "reorder_level", e.target.value)}
                                min="0"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label>Category *</Label>
                              <Input
                                placeholder="Enter category"
                                value={item.category || ""}
                                onChange={(e) => updateItem(item.id, "category", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Unit</Label>
                              <Input
                                placeholder="e.g., pcs, kg, l"
                                value={item.unit || ""}
                                onChange={(e) => updateItem(item.id, "unit", e.target.value)}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label>Expiry Date</Label>
                              <Input
                                type="date"
                                value={item.expiry_date || ""}
                                onChange={(e) => updateItem(item.id, "expiry_date", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Loan Information */}
                      <div className="mt-4 pt-4 border-t">
                        <h5 className="font-medium mb-3">Loan Information (Optional)</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Loan Amount</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.loan_amount || ""}
                              onChange={(e) => updateItem(item.id, "loan_amount", e.target.value)}
                              min="0"
                            />
              </div>

                          <div className="space-y-2">
                            <Label>Amount Paid</Label>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={item.loan_paid || ""}
                              onChange={(e) => updateItem(item.id, "loan_paid", e.target.value)}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Batch Summary */}
          {batchItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{batchItems.length}</div>
                    <p className="text-sm text-gray-600">Total Items</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {batchItems.filter(item => item.type === "new").length}
                    </div>
                    <p className="text-sm text-gray-600">New Products</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {batchItems.filter(item => item.type === "existing").length}
                    </div>
                    <p className="text-sm text-gray-600">Existing Products</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      TSh {calculateTotalLoan().toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Loan</p>
                  </div>
                </div>
                
                {calculateTotalLoan() > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h5 className="font-medium mb-2">Loan Summary</h5>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total Loan:</span>
                        <p className="font-semibold">TSh {calculateTotalLoan().toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount Paid:</span>
                        <p className="font-semibold">TSh {calculateTotalPaid().toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Remaining:</span>
                        <p className="font-semibold text-red-600">
                          TSh {(calculateTotalLoan() - calculateTotalPaid()).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
              {loading ? "Creating Batch..." : "Create Batch"}
                </Button>
                <Link href="/dashboard/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
      </div>
    </Layout>
  )
}
