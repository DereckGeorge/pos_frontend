"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { mockSales } from "@/lib/mockData"
import { ArrowLeft, Receipt, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useParams } from "next/navigation"

export default function SaleDetailPage() {
  const params = useParams()
  const saleId = params.id as string

  const sale = mockSales.find((s) => s.id === saleId)

  if (!sale) {
    return (
      <Layout title="Sale Not Found">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Sale Not Found</h2>
          <p className="text-gray-600 mt-2">The sale you're looking for doesn't exist.</p>
          <Link href="/dashboard/sales">
            <Button className="mt-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sales
            </Button>
          </Link>
        </div>
      </Layout>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "refunded":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handlePrintReceipt = () => {
    // In a real app, this would generate and print a receipt
    alert("Receipt printed successfully!")
  }

  const handleRefund = () => {
    // In a real app, this would process a refund
    if (confirm("Are you sure you want to refund this sale?")) {
      alert("Refund processed successfully!")
    }
  }

  return (
    <Layout title={`Sale ${sale.id}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/sales">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Sale {sale.id}</h2>
              <p className="text-gray-600">{formatDate(sale.createdAt)}</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={handlePrintReceipt}>
              <Receipt className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            {sale.status === "completed" && (
              <Button variant="destructive" onClick={handleRefund}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refund
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sale Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Items Purchased</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sale.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex-1">
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${item.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${sale.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${sale.tax.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total:</span>
                    <span>${sale.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Payment Method:</span>
                    <span>{sale.paymentMethod}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sale Information */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sale Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(sale.status)}>
                      {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                    </Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Sale ID</label>
                  <p className="mt-1 font-mono text-sm">{sale.id}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Date & Time</label>
                  <p className="mt-1">{formatDate(sale.createdAt)}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Cashier</label>
                  <p className="mt-1">{sale.cashierName}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Customer</label>
                  <p className="mt-1">{sale.customerName || "Walk-in Customer"}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Payment Method</label>
                  <p className="mt-1">{sale.paymentMethod}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Items Count</label>
                  <p className="mt-1">{sale.items.length} item(s)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
