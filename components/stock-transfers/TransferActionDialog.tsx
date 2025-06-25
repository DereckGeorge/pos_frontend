"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

interface TransferActionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason?: string) => void
  action: "approve" | "reject"
  transferId: string
  productName: string
  quantity: number
  fromBranch: string
  toBranch: string
  loading: boolean
  error: string
}

export function TransferActionDialog({
  isOpen,
  onClose,
  onConfirm,
  action,
  transferId,
  productName,
  quantity,
  fromBranch,
  toBranch,
  loading,
  error
}: TransferActionDialogProps) {
  const [reason, setReason] = useState("")

  if (!isOpen) return null

  const isReject = action === "reject"
  const title = isReject ? "Reject Transfer" : "Approve Transfer"
  const description = isReject 
    ? "Are you sure you want to reject this transfer request?"
    : "Are you sure you want to approve this transfer request?"

  const handleConfirm = () => {
    if (isReject && !reason.trim()) {
      return
    }
    onConfirm(isReject ? reason : undefined)
  }

  const handleClose = () => {
    setReason("")
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center space-x-3 mb-4">
          {isReject ? (
            <XCircle className="h-6 w-6 text-red-600" />
          ) : (
            <CheckCircle className="h-6 w-6 text-green-600" />
          )}
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>

        <div className="space-y-4">
          <p className="text-gray-600">{description}</p>

          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Product:</span>
              <span className="text-sm font-medium">{productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Quantity:</span>
              <span className="text-sm font-medium">{quantity}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">From:</span>
              <span className="text-sm font-medium">{fromBranch}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">To:</span>
              <span className="text-sm font-medium">{toBranch}</span>
            </div>
          </div>

          {isReject && (
            <div className="space-y-2">
              <Label htmlFor="reason">Rejection Reason *</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for rejection..."
                rows={3}
                required
              />
            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={isReject ? "destructive" : "default"}
              onClick={handleConfirm}
              disabled={loading || (isReject && !reason.trim())}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isReject ? "Rejecting..." : "Approving..."}
                </>
              ) : (
                <>
                  {isReject ? <XCircle className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  {isReject ? "Reject Transfer" : "Approve Transfer"}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
} 