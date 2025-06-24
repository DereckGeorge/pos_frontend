"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateUser, getPositions, getAllBranches, getApprovedUsers } from "@/lib/api"
import { ArrowLeft, Save, User } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Position {
  id: string
  name: string
}

interface Branch {
  id: string
  name: string
  location: string
}

interface UserData {
  id: string
  name: string
  email: string
  position_id: string
  branch_id: string
  position: {
    name: string
  }
  branch: {
    name: string
  }
}

export default function EditUserPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [positions, setPositions] = useState<Position[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    position_id: "",
    branch_id: "",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Fetch approved users, positions, and branches in parallel
        const [usersResponse, positionsResponse, branchesResponse] = await Promise.all([
          getApprovedUsers(),
          getPositions(),
          getAllBranches()
        ])

        if (usersResponse.error) {
          setError("Failed to load users data")
          return
        }

        if (positionsResponse.error) {
          setError("Failed to load positions")
          return
        }

        if (branchesResponse.error) {
          setError("Failed to load branches")
          return
        }

        const users = usersResponse.data?.data?.users || []
        const positionsData = positionsResponse.data?.data?.positions || []
        const branchesData = branchesResponse.data?.data?.branches || []

        // Find the specific user by ID
        const user = users.find((u: any) => u.id === params.id)
        
        if (!user) {
          setError("User not found")
          return
        }

        setUserData(user)
        setPositions(positionsData)
        setBranches(branchesData)

        // Pre-fill form with user data
        setFormData({
          name: user.name,
          email: user.email,
          password: "",
          position_id: user.position_id,
          branch_id: user.branch_id,
        })
      } catch (err) {
        console.error("Error fetching data:", err)
        setError("Failed to load data")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.position_id || !formData.branch_id) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setSaving(true)
      setError("")
      
      const updateData: any = {
        name: formData.name,
        email: formData.email,
        position_id: formData.position_id,
        branch_id: formData.branch_id,
      }

      // Only include password if it's provided
      if (formData.password.trim()) {
        updateData.password = formData.password
      }
      
      const response = await updateUser(params.id, updateData)
      
      if (response.error) {
        setError(response.error)
      } else {
        alert("User updated successfully!")
        router.push("/dashboard/users")
      }
    } catch (err) {
      console.error("Error updating user:", err)
      setError("Failed to update user. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <RoleBasedRoute allowedRoles={["superuser"]}>
        <Layout title="Edit User">
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
        <Layout title="Edit User">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">{error}</p>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

  if (!userData) {
    return (
      <RoleBasedRoute allowedRoles={["superuser"]}>
        <Layout title="Edit User">
          <div className="flex items-center justify-center h-64">
            <p className="text-red-600">User not found</p>
          </div>
        </Layout>
      </RoleBasedRoute>
    )
  }

  return (
    <RoleBasedRoute allowedRoles={["superuser"]}>
      <Layout title="Edit User">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/users">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Edit User</h2>
              <p className="text-gray-600">Update user information for {userData.name}</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>User Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter email address"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Leave blank to keep current password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                    />
                    <p className="text-xs text-gray-500 mt-1">Leave blank to keep the current password</p>
                  </div>

                  <div>
                    <Label htmlFor="position">Position *</Label>
                    <Select value={formData.position_id} onValueChange={(value) => handleInputChange("position_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position.id} value={position.id}>
                            {position.name.charAt(0).toUpperCase() + position.name.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="branch">Branch *</Label>
                    <Select value={formData.branch_id} onValueChange={(value) => handleInputChange("branch_id", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select branch" />
                      </SelectTrigger>
                      <SelectContent>
                        {branches.map((branch) => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name} - {branch.location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={saving}
                    className="flex-1"
                  >
                    {saving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Update User
                  </Button>
                  <Link href="/dashboard/users">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Current User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Current Position:</strong> {userData.position.name.charAt(0).toUpperCase() + userData.position.name.slice(1)}
                </div>
                <div>
                  <strong>Current Branch:</strong> {userData.branch.name}
                </div>
                <div>
                  <strong>User ID:</strong> {userData.id}
                </div>
                <div>
                  <strong>Status:</strong> <span className="text-green-600">Approved</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleBasedRoute>
  )
} 