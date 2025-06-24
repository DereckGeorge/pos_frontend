"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { mockExpenses, expenseCategories } from "@/lib/mockData"
import { Plus, Eye, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(mockExpenses)

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
      Other: "bg-gray-100 text-gray-800",
    }
    return colors[category] || "bg-gray-100 text-gray-800"
  }

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter((expense) => expense.id !== id))
    }
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const expensesByCategory = expenseCategories
    .map((category) => ({
      category,
      amount: expenses.filter((e) => e.category === category).reduce((sum, e) => sum + e.amount, 0),
      count: expenses.filter((e) => e.category === category).length,
    }))
    .filter((item) => item.count > 0)

  return (
    <Layout title="Expense Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Expenses</h2>
            <p className="text-gray-600">Track and manage business expenses</p>
          </div>
          <Link href="/dashboard/expenses/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Expense
            </Button>
          </Link>
        </div>

        {/* Expense Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-sm text-gray-600">Total Expenses</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${totalExpenses.toFixed(2)}</div>
              <p className="text-sm text-gray-600">Total Amount</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">${(totalExpenses / expenses.length).toFixed(2)}</div>
              <p className="text-sm text-gray-600">Average Expense</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{expensesByCategory.length}</div>
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
              {expensesByCategory.map((item) => (
                <div key={item.category} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(item.category)}>{item.category}</Badge>
                    <span className="text-sm text-gray-600">{item.count} items</span>
                  </div>
                  <div className="text-xl font-semibold">${item.amount.toFixed(2)}</div>
                </div>
              ))}
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
                          {expense.createdByName} • {formatDate(expense.date)}
                        </p>
                        {expense.notes && <p className="text-sm text-gray-500 mt-1">{expense.notes}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <p className="text-lg font-semibold">${expense.amount.toFixed(2)}</p>
                    <Badge className={getCategoryColor(expense.category)}>{expense.category}</Badge>
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
    </Layout>
  )
}
