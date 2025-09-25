"use client"

import { useState } from "react"
import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Newspaper, AlertCircle, Search, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

// Timeline event types
type EventType = "career" | "address" | "news" | "alert" | "artifact"

interface TimelineEvent {
  id: string
  type: EventType
  title: string
  description: string
  date: string
  icon: React.ElementType
  color: string
}

export function ClientTimeline() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  // Dummy timeline data
  const initialTimelineEvents: TimelineEvent[] = [
    {
      id: "1",
      type: "career",
      title: "Career Change",
      description: "Appointed as CEO of CHA cgh (Switzerland) SA",
      date: "2024/03/15",
      icon: Briefcase,
      color: "bg-green-100 text-green-700 border-green-200",
    },
    {
      id: "2",
      type: "news",
      title: "News Publication",
      description: "Featured in Swiss Business Monthly: 'Rising Stars in Shipping'",
      date: "2024/02/22",
      icon: Newspaper,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
    {
      id: "4",
      type: "alert",
      title: "Court Alert",
      description: "The person has been associated in a court case.",
      date: "2023/08/12",
      icon: AlertCircle,
      color: "bg-blue-100 text-blue-700 border-blue-200",
    },
    {
      id: "5",
      type: "news",
      title: "News Publication",
      description: "Quoted in Financial Times article on European shipping regulations",
      date: "2023/06/30",
      icon: Newspaper,
      color: "bg-amber-100 text-amber-700 border-amber-200",
    },
  ]

  // Start with empty timeline
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([])
  const [artifactsFound, setArtifactsFound] = useState(false)

  const initiateProcess = () => {
    setIsLoading(true)
    setProgress(0)

    // Simulate the process with increasing progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)

          // Add the original timeline events after loading completes
          setTimelineEvents(initialTimelineEvents)
          setArtifactsFound(true)
          setIsLoading(false)
          return 100
        }
        return prev + 5
      })
    }, 120)
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Client Updates</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto pr-2">
        {/* Due Diligence Button */}
        <div className="mb-4">
          <Button
            onClick={initiateProcess}
            disabled={isLoading}
            className={cn(
              "w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white transition-all duration-300 shadow-md hover:shadow-lg",
              isLoading ? "opacity-80" : "",
            )}
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Processing Due Diligence... {progress}%</span>
              </div>
            ) : artifactsFound ? (
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Due Diligence Complete • {timelineEvents.length} Artifacts Found</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Initiate Due Diligence Process</span>
              </div>
            )}
          </Button>
        </div>

        {/* Loading Progress Bar (only visible during loading) */}
        {isLoading && (
          <div className="mb-4 bg-gray-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-green-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        {/* Timeline Events */}
        <div className="space-y-0">
          {timelineEvents.map((event, index) => (
            <a
              href="#"
              key={event.id}
              className={cn(
                "relative pl-6 pb-4 pt-1 block",
                event.type === "artifact" && "animate-fadeIn",
                "transition-all duration-200 hover:translate-x-1",
              )}
            >
              {/* Timeline connector line - only show if not the last item */}
              {index < timelineEvents.length - 1 && (
                <div className="absolute left-0 top-6 bottom-0 w-px bg-gray-200"></div>
              )}

              {/* Event dot */}
              <div className="absolute left-[-4px] top-2 z-10">
                <div
                  className={cn(
                    "w-2 h-2 rounded-full border",
                    event.type === "career"
                      ? "bg-green-500 border-green-500"
                      : event.type === "news"
                        ? "bg-amber-500 border-amber-500"
                        : event.type === "address"
                          ? "bg-amber-500 border-amber-500"
                          : event.type === "artifact"
                            ? "bg-emerald-500 border-emerald-500"
                            : "bg-blue-500 border-blue-500",
                  )}
                ></div>
              </div>

              {/* Event content */}
              <div
                className={cn(
                  "rounded-md p-3 border group",
                  event.color,
                  event.type === "artifact" && "ring-1 ring-emerald-300 ring-opacity-50",
                  "hover:shadow-md transition-all duration-200",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <event.icon className="h-4 w-4 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium flex items-center">
                        {event.title}
                        <span className="ml-1 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          #
                        </span>
                      </h3>
                      <p className="text-xs">{event.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{event.date}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
