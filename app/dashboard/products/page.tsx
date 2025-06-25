"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getProducts, deleteProduct } from "@/lib/api"
import { Plus, Search, Edit, Trash2, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { EditProductForm } from "@/components/products/EditProductForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ApiProduct {
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
  created_by: string
  updated_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
  profit: number
  branch: {
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
    created_at: string
    updated_at: string
  }
}

interface ApiResponse {
  success: boolean
  message: string
  data: {
    statistics: {
      total_products: number
      out_of_stock_products: number
      low_stock_products: number
      inventory_value: number
    }
    products: ApiProduct[]
  }
}

export default function ProductsPage() {
  const [products, setProducts] = useState<ApiProduct[]>([])
  const [statistics, setStatistics] = useState({
    total_products: 0,
    out_of_stock_products: 0,
    low_stock_products: 0,
    inventory_value: 0
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<ApiProduct | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getProducts()
      
      if (response.error) {
        setError(response.error)
        return
      }

      const data = response.data as ApiResponse
      setProducts(data.data.products)
      setStatistics(data.data.statistics)
    } catch (err) {
      setError("Failed to fetch products")
      console.error("Error fetching products:", err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.includes(searchTerm),
  )

  const handleDelete = (id: string) => {
    const product = products.find(p => p.id === id)
    if (product) {
      setDeletingProduct(product)
    }
  }

  const confirmDelete = async () => {
    if (!deletingProduct) return
    
    setDeleteLoading(true)
    try {
      const response = await deleteProduct(deletingProduct.id)
      
      if (response.error) {
        console.error("Error deleting product:", response.error)
        // You could show an error message here
        return
      }

      // Remove the product from the local state
      setProducts(products.filter(product => product.id !== deletingProduct.id))
      setDeletingProduct(null)
    } catch (error) {
      console.error("Error deleting product:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleEditSuccess = () => {
    setEditingProduct(null)
    fetchProducts() // Refresh the products list
  }

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { label: "Out of Stock", color: "bg-red-100 text-red-800" }
    if (stock <= minStock) return { label: "Low Stock", color: "bg-orange-100 text-orange-800" }
    return { label: "In Stock", color: "bg-green-100 text-green-800" }
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Electronics: "bg-blue-100 text-blue-800",
      Computers: "bg-purple-100 text-purple-800",
      Tablets: "bg-green-100 text-green-800",
      Audio: "bg-pink-100 text-pink-800",
      Wearables: "bg-indigo-100 text-indigo-800",
      Accessories: "bg-yellow-100 text-yellow-800",
      Software: "bg-teal-100 text-teal-800",
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const lowStockProducts = products.filter((product) => product.quantity <= product.reorder_level)

  if (loading) {
    return (
      <Layout title="Product Management">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading products...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Product Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchProducts}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Product Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Products</h2>
            <p className="text-gray-600">Manage your product inventory</p>
          </div>
          <Link href="/dashboard/products/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Product Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.total_products}</div>
              <p className="text-sm text-gray-600">Total Products</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">TSh {statistics.inventory_value.toLocaleString()}</div>
              <p className="text-sm text-gray-600">Inventory Value</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-600">{statistics.low_stock_products}</div>
              <p className="text-sm text-gray-600">Low Stock</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{statistics.out_of_stock_products}</div>
              <p className="text-sm text-gray-600">Out of Stock</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search products by name, category, or code..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alert */}
        {lowStockProducts.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Low Stock Alert</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="p-3 bg-white rounded-lg border">
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {product.quantity} / Min: {product.reorder_level}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Products List */}
        <Card>
          <CardHeader>
            <CardTitle>Product Inventory ({filteredProducts.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredProducts.map((product) => {
                const stockStatus = getStockStatus(product.quantity, product.reorder_level)
                return (
                  <div
                    key={product.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-600">{product.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge className={getCategoryColor(product.category)}>{product.category}</Badge>
                            <Badge className={stockStatus.color}>{stockStatus.label}</Badge>
                            <Badge variant="outline">{product.branch.name}</Badge>
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-600">
                        <span>Code: {product.code}</span>
                        <span className="ml-4">Stock: {product.quantity} {product.unit}</span>
                        <span className="ml-4">Min Stock: {product.reorder_level}</span>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-lg font-semibold">TSh {parseFloat(product.price).toLocaleString()}</p>
                      <p className="text-sm text-gray-600">Cost: TSh {parseFloat(product.cost_price).toLocaleString()}</p>
                      <p className="text-sm text-green-600">Profit: TSh {product.profit.toLocaleString()}</p>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Handle edit product
                          setEditingProduct(product)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(product.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Product Form */}
      {editingProduct && (
        <EditProductForm
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deletingProduct?.name}"? This action cannot be undone.`}
        confirmText="Delete Product"
        cancelText="Cancel"
        loading={deleteLoading}
      />
    </Layout>
  )
}
