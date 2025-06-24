"use client"

import { Layout } from "@/components/common/Layout"
import { RoleBasedRoute } from "@/components/common/RoleBasedRoute"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { mockLocations, mockUsers, mockSales, formatTSh } from "@/lib/mockData"
import { Plus, Search, Edit, Eye, MapPin, Users, DollarSign } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function LocationsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredLocations = mockLocations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      location.region.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Calculate statistics for each location
  const locationsWithStats = filteredLocations.map((location) => {
    const locationUsers = mockUsers.filter((user) => user.locationId === location.id && user.status === "active")
    const locationSales = mockSales.filter((sale) => sale.locationId === location.id)
    const totalSales = locationSales.reduce((sum, sale) => sum + sale.total, 0)

    return {
      ...location,
      userCount: locationUsers.length,
      salesCount: locationSales.length,
      totalSales,
    }
  })

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  const totalLocations = mockLocations.length
  const activeLocations = mockLocations.filter((loc) => loc.status === "active").length
  const totalUsers = mockUsers.filter((user) => user.locationId).length
  const totalSales = mockSales.reduce((sum, sale) => sum + sale.total, 0)

  return (
    <RoleBasedRoute allowedRoles={["superuser"]}>
      <Layout title="Location Management">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Locations</h2>
              <p className="text-gray-600">Manage all POS Tanzania locations</p>
            </div>
            <Link href="/dashboard/locations/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </Link>
          </div>

          {/* Location Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalLocations}</div>
                <p className="text-sm text-gray-600">Total Locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-600">{activeLocations}</div>
                <p className="text-sm text-gray-600">Active Locations</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{totalUsers}</div>
                <p className="text-sm text-gray-600">Total Staff</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-2xl font-bold">{formatTSh(totalSales)}</div>
                <p className="text-sm text-gray-600">Total Sales</p>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search locations by name, city, or region..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Locations List */}
          <Card>
            <CardHeader>
              <CardTitle>All Locations ({locationsWithStats.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationsWithStats.map((location) => (
                  <div
                    key={location.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <MapPin className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{location.name}</p>
                          <p className="text-sm text-gray-600">{location.address}</p>
                          <p className="text-sm text-gray-500">
                            {location.city}, {location.region}
                          </p>
                          <p className="text-sm text-gray-500">Manager: {location.managerName}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4" />
                          <span>{location.userCount} staff</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <DollarSign className="h-4 w-4" />
                          <span>{location.salesCount} sales</span>
                        </div>
                        <span>Phone: {location.phone}</span>
                      </div>
                    </div>

                    <div className="text-right mr-4">
                      <p className="text-lg font-semibold">{formatTSh(location.totalSales)}</p>
                      <Badge className={getStatusColor(location.status)}>
                        {location.status.charAt(0).toUpperCase() + location.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex space-x-2">
                      <Link href={`/dashboard/locations/${location.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          alert(`Editing location: ${location.name}`)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </RoleBasedRoute>
  )
}
