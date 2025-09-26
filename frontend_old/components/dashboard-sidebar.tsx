import { Home, Users, FileText, Shield, BarChart3, Settings, HelpCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface DashboardSidebarProps {
  currentStep: number
}

export function DashboardSidebar({ currentStep }: DashboardSidebarProps) {
  const navItems = [
    { icon: Home, label: "Dashboard", active: false },
    { icon: Users, label: "Clients", active: true },
    { icon: FileText, label: "Documents", active: false },
    { icon: Shield, label: "Compliance", active: false },
    { icon: BarChart3, label: "Reports", active: false },
    { icon: Settings, label: "Settings", active: false },
  ]

  const steps = [
    { number: 1, label: "File Upload" },
    { number: 2, label: "Processing" },
    { number: 3, label: "Validation Results" },
  ]

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <div className="h-10 w-24 relative">
          <Image src="/logo.png" alt="Julius Baer Logo" fill className="object-contain" />
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item, index) => (
          <a
            key={index}
            href=""
            className={cn(
              "flex items-center px-4 py-3 text-sm font-medium rounded-md",
              item.active ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
            )}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </a>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">KYC Process</h3>
        </div>
        <div className="space-y-4">
          {steps.map((step) => (
            <div key={step.number} className="flex items-center">
              <div
                className={cn(
                  "flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step.number === currentStep
                    ? "bg-[#0A2277] text-white"
                    : step.number < currentStep
                      ? "bg-green-100 text-green-600 border border-green-600"
                      : "bg-gray-100 text-gray-500",
                )}
              >
                {step.number < currentStep ? "✓" : step.number}
              </div>
              <div className="ml-3 text-sm font-medium text-gray-900">{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-gray-200">
        <a
          href="#"
          className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
        >
          <HelpCircle className="mr-3 h-5 w-5" />
          Help & Support
        </a>
      </div>
    </div>
  )
}
