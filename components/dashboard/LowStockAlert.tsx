"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

const lowStockItems = [
  { id: 1, name: "iPhone 15 Pro", stock: 3, minStock: 10 },
  { id: 2, name: "Samsung Galaxy S24", stock: 1, minStock: 5 },
  { id: 3, name: "MacBook Air M3", stock: 2, minStock: 8 },
]

export function LowStockAlert() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Low Stock Alert</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {lowStockItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current stock: {item.stock} | Minimum: {item.minStock}
                </p>
              </div>
              <Badge variant="destructive">Low Stock</Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
