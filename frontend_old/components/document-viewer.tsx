"use client"

import { useState, useEffect } from "react"
import { Download, ZoomIn, ZoomOut, RotateCw, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import Image from "next/image"

interface DocumentViewerProps {
  documentType: string
  onClose: () => void
}

export function DocumentViewer({ documentType, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    // Set total pages based on document type
    setTotalPages(documentType === "form" ? 1 : 1)
    // Reset zoom, rotation and current page when document changes
    setZoom(1)
    setRotation(0)
    setCurrentPage(1)
  }, [documentType])

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360)
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const getDocumentTitle = () => {
    switch (documentType) {
      case "passport":
        return "Passport"
      case "profile":
        return "Client Profile"
      case "form":
        return "Account Opening Form"
      case "description":
        return "Client Description"
      default:
        return "Document"
    }
  }

  const getDocumentImage = () => {
    switch (documentType) {
      case "passport":
        return "/passport-highlighted.jpeg"
      case "form":
        return "/form-highlighted.jpeg"
      default:
        return "/placeholder.svg?height=800&width=400"
    }
  }

  const getIssueDescription = () => {
    switch (documentType) {
      case "passport":
        return "Missing gender information (Sex field)"
      case "form":
        return "Missing specimen signature"
      default:
        return "Document has validation issues"
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{getDocumentTitle()}</DialogTitle>
              <p className="text-sm text-red-600 mt-1">{getIssueDescription()}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handleZoomOut}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-sm">{Math.round(zoom * 100)}%</span>
              <Button variant="outline" size="icon" onClick={handleZoomIn}>
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleRotate}>
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon"></Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto p-6 bg-gray-100 flex items-center justify-center">
          <div
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: "transform 0.2s ease",
            }}
            className="transform-origin-center"
          >
            <div className="relative border-4 border-gray-800 rounded-md shadow-lg bg-white">
              <Image
                src={getDocumentImage() || "/placeholder.svg"}
                alt={`${getDocumentTitle()} with highlighted issues`}
                width={800}
                height={1000}
                className="max-w-full h-auto"
              />
            </div>
          </div>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 border-t bg-gray-50">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="flex items-center"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-gray-500">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="flex items-center"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
