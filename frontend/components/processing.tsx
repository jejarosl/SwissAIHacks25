"use client"

import { cn } from "@/lib/utils"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react"

export function Processing() {
  const [progress, setProgress] = useState(0)
  const [currentStage, setCurrentStage] = useState(0)

  const stages = [
    { name: "Document Extraction", icon: FileText, status: "completed" },
    { name: "Data Verification", icon: CheckCircle2, status: "in-progress" },
    { name: "Risk Assessment", icon: AlertCircle, status: "pending" },
    { name: "Final Validation", icon: Clock, status: "pending" },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }

        // Update the current stage based on progress
        if (prevProgress >= 75 && currentStage < 3) {
          setCurrentStage(3)
        } else if (prevProgress >= 50 && currentStage < 2) {
          setCurrentStage(2)
        } else if (prevProgress >= 25 && currentStage < 1) {
          setCurrentStage(1)
        }

        return prevProgress + 1
      })
    }, 30)

    return () => {
      clearInterval(timer)
    }
  }, [currentStage])

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="border-none shadow-lg">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl">Processing Documents</CardTitle>
          <CardDescription>Please wait while we analyze and validate the uploaded documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8 pt-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-medium">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <div className="relative">
            <div className="absolute left-1/2 h-full w-0.5 -translate-x-1/2 bg-gray-200"></div>

            <div className="space-y-8">
              {stages.map((stage, index) => {
                let status = "pending"
                if (index < currentStage) {
                  status = "completed"
                } else if (index === currentStage) {
                  status = "in-progress"
                }

                return (
                  <div key={index} className="relative flex items-center pb-4">
                    <div
                      className={cn(
                        "absolute left-1/2 -translate-x-1/2 flex h-10 w-10 items-center justify-center rounded-full border-2",
                        status === "completed"
                          ? "border-green-500 bg-green-100"
                          : status === "in-progress"
                            ? "border-blue-500 bg-blue-100"
                            : "border-gray-300 bg-white",
                      )}
                    >
                      <stage.icon
                        className={cn(
                          "h-5 w-5",
                          status === "completed"
                            ? "text-green-500"
                            : status === "in-progress"
                              ? "text-blue-500"
                              : "text-gray-400",
                        )}
                      />
                    </div>

                    <div
                      className={cn(
                        "ml-16 w-full rounded-lg border p-4",
                        status === "completed"
                          ? "border-green-200 bg-green-50"
                          : status === "in-progress"
                            ? "border-blue-200 bg-blue-50"
                            : "border-gray-200 bg-gray-50",
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={cn(
                            "font-medium",
                            status === "completed"
                              ? "text-green-700"
                              : status === "in-progress"
                                ? "text-blue-700"
                                : "text-gray-500",
                          )}
                        >
                          {stage.name}
                        </h3>
                        <span
                          className={cn(
                            "text-sm",
                            status === "completed"
                              ? "text-green-600"
                              : status === "in-progress"
                                ? "text-blue-600"
                                : "text-gray-400",
                          )}
                        >
                          {status === "completed" ? "Completed" : status === "in-progress" ? "In Progress" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center pt-4">
            <div className="text-center text-sm text-gray-500">
              <p>This process typically takes 30-60 seconds.</p>
              <p>Please do not close this window.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
