"use client"

import { Layout } from "@/components/common/Layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { getStockTransfers, getPendingStockTransfers, approveStockTransfer, rejectStockTransfer } from "@/lib/api"
import { Plus, ArrowLeft, Loader2, ArrowLeftRight, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { TransferActionDialog } from "@/components/stock-transfers/TransferActionDialog"

interface ApiStockTransfer {
  id: string
  product_id: string
  from_branch_id: string
  to_branch_id: string
  quantity: number
  status: string
  reason: string
  rejection_reason: string | null
  requested_by: {
    id: string
    name: string
    email: string
    position_id: string
    branch_id: string
    status: string
    approved_by: string
    approved_at: string
    created_at: string
    updated_at: string
  }
  approved_by: string | null
  approved_at: string | null
  created_at: string
  updated_at: string
  product: {
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
    profit: number
  }
  from_branch: {
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
  }
  to_branch: {
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
  }
}

interface ApiPendingTransfer {
  id: string
  product: {
    id: string
    name: string
    code: string
    price: string
    cost_price: string
    quantity: number
  }
  from_branch: {
    id: string
    name: string
    location: string
  }
  to_branch: {
    id: string
    name: string
    location: string
  }
  quantity: number
  reason: string
  requested_by: {
    id: string
    name: string
    position: string
  }
  created_at: string
}

interface ApiStockTransfersResponse {
  status: string
  data: {
    transfers: ApiStockTransfer[]
  }
}

interface ApiPendingTransfersResponse {
  status: string
  data: {
    statistics: {
      total_pending_transfers: number
      total_quantity: number
      total_value: number
    }
    pending_transfers: ApiPendingTransfer[]
  }
}

export default function StockTransfersPage() {
  const [transfers, setTransfers] = useState<ApiStockTransfer[]>([])
  const [pendingTransfers, setPendingTransfers] = useState<ApiPendingTransfer[]>([])
  const [pendingStats, setPendingStats] = useState({
    total_pending_transfers: 0,
    total_quantity: 0,
    total_value: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  
  // Action dialog state
  const [actionDialog, setActionDialog] = useState<{
    isOpen: boolean
    action: "approve" | "reject"
    transferId: string
    productName: string
    quantity: number
    fromBranch: string
    toBranch: string
  }>({
    isOpen: false,
    action: "approve",
    transferId: "",
    productName: "",
    quantity: 0,
    fromBranch: "",
    toBranch: ""
  })
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState("")

  useEffect(() => {
    fetchStockTransfers()
  }, [])

  const fetchStockTransfers = async () => {
    try {
      setLoading(true)
      setError("")
      
      // Fetch both regular transfers and pending transfers
      const [transfersResponse, pendingResponse] = await Promise.all([
        getStockTransfers(),
        getPendingStockTransfers()
      ])
      
      if (transfersResponse.error) {
        setError(transfersResponse.error)
        return
      }

      if (pendingResponse.error) {
        setError(pendingResponse.error)
        return
      }

      const transfersData = transfersResponse.data as ApiStockTransfersResponse
      const pendingData = pendingResponse.data as ApiPendingTransfersResponse

      setTransfers(transfersData.data.transfers)
      setPendingTransfers(pendingData.data.pending_transfers)
      setPendingStats(pendingData.data.statistics)
    } catch (err) {
      setError("Failed to fetch stock transfers")
      console.error("Error fetching stock transfers:", err)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />
      case "approved":
        return <CheckCircle className="h-4 w-4" />
      case "rejected":
        return <XCircle className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      default:
        return <AlertTriangle className="h-4 w-4" />
    }
  }

  const handleApprove = (transfer: ApiStockTransfer | ApiPendingTransfer) => {
    setActionDialog({
      isOpen: true,
      action: "approve",
      transferId: transfer.id,
      productName: transfer.product.name,
      quantity: transfer.quantity,
      fromBranch: transfer.from_branch.name,
      toBranch: transfer.to_branch.name
    })
    setActionError("")
  }

  const handleReject = (transfer: ApiStockTransfer | ApiPendingTransfer) => {
    setActionDialog({
      isOpen: true,
      action: "reject",
      transferId: transfer.id,
      productName: transfer.product.name,
      quantity: transfer.quantity,
      fromBranch: transfer.from_branch.name,
      toBranch: transfer.to_branch.name
    })
    setActionError("")
  }

  const handleActionConfirm = async (reason?: string) => {
    try {
      setActionLoading(true)
      setActionError("")

      let response
      if (actionDialog.action === "approve") {
        response = await approveStockTransfer(actionDialog.transferId)
      } else {
        response = await rejectStockTransfer(actionDialog.transferId, reason || "")
      }

      if (response.error) {
        setActionError(response.error)
        return
      }

      // Refresh the data
      await fetchStockTransfers()
      
      // Close the dialog
      setActionDialog(prev => ({ ...prev, isOpen: false }))
    } catch (err) {
      setActionError("Failed to process transfer action")
      console.error("Error processing transfer action:", err)
    } finally {
      setActionLoading(false)
    }
  }

  const handleActionClose = () => {
    setActionDialog(prev => ({ ...prev, isOpen: false }))
    setActionError("")
  }

  if (loading) {
    return (
      <Layout title="Stock Transfers">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading stock transfers...</span>
          </div>
        </div>
      </Layout>
    )
  }

  if (error) {
    return (
      <Layout title="Stock Transfers">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchStockTransfers}>Retry</Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout title="Stock Transfers">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Stock Transfers</h2>
            <p className="text-gray-600">Manage product transfers between branches</p>
          </div>
          <Link href="/dashboard/stock-transfers/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Transfer
            </Button>
          </Link>
        </div>

        {/* Pending Transfers Stats */}
        {pendingStats.total_pending_transfers > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                <span>Pending Transfers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingStats.total_pending_transfers}</div>
                  <p className="text-sm text-yellow-700">Pending Requests</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">{pendingStats.total_quantity}</div>
                  <p className="text-sm text-yellow-700">Total Quantity</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-yellow-600">TSh {pendingStats.total_value.toLocaleString()}</div>
                  <p className="text-sm text-yellow-700">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending Transfers */}
        {pendingTransfers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span>Pending Transfers ({pendingTransfers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pendingTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg bg-yellow-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <ArrowLeftRight className="h-5 w-5 text-yellow-600" />
                        <div>
                          <p className="font-semibold">{transfer.product.name}</p>
                          <p className="text-sm text-gray-600">{transfer.product.code}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {transfer.from_branch.name} → {transfer.to_branch.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Requested by {transfer.requested_by.name} ({transfer.requested_by.position})
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">{transfer.reason}</p>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <div className="text-lg font-semibold">{transfer.quantity} {transfer.product.unit || 'pcs'}</div>
                      <div className="text-sm text-gray-600">
                        TSh {parseFloat(transfer.product.price).toLocaleString()} each
                      </div>
                      <div className="text-sm font-semibold text-yellow-600">
                        TSh {(parseFloat(transfer.product.price) * transfer.quantity).toLocaleString()}
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800 mt-2">Pending</Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleApprove(transfer)}>
                        Approve
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleReject(transfer)}>
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Transfers */}
        <Card>
          <CardHeader>
            <CardTitle>All Stock Transfers ({transfers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transfers.map((transfer) => (
                <div
                  key={transfer.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <ArrowLeftRight className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{transfer.product.name}</p>
                        <p className="text-sm text-gray-600">{transfer.product.code}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {transfer.from_branch.name} → {transfer.to_branch.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested by {transfer.requested_by.name} • {formatDate(transfer.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{transfer.reason}</p>
                      {transfer.rejection_reason && (
                        <p className="text-sm text-red-600 mt-1">
                          Rejection: {transfer.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right mr-4">
                    <div className="text-lg font-semibold">{transfer.quantity} {transfer.product.unit}</div>
                    <div className="text-sm text-gray-600">
                      TSh {parseFloat(transfer.product.price).toLocaleString()} each
                    </div>
                    <div className="text-sm font-semibold">
                      TSh {(parseFloat(transfer.product.price) * transfer.quantity).toLocaleString()}
                    </div>
                    <Badge className={`mt-2 ${getStatusColor(transfer.status)}`}>
                      {getStatusIcon(transfer.status)}
                      <span className="ml-1">{transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}</span>
                    </Badge>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {transfer.status === "pending" && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => handleApprove(transfer)}>
                          Approve
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleReject(transfer)}>
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <TransferActionDialog
        isOpen={actionDialog.isOpen}
        onClose={handleActionClose}
        onConfirm={handleActionConfirm}
        action={actionDialog.action}
        transferId={actionDialog.transferId}
        productName={actionDialog.productName}
        quantity={actionDialog.quantity}
        fromBranch={actionDialog.fromBranch}
        toBranch={actionDialog.toBranch}
        loading={actionLoading}
        error={actionError}
      />
    </Layout>
  )
} 