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
  const [isPassport, setIsPassport] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setIsPassport(documentType === "passport")
    // Set total pages based on document type
    setTotalPages(documentType === "form" ? 3 : 1)
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

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <DialogTitle>{getDocumentTitle()}</DialogTitle>
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
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
              </Button>
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
            {isPassport ? (
              <div className="relative border-4 border-gray-800 rounded-md shadow-lg bg-white">
                <Image
                  src="/passport-highlighted.png"
                  alt="Passport with highlighted issues"
                  width={600}
                  height={400}
                  className="max-w-full h-auto"
                />
                <div className="absolute top-0 left-0 w-full h-full">
                </div>
              </div>
            ) : documentType === "form" ? (
              <div className="bg-white p-8 border shadow-lg rounded-md max-w-2xl">
                {currentPage === 1 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-[#0A2277]">BANK JULIUS BAER & CO. LTD.</h2>
                      <p className="text-xs text-gray-500 mt-1">
                        This document is a simplified, fictional representation of onboarding materials, created for
                        project purposes only and does not reflect the actual policies, procedures, or requirements of
                        Julius Baer.
                      </p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold border-b pb-1 mb-3">Details of the Account and Client</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Account Holder's Name</p>
                          <p className="font-medium">Simon Lukas</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Account Holder's Surname</p>
                          <p className="font-medium">Hoffmann</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Passport No/ Unique ID</p>
                          <p className="font-medium">TR4441465</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold border-b pb-1 mb-3">Reference Currency</h3>
                      <div className="flex gap-4">
                        <div className="flex items-center">
                          <div className="w-4 h-4 border border-gray-400 rounded-sm mr-2 flex items-center justify-center">
                            <div className="w-2 h-2 bg-[#0A2277] rounded-sm"></div>
                          </div>
                          <span>CHF</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 border border-gray-400 rounded-sm mr-2"></div>
                          <span>EUR</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 border border-gray-400 rounded-sm mr-2"></div>
                          <span>USD</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 border border-gray-400 rounded-sm mr-2"></div>
                          <span>Other</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentPage === 2 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-[#0A2277]">BANK JULIUS BAER & CO. LTD.</h2>
                      <p className="text-xs text-gray-500 mt-1">Page 2 of 3</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold border-b pb-1 mb-3">Delivery of Communication</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Street Name</p>
                          <p className="font-medium">Bahnhofstrasse 123</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Postal Code</p>
                          <p className="font-medium">8001</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">City</p>
                          <p className="font-medium">Zürich</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Country</p>
                          <p className="font-medium">Switzerland</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold border-b pb-1 mb-3">Contact Information</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium">+41 44 123 4567</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Mobile Number</p>
                          <p className="font-medium">+41 79 987 6543</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email Address</p>
                          <p className="font-medium">s.hoffmann@example.com</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {currentPage === 3 && (
                  <>
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold text-[#0A2277]">BANK JULIUS BAER & CO. LTD.</h2>
                      <p className="text-xs text-gray-500 mt-1">Page 3 of 3</p>
                    </div>

                    <div className="mb-6">
                      <h3 className="font-bold border-b pb-1 mb-3">APPLICATION FOR E-BANKING</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">Simon Lukas Hoffmann</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">s.hoffmann@example.com</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 border-t pt-4">
                      <p className="text-sm text-gray-600">Specimen Signature:</p>
                      <div className="h-16 border-b border-gray-300 mt-2 flex items-end justify-center">
                        <p className="italic text-gray-700 pb-1">Simon Hoffmann</p>
                      </div>
                    </div>

                    <div className="mt-8 p-4 border border-red-200 bg-red-50 rounded-md">
                      <p className="text-sm text-red-600 font-medium">Missing Signature</p>
                      <p className="text-xs text-red-500 mt-1">
                        The client's signature is required but missing from this section.
                      </p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white p-8 border shadow-lg rounded-md">
                <h2 className="text-xl font-bold mb-4">Client Description</h2>
                <p className="text-gray-700 mb-3">
                  Simon Lukas Hoffmann is a 23-year-old German national currently residing in Zürich, Switzerland. He
                  relocated from Berlin in 2022 for professional opportunities in the financial sector.
                </p>
                <p className="text-gray-700 mb-3">
                  Mr. Hoffmann works as a Junior Investment Analyst at a boutique financial services firm in Zürich's
                  financial district. He holds a Bachelor's degree in Finance from Humboldt University of Berlin and is
                  currently pursuing part-time studies for his Master's in Financial Engineering.
                </p>
                <p className="text-gray-700 mb-3">
                  His income is primarily derived from his employment, with an annual salary of approximately CHF
                  85,000. He has recently inherited assets valued at approximately EUR 510,000 from his late
                  grandfather, which he intends to invest through Julius Baer's wealth management services.
                </p>
                <p className="text-gray-700">
                  Mr. Hoffmann has no political exposure and maintains a moderate risk profile for his investments. He
                  has expressed interest in sustainable investment options and long-term wealth accumulation strategies.
                </p>
              </div>
            )}
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
