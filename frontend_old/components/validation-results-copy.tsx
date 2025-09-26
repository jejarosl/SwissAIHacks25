"use client"

import { useState } from "react"
import type { UploadedFile, ValidationResult } from "@/components/kyc-dashboard"
import { PassportInfo } from "@/components/passport-info"
import { AiChatbox } from "@/components/ai-chatbox"
import { ClientTimeline } from "@/components/client-timeline"
import { WealthChart } from "@/components/wealth-chart"
import { DocumentViewer } from "@/components/document-viewer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, CheckCircle, Download, Send, Eye, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

interface ValidationResultsProps {
  result: ValidationResult
  files: UploadedFile[]
  onReset: () => void
}

export function ValidationResults({ result, files, onReset }: ValidationResultsProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const [viewingDocument, setViewingDocument] = useState<string | null>(null)

  const isSuccess = result.status === "success"

  const handleViewDocument = (documentType: string) => {
    setViewingDocument(documentType)
  }

  const handleCloseViewer = () => {
    setViewingDocument(null)
  }

  return (
    <div className="space-y-6 pb-10">
      <div
        className={cn("p-4 rounded-lg flex items-center justify-between", isSuccess ? "bg-green-100" : "bg-red-100")}
      >
        <div className="flex items-center">
          {isSuccess ? (
            <CheckCircle className="h-6 w-6 text-green-600 mr-3" />
          ) : (
            <AlertTriangle className="h-6 w-6 text-red-600 mr-3" />
          )}
          <div>
            <h2 className={cn("text-lg font-semibold", isSuccess ? "text-green-800" : "text-red-800")}>
              Validation {isSuccess ? "Successful" : "Failed"}
            </h2>
            <p className={cn("text-sm", isSuccess ? "text-green-700" : "text-red-700")}>
              {isSuccess
                ? "All documents have been successfully validated."
                : "There are issues with the submitted documents that require attention."}
            </p>
          </div>
        </div>

        {isSuccess && (
          <div className="flex space-x-3">
            <Button size="sm" variant="outline" className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button size="sm" className="flex items-center bg-[#0A2277] hover:bg-[#081a5e]">
              <Download className="h-4 w-4 mr-2" />
              Export to CRM
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {isSuccess && (
                  <>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Confidence Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{result.confidenceScore}%</div>
                        <p className="text-xs text-gray-500 mt-1">Based on document consistency</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Credit Score</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{result.creditScore?.toFixed(1)}/10</div>
                        <p className="text-xs text-gray-500 mt-1">Estimated creditworthiness</p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Risk Factor</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{result.riskFactor}%</div>
                        <p className="text-xs text-gray-500 mt-1">Overall risk assessment</p>
                      </CardContent>
                    </Card>
                  </>
                )}

                {!isSuccess && result.errorDetails && (
                  <Card className="md:col-span-3">
                    <CardHeader>
                      <CardTitle>Validation Issues</CardTitle>
                      <CardDescription>The following issues were found during document validation</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {result.errorDetails.map((error, index) => (
                          <li key={index} className="flex items-start p-3 rounded-md bg-red-50 border border-red-100">
                            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <h4 className="font-medium text-red-800">
                                {error.documentType === "passport"
                                  ? "Passport"
                                  : error.documentType === "profile"
                                    ? "Client Profile"
                                    : error.documentType === "form"
                                      ? "Account Opening Form"
                                      : "Client Description"}
                              </h4>
                              <p className="text-sm text-red-700">{error.description}</p>
                              <p className="text-xs text-red-600 mt-1">Location: {error.location}</p>
                              <Button
                                variant="link"
                                size="sm"
                                className="text-red-600 p-0 h-auto mt-1 flex items-center"
                                onClick={() => handleViewDocument(error.documentType)}
                              >
                                <ExternalLink className="h-3 w-3 mr-1" />
                                See more
                              </Button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>

              <PassportInfo isSuccess={isSuccess} />

              {isSuccess && <WealthChart />}
            </TabsContent>

            <TabsContent value="documents" className="pt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Parsed Documents</CardTitle>
                  <CardDescription>Review all documents submitted for this KYC verification</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {files.map((file) => (
                      <li
                        key={file.id}
                        className="flex items-center justify-between p-3 rounded-md border border-gray-200"
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <Download className="h-5 w-5 text-gray-500" />
                          </div>
                          <div className="ml-3">
                            <p className="font-medium text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(0)} KB •{" "}
                              {file.type === "passport"
                                ? "Passport"
                                : file.type === "profile"
                                  ? "Client Profile"
                                  : file.type === "form"
                                    ? "Account Opening Form"
                                    : "Client Description"}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(file.type)}
                          className="flex items-center"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="pt-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Validation Details</CardTitle>
                  <CardDescription>Detailed information about the validation process</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Validation ID</h3>
                      <p className="text-gray-900">KYC-{Math.random().toString(36).substring(2, 10).toUpperCase()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Timestamp</h3>
                      <p className="text-gray-900">{new Date().toLocaleString()}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Validation Method</h3>
                      <p className="text-gray-900">Automated Document Analysis + AI Verification</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Compliance Standards</h3>
                      <p className="text-gray-900">Guideline (EU) directive 2025/№4412, Local Regulations</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
        {isSuccess && <ClientTimeline />}
          <AiChatbox />
        </div>
      </div>

      {viewingDocument && <DocumentViewer documentType={viewingDocument} onClose={handleCloseViewer} />}
    </div>
  )
}
