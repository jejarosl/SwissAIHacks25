"use client"

import { useState, useCallback } from "react"
import type { FileType, UploadedFile } from "@/components/kyc-dashboard"
import { FileIcon, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { useDropzone } from "react-dropzone"
import { v4 as uuidv4 } from "uuid"

interface FileUploadProps {
  files: UploadedFile[]
  onFileUpload: (files: UploadedFile[]) => void
  riskThreshold: number
  onRiskThresholdChange: (value: number) => void
  onProcessing: () => void
}

export function FileUpload({
  files,
  onFileUpload,
  riskThreshold,
  onRiskThresholdChange,
  onProcessing,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const requiredFiles = [
    { type: "passport", label: "Passport", format: "PNG", icon: FileIcon },
    { type: "profile", label: "Client Profile", format: "DOCX", icon: FileIcon },
    { type: "form", label: "Account Opening Form", format: "PDF", icon: FileIcon },
    { type: "description", label: "Client Description", format: "TXT", icon: FileIcon },
  ]

  const getFileTypeFromName = (fileName: string): FileType | null => {
    const extension = fileName.split(".").pop()?.toLowerCase()

    if (extension === "png") return "passport"
    if (extension === "docx" || extension === "doc") return "profile"
    if (extension === "pdf") return "form"
    if (extension === "txt") return "description"

    return null
  }

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newFiles = acceptedFiles
        .map((file) => {
          const fileType = getFileTypeFromName(file.name)

          if (!fileType) {
            // Skip files with unrecognized extensions
            return null
          }

          return {
            id: uuidv4(),
            name: file.name,
            type: fileType,
            size: file.size,
            uploaded: true,
          }
        })
        .filter(Boolean) as UploadedFile[]

      if (newFiles.length > 0) {
        onFileUpload(newFiles)
      }
    },
    [onFileUpload],
  )

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    onDropAccepted: () => setDragActive(false),
    onDropRejected: () => setDragActive(false),
  })

  const getUploadedFileByType = (type: FileType) => {
    return files.find((file) => file.type === type)
  }

  const allFilesUploaded = requiredFiles.every((file) => getUploadedFileByType(file.type as FileType))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Document Verification</h1>
        <p className="mt-2 text-gray-600">Upload the required client documents to begin the verification process.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Step 1: File Upload</CardTitle>
          <CardDescription>
            Please upload all four required documents to proceed with the KYC verification.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
              dragActive ? "border-[#0A2277] bg-blue-50" : "border-gray-300 hover:border-gray-400",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center justify-center space-y-2">
              <Upload className="h-10 w-10 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-900">Drag files here or click to browse</h3>
              <p className="text-sm text-gray-500">Supports PNG, DOCX, PDF, and TXT files</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {requiredFiles.map((requiredFile) => {
              const uploadedFile = getUploadedFileByType(requiredFile.type as FileType)

              return (
                <Card
                  key={requiredFile.type}
                  className={cn("border", uploadedFile ? "border-green-200 bg-green-50" : "border-gray-200")}
                >
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          uploadedFile ? "bg-green-100" : "bg-gray-100",
                        )}
                      >
                        <requiredFile.icon
                          className={cn("h-5 w-5", uploadedFile ? "text-green-600" : "text-gray-500")}
                        />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{requiredFile.label}</p>
                        <p className="text-xs text-gray-500">Expected format: {requiredFile.format}</p>
                      </div>
                    </div>

                    {uploadedFile ? (
                      <div className="flex items-center text-green-600">
                        <CheckCircle2 className="h-5 w-5 mr-1" />
                        <span className="text-sm">Uploaded</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-400">
                        <AlertCircle className="h-5 w-5 mr-1" />
                        <span className="text-sm">Required</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-4 bg-gray-50 border-t border-gray-200 p-4">
          <Button variant="outline">Cancel</Button>
          <Button onClick={onProcessing} disabled={!allFilesUploaded} className="bg-[#0A2277] hover:bg-[#081a5e]">
            Process Documents
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
