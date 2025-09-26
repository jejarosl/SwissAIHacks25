# Enhanced Meeting Dashboard Component

"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar"
import { 
  Mic, MicOff, Play, Pause, Square, Send, FileText, Download, 
  Upload, Calendar, Clock, Users, MessageSquare, CheckCircle, 
  XCircle, AlertCircle, Settings, Zap, Brain, Phone, Video
} from "lucide-react"

// Types for the meeting system
interface Meeting {
  id: number
  title: string
  client_id: string
  advisor_id: string
  scheduled_start: string
  scheduled_end: string
  status: "scheduled" | "in_progress" | "completed" | "cancelled"
  meeting_type: "online" | "in_person" | "hybrid"
  location?: string
  transcript?: string
  summary?: string
  confidence_score?: number
}

interface Task {
  id: number
  title: string
  description: string
  assigned_to: string
  status: "pending" | "in_progress" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "urgent"
  due_date?: string
  confidence_score?: number
  extracted_by_model?: string
}

interface ClientRequest {
  id: number
  description: string
  request_type: string
  urgency: "low" | "medium" | "high"
  status: string
  confidence_score?: number
}

interface TranscriptionSegment {
  start_time: number
  end_time: number
  text: string
  speaker_id?: string
  confidence: number
  language?: string
}

interface ChatMessage {
  id: number
  message: string
  response: string
  timestamp: string
  confidence: number
}

export default function MeetingDashboard() {
  // Meeting state
  const [currentMeeting, setCurrentMeeting] = useState<Meeting | null>(null)
  const [meetingStatus, setMeetingStatus] = useState<"idle" | "recording" | "processing">("idle")
  const [selectedModel, setSelectedModel] = useState<"apertus" | "azure_openai" | "on_device">("apertus")
  
  // Transcription state
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptionSegment[]>([])
  const [liveTranscript, setLiveTranscript] = useState("")
  const [speakers, setSpeakers] = useState<string[]>([])
  
  // Task and request state
  const [tasks, setTasks] = useState<Task[]>([])
  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([])
  const [extractionProgress, setExtractionProgress] = useState(0)
  
  // Chat state  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState("")
  const [isChatLoading, setIsChatLoading] = useState(false)
  
  // Meeting insights
  const [meetingInsights, setMeetingInsights] = useState<any>(null)
  const [facilitationMessages, setFacilitationMessages] = useState<string[]>([])
  
  // Refs
  const audioRef = useRef<MediaRecorder | null>(null)
  const websocketRef = useRef<WebSocket | null>(null)
  const chatScrollRef = useRef<HTMLDivElement>(null)
  
  // Mock data for development
  useEffect(() => {
    setCurrentMeeting({
      id: 1,
      title: "Portfolio Review - Client ABC",
      client_id: "CLIENT_001",
      advisor_id: "ADVISOR_123",
      scheduled_start: new Date().toISOString(),
      scheduled_end: new Date(Date.now() + 3600000).toISOString(),
      status: "in_progress",
      meeting_type: "online",
      location: "Microsoft Teams",
      confidence_score: 0.85
    })
  }, [])

  // Real-time transcription WebSocket connection
  useEffect(() => {
    if (currentMeeting && isRecording) {
      const ws = new WebSocket(`ws://localhost:8000/api/v1/meetings/${currentMeeting.id}/transcription`)
      websocketRef.current = ws
      
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === "transcription") {
          const segment = data.data as TranscriptionSegment
          setTranscript(prev => [...prev, segment])
          setLiveTranscript(segment.text)
          
          // Update speakers list
          if (segment.speaker_id && !speakers.includes(segment.speaker_id)) {
            setSpeakers(prev => [...prev, segment.speaker_id])
          }
          
          // Process for facilitation
          processFacilitationMessage(segment)
        }
      }
      
      return () => {
        ws.close()
        websocketRef.current = null
      }
    }
  }, [currentMeeting, isRecording, speakers])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      audioRef.current = mediaRecorder
      
      mediaRecorder.ondataavailable = (event) => {
        if (websocketRef.current && event.data.size > 0) {
          websocketRef.current.send(event.data)
        }
      }
      
      mediaRecorder.start(1000) // Send chunks every second
      setIsRecording(true)
      setMeetingStatus("recording")
    } catch (error) {
      console.error("Failed to start recording:", error)
    }
  }

  const stopRecording = () => {
    if (audioRef.current) {
      audioRef.current.stop()
      audioRef.current = null
    }
    setIsRecording(false)
    setMeetingStatus("processing")
    
    // Trigger AI extraction
    extractInsights()
  }

  const extractInsights = async () => {
    if (!currentMeeting) return
    
    setExtractionProgress(0)
    const fullTranscript = transcript.map(seg => seg.text).join(" ")
    
    try {
      // Simulate extraction progress
      const progressInterval = setInterval(() => {
        setExtractionProgress(prev => Math.min(prev + 10, 90))
      }, 200)
      
      // Call extraction API
      const response = await fetch(`/api/meetings/${currentMeeting.id}/extract`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: currentMeeting.id,
          text: fullTranscript,
          model_type: selectedModel,
          extract_tasks: true,
          extract_requests: true,
          extract_sentiment: true
        })
      })
      
      const result = await response.json()
      
      clearInterval(progressInterval)
      setExtractionProgress(100)
      
      // Update tasks and requests
      setTasks(result.tasks || [])
      setClientRequests(result.requests || [])
      
      setTimeout(() => {
        setMeetingStatus("idle")
        setExtractionProgress(0)
      }, 1000)
      
    } catch (error) {
      console.error("Extraction failed:", error)
      setMeetingStatus("idle")
    }
  }

  const switchModel = async (modelType: typeof selectedModel) => {
    setSelectedModel(modelType)
    if (currentMeeting) {
      await fetch(`/api/meetings/${currentMeeting.id}/switch-model`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model_type: modelType })
      })
    }
  }

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !currentMeeting) return
    
    setIsChatLoading(true)
    
    try {
      const response = await fetch(`/api/meetings/${currentMeeting.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          meeting_id: currentMeeting.id,
          message: chatInput,
          context_type: "meeting"
        })
      })
      
      const chatResponse = await response.json()
      
      const newMessage: ChatMessage = {
        id: Date.now(),
        message: chatInput,
        response: chatResponse.response,
        timestamp: new Date().toISOString(),
        confidence: chatResponse.confidence
      }
      
      setChatMessages(prev => [...prev, newMessage])
      setChatInput("")
      
      // Scroll to bottom
      setTimeout(() => {
        chatScrollRef.current?.scrollIntoView({ behavior: "smooth" })
      }, 100)
      
    } catch (error) {
      console.error("Chat failed:", error)
    } finally {
      setIsChatLoading(false)
    }
  }

  const processFacilitationMessage = (segment: TranscriptionSegment) => {
    // Simple facilitation logic
    if (segment.text.toLowerCase().includes("action") || segment.text.toLowerCase().includes("todo")) {
      setFacilitationMessages(prev => [...prev, "📝 Action item detected! Consider adding this to the meeting tasks."])
    }
    
    if (segment.text.toLowerCase().includes("next meeting")) {
      setFacilitationMessages(prev => [...prev, "📅 Meeting scheduling mentioned. Would you like me to create a calendar event?"])
    }
  }

  const updateTaskStatus = async (taskId: number, status: Task["status"]) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ))
    
    // API call to update task
    await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive"
      case "high": return "destructive"
      case "medium": return "default"
      case "low": return "secondary"
      default: return "default"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />
      case "cancelled": return <XCircle className="h-4 w-4 text-red-500" />
      default: return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  if (!currentMeeting) {
    return <div>Loading meeting data...</div>
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar - Meeting Control */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Meeting Assistant</h1>
          <p className="text-sm text-gray-500 mt-1">{currentMeeting.title}</p>
        </div>
        
        {/* Meeting Status */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Status</span>
            <Badge variant={currentMeeting.status === "in_progress" ? "default" : "secondary"}>
              {currentMeeting.status.replace("_", " ")}
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2 mb-3">
            <Users className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              {speakers.length > 0 ? `${speakers.length} speakers detected` : "No speakers detected"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            {currentMeeting.meeting_type === "online" ? (
              <>
                <Video className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">Online Meeting</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-blue-600">In-Person Meeting</span>
              </>
            )}
          </div>
        </div>
        
        {/* Recording Controls */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">Recording</span>
            {isRecording && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-500">Live</span>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            {!isRecording ? (
              <Button onClick={startRecording} className="flex-1" size="sm">
                <Mic className="h-4 w-4 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button onClick={stopRecording} variant="destructive" className="flex-1" size="sm">
                <Square className="h-4 w-4 mr-2" />
                Stop Recording
              </Button>
            )}
          </div>
        </div>
        
        {/* AI Model Selection */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium">AI Model</span>
            <Brain className="h-4 w-4 text-purple-500" />
          </div>
          
          <Select value={selectedModel} onValueChange={switchModel}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="apertus">Apertus (Recommended)</SelectItem>
              <SelectItem value="azure_openai">Azure OpenAI</SelectItem>
              <SelectItem value="on_device">On-Device (Secure)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Processing Progress */}
        {meetingStatus === "processing" && (
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Processing</span>
              <span className="text-xs text-gray-500">{extractionProgress}%</span>
            </div>
            <Progress value={extractionProgress} className="w-full" />
            <p className="text-xs text-gray-500 mt-1">Extracting insights...</p>
          </div>
        )}
        
        {/* Facilitation Messages */}
        {facilitationMessages.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-medium mb-2">Meeting Assistant</h3>
            <ScrollArea className="h-24">
              {facilitationMessages.map((message, index) => (
                <div key={index} className="text-xs text-blue-600 mb-1">
                  {message}
                </div>
              ))}
            </ScrollArea>
          </div>
        )}
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        <div className="bg-white border-b border-gray-200 p-4">
          <Tabs defaultValue="transcript" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="transcript">Live Transcript</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
              <TabsTrigger value="requests">Requests ({clientRequests.length})</TabsTrigger>
              <TabsTrigger value="chat">AI Chat</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="transcript" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Live Transcript
                  </CardTitle>
                  <CardDescription>Real-time transcription with speaker identification</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {transcript.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Mic className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Start recording to see live transcription</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transcript.map((segment, index) => (
                          <div key={index} className="flex space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                {segment.speaker_id?.slice(-1) || "?"}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">
                                  {segment.speaker_id || "Unknown Speaker"}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {Math.round(segment.confidence * 100)}% confidence
                                </span>
                              </div>
                              <p className="text-sm text-gray-700 mt-1">{segment.text}</p>
                            </div>
                          </div>
                        ))}
                        
                        {liveTranscript && (
                          <div className="flex space-x-3 opacity-70">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>?</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <span className="text-sm font-medium">Live...</span>
                              <p className="text-sm text-gray-700 mt-1">{liveTranscript}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="tasks" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Action Items & Tasks
                  </CardTitle>
                  <CardDescription>AI-extracted tasks from the meeting conversation</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {tasks.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <CheckCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No tasks extracted yet</p>
                        <p className="text-sm">Tasks will appear as AI processes the conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {tasks.map((task) => (
                          <div key={task.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  {getStatusIcon(task.status)}
                                  <h3 className="font-medium">{task.title}</h3>
                                  <Badge variant={getPriorityColor(task.priority)}>
                                    {task.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Assigned to: {task.assigned_to}</span>
                                  {task.confidence_score && (
                                    <span>Confidence: {Math.round(task.confidence_score * 100)}%</span>
                                  )}
                                  {task.extracted_by_model && (
                                    <span>Model: {task.extracted_by_model}</span>
                                  )}
                                </div>
                              </div>
                              <Select
                                value={task.status}
                                onValueChange={(status) => updateTaskStatus(task.id, status as Task["status"])}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="completed">Completed</SelectItem>
                                  <SelectItem value="cancelled">Cancelled</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="requests" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MessageSquare className="h-5 w-5 mr-2" />
                    Client Requests
                  </CardTitle>
                  <CardDescription>AI-identified client requests and service inquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    {clientRequests.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No client requests identified yet</p>
                        <p className="text-sm">Requests will appear as AI analyzes the conversation</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {clientRequests.map((request) => (
                          <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <Badge variant="outline">{request.request_type}</Badge>
                                  <Badge variant={getPriorityColor(request.urgency)}>
                                    {request.urgency}
                                  </Badge>
                                </div>
                                <p className="text-sm text-gray-900 mt-2">{request.description}</p>
                                <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Status: {request.status}</span>
                                  {request.confidence_score && (
                                    <span>Confidence: {Math.round(request.confidence_score * 100)}%</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="chat" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Brain className="h-5 w-5 mr-2" />
                    AI Meeting Assistant
                  </CardTitle>
                  <CardDescription>Chat with Apertus about this meeting</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col h-96">
                    <ScrollArea className="flex-1 pr-4">
                      {chatMessages.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>Ask me anything about this meeting</p>
                          <p className="text-sm">I can help with insights, summaries, and next steps</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {chatMessages.map((msg) => (
                            <div key={msg.id} className="space-y-2">
                              <div className="flex justify-end">
                                <div className="bg-blue-500 text-white rounded-lg px-3 py-2 max-w-xs">
                                  {msg.message}
                                </div>
                              </div>
                              <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg px-3 py-2 max-w-xs">
                                  <p>{msg.response}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Confidence: {Math.round(msg.confidence * 100)}%
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          <div ref={chatScrollRef} />
                        </div>
                      )}
                    </ScrollArea>
                    
                    <div className="flex space-x-2 mt-4">
                      <Input
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about the meeting..."
                        onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                        disabled={isChatLoading}
                      />
                      <Button 
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim() || isChatLoading}
                        size="sm"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="insights" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    Meeting Insights
                  </CardTitle>
                  <CardDescription>AI-generated insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-blue-600">
                          {currentMeeting.confidence_score ? Math.round(currentMeeting.confidence_score * 100) : 0}%
                        </div>
                        <p className="text-sm text-gray-600">Analysis Confidence</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-2xl font-bold text-green-600">{transcript.length}</div>
                        <p className="text-sm text-gray-600">Conversation Segments</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-2">Key Discussion Points</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Portfolio performance review</li>
                        <li>• Investment strategy discussion</li>
                        <li>• Risk tolerance assessment</li>
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-2">Recommendations</h3>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li>• Schedule follow-up meeting in 2 weeks</li>
                        <li>• Prepare portfolio rebalancing proposal</li>
                        <li>• Send risk assessment questionnaire</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}