"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const recentSales = [
  { id: 1, customer: "John Doe", amount: 125.5, time: "2 minutes ago" },
  { id: 2, customer: "Jane Smith", amount: 89.99, time: "5 minutes ago" },
  { id: 3, customer: "Bob Johnson", amount: 234.75, time: "12 minutes ago" },
  { id: 4, customer: "Alice Brown", amount: 67.25, time: "18 minutes ago" },
  { id: 5, customer: "Charlie Wilson", amount: 156.8, time: "25 minutes ago" },
]

export function RecentSales() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Sales</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSales.map((sale) => (
            <div key={sale.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {sale.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{sale.customer}</p>
                  <p className="text-xs text-muted-foreground">{sale.time}</p>
                </div>
              </div>
              <div className="text-sm font-medium">${sale.amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
