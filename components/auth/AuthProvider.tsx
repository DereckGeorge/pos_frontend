"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User, Location } from "@/lib/mockData"
import { login as apiLogin } from "@/lib/api"

interface AuthContextType {
  user: User | null
  userLocation: Location | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

interface ApiUser {
  id: string
  name: string
  email: string
  position: string
  created_at: string
  updated_at: string
  branch?: {
    id: string
    name: string
    location: string
    contact_number: string
    is_active: boolean
  }
}

interface LoginResponse {
  user: ApiUser
  access_token: string
  token_type: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userLocation, setUserLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem("pos_token")
    const userData = localStorage.getItem("pos_user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)

        // Set user location if they have one
        if (parsedUser.locationId) {
          // For now, we'll set a default location since the API doesn't provide location info
          setUserLocation({
            id: "default",
            name: "Main Store",
            address: "Dar es Salaam, Tanzania",
            city: "Dar es Salaam",
            region: "Dar es Salaam",
            phone: "+255 123 456 789",
            managerId: "default",
            managerName: "Default Manager",
            status: "active",
            createdAt: new Date().toISOString()
          })
        }
      } catch (error) {
        console.error("Error parsing stored user data:", error)
        localStorage.removeItem("pos_token")
        localStorage.removeItem("pos_user")
      }
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin(email, password)
      
      if (response.error) {
        console.error("Login failed:", response.error)
        return false
      }

      const data = response.data as LoginResponse

      // Transform API user data to match our User interface
      const transformedUser: User = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        username: data.user.email.split("@")[0], // Use email prefix as username
        role: data.user.position === "super user" ? "superuser" : (data.user.position as "manager" | "cashier"),
        status: "active",
        createdAt: data.user.created_at,
        lastLogin: new Date().toISOString(),
        locationId: data.user.branch?.id || "default", // Use branch ID from API
        phone: "", // API doesn't provide phone
        createdBy: "system",
        createdByName: "System"
      }

      // Store token and user data
      localStorage.setItem("pos_token", data.access_token)
      localStorage.setItem("pos_user", JSON.stringify(transformedUser))
      setUser(transformedUser)

      // Set branch location from API if available
      if (data.user.branch) {
        setUserLocation({
          id: data.user.branch.id,
          name: data.user.branch.name,
          address: data.user.branch.location,
          city: data.user.branch.location,
          region: data.user.branch.location,
          phone: data.user.branch.contact_number,
          managerId: "default",
          managerName: "Default Manager",
          status: data.user.branch.is_active ? "active" : "inactive",
          createdAt: new Date().toISOString()
        })
      } else {
        // Set default location
        setUserLocation({
          id: "default",
          name: "Main Store",
          address: "Dar es Salaam, Tanzania",
          city: "Dar es Salaam",
          region: "Dar es Salaam",
          phone: "+255 123 456 789",
          managerId: "default",
          managerName: "Default Manager",
          status: "active",
          createdAt: new Date().toISOString()
        })
      }

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("pos_token")
    localStorage.removeItem("pos_user")
    setUser(null)
    setUserLocation(null)
  }

  return <AuthContext.Provider value={{ user, userLocation, login, logout, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
