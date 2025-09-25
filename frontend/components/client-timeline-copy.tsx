"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, MapPin, Newspaper, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

// Timeline event types
type EventType = "career" | "address" | "news" | "alert"

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
  // Dummy timeline data
  const timelineEvents: TimelineEvent[] = [
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Client Updates</span>
          <span className="text-xs font-normal text-gray-500">Last 12 months</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-full overflow-y-auto pr-2">
        <div className="space-y-0">
          {timelineEvents.map((event, index) => (
            <div key={event.id} className="relative pl-6 pb-4 pt-1">
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
                          : "bg-blue-500 border-blue-500",
                  )}
                ></div>
              </div>

              {/* Event content */}
              <div className={cn("rounded-md p-3 border", event.color)}>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-2">
                    <event.icon className="h-4 w-4 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium">{event.title}</h3>
                      <p className="text-xs">{event.description}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{event.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
