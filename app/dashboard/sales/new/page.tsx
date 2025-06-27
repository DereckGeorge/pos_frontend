"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { getCashierProducts, createSale } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"
import { formatTSh } from "@/lib/mockData"
import Receipt from "@/components/sales/Receipt"

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
  branch: {
    id: string
    name: string
    location: string
  }
}

interface CartItem {
  product: Product
  quantity: number
  unitPrice: number
  totalPrice: number
}

export default function NewSalePage() {
  const router = useRouter()
  const { user, userLocation } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [showReceipt, setShowReceipt] = useState(false)
  const [saleReceipt, setSaleReceipt] = useState<any>(null)

  const [checkoutData, setCheckoutData] = useState({
    payment_method: "cash",
    payment_reference: "",
    notes: ""
  })

  const categories = [
    "All",
    "Electronics",
    "Clothing",
    "Food & Beverages",
    "Home & Garden",
    "Sports",
    "Books",
    "Other"
  ]

  useEffect(() => {
    fetchProducts()
  }, [searchTerm, selectedCategory])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError("")
      const params: any = {}
      if (searchTerm) params.search = searchTerm
      if (selectedCategory && selectedCategory !== "All") params.category = selectedCategory
      
      const response = await getCashierProducts(params)
      
      if (response?.error) {
        setError(response.error)
        return
      }
      
      // The API returns { success, message, data: { products: [...] } }
      setProducts(response?.data?.products || [])
    } catch (err) {
      console.error("Error fetching products:", err)
      setError("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.product.id === product.id)
    
    if (existingItem) {
      // Update quantity if already in cart
      if (existingItem.quantity < product.quantity) {
        setCart(cart.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1, totalPrice: (item.quantity + 1) * item.unitPrice }
            : item
        ))
      }
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        product,
        quantity: 1,
        unitPrice: parseFloat(product.price),
        totalPrice: parseFloat(product.price)
      }
      setCart([...cart, newItem])
    }
  }

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId)
      return
    }

    const product = products.find(p => p.id === productId)
    if (product && newQuantity <= product.quantity) {
      setCart(cart.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity, totalPrice: newQuantity * item.unitPrice }
          : item
      ))
    }
  }

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId))
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.totalPrice, 0)
  }

  const getCartItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0)
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setError("Please add items to cart before checkout")
      return
    }

    if (!checkoutData.payment_method) {
      setError("Please select a payment method")
      return
    }

    try {
      setSubmitting(true)
      setError("")
      
      const saleData = {
        items: cart.map(item => ({
          product_id: item.product.id,
          quantity: item.quantity
        })),
        payment_method: checkoutData.payment_method,
        payment_reference: checkoutData.payment_reference,
        notes: checkoutData.notes
      }

      const response = await createSale(saleData)
      
      if (response.error) {
        setError(response.error)
        return
      }

      // Generate receipt data
      const subtotal = getCartTotal()
      const vatAmount = subtotal * 0.18 // 18% VAT
      const totalAmount = subtotal + vatAmount

      const receiptData = {
        id: response.data?.id || `SALE_${Date.now()}`,
        receipt_number: response.data?.receipt_number || `RCP_${Date.now()}`,
        date: new Date().toISOString(),
        items: cart.map(item => ({
          product_name: item.product.name,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.totalPrice
        })),
        subtotal: subtotal,
        vat_amount: vatAmount,
        total_amount: totalAmount,
        payment_method: checkoutData.payment_method,
        payment_reference: checkoutData.payment_reference,
        cashier_name: user?.name || "Cashier",
        branch_name: userLocation?.name || "Branch",
        branch_location: userLocation?.address || "Location"
      }

      setSaleReceipt(receiptData)
      setShowReceipt(true)
      setSuccess(true)
    } catch (err) {
      setError("Failed to create sale")
      console.error("Error creating sale:", err)
    } finally {
      setSubmitting(false)
    }
  }

  const clearCart = () => {
    setCart([])
  }

  return (
    <Layout title="New Sale">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Products Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">New Sale</h2>
              <p className="text-gray-600">Select products for {userLocation?.name || "your branch"}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card>
            <CardHeader>
              <CardTitle>Available Products</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map((product) => {
                    const cartItem = cart.find(item => item.product.id === product.id)
                    const inCart = cartItem ? cartItem.quantity : 0
                    
                    return (
                      <div key={product.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold">{product.name}</h3>
                            <p className="text-sm text-gray-600">{product.description}</p>
                            <p className="text-xs text-gray-500">Code: {product.code}</p>
                          </div>
                          <Badge variant={product.quantity > 0 ? "default" : "destructive"}>
                            {product.quantity > 0 ? `${product.quantity} ${product.unit}` : "Out of Stock"}
                          </Badge>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="text-lg font-bold">{formatTSh(parseFloat(product.price))}</div>
                          <div className="flex items-center space-x-2">
                            {inCart > 0 && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateQuantity(product.id, inCart - 1)}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <span className="text-sm font-medium">{inCart}</span>
                              </>
                            )}
                            <Button
                              size="sm"
                              onClick={() => addToCart(product)}
                              disabled={product.quantity === 0}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cart Section */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart ({getCartItemCount()})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Cart is empty</p>
                  <p className="text-sm text-gray-500">Add products to get started</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.product.name}</h4>
                          <p className="text-xs text-gray-600">{formatTSh(item.unitPrice)} × {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-sm">{formatTSh(item.totalPrice)}</div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeFromCart(item.product.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Cart Total */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatTSh(getCartTotal())}</span>
                    </div>
                  </div>

                  {/* Checkout Form */}
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_method">Payment Method *</Label>
                      <Select 
                        value={checkoutData.payment_method} 
                        onValueChange={(value) => setCheckoutData(prev => ({ ...prev, payment_method: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="mpesa">M-Pesa</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="payment_reference">Payment Reference</Label>
                      <Input
                        id="payment_reference"
                        placeholder="Payment reference"
                        value={checkoutData.payment_reference}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, payment_reference: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        placeholder="Additional notes (optional)"
                        value={checkoutData.notes}
                        onChange={(e) => setCheckoutData(prev => ({ ...prev, notes: e.target.value }))}
                        rows={2}
                      />
                    </div>

                    {error && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}

                    {success && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm">Sale completed successfully! Receipt is ready.</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button 
                        onClick={handleCheckout} 
                        className="w-full" 
                        disabled={submitting || cart.length === 0}
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        {submitting ? "Processing..." : "Complete Sale"}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        onClick={clearCart}
                        className="w-full"
                        disabled={cart.length === 0}
                      >
                        Clear Cart
                      </Button>

                      {success && (
                        <Button 
                          variant="outline" 
                          onClick={() => router.push("/dashboard/sales")}
                          className="w-full"
                        >
                          View All Sales
                        </Button>
                      )}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receipt Modal */}
      {showReceipt && saleReceipt && (
        <Receipt 
          sale={saleReceipt} 
          onClose={() => {
            setShowReceipt(false)
            setSaleReceipt(null)
            setSuccess(false)
            setCart([])
            router.push("/dashboard/sales")
          }} 
        />
      )}
    </Layout>
  )
}
