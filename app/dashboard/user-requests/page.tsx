"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { mockUserRequests } from "@/lib/mockData"
import { UserPlus, Check, X, Clock, Eye } from "lucide-react"
import { useState } from "react"

export default function UserRequestsPage() {
  const { user } = useAuth()
  const [requests, setRequests] = useState(mockUserRequests)

  // Filter requests based on user role
  const filteredRequests =
    user?.role === "superuser" ? requests : requests.filter((req) => req.requestedBy === user?.id)

  const handleApprove = (requestId: string) => {
    if (confirm("Are you sure you want to approve this request?")) {
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "approved",
                reviewedBy: user?.id,
                reviewedByName: user?.name,
                reviewedDate: new Date().toISOString(),
              }
            : req,
        ),
      )
      alert("Request approved successfully!")
    }
  }

  const handleReject = (requestId: string) => {
    if (confirm("Are you sure you want to reject this request?")) {
      setRequests(
        requests.map((req) =>
          req.id === requestId
            ? {
                ...req,
                status: "rejected",
                reviewedBy: user?.id,
                reviewedByName: user?.name,
                reviewedDate: new Date().toISOString(),
              }
            : req,
        ),
      )
      alert("Request rejected.")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
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

  const pendingRequests = filteredRequests.filter((req) => req.status === "pending").length
  const approvedRequests = filteredRequests.filter((req) => req.status === "approved").length
  const rejectedRequests = filteredRequests.filter((req) => req.status === "rejected").length

  const pageTitle = user?.role === "superuser" ? "User Requests" : "Cashier Requests"
  const allowedRoles = user?.role === "superuser" ? ["superuser"] : ["manager", "superuser"]

  return (
    <RoleBasedRoute allowedRoles={allowedRoles}>
      <Layout title={pageTitle}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">{pageTitle}</h2>
              <p className="text-gray-600">
                {user?.role === "superuser"
                  ? "Review and approve user creation requests from managers"
                  : "Request new cashier creation for your location"}
              </p>
            </div>
            {user?.role === "manager" && (
              <Button onClick={() => alert("Create new cashier request form would open here")}>
                <UserPlus className="h-4 w-4 mr-2" />
                Request New Cashier
              </Button>
            )}
          </div>

          {/* Request Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{filteredRequests.length}</div>
                <p className="text-sm text-gray-600">Total Requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-600">{pendingRequests}</div>
                <p className="text-sm text-gray-600">Pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{approvedRequests}</div>
                <p className="text-sm text-gray-600">Approved</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{rejectedRequests}</div>
                <p className="text-sm text-gray-600">Rejected</p>
              </CardContent>
            </Card>
          </div>

          {/* Requests List */}
          <Card>
            <CardHeader>
              <CardTitle>
                {user?.role === "superuser" ? "All User Requests" : "Your Cashier Requests"} ({filteredRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <UserPlus className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold">Create Cashier: {request.userData.name}</p>
                          <p className="text-sm text-gray-600">
                            Requested by {request.requestedByName} for {request.locationName}
                          </p>
                          <div className="mt-1 text-sm text-gray-500">
                            <p>Email: {request.userData.email}</p>
                            <p>Phone: {request.userData.phone}</p>
                            <p>Username: {request.userData.username}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-sm text-gray-600">
                        <p>Request Date: {formatDate(request.requestDate)}</p>
                        {request.reviewedDate && (
                          <p>
                            Reviewed: {formatDate(request.reviewedDate)} by {request.reviewedByName}
                          </p>
                        )}
                        {request.notes && <p className="mt-1 italic">Notes: {request.notes}</p>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge className={getStatusColor(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>

                      {user?.role === "superuser" && request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleApprove(request.id)}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}

                      {request.status === "pending" && user?.role !== "superuser" && (
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">Awaiting Approval</span>
                        </div>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert(`Viewing details for request: ${request.userData.name}`)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No user requests found</p>
                    {user?.role === "manager" && (
                      <p className="text-sm mt-2">Click "Request New Cashier" to create your first request</p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleBasedRoute>
  )
}
