export interface Location {
  id: string
  name: string
  address: string
  city: string
  region: string
  phone: string
  managerId: string
  managerName: string
  status: "active" | "inactive"
  createdAt: string
}

export interface User {
  id: string
  username: string
  name: string
  email: string
  phone: string
  role: "superuser" | "manager" | "cashier"
  locationId?: string
  locationName?: string
  status: "active" | "inactive" | "pending"
  createdAt: string
  lastLogin?: string
  createdBy: string
  createdByName: string
}

export interface Product {
  id: string
  name: string
  description: string
  category: string
  barcode: string
  basePrice: number
  baseCost: number
  createdAt: string
  createdBy: string
  createdByName: string
}

export interface LocationStock {
  id: string
  productId: string
  productName: string
  locationId: string
  locationName: string
  stock: number
  minStock: number
  price: number
  cost: number
  lastUpdated: string
  updatedBy: string
  updatedByName: string
}

export interface Sale {
  id: string
  locationId: string
  locationName: string
  items: SaleItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  cashierId: string
  cashierName: string
  customerId?: string
  customerName?: string
  createdAt: string
  status: "completed" | "refunded" | "pending"
}

export interface SaleItem {
  productId: string
  productName: string
  quantity: number
  price: number
  total: number
}

export interface Expense {
  id: string
  locationId: string
  locationName: string
  description: string
  amount: number
  category: string
  date: string
  createdBy: string
  createdByName: string
  createdByRole: string
  receipt?: string
  notes?: string
  approvedBy?: string
  approvedByName?: string
  status: "pending" | "approved" | "rejected"
}

export interface StockTransfer {
  id: string
  productId: string
  productName: string
  fromLocationId: string
  fromLocationName: string
  toLocationId: string
  toLocationName: string
  quantity: number
  requestedBy: string
  requestedByName: string
  approvedBy?: string
  approvedByName?: string
  status: "pending" | "approved" | "rejected" | "completed"
  requestDate: string
  approvedDate?: string
  completedDate?: string
  notes?: string
}

export interface UserRequest {
  id: string
  requestType: "create_cashier"
  requestedBy: string
  requestedByName: string
  locationId: string
  locationName: string
  userData: {
    name: string
    email: string
    phone: string
    username: string
  }
  status: "pending" | "approved" | "rejected"
  requestDate: string
  reviewedBy?: string
  reviewedByName?: string
  reviewedDate?: string
  notes?: string
}

// Tanzania Locations
export const mockLocations: Location[] = [
  {
    id: "LOC-001",
    name: "Kariakoo Branch",
    address: "Kariakoo Market, Msimbazi Street",
    city: "Dar es Salaam",
    region: "Dar es Salaam",
    phone: "+255 22 218 0001",
    managerId: "2",
    managerName: "Amina Hassan",
    status: "active",
    createdAt: "2024-01-01T10:00:00Z",
  },
  {
    id: "LOC-002",
    name: "Mwanza Central",
    address: "Kenyatta Road, City Centre",
    city: "Mwanza",
    region: "Mwanza",
    phone: "+255 28 250 0002",
    managerId: "3",
    managerName: "John Mwalimu",
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
  },
  {
    id: "LOC-003",
    name: "Arusha Mall",
    address: "Sokoine Road, Arusha Mall",
    city: "Arusha",
    region: "Arusha",
    phone: "+255 27 254 0003",
    managerId: "4",
    managerName: "Grace Kimaro",
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
  },
  {
    id: "LOC-004",
    name: "Dodoma Plaza",
    address: "Uhuru Avenue, Dodoma Plaza",
    city: "Dodoma",
    region: "Dodoma",
    phone: "+255 26 232 0004",
    managerId: "5",
    managerName: "Ibrahim Ally",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
  },
]

// Users with Tanzania names and hierarchy
export const mockUsers: User[] = [
  {
    id: "1",
    username: "superuser",
    name: "Mohamed Rashid",
    email: "mohamed.rashid@postz.com",
    phone: "+255 754 123 001",
    role: "superuser",
    status: "active",
    createdAt: "2024-01-01T10:00:00Z",
    lastLogin: "2024-01-25T08:30:00Z",
    createdBy: "1",
    createdByName: "System",
  },
  {
    id: "2",
    username: "manager_dar",
    name: "Amina Hassan",
    email: "amina.hassan@postz.com",
    phone: "+255 713 456 002",
    role: "manager",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    status: "active",
    createdAt: "2024-01-02T10:00:00Z",
    lastLogin: "2024-01-25T09:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "3",
    username: "manager_mwanza",
    name: "John Mwalimu",
    email: "john.mwalimu@postz.com",
    phone: "+255 765 789 003",
    role: "manager",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    status: "active",
    createdAt: "2024-01-05T10:00:00Z",
    lastLogin: "2024-01-24T16:30:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "4",
    username: "manager_arusha",
    name: "Grace Kimaro",
    email: "grace.kimaro@postz.com",
    phone: "+255 784 321 004",
    role: "manager",
    locationId: "LOC-003",
    locationName: "Arusha Mall",
    status: "active",
    createdAt: "2024-01-10T10:00:00Z",
    lastLogin: "2024-01-25T07:45:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "5",
    username: "manager_dodoma",
    name: "Ibrahim Ally",
    email: "ibrahim.ally@postz.com",
    phone: "+255 756 654 005",
    role: "manager",
    locationId: "LOC-004",
    locationName: "Dodoma Plaza",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    lastLogin: "2024-01-23T14:15:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "6",
    username: "cashier_dar_1",
    name: "Fatuma Juma",
    email: "fatuma.juma@postz.com",
    phone: "+255 745 987 006",
    role: "cashier",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    status: "active",
    createdAt: "2024-01-20T10:00:00Z",
    lastLogin: "2024-01-25T08:00:00Z",
    createdBy: "2",
    createdByName: "Amina Hassan",
  },
  {
    id: "7",
    username: "cashier_dar_2",
    name: "Hassan Mwamba",
    email: "hassan.mwamba@postz.com",
    phone: "+255 762 345 007",
    role: "cashier",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    status: "active",
    createdAt: "2024-01-22T10:00:00Z",
    lastLogin: "2024-01-24T18:30:00Z",
    createdBy: "2",
    createdByName: "Amina Hassan",
  },
  {
    id: "8",
    username: "cashier_mwanza_1",
    name: "Mary Magesa",
    email: "mary.magesa@postz.com",
    phone: "+255 754 678 008",
    role: "cashier",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    status: "active",
    createdAt: "2024-01-18T10:00:00Z",
    lastLogin: "2024-01-25T09:15:00Z",
    createdBy: "3",
    createdByName: "John Mwalimu",
  },
]

// Products with Tanzania context
export const mockProducts: Product[] = [
  {
    id: "PROD-001",
    name: "Samsung Galaxy A54",
    description: "Mid-range smartphone with excellent camera",
    category: "Mobile Phones",
    barcode: "8801643718039",
    basePrice: 850000, // TSh
    baseCost: 650000,
    createdAt: "2024-01-15T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "PROD-002",
    name: "Tecno Spark 10 Pro",
    description: "Affordable smartphone with good performance",
    category: "Mobile Phones",
    barcode: "6901443394876",
    basePrice: 420000,
    baseCost: 320000,
    createdAt: "2024-01-16T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "PROD-003",
    name: "HP Laptop 15-dw3000",
    description: "Business laptop with Intel Core i5",
    category: "Computers",
    barcode: "194850123456",
    basePrice: 1850000,
    baseCost: 1450000,
    createdAt: "2024-01-17T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "PROD-004",
    name: "JBL Go 3 Speaker",
    description: "Portable Bluetooth speaker",
    category: "Audio",
    barcode: "6925281982767",
    basePrice: 85000,
    baseCost: 65000,
    createdAt: "2024-01-18T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "PROD-005",
    name: "Power Bank 20000mAh",
    description: "High capacity portable charger",
    category: "Accessories",
    barcode: "6971536921234",
    basePrice: 45000,
    baseCost: 32000,
    createdAt: "2024-01-19T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
  {
    id: "PROD-006",
    name: "USB Flash Drive 64GB",
    description: "High-speed USB 3.0 flash drive",
    category: "Storage",
    barcode: "1234567890123",
    basePrice: 25000,
    baseCost: 18000,
    createdAt: "2024-01-20T10:00:00Z",
    createdBy: "1",
    createdByName: "Mohamed Rashid",
  },
]

// Location-specific stock
export const mockLocationStock: LocationStock[] = [
  // Kariakoo Branch Stock
  {
    id: "STOCK-001",
    productId: "PROD-001",
    productName: "Samsung Galaxy A54",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    stock: 15,
    minStock: 5,
    price: 850000,
    cost: 650000,
    lastUpdated: "2024-01-25T10:00:00Z",
    updatedBy: "2",
    updatedByName: "Amina Hassan",
  },
  {
    id: "STOCK-002",
    productId: "PROD-002",
    productName: "Tecno Spark 10 Pro",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    stock: 25,
    minStock: 10,
    price: 420000,
    cost: 320000,
    lastUpdated: "2024-01-25T10:00:00Z",
    updatedBy: "2",
    updatedByName: "Amina Hassan",
  },
  {
    id: "STOCK-003",
    productId: "PROD-003",
    productName: "HP Laptop 15-dw3000",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    stock: 8,
    minStock: 3,
    price: 1850000,
    cost: 1450000,
    lastUpdated: "2024-01-25T10:00:00Z",
    updatedBy: "2",
    updatedByName: "Amina Hassan",
  },
  // Mwanza Central Stock
  {
    id: "STOCK-004",
    productId: "PROD-001",
    productName: "Samsung Galaxy A54",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    stock: 12,
    minStock: 5,
    price: 870000, // Slightly different pricing
    cost: 650000,
    lastUpdated: "2024-01-24T10:00:00Z",
    updatedBy: "3",
    updatedByName: "John Mwalimu",
  },
  {
    id: "STOCK-005",
    productId: "PROD-004",
    productName: "JBL Go 3 Speaker",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    stock: 30,
    minStock: 10,
    price: 85000,
    cost: 65000,
    lastUpdated: "2024-01-24T10:00:00Z",
    updatedBy: "3",
    updatedByName: "John Mwalimu",
  },
  // Arusha Mall Stock
  {
    id: "STOCK-006",
    productId: "PROD-005",
    productName: "Power Bank 20000mAh",
    locationId: "LOC-003",
    locationName: "Arusha Mall",
    stock: 50,
    minStock: 15,
    price: 45000,
    cost: 32000,
    lastUpdated: "2024-01-23T10:00:00Z",
    updatedBy: "4",
    updatedByName: "Grace Kimaro",
  },
]

// Sales with Tanzania context
export const mockSales: Sale[] = [
  {
    id: "SALE-KAR-001",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    items: [
      { productId: "PROD-001", productName: "Samsung Galaxy A54", quantity: 1, price: 850000, total: 850000 },
      { productId: "PROD-005", productName: "Power Bank 20000mAh", quantity: 1, price: 45000, total: 45000 },
    ],
    subtotal: 895000,
    tax: 161100, // 18% VAT
    total: 1056100,
    paymentMethod: "M-Pesa",
    cashierId: "6",
    cashierName: "Fatuma Juma",
    customerName: "Mwalimu Nyerere",
    createdAt: "2024-01-25T14:30:00Z",
    status: "completed",
  },
  {
    id: "SALE-KAR-002",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    items: [{ productId: "PROD-002", productName: "Tecno Spark 10 Pro", quantity: 1, price: 420000, total: 420000 }],
    subtotal: 420000,
    tax: 75600,
    total: 495600,
    paymentMethod: "Cash",
    cashierId: "7",
    cashierName: "Hassan Mwamba",
    customerName: "Mama Salma",
    createdAt: "2024-01-25T13:15:00Z",
    status: "completed",
  },
  {
    id: "SALE-MWZ-001",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    items: [
      { productId: "PROD-001", productName: "Samsung Galaxy A54", quantity: 1, price: 870000, total: 870000 },
      { productId: "PROD-004", productName: "JBL Go 3 Speaker", quantity: 2, price: 85000, total: 170000 },
    ],
    subtotal: 1040000,
    tax: 187200,
    total: 1227200,
    paymentMethod: "Tigo Pesa",
    cashierId: "8",
    cashierName: "Mary Magesa",
    customerName: "Bwana Juma",
    createdAt: "2024-01-25T12:00:00Z",
    status: "completed",
  },
]

// Expenses with Tanzania context
export const mockExpenses: Expense[] = [
  {
    id: "EXP-KAR-001",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    description: "Umeme Bill - January 2024",
    amount: 450000,
    category: "Utilities",
    date: "2024-01-25T09:00:00Z",
    createdBy: "2",
    createdByName: "Amina Hassan",
    createdByRole: "manager",
    status: "approved",
    notes: "Monthly electricity bill from TANESCO",
  },
  {
    id: "EXP-KAR-002",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    description: "Transport - Product Delivery",
    amount: 85000,
    category: "Transport",
    date: "2024-01-24T14:30:00Z",
    createdBy: "6",
    createdByName: "Fatuma Juma",
    createdByRole: "cashier",
    status: "approved",
    notes: "Delivery from supplier in Ubungo",
  },
  {
    id: "EXP-MWZ-001",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    description: "Rent - February 2024",
    amount: 1200000,
    category: "Rent",
    date: "2024-01-23T11:15:00Z",
    createdBy: "3",
    createdByName: "John Mwalimu",
    createdByRole: "manager",
    status: "approved",
    notes: "Monthly shop rent",
  },
]

// Stock Transfer Requests
export const mockStockTransfers: StockTransfer[] = [
  {
    id: "TRANS-001",
    productId: "PROD-001",
    productName: "Samsung Galaxy A54",
    fromLocationId: "LOC-001",
    fromLocationName: "Kariakoo Branch",
    toLocationId: "LOC-003",
    toLocationName: "Arusha Mall",
    quantity: 5,
    requestedBy: "4",
    requestedByName: "Grace Kimaro",
    status: "pending",
    requestDate: "2024-01-25T10:00:00Z",
    notes: "Need stock for weekend promotion",
  },
  {
    id: "TRANS-002",
    productId: "PROD-004",
    productName: "JBL Go 3 Speaker",
    fromLocationId: "LOC-002",
    fromLocationName: "Mwanza Central",
    toLocationId: "LOC-001",
    toLocationName: "Kariakoo Branch",
    quantity: 10,
    requestedBy: "2",
    requestedByName: "Amina Hassan",
    approvedBy: "3",
    approvedByName: "John Mwalimu",
    status: "approved",
    requestDate: "2024-01-24T14:00:00Z",
    approvedDate: "2024-01-24T16:00:00Z",
    notes: "High demand in Dar es Salaam",
  },
]

// User Creation Requests
export const mockUserRequests: UserRequest[] = [
  {
    id: "REQ-001",
    requestType: "create_cashier",
    requestedBy: "2",
    requestedByName: "Amina Hassan",
    locationId: "LOC-001",
    locationName: "Kariakoo Branch",
    userData: {
      name: "Zuberi Mwalimu",
      email: "zuberi.mwalimu@postz.com",
      phone: "+255 745 123 999",
      username: "cashier_dar_3",
    },
    status: "pending",
    requestDate: "2024-01-25T09:00:00Z",
    notes: "Need additional cashier for weekend shifts",
  },
  {
    id: "REQ-002",
    requestType: "create_cashier",
    requestedBy: "3",
    requestedByName: "John Mwalimu",
    locationId: "LOC-002",
    locationName: "Mwanza Central",
    userData: {
      name: "Neema Shayo",
      email: "neema.shayo@postz.com",
      phone: "+255 765 456 888",
      username: "cashier_mwanza_2",
    },
    status: "approved",
    requestDate: "2024-01-23T11:00:00Z",
    reviewedBy: "1",
    reviewedByName: "Mohamed Rashid",
    reviewedDate: "2024-01-24T08:00:00Z",
    notes: "Approved - Good business justification",
  },
]

export const expenseCategories = [
  "Utilities", // Umeme, Maji
  "Rent", // Kodi
  "Transport", // Usafiri
  "Marketing", // Uuzaji
  "Maintenance", // Matengenezo
  "Equipment", // Vifaa
  "Food & Beverages", // Chakula
  "Professional Services", // Huduma za Kitaalamu
  "Insurance", // Bima
  "Security", // Usalama
  "Communication", // Mawasiliano
  "Other", // Mengineyo
]

export const productCategories = [
  "Mobile Phones", // Simu za Mkononi
  "Computers", // Kompyuta
  "Tablets", // Kompyuta za Mkononi
  "Audio", // Sauti
  "Accessories", // Vifaa vya Ziada
  "Storage", // Hifadhi
  "Software", // Programu
  "Other", // Mengineyo
]

// Helper function to format TSh currency
export const formatTSh = (amount: number): string => {
  return `TSh ${amount.toLocaleString("en-US")}`
}

// Helper function to get location by user
export const getUserLocation = (user: User): Location | undefined => {
  return mockLocations.find((loc) => loc.id === user.locationId)
}

// Helper function to get users by location
export const getUsersByLocation = (locationId: string): User[] => {
  return mockUsers.filter((user) => user.locationId === locationId)
}

// Helper function to get stock by location
export const getStockByLocation = (locationId: string): LocationStock[] => {
  return mockLocationStock.filter((stock) => stock.locationId === locationId)
}
