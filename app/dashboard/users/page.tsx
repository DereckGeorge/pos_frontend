"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { getApprovedUsers } from "@/lib/api"
import { Plus, Search, Edit, Trash2, UserCheck, UserX } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface ApprovedUser {
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
    id: string
    name: string
    location: string
  }
}

interface ApprovedUsersResponse {
  statistics: {
    total_users: number
    super_users: number
    managers: number
    cashiers: number
  }
  users: ApprovedUser[]
}

export default function UsersPage() {
  const [approvedUsersData, setApprovedUsersData] = useState<ApprovedUsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchApprovedUsers = async () => {
      try {
        setLoading(true)
        const response = await getApprovedUsers()
        
        if (response.error) {
          console.error("Failed to fetch approved users:", response.error)
          setError("Failed to load users data")
        } else {
          // Extract data from the nested response structure
          setApprovedUsersData(response.data?.data || null)
        }
      } catch (err) {
        console.error("Error fetching approved users:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchApprovedUsers()
  }, [])

  // Transform API data to match the expected format
  const users = approvedUsersData?.users?.map((userData) => ({
    id: userData.id,
    name: userData.name,
    email: userData.email,
    username: userData.email.split("@")[0],
    phone: "",
    role: userData.position.name === "super user" ? "superuser" : userData.position.name as "manager" | "cashier",
    locationId: userData.branch?.id || "",
    locationName: userData.branch?.name || "",
    status: userData.status as "active" | "inactive",
    createdAt: userData.created_at,
    lastLogin: undefined,
    createdBy: "system",
    createdByName: "System"
  })) || []

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this user?")) {
      // TODO: Implement API call to delete user
      alert("User deletion would be implemented here")
    }
  }

  const handleToggleStatus = (id: string) => {
    // TODO: Implement API call to toggle user status
    alert("User status toggle would be implemented here")
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "superuser":
        return "bg-red-100 text-red-800"
      case "manager":
        return "bg-blue-100 text-blue-800"
      case "cashier":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Use API statistics if available
  const totalUsers = approvedUsersData?.statistics?.total_users || 0
  const superUsers = approvedUsersData?.statistics?.super_users || 0
  const managerUsers = approvedUsersData?.statistics?.managers || 0
  const cashierUsers = approvedUsersData?.statistics?.cashiers || 0
  const activeUsers = users.filter((user) => user.status === "active").length

  if (loading) {
    return (
      <RoleBasedRoute allowedRoles={["superuser"]}>
        <Layout title="User Management">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

  if (error) {
    return (
      <RoleBasedRoute allowedRoles={["superuser"]}>
        <Layout title="User Management">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">{error}</p>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={["superuser"]}>
      <Layout title="User Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-gray-600">Manage system users and their roles</p>
            </div>
            <Link href="/dashboard/users/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </Link>
          </div>

          {/* User Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-sm text-gray-600">Total Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
                <p className="text-sm text-gray-600">Active Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-600">{superUsers}</div>
                <p className="text-sm text-gray-600">Super Users</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-600">{managerUsers}</div>
                <p className="text-sm text-gray-600">Managers</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{cashierUsers}</div>
                <p className="text-sm text-gray-600">Cashiers</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, username, or role..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>System Users ({filteredUsers.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold">
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                          <p className="text-sm text-gray-500">@{user.username}</p>
                          <p className="text-sm text-gray-500">Branch: {user.locationName}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>Created: {formatDate(user.createdAt)}</span>
                        {user.lastLogin && <span>Last login: {formatDate(user.lastLogin)}</span>}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                        <div className="mt-1">
                          <Badge className={getStatusColor(user.status)}>
                            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(user.id)}
                          title={user.status === "active" ? "Deactivate user" : "Activate user"}
                        >
                          {user.status === "active" ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/users/${user.id}/edit`)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-gray-400 font-semibold">👥</span>
                    </div>
                    <p>No users found.</p>
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
