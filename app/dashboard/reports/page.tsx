"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, FileText, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react"
import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getReportStatistics, getManagerReportStatistics } from "@/lib/api"
import { useAuth } from "@/components/auth/AuthProvider"

export default function ReportsPage() {
  const { user } = useAuth()
  const [dateRange, setDateRange] = useState({
    startDate: "2024-01-01",
    endDate: "2024-01-31",
  })
  const [reportType, setReportType] = useState("sales")

  // API data state
  const [reportData, setReportData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!user) return
    fetchReportStatistics()
  }, [user])

  const fetchReportStatistics = async () => {
    try {
      setLoading(true)
      setError("")
      let response
      if (user?.role === "manager") {
        response = await getManagerReportStatistics()
      } else {
        response = await getReportStatistics()
      }
      if (response.error) {
        setError(response.error)
        return
      }
      setReportData(response.data.data)
    } catch (err) {
      setError("Failed to fetch report statistics")
      console.error("Error fetching report statistics:", err)
    } finally {
      setLoading(false)
    }
  }

  // Fallbacks for loading/error
  if (loading) {
    return (
      <Layout title="Reports & Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <span className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></span>
            <span>Loading report statistics...</span>
          </div>
        </div>
      </Layout>
    )
  }
  if (error) {
    return (
      <Layout title="Reports & Analytics">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchReportStatistics}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }
  if (!reportData) return null

  // Use API data instead of mock data
  const financial = reportData.financial_overview
  const totalSales = parseFloat(financial.total_sales)
  const totalExpenses = parseFloat(financial.total_expenses)
  const profit = parseFloat(financial.net_profit)
  const profitMargin = parseFloat(financial.net_profit_margin.replace("%", "").replace(/,/g, ""))

  // Sales by day
  const salesByDay = (reportData.sales_by_time?.daily || []).map((item: any) => ({
    date: item.date,
    amount: parseFloat(item.total_sales)
  }))
  const salesChartData = salesByDay

  // Expenses by category
  const expensesChartData = (reportData.expense_breakdown || []).map((item: any) => ({
    category: item.category,
    amount: parseFloat(item.amount)
  }))

  // Top selling products
  const topProducts = (reportData.top_selling_products || []).map((item: any) => ({
    name: item.product_name,
    quantity: parseInt(item.total_quantity)
  }))

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6"]

  // Recent transactions
  const recentTransactions = (reportData.recent_transactions || []).map((sale: any) => ({
    id: sale.sale_id,
    date: sale.date,
    total: parseFloat(sale.total_amount),
    items: sale.items || []
  }))

  // Detailed sales/expenses
  const detailedSales = reportData.detailed_sales || []
  const detailedExpenses = reportData.recent_activities?.recent_expenses || []

  const handleExport = (format: "csv" | "pdf") => {
    if (format === "csv") {
      exportToCSV()
    } else if (format === "pdf") {
      exportToPDF()
    }
  }

  const exportToCSV = () => {
    if (!reportData) return

    let csvContent = ""
    
    // Add header
    csvContent += "Report Type,Date Range,Generated On\n"
    csvContent += `${reportType.toUpperCase()},${dateRange.startDate} to ${dateRange.endDate},${new Date().toLocaleDateString()}\n\n`
    
    // Financial Overview
    csvContent += "FINANCIAL OVERVIEW\n"
    csvContent += "Metric,Value\n"
    csvContent += `Total Sales,TSh ${financial.total_sales}\n`
    csvContent += `Total Expenses,TSh ${financial.total_expenses}\n`
    csvContent += `Net Profit,TSh ${financial.net_profit}\n`
    csvContent += `Profit Margin,${financial.net_profit_margin}\n\n`
    
    // Sales by Day
    if (salesByDay.length > 0) {
      csvContent += "SALES BY DAY\n"
      csvContent += "Date,Amount (TSh)\n"
      salesByDay.forEach((item: any) => {
        csvContent += `${item.date},${item.amount}\n`
      })
      csvContent += "\n"
    }
    
    // Expenses by Category
    if (expensesChartData.length > 0) {
      csvContent += "EXPENSES BY CATEGORY\n"
      csvContent += "Category,Amount (TSh)\n"
      expensesChartData.forEach((item: any) => {
        csvContent += `${item.category},${item.amount}\n`
      })
      csvContent += "\n"
    }
    
    // Top Products
    if (topProducts.length > 0) {
      csvContent += "TOP SELLING PRODUCTS\n"
      csvContent += "Product,Quantity Sold\n"
      topProducts.forEach((item: any) => {
        csvContent += `${item.name},${item.quantity}\n`
      })
      csvContent += "\n"
    }
    
    // Recent Transactions
    if (recentTransactions.length > 0) {
      csvContent += "RECENT TRANSACTIONS\n"
      csvContent += "ID,Date,Total Amount (TSh),Items\n"
      recentTransactions.forEach((transaction: any) => {
        const items = transaction.items.map((item: any) => `${item.product_name} (${item.quantity})`).join("; ")
        csvContent += `${transaction.id},${transaction.date},${transaction.total},"${items}"\n`
      })
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `${reportType}_report_${dateRange.startDate}_to_${dateRange.endDate}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const exportToPDF = () => {
    if (!reportData) return

    // Create a new window for PDF generation
    const printWindow = window.open("", "_blank")
    if (!printWindow) {
      alert("Please allow popups to generate PDF")
      return
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${reportType.toUpperCase()} Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h2 { color: #333; border-bottom: 2px solid #3b82f6; padding-bottom: 5px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f8f9fa; font-weight: bold; }
          .metric { margin: 10px 0; }
          .metric strong { color: #3b82f6; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${reportType.toUpperCase()} REPORT</h1>
          <p>Date Range: ${dateRange.startDate} to ${dateRange.endDate}</p>
          <p>Generated: ${new Date().toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Financial Overview</h2>
          <div class="metric"><strong>Total Sales:</strong> TSh ${financial.total_sales}</div>
          <div class="metric"><strong>Total Expenses:</strong> TSh ${financial.total_expenses}</div>
          <div class="metric"><strong>Net Profit:</strong> TSh ${financial.net_profit}</div>
          <div class="metric"><strong>Profit Margin:</strong> ${financial.net_profit_margin}</div>
        </div>

        ${salesByDay.length > 0 ? `
        <div class="section">
          <h2>Sales by Day</h2>
          <table>
            <thead>
              <tr><th>Date</th><th>Amount (TSh)</th></tr>
            </thead>
            <tbody>
              ${salesByDay.map((item: any) => `
                <tr><td>${item.date}</td><td>${item.amount}</td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${expensesChartData.length > 0 ? `
        <div class="section">
          <h2>Expenses by Category</h2>
          <table>
            <thead>
              <tr><th>Category</th><th>Amount (TSh)</th></tr>
            </thead>
            <tbody>
              ${expensesChartData.map((item: any) => `
                <tr><td>${item.category}</td><td>${item.amount}</td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${topProducts.length > 0 ? `
        <div class="section">
          <h2>Top Selling Products</h2>
          <table>
            <thead>
              <tr><th>Product</th><th>Quantity Sold</th></tr>
            </thead>
            <tbody>
              ${topProducts.map((item: any) => `
                <tr><td>${item.name}</td><td>${item.quantity}</td></tr>
              `).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        ${recentTransactions.length > 0 ? `
        <div class="section">
          <h2>Recent Transactions</h2>
          <table>
            <thead>
              <tr><th>ID</th><th>Date</th><th>Total Amount (TSh)</th><th>Items</th></tr>
            </thead>
            <tbody>
              ${recentTransactions.map((transaction: any) => {
                const items = transaction.items.map((item: any) => `${item.product_name} (${item.quantity})`).join(", ")
                return `
                  <tr>
                    <td>${transaction.id}</td>
                    <td>${transaction.date}</td>
                    <td>${transaction.total}</td>
                    <td>${items}</td>
                  </tr>
                `
              }).join("")}
            </tbody>
          </table>
        </div>
        ` : ""}

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Print PDF
          </button>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
  }

  return (
    <Layout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-gray-600">View detailed business reports and analytics</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => handleExport("csv")}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={() => handleExport("pdf")}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Report Filters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reportType">Report Type</Label>
                <Select value={reportType} onValueChange={setReportType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="expenses">Expenses Report</SelectItem>
                    <SelectItem value="profit">Profit & Loss</SelectItem>
                    <SelectItem value="inventory">Inventory Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Sales</p>
                  <p className="text-2xl font-bold">{totalSales.toLocaleString()} TSh</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold">{totalExpenses.toLocaleString()} TSh</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Net Profit</p>
                  <p className={`text-2xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profit.toLocaleString()} TSh
                  </p>
                </div>
                <DollarSign className={`h-8 w-8 ${profit >= 0 ? "text-green-500" : "text-red-500"}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Profit Margin</p>
                  <p className={`text-2xl font-bold ${profitMargin >= 0 ? "text-green-600" : "text-red-600"}`}>
                    {profitMargin.toLocaleString()}%
                  </p>
                </div>
                <TrendingUp className={`h-8 w-8 ${profitMargin >= 0 ? "text-green-500" : "text-red-500"}`} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Sales Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value: number = 0) => [value.toLocaleString() + ' TSh', 'Sales']} />
                  <Line type="monotone" dataKey="amount" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Expenses by Category */}
          <Card>
            <CardHeader>
              <CardTitle>Expenses by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expensesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value: number = 0) => [value.toLocaleString() + ' TSh', 'Amount']} />
                  <Bar dataKey="amount" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Products and Detailed Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Selling Products */}
          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={topProducts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value?.toLocaleString() || '0'}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="quantity"
                  >
                    {topProducts.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {recentTransactions.slice(0, 10).map((sale: any) => (
                  <div key={sale.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{sale.id}</p>
                      <p className="text-sm text-gray-600">{new Date(sale.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{sale.total.toLocaleString()} TSh</p>
                      <p className="text-sm text-gray-600">{sale.items.length} items</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Report Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</CardTitle>
          </CardHeader>
          <CardContent>
            {reportType === "sales" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Sale ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Customer</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Items</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Total</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedSales.map((sale: any) => (
                      <tr key={sale.sale_id || sale.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{sale.sale_id || sale.id}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(sale.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{sale.customerName || sale.cashier || "Walk-in"}</td>
                        <td className="border border-gray-300 px-4 py-2">{sale.items_count || (sale.items ? sale.items.length : 0)}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{sale.total_amount?.toLocaleString()} TSh</td>
                        <td className="border border-gray-300 px-4 py-2">
                          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">completed</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {reportType === "expenses" && (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Expense ID</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                      <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Created By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedExpenses.map((expense: any) => (
                      <tr key={expense.expense_id || expense.id} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-4 py-2">{expense.expense_id || expense.id}</td>
                        <td className="border border-gray-300 px-4 py-2">
                          {new Date(expense.created_at || expense.date).toLocaleDateString()}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">{expense.description}</td>
                        <td className="border border-gray-300 px-4 py-2">{expense.category}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{expense.amount?.toLocaleString()} TSh</td>
                        <td className="border border-gray-300 px-4 py-2">{expense.created_by || expense.createdByName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
