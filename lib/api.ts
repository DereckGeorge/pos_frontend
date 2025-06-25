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

export async function getBranchesForProducts() {
  return apiRequest("/branches")
}

export async function getProducts() {
  return apiRequest("/products")
}

export async function updateProduct(productId: string, productData: {
  name: string
  description: string
  price: number
  cost_price: number
  quantity: number
  reorder_level: number
  unit: string
  category: string
}) {
  return apiRequest(`/products/${productId}`, {
    method: "PUT",
    body: JSON.stringify(productData),
  })
}

export async function createProduct(productData: {
  name: string
  code: string
  description: string
  price: number
  cost_price: number
  quantity: number
  reorder_level: number
  unit: string
  category: string
  branch_id: string
}) {
  return apiRequest("/products", {
    method: "POST",
    body: JSON.stringify(productData),
  })
}

export async function deleteProduct(productId: string) {
  return apiRequest(`/products/${productId}`, {
    method: "DELETE",
  })
}

export async function getExpenseStatistics() {
  return apiRequest("/dashboard/expense-statistics")
}

export async function createExpenseCategory(categoryData: {
  name: string
  description: string
  is_active: boolean
}) {
  return apiRequest("/expense-categories", {
    method: "POST",
    body: JSON.stringify(categoryData),
  })
}

export async function getExpenseCategories() {
  return apiRequest("/expense-categories")
}

export async function updateExpenseCategory(categoryId: string, categoryData: {
  name: string
  description: string
  is_active: boolean
}) {
  return apiRequest(`/expense-categories/${categoryId}`, {
    method: "PUT",
    body: JSON.stringify(categoryData),
  })
}

export async function deleteExpenseCategory(categoryId: string) {
  return apiRequest(`/expense-categories/${categoryId}`, {
    method: "DELETE",
  })
}

export async function getStockTransfers() {
  return apiRequest("/products/transfers")
}

export async function getPendingStockTransfers() {
  return apiRequest("/products/pending-transfers")
}

export async function createStockTransfer(data: {
  product_id: string
  from_branch_id: string
  to_branch_id: string
  quantity: number
  reason: string
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/transfers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.message || "Failed to create stock transfer" }
    }

    return { data: result }
  } catch (error) {
    console.error("Error creating stock transfer:", error)
    return { error: "Failed to create stock transfer" }
  }
}

export async function approveStockTransfer(transferId: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/transfers/${transferId}/approve`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.message || "Failed to approve stock transfer" }
    }

    return { data: result }
  } catch (error) {
    console.error("Error approving stock transfer:", error)
    return { error: "Failed to approve stock transfer" }
  }
}

export async function rejectStockTransfer(transferId: string, reason: string) {
  try {
    const response = await fetch(`${API_BASE_URL}/products/transfers/${transferId}/reject`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ reason }),
    })

    const result = await response.json()

    if (!response.ok) {
      return { error: result.message || "Failed to reject stock transfer" }
    }

    return { data: result }
  } catch (error) {
    console.error("Error rejecting stock transfer:", error)
    return { error: "Failed to reject stock transfer" }
  }
}

export async function getReportStatistics() {
  return apiRequest("/dashboard/report-statistics")
}

export async function getSales() {
  return apiRequest("/sales")
}

export async function getManagerReportStatistics() {
  return apiRequest("/manager/dashboard/report-statistics")
}

export async function getManagerDashboardOverview() {
  return apiRequest("/manager/dashboard/overview")
} 