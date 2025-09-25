"use client"

import { useState } from "react"
import { FileUpload } from "@/components/file-upload"
import { Processing } from "@/components/processing"
import { ValidationResults } from "@/components/validation-results"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"

export type FileType = "passport" | "profile" | "form" | "description"

export interface UploadedFile {
  id: string
  name: string
  type: FileType
  size: number
  uploaded: boolean
}

export interface ValidationResult {
  status: "success" | "failed"
  confidenceScore?: number
  creditScore?: number
  riskFactor?: number
  errorDetails?: {
    documentType: FileType
    description: string
    location: string
  }[]
}

export default function KycDashboard() {
  const [currentStep, setCurrentStep] = useState<number>(1)
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [riskThreshold, setRiskThreshold] = useState<number>(50)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)

  const handleFileUpload = (newFiles: UploadedFile[]) => {
    setFiles([...files, ...newFiles])
  }

  const handleProcessing = () => {
    setCurrentStep(2)

    // Simulate processing delay
    setTimeout(() => {
      // Replace the random validation logic with this time-based approach:

      // Use the current timestamp to determine success/failure
      // If the current second is even, success; if odd, failure
      const now = new Date()
      const isSuccess = now.getSeconds() % 2 === 0
      console.log("Current second:", now.getSeconds(), "isSuccess:", isSuccess)

      setValidationResult({
        status: isSuccess ? "success" : "failed",
        confidenceScore: isSuccess ? Math.floor(Math.random() * 30) + 70 : Math.floor(Math.random() * 50) + 20,
        creditScore: isSuccess ? Math.floor(Math.random() * 2) + 7 : Math.floor(Math.random() * 4) + 3,
        riskFactor: isSuccess ? Math.floor(Math.random() * 30) + 10 : Math.floor(Math.random() * 40) + 60,
        errorDetails: !isSuccess
          ? [
              {
                documentType: "passport",
                description: "Missing gender information (Sex field)",
                location: "Page 1, Section 'Sex'",
              },
              {
                documentType: "form",
                description: "Missing specimen signature",
                location: "Page 1, Bottom section",
              },
            ]
          : undefined,
      })

      setCurrentStep(3)
    }, 3000)
  }

  const handleRiskThresholdChange = (value: number) => {
    setRiskThreshold(value)
  }

  const resetProcess = () => {
    setCurrentStep(1)
    setFiles([])
    setValidationResult(null)
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar currentStep={currentStep} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {currentStep === 1 && (
              <FileUpload
                files={files}
                onFileUpload={handleFileUpload}
                riskThreshold={riskThreshold}
                onRiskThresholdChange={handleRiskThresholdChange}
                onProcessing={handleProcessing}
              />
            )}

            {currentStep === 2 && <Processing />}

            {currentStep === 3 && validationResult && (
              <ValidationResults result={validationResult} files={files} onReset={resetProcess} />
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
