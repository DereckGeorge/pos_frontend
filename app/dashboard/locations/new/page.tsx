"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createBranch } from "@/lib/api"
import { ArrowLeft, Save, MapPin } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewLocationPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    contact_number: "",
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (!formData.name.trim() || !formData.location.trim() || !formData.contact_number.trim()) {
      setError("Please fill in all required fields")
      return
    }

    try {
      setLoading(true)
      setError("")
      
      const response = await createBranch(formData)
      
      if (response.error) {
        setError(response.error)
      } else {
        alert("Location created successfully!")
        router.push("/dashboard/locations")
      }
    } catch (err) {
      console.error("Error creating location:", err)
      setError("Failed to create location. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <RoleBasedRoute allowedRoles={["superuser"]}>
      <Layout title="Add New Location">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/locations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Locations
              </Button>
            </Link>
            <div>
              <h2 className="text-2xl font-bold">Add New Location</h2>
              <p className="text-gray-600">Create a new POS Tanzania branch</p>
            </div>
          </div>

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MapPin className="h-5 w-5" />
                <span>Location Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Branch Name *</Label>
                    <Input
                      id="name"
                      placeholder="Enter branch name (e.g., Main Branch, Ilala Branch)"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="Enter location (e.g., Dar es Salaam, Arusha, Mwanza)"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="contact_number">Contact Number *</Label>
                    <Input
                      id="contact_number"
                      placeholder="Enter contact number (e.g., 0748281701)"
                      value={formData.contact_number}
                      onChange={(e) => handleInputChange("contact_number", e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => handleInputChange("is_active", checked)}
                    />
                    <Label htmlFor="is_active">Active Location</Label>
                  </div>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Create Location
                  </Button>
                  <Link href="/dashboard/locations">
                    <Button type="button" variant="outline">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Help Text */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <strong>Branch Name:</strong> Use descriptive names like "Main Branch", "Ilala Branch", or "Mlimani Branch"
                </div>
                <div>
                  <strong>Location:</strong> Specify the city or area where the branch is located
                </div>
                <div>
                  <strong>Contact Number:</strong> Provide a valid phone number for the branch
                </div>
                <div>
                  <strong>Active Status:</strong> Only active locations can process sales and manage users
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleBasedRoute>
  )
} 