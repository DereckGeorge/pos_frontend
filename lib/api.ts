const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL

export interface ApiResponse<T = any> {
  data?: T
  error?: string
  message?: string
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const token = localStorage.getItem("pos_token")
    
    const defaultHeaders: HeadersInit = {
      "Content-Type": "application/json",
      "accept": "application/json",
    }

    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return {
        error: errorData.message || `HTTP error! status: ${response.status}`,
      }
    }

    const data = await response.json()
    return { data }
  } catch (error) {
    console.error("API request failed:", error)
    return {
      error: error instanceof Error ? error.message : "Network error",
    }
  }
}

export async function login(email: string, password: string) {
  return apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function logout() {
  return apiRequest("/logout", {
    method: "POST",
  })
}

export async function getProfile() {
  return apiRequest("/profile")
}

export async function refreshToken() {
  return apiRequest("/refresh", {
    method: "POST",
  })
}

export async function getSuperuserDashboard() {
  return apiRequest("/dashboard/super-user")
}

export async function getPendingUsers() {
  return apiRequest("/pending-users")
}

export async function approveUser(userId: string, action: "approve" | "reject", rejectionReason?: string) {
  const payload: any = {
    user_id: userId,
    action: action
  }
  
  if (action === "reject" && rejectionReason) {
    payload.rejection_reason = rejectionReason
  }
  
  return apiRequest("/approve-user", {
    method: "POST",
    body: JSON.stringify(payload),
  })
}

export async function getBranches() {
  return apiRequest("/dashboard/branches")
}

export async function createBranch(branchData: {
  name: string
  location: string
  contact_number: string
  is_active: boolean
}) {
  return apiRequest("/branches", {
    method: "POST",
    body: JSON.stringify(branchData),
  })
}

export async function getApprovedUsers() {
  return apiRequest("/approved-users")
}

export async function updateUser(userId: string, userData: {
  name: string
  email: string
  password?: string
  position_id: string
  branch_id: string
}) {
  return apiRequest(`/users/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  })
}

export async function getPositions() {
  return apiRequest("/positions")
}

export async function getAllBranches() {
  return apiRequest("/branches")
} 