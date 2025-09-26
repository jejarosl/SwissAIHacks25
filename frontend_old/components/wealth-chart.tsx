"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ArrowUp } from "lucide-react"

interface WealthChartProps {
  className?: string
}

export function WealthChart({ className }: WealthChartProps) {
  // Financial data for wealth breakdown
  const financialData = [
    { name: "Primary Residence", value: 2950000, details: "Condo, Neuchâtel", percentage: "30.8%" },
    { name: "Holiday Property", value: 5770000, details: "Villa, Bienna", percentage: "60.3%" },
    { name: "Savings", value: 360000, details: "From Investments", percentage: "3.8%" },
    { name: "Inheritance", value: 484500, details: "Converted from 510,000 EUR", percentage: "5.1%" },
  ]

  const totalNetWorth = financialData.reduce((sum, item) => sum + item.value, 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-CH", {
      style: "currency",
      currency: "CHF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
      .format(value)
      .replace(/\s/g, "'")
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Wealth Breakdown</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1 text-green-600 mt-1">
                <ArrowUp className="h-3 w-3" />
              </div>
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Total Estimated Wealth</div>
            <div className="text-xl font-bold text-[#0A2277]">{formatCurrency(totalNetWorth)}</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {financialData.map((item, index) => (
            <div key={index} className="flex justify-between items-center p-3 rounded-md border">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        index === 0 ? "#0A2463" : index === 1 ? "#3D5A80" : index === 2 ? "#98C1D9" : "#D4AF37",
                    }}
                  ></div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <p className="text-xs text-gray-500 ml-5">{item.details}</p>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatCurrency(item.value)}</div>
                <div className="text-xs text-gray-500">{item.percentage}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
