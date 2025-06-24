"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { mockUsers, mockLocations } from "@/lib/mockData"
import type { User, Location } from "@/lib/mockData"

interface AuthContextType {
  user: User | null
  userLocation: Location | null
  login: (username: string, password: string) => Promise<boolean>
  logout: () => void
  loading: boolean
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
      const parsedUser = JSON.parse(userData)
      setUser(parsedUser)

      // Set user location if they have one
      if (parsedUser.locationId) {
        const location = mockLocations.find((loc) => loc.id === parsedUser.locationId)
        setUserLocation(location || null)
      }
    }
    setLoading(false)
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    // Mock authentication - in real app, this would call your API
    const foundUser = mockUsers.find((u) => u.username === username && u.status === "active")

    if (foundUser && password === "password") {
      const token = `mock_jwt_token_${foundUser.id}`
      localStorage.setItem("pos_token", token)
      localStorage.setItem("pos_user", JSON.stringify(foundUser))
      setUser(foundUser)

      // Set user location
      if (foundUser.locationId) {
        const location = mockLocations.find((loc) => loc.id === foundUser.locationId)
        setUserLocation(location || null)
      }

      return true
    }

    return false
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
