"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/AuthProvider"
import { getPendingUsers, approveUser } from "@/lib/api"
import { UserPlus, Check, X, Clock, Eye } from "lucide-react"
import { useState, useEffect } from "react"

interface PendingUser {
  id: string
  name: string
  email: string
  status: string
  created_at: string
  updated_at: string
  position: {
    name: string
  }
  branch: {
    name: string
    location: string
  }
}

interface PendingUsersResponse {
  statistics: {
    total_requests: number
    approved: number
    rejected: number
    pending: number
  }
  users: PendingUser[]
}

export default function UserRequestsPage() {
  const { user } = useAuth()
  const [pendingUsersData, setPendingUsersData] = useState<PendingUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingAction, setProcessingAction] = useState<string | null>(null)

  const fetchPendingUsers = async () => {
    try {
      setLoading(true)
      const response = await getPendingUsers()
      
      if (response.error) {
        console.error("Failed to fetch pending users:", response.error)
        setError("Failed to load pending users data")
      } else {
        // Extract data from the nested response structure
        setPendingUsersData(response.data?.data || null)
      }
    } catch (err) {
      console.error("Error fetching pending users:", err)
      setError("Failed to load data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  // Transform API data to match the expected format
  const requests = pendingUsersData?.users?.map((userData) => ({
    id: userData.id,
    requestType: "create_cashier" as const,
    requestedBy: "system",
    requestedByName: "System",
    locationId: userData.branch?.name || "",
    locationName: userData.branch?.name || "",
    userData: {
      name: userData.name,
      email: userData.email,
      phone: "",
      username: userData.email.split("@")[0],
    },
    status: userData.status as "pending" | "approved" | "rejected",
    requestDate: userData.created_at,
    reviewedBy: undefined,
    reviewedByName: undefined,
    reviewedDate: undefined,
    notes: `Position: ${userData.position?.name || "Unknown"}`,
  })) || []

  // Filter requests based on user role
  const filteredRequests =
    user?.role === "superuser" ? requests : requests.filter((req) => req.requestedBy === user?.id)

  const handleApprove = async (requestId: string) => {
    if (confirm("Are you sure you want to approve this request?")) {
      try {
        setProcessingAction(requestId)
        const response = await approveUser(requestId, "approve")
        
        if (response.error) {
          alert(`Failed to approve user: ${response.error}`)
        } else {
          alert("User approved successfully!")
          // Refresh the data to show updated status
          await fetchPendingUsers()
        }
      } catch (err) {
        console.error("Error approving user:", err)
        alert("Failed to approve user. Please try again.")
      } finally {
        setProcessingAction(null)
      }
    }
  }

  const handleReject = async (requestId: string) => {
    const rejectionReason = prompt("Please provide a reason for rejection:")
    if (rejectionReason !== null) {
      try {
        setProcessingAction(requestId)
        const response = await approveUser(requestId, "reject", rejectionReason)
        
        if (response.error) {
          alert(`Failed to reject user: ${response.error}`)
        } else {
          alert("User rejected successfully!")
          // Refresh the data to show updated status
          await fetchPendingUsers()
        }
      } catch (err) {
        console.error("Error rejecting user:", err)
        alert("Failed to reject user. Please try again.")
      } finally {
        setProcessingAction(null)
      }
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

  const pendingRequests = pendingUsersData?.statistics?.pending || 0
  const approvedRequests = pendingUsersData?.statistics?.approved || 0
  const rejectedRequests = pendingUsersData?.statistics?.rejected || 0
  const totalRequests = pendingUsersData?.statistics?.total_requests || 0

  const pageTitle = user?.role === "superuser" ? "User Requests" : "Cashier Requests"
  const allowedRoles: ("superuser" | "manager" | "cashier")[] = user?.role === "superuser" ? ["superuser"] : ["manager", "superuser"]

  if (loading) {
    return (
      <RoleBasedRoute allowedRoles={allowedRoles}>
        <Layout title={pageTitle}>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

  if (error) {
    return (
      <RoleBasedRoute allowedRoles={allowedRoles}>
        <Layout title={pageTitle}>
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">{error}</p>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

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
                <div className="text-2xl font-bold">{totalRequests}</div>
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
                            disabled={processingAction === request.id}
                            className="text-green-600 border-green-300 hover:bg-green-50"
                          >
                            {processingAction === request.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                            ) : (
                              <Check className="h-4 w-4" />
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request.id)}
                            disabled={processingAction === request.id}
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            {processingAction === request.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                            ) : (
                              <X className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {filteredRequests.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UserPlus className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No user requests found.</p>
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
