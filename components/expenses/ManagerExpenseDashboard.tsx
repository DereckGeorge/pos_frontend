"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getCashierExpenses } from "@/lib/api"
import { Plus, Eye, Edit, Trash2, Loader2, FolderPlus, FolderOpen } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { AddExpenseCategoryForm } from "@/components/expenses/AddExpenseCategoryForm"

interface ApiExpense {
  id: string
  amount: string
  description: string
  expense_date: string
  created_at: string
  payment_method: string
  receipt_number: string
  category: {
    id: string
    name: string
  } | null
  branch: {
    id: string
    name: string
  }
  creator: {
    id: string
    name: string
    email: string
    position: string
  }
}

interface ApiExpenseStatistics {
  success: boolean
  message: string
  data: {
    overview: {
      total_expenses: number
      total_amount: string
      average_amount: string
      total_categories: number
    }
    category_totals: Array<{
      category_name: string
      total_amount: string | number
      expense_count: number
    }>
    recent_expenses: ApiExpense[]
  }
}

export default function ManagerExpenseDashboard() {
  const [expenses, setExpenses] = useState<ApiExpense[]>([])
  const [statistics, setStatistics] = useState({
    total_expenses: 0,
    total_amount: "0",
    average_amount: "0",
    total_categories: 0
  })
  const [categoryTotals, setCategoryTotals] = useState<Array<{
    category_name: string
    total_amount: string | number
    expense_count: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  useEffect(() => {
    fetchExpenseStatistics()
  }, [])

  const fetchExpenseStatistics = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getCashierExpenses()
      
      if (response.error) {
        setError(response.error)
        return
      }

      // The API returns { statistics: {...}, expenses: { data: [...] } }
      setExpenses(response.expenses?.data || [])
      
      // Calculate unique categories from expenses
      const uniqueCategories = new Set()
      response.expenses?.data?.forEach((expense: any) => {
        if (expense.category?.name) {
          uniqueCategories.add(expense.category.name)
        }
      })
      
      setStatistics({
        total_expenses: response.statistics?.total_expenses || 0,
        total_amount: response.statistics?.total_amount?.toString() || "0",
        average_amount: response.statistics?.average_amount?.toString() || "0",
        total_categories: uniqueCategories.size
      })
      
      // For now, we'll set empty arrays for category totals since they're not in this response
      setCategoryTotals([])
    } catch (err) {
      setError("Failed to fetch expense statistics")
      console.error("Error fetching expense statistics:", err)
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      "Office Supplies": "bg-blue-100 text-blue-800",
      Utilities: "bg-green-100 text-green-800",
      Marketing: "bg-purple-100 text-purple-800",
      Maintenance: "bg-orange-100 text-orange-800",
      Equipment: "bg-red-100 text-red-800",
      Travel: "bg-indigo-100 text-indigo-800",
      "Food & Beverages": "bg-pink-100 text-pink-800",
      "Professional Services": "bg-teal-100 text-teal-800",
      Insurance: "bg-cyan-100 text-cyan-800",
      Salaries: "bg-yellow-100 text-yellow-800",
      Rent: "bg-gray-100 text-gray-800",
      Transportation: "bg-indigo-100 text-indigo-800",
      Miscellaneous: "bg-gray-100 text-gray-800",
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((expense) => expense.id !== id))
    }
  }

  const handleCategorySuccess = () => {
    setShowAddCategory(false)
    // Optionally refresh the expense statistics to show new categories
    fetchExpenseStatistics()
  }

  if (loading) {
    return (
      <Layout title="Expense Management">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading expense statistics...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Expense Management">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchExpenseStatistics}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Expense Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Expenses</h2>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => setShowAddCategory(true)}>
              <FolderPlus className="h-4 w-4 mr-2" />
              Add Category
            </Button>
            <Link href="/dashboard/expenses/categories">
              <Button variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                View Categories
              </Button>
            </Link>
            <Link href="/dashboard/expenses/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* Expense Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.total_expenses}</div>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">TSh {parseFloat(statistics.total_amount).toLocaleString()}</div>
              <p className="text-sm text-gray-600">Total Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">TSh {parseFloat(statistics.average_amount).toLocaleString()}</div>
              <p className="text-sm text-gray-600">Average Expense</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{statistics.total_categories}</div>
              <p className="text-sm text-gray-600">Categories</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(() => {
                // Calculate category totals from expenses data
                const categoryMap = new Map<string, { total: number; count: number }>()
                
                expenses.forEach(expense => {
                  const categoryName = expense.category?.name || "Uncategorized"
                  const amount = parseFloat(expense.amount)
                  
                  if (categoryMap.has(categoryName)) {
                    const existing = categoryMap.get(categoryName)!
                    existing.total += amount
                    existing.count += 1
                  } else {
                    categoryMap.set(categoryName, { total: amount, count: 1 })
                  }
                })
                
                return Array.from(categoryMap.entries()).map(([categoryName, data]) => (
                  <div key={categoryName} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={getCategoryColor(categoryName)}>{categoryName}</Badge>
                      <span className="text-sm text-gray-600">{data.count} items</span>
                    </div>
                    <div className="text-xl font-semibold">TSh {data.total.toLocaleString()}</div>
                  </div>
                ))
              })()}
            </div>
          </CardContent>
        </Card>

        {/* Expenses List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {expense.creator.name} • {formatDate(expense.expense_date)}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">{expense.branch.name} • {expense.payment_method}</p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold">TSh {parseFloat(expense.amount).toLocaleString()}</p>
                    <Badge className={getCategoryColor(expense.category?.name || "")}>{expense.category?.name || "Uncategorized"}</Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Handle view expense
                        alert(`Viewing expense: ${expense.description}`)
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Handle edit expense
                        alert(`Editing expense: ${expense.description}`)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Category Form */}
      {showAddCategory && (
        <AddExpenseCategoryForm
          onClose={() => setShowAddCategory(false)}
          onSuccess={handleCategorySuccess}
        />
      )}
    </Layout>
  )
} 