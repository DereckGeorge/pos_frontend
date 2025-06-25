"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getExpenseCategories, deleteExpenseCategory } from "@/lib/api"
import { Plus, ArrowLeft, Loader2, FolderOpen, Calendar, DollarSign, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { AddExpenseCategoryForm } from "@/components/expenses/AddExpenseCategoryForm"
import { EditExpenseCategoryForm } from "@/components/expenses/EditExpenseCategoryForm"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"

interface ApiExpenseCategory {
  id: string
  name: string
  description: string
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

interface ApiCategoryUsage {
  category_id: string
  category_name: string
  total_expenses: number
  total_amount: string
  last_used: string | null
}

interface ApiExpenseCategoriesResponse {
  message: string
  categories: ApiExpenseCategory[]
  recent_activities: {
    recent_expenses: Array<{
      expense_id: string
      branch: string
      category: string
      amount: string
      description: string
      created_by: string
      created_at: string
    }>
    category_usage: ApiCategoryUsage[]
  }
}

export default function ExpenseCategoriesPage() {
  const [categories, setCategories] = useState<ApiExpenseCategory[]>([])
  const [categoryUsage, setCategoryUsage] = useState<ApiCategoryUsage[]>([])
  const [recentExpenses, setRecentExpenses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [editingCategory, setEditingCategory] = useState<ApiExpenseCategory | null>(null)
  const [deletingCategory, setDeletingCategory] = useState<ApiExpenseCategory | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  useEffect(() => {
    fetchExpenseCategories()
  }, [])

  const fetchExpenseCategories = async () => {
    try {
      setLoading(true)
      setError("")
      const response = await getExpenseCategories()
      
      if (response.error) {
        setError(response.error)
        return
      }

      const data = response.data as ApiExpenseCategoriesResponse
      setCategories(data.categories)
      setCategoryUsage(data.recent_activities.category_usage)
      setRecentExpenses(data.recent_activities.recent_expenses)
    } catch (err) {
      setError("Failed to fetch expense categories")
      console.error("Error fetching expense categories:", err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
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
      "Cleanliness Fee": "bg-emerald-100 text-emerald-800",
      "Internet bundles": "bg-violet-100 text-violet-800",
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const handleCategorySuccess = () => {
    setShowAddCategory(false)
    fetchExpenseCategories()
  }

  const handleEditSuccess = () => {
    setEditingCategory(null)
    fetchExpenseCategories()
  }

  const handleDelete = (category: ApiExpenseCategory) => {
    setDeletingCategory(category)
  }

  const confirmDelete = async () => {
    if (!deletingCategory) return
    
    setDeleteLoading(true)
    try {
      const response = await deleteExpenseCategory(deletingCategory.id)
      
      if (response.error) {
        console.error("Error deleting category:", response.error)
        return
      }

      setDeletingCategory(null)
      fetchExpenseCategories()
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const activeCategories = categories.filter(cat => cat.is_active)
  const inactiveCategories = categories.filter(cat => !cat.is_active)

  if (loading) {
    return (
      <Layout title="Expense Categories">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading expense categories...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Expense Categories">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchExpenseCategories}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Expense Categories">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/expenses">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Expenses
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Expense Categories</h2>
              <p className="text-gray-600">Manage and view all expense categories</p>
            </div>
          </div>
          <Button onClick={() => setShowAddCategory(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{categories.length}</div>
              <p className="text-sm text-gray-600">Total Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{activeCategories.length}</div>
              <p className="text-sm text-gray-600">Active Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{inactiveCategories.length}</div>
              <p className="text-sm text-gray-600">Inactive Categories</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">
                {categoryUsage.filter(cat => cat.total_expenses > 0).length}
              </div>
              <p className="text-sm text-gray-600">Categories in Use</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Category Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryUsage.map((usage) => (
                <div key={usage.category_id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(usage.category_name)}>
                      {usage.category_name}
                    </Badge>
                    <span className="text-sm text-gray-600">{usage.total_expenses} expenses</span>
                  </div>
                  <div className="text-xl font-semibold mb-2">
                    TSh {parseFloat(usage.total_amount).toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">
                    {usage.last_used ? (
                      <span>Last used: {formatDate(usage.last_used)}</span>
                    ) : (
                      <span className="text-gray-400">Never used</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Active Categories ({activeCategories.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCategories.map((category) => (
                <div
                  key={category.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <FolderOpen className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{category.name}</p>
                        <p className="text-sm text-gray-600">{category.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Created: {formatDate(category.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Inactive Categories */}
        {inactiveCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Inactive Categories ({inactiveCategories.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {inactiveCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <FolderOpen className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-semibold text-gray-600">{category.name}</p>
                          <p className="text-sm text-gray-500">{category.description}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Created: {formatDate(category.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className="bg-gray-100 text-gray-600">Inactive</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setEditingCategory(category)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        onClick={() => handleDelete(category)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div
                  key={expense.expense_id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div>
                        <p className="font-semibold">{expense.description}</p>
                        <p className="text-sm text-gray-600">
                          {expense.created_by} • {expense.branch}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(expense.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold">TSh {parseFloat(expense.amount).toLocaleString()}</p>
                    <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
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

      {/* Edit Expense Category Form */}
      {editingCategory && (
        <EditExpenseCategoryForm
          category={editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={confirmDelete}
        title="Delete Category"
        message={`Are you sure you want to delete "${deletingCategory?.name}"? This action cannot be undone.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        loading={deleteLoading}
      />
    </Layout>
  )
} 