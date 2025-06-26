"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createExpense, getExpenseCategories } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"

interface ExpenseCategory {
  id: string
  name: string
  description: string
  is_active: boolean
}

export default function NewExpensePage() {
  const router = useRouter()
  const { user } = useAuth()
  const [categories, setCategories] = useState<ExpenseCategory[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    expense_category_id: "",
    amount: "",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
    receipt_number: "",
    payment_method: "cash",
    payment_reference: ""
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await getExpenseCategories()
      setCategories(response.categories || [])
    } catch (err) {
      console.error("Error fetching categories:", err)
      setError("Failed to load expense categories")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.expense_category_id || !formData.amount || !formData.description) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      await createExpense({
        ...formData,
        amount: parseFloat(formData.amount)
      })

      router.push("/dashboard/expenses")
    } catch (err) {
      setError("Failed to create expense")
      console.error("Error creating expense:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Layout title="Record New Expense">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Link href="/dashboard/expenses">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold">Record New Expense</h2>
            <p className="text-gray-600">Add a new business expense for {user?.locationName || "your branch"}</p>
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Expense Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select 
                    value={formData.expense_category_id} 
                    onValueChange={(value) => handleChange("expense_category_id", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Amount (TSh) *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => handleChange("amount", e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter expense description"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.expense_date}
                    onChange={(e) => handleChange("expense_date", e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="receipt">Receipt Number</Label>
                  <Input
                    id="receipt"
                    placeholder="Receipt number"
                    value={formData.receipt_number}
                    onChange={(e) => handleChange("receipt_number", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Payment Method</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(value) => handleChange("payment_method", value)}
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
                  <Label htmlFor="reference">Payment Reference</Label>
                  <Input
                    id="reference"
                    placeholder="Payment reference"
                    value={formData.payment_reference}
                    onChange={(e) => handleChange("payment_reference", e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              <div className="flex space-x-4">
                <Button type="submit" className="flex-1" disabled={loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Record Expense"}
                </Button>
                <Link href="/dashboard/expenses">
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
