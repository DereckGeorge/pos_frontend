"use client"

import type React from "react"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { productCategories, mockLocations } from "@/lib/mockData"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createProduct, getAllBranches } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    cost: "",
    stock: "",
    minStock: "",
    barcode: "",
    category: "",
    branch_id: ""
  })
  const [branches, setBranches] = useState<{ id: string; name: string; address: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [branchesLoading, setBranchesLoading] = useState(true)

  useEffect(() => {
    async function fetchBranches() {
      try {
        setBranchesLoading(true)
        const response = await getAllBranches()
        console.log("Branches API response:", response) // Debug log
        
        if (response.error) {
          console.error("Error fetching branches:", response.error)
          // Fallback to mock branches if API fails
          const mockBranches = mockLocations.map(loc => ({
            id: loc.id,
            name: loc.name,
            address: loc.address
          }))
          setBranches(mockBranches)
          setBranchesLoading(false)
          return
        }

        let branchesData = []
        
        // Handle the correct API response structure
        if (response.data && response.data.data && response.data.data.branches) {
          branchesData = response.data.data.branches
        } else if (response.data && response.data.branches) {
          branchesData = response.data.branches
        } else if (Array.isArray(response.data)) {
          branchesData = response.data
        }

        console.log("Processed branches data:", branchesData) // Debug log
        
        // If no branches found from API, use mock data
        if (branchesData.length === 0) {
          console.log("No branches from API, using mock data")
          branchesData = mockLocations.map(loc => ({
            id: loc.id,
            name: loc.name,
            address: loc.address
          }))
        }
        
        setBranches(branchesData)
        setBranchesLoading(false)
      } catch (error) {
        console.error("Error in fetchBranches:", error)
        // Fallback to mock branches on error
        const mockBranches = mockLocations.map(loc => ({
          id: loc.id,
          name: loc.name,
          address: loc.address
        }))
        setBranches(mockBranches)
        setBranchesLoading(false)
      }
    }
    fetchBranches()
    // Pre-select manager's branch
    if (user?.role === "manager" && user?.locationId) {
      setFormData(prev => ({
        ...prev,
        branch_id: user.locationId!
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (!formData.name || !formData.price || !formData.cost || !formData.category || !formData.branch_id) {
      setError("Please fill in all required fields")
      setLoading(false)
      return
    }

    const payload = {
      name: formData.name,
      code: formData.barcode,
      description: formData.description,
      price: Number(formData.price),
      cost_price: Number(formData.cost),
      quantity: Number(formData.stock),
      reorder_level: Number(formData.minStock),
      unit: "pcs", // You can add a unit field if needed
      category: formData.category,
      branch_id: formData.branch_id
    }

    const response = await createProduct(payload)
    setLoading(false)
    if (response.error) {
      setError(response.error)
      return
    }
    router.push("/dashboard/products")
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const generateBarcode = () => {
    const barcode = Math.random().toString().slice(2, 14)
    handleChange("barcode", barcode)
  }

  return (
    <Layout title="Add New Product">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/products">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Add New Product</h2>
            <p className="text-gray-600">Add a new product to your inventory</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Selling Price *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => handleChange("price", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cost">Cost Price *</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.cost}
                    onChange={(e) => handleChange("cost", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Initial Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={formData.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="minStock">Minimum Stock</Label>
                  <Input
                    id="minStock"
                    type="number"
                    placeholder="0"
                    value={formData.minStock}
                    onChange={(e) => handleChange("minStock", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="barcode"
                      placeholder="Enter or generate barcode"
                      value={formData.barcode}
                      onChange={(e) => handleChange("barcode", e.target.value)}
                    />
                    <Button type="button" variant="outline" onClick={generateBarcode}>
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {productCategories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="branch_id">Branch *</Label>
                <Select 
                  value={formData.branch_id} 
                  onValueChange={(value) => handleChange("branch_id", value)}
                  disabled={user?.role === "manager"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={branchesLoading ? "Loading branches..." : "Select branch"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchesLoading ? (
                      <SelectItem value="loading" disabled>
                        Loading branches...
                      </SelectItem>
                    ) : (
                      branches.map((branch) => (
                        <SelectItem key={branch.id} value={branch.id}>
                          {branch.name} - {branch.address}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {user?.role === "manager" && (
                  <p className="text-sm text-gray-500">
                    Branch is automatically set to your assigned branch
                  </p>
                )}
              </div>

              {/* Profit Calculation */}
              {formData.price && formData.cost && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Profit Calculation</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Selling Price:</span>
                      <p className="font-semibold">TSh {Number.parseFloat(formData.price || "0").toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Cost Price:</span>
                      <p className="font-semibold">TSh {Number.parseFloat(formData.cost || "0").toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Profit:</span>
                      <p className="font-semibold text-green-600">
                        TSh {(Number.parseFloat(formData.price || "0") - Number.parseFloat(formData.cost || "0")).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && <p className="text-red-600 text-sm">{error}</p>}

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Adding..." : "Add Product"}
                </Button>
                <Link href="/dashboard/products">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
