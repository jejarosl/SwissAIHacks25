import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

interface PassportInfoProps {
  isSuccess: boolean
}

export function PassportInfo({ isSuccess }: PassportInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle>Contact Info</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-shrink-0 w-full md:w-32 h-40 bg-gray-100 rounded-md flex items-center justify-center">
            <User className="h-16 w-16 text-gray-400" />
          </div>

          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                <p className="text-gray-900">Simon Lukas Hoffmann</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                <p className="text-gray-900">24 December 2000</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Estimated Wealth</h3>
                <p className="text-gray-900">≈ 9.87M CHF</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Country of Origin</h3>
                <p className="text-gray-900">Germany</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Citizenship</h3>
                <p className="text-gray-900">German</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Street Address</h3>
                <p className="text-gray-900">Bahnhofstrasse 123, Zürich</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Wealth Summary</h3>
              <p className="text-gray-900 text-sm">
                Client has significant assets in real estate, with two properties comprising over 88% of total wealth.
                Primary income from shipping company. Recently received inheritance of 510,000 EUR from family member.
                Portfolio shows 12% growth since last year.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
