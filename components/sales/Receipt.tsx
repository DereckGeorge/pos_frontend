"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Printer, Download } from "lucide-react"

interface ReceiptItem {
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
}

interface ReceiptProps {
  sale: {
    id: string
    receipt_number: string
    date: string
    items: ReceiptItem[]
    subtotal: number
    vat_amount: number
    total_amount: number
    payment_method: string
    payment_reference: string
    cashier_name: string
    branch_name: string
    branch_location: string
  }
  onClose: () => void
}

export default function Receipt({ sale, onClose }: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null)

  const formatTSh = (amount: number) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-TZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const printReceipt = () => {
    if (receiptRef.current) {
      const printWindow = window.open('', '_blank')
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Receipt - ${sale.receipt_number}</title>
            <style>
              body { 
                font-family: 'Courier New', monospace; 
                margin: 0; 
                padding: 20px; 
                font-size: 12px;
                line-height: 1.2;
              }
              .receipt { 
                max-width: 300px; 
                margin: 0 auto; 
                border: 1px solid #000;
                padding: 10px;
              }
              .header { 
                text-align: center; 
                margin-bottom: 15px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .company-name { 
                font-size: 16px; 
                font-weight: bold; 
                margin-bottom: 5px;
              }
              .branch-info { 
                font-size: 11px; 
                margin-bottom: 5px;
              }
              .receipt-details { 
                margin-bottom: 15px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .items { 
                margin-bottom: 15px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .item { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 5px;
              }
              .item-name { 
                flex: 1; 
                margin-right: 10px;
              }
              .item-details { 
                text-align: right; 
                min-width: 80px;
              }
              .totals { 
                margin-bottom: 15px; 
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
              }
              .total-row { 
                display: flex; 
                justify-content: space-between; 
                margin-bottom: 3px;
              }
              .total-row.final { 
                font-weight: bold; 
                font-size: 14px;
                border-top: 1px solid #000;
                padding-top: 5px;
                margin-top: 5px;
              }
              .footer { 
                text-align: center; 
                font-size: 10px;
                margin-top: 15px;
              }
              @media print {
                body { margin: 0; }
                .receipt { border: none; }
              }
            </style>
          </head>
          <body>
            ${receiptRef.current.innerHTML}
          </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    }
  }

  const downloadReceipt = () => {
    if (receiptRef.current) {
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt - ${sale.receipt_number}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              font-size: 14px;
            }
            .receipt { 
              max-width: 400px; 
              margin: 0 auto; 
              border: 2px solid #333;
              padding: 20px;
              border-radius: 8px;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #333;
              padding-bottom: 15px;
            }
            .company-name { 
              font-size: 20px; 
              font-weight: bold; 
              margin-bottom: 8px;
              color: #333;
            }
            .branch-info { 
              font-size: 14px; 
              margin-bottom: 5px;
              color: #666;
            }
            .receipt-details { 
              margin-bottom: 20px; 
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
            }
            .items { 
              margin-bottom: 20px; 
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
            }
            .item { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 8px;
              padding: 5px 0;
            }
            .item-name { 
              flex: 1; 
              margin-right: 15px;
            }
            .item-details { 
              text-align: right; 
              min-width: 100px;
            }
            .totals { 
              margin-bottom: 20px; 
              border-bottom: 1px solid #ccc;
              padding-bottom: 15px;
            }
            .total-row { 
              display: flex; 
              justify-content: space-between; 
              margin-bottom: 5px;
              padding: 3px 0;
            }
            .total-row.final { 
              font-weight: bold; 
              font-size: 16px;
              border-top: 2px solid #333;
              padding-top: 8px;
              margin-top: 8px;
            }
            .footer { 
              text-align: center; 
              font-size: 12px;
              margin-top: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          ${receiptRef.current.innerHTML}
        </body>
        </html>
      `
      
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `receipt_${sale.receipt_number}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Receipt</h2>
            <Button variant="outline" size="sm" onClick={onClose}>
              ×
            </Button>
          </div>
          
          <div ref={receiptRef} className="receipt bg-white p-4 border border-gray-300 rounded">
            {/* Header */}
            <div className="header">
              <div className="company-name">POS SYSTEM</div>
              <div className="branch-info">{sale.branch_name}</div>
              <div className="branch-info">{sale.branch_location}</div>
              <div className="branch-info">TIN: 123456789</div>
              <div className="branch-info">VAT Reg: VAT123456789</div>
            </div>

            {/* Receipt Details */}
            <div className="receipt-details">
              <div className="item">
                <span>Receipt No:</span>
                <span>{sale.receipt_number}</span>
              </div>
              <div className="item">
                <span>Date:</span>
                <span>{formatDate(sale.date)}</span>
              </div>
              <div className="item">
                <span>Cashier:</span>
                <span>{sale.cashier_name}</span>
              </div>
            </div>

            {/* Items */}
            <div className="items">
              <div className="item" style={{ fontWeight: 'bold', borderBottom: '1px solid #000', paddingBottom: '5px', marginBottom: '10px' }}>
                <span>Item</span>
                <span>Qty</span>
                <span>Price</span>
                <span>Total</span>
              </div>
              {sale.items.map((item, index) => (
                <div key={index} className="item">
                  <div className="item-name">{item.product_name}</div>
                  <div className="item-details">
                    <div>{item.quantity}</div>
                    <div>{formatTSh(item.unit_price)}</div>
                    <div>{formatTSh(item.total_price)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="totals">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatTSh(sale.subtotal)}</span>
              </div>
              <div className="total-row">
                <span>VAT (18%):</span>
                <span>{formatTSh(sale.vat_amount)}</span>
              </div>
              <div className="total-row final">
                <span>TOTAL:</span>
                <span>{formatTSh(sale.total_amount)}</span>
              </div>
            </div>

            {/* Payment Info */}
            <div className="receipt-details">
              <div className="item">
                <span>Payment Method:</span>
                <span>{sale.payment_method.toUpperCase()}</span>
              </div>
              {sale.payment_reference && (
                <div className="item">
                  <span>Reference:</span>
                  <span>{sale.payment_reference}</span>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="footer">
              <div>Thank you for your purchase!</div>
              <div>Please keep this receipt for your records</div>
              <div>For inquiries: {sale.branch_location}</div>
              <div>Generated on: {formatDate(new Date().toISOString())}</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 mt-4">
            <Button onClick={printReceipt} className="flex-1">
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button variant="outline" onClick={downloadReceipt} className="flex-1">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 