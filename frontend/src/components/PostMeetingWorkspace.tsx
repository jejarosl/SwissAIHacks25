import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Download, Upload, MessageCircle, Check, X, 
  Calendar, Clock, AlertTriangle, ChevronDown, Send,
  ExternalLink, Star, User
} from 'lucide-react';
import { mockTasks, mockDocuments } from '../utils/mockData';
import { Task, Document } from '../types';
import VoiceNoteRecorder from './VoiceNoteRecorder';
import VoiceNotesList from './VoiceNotesList';
import VoiceChat from './VoiceChat';
import { VoiceNote } from '../utils/voiceUtils';

const PostMeetingWorkspace: React.FC = () => {
  const currentMeetingId = 'meeting-123'; // This would come from props or context
  const [tasks, setTasks] = useState<Task[]>(mockTasks.filter(task => task.meetingId === currentMeetingId));
  const [documents] = useState<Document[]>(mockDocuments);
  const [voiceNotes, setVoiceNotes] = useState<VoiceNote[]>([]);
  const [language, setLanguage] = useState('English');
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { id: '1', message: 'What tasks remain from the last two meetings?', response: 'Based on previous meetings, you have 3 pending tasks: ESG proposal preparation (due Jan 24), portfolio diversification review (due Jan 26), and client risk profile update (completed).' }
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState<'chat' | 'voice'>('chat');

  const taskColumns = {
    'todo': tasks.filter(task => task.status === 'todo'),
    'in-progress': tasks.filter(task => task.status === 'in-progress'),
    'done': tasks.filter(task => task.status === 'done')
  };

  const handleDragEnd = (result: any) => {
    console.log('Drag end result:', result); // Debug logging
    
    if (!result.destination) {
      console.log('No destination - drag cancelled');
      return;
    }

    const { destination, draggableId, source } = result;
    
    // If dropped in the same position, do nothing
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }
    
    console.log(`Moving task ${draggableId} from ${source.droppableId} to ${destination.droppableId}`);
    
    const newTasks = tasks.map(task => 
      task.id === draggableId 
        ? { ...task, status: destination.droppableId as Task['status'] }
        : task
    );
    setTasks(newTasks);
  };

  const handleTaskApproval = (taskId: string, approved: boolean) => {
    if (approved) {
      // Simulate sending to Outlook/Planner
      console.log(`Task ${taskId} approved and sent to Outlook`);
    }
    // Remove from tasks or mark as processed
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    // Simulate AI response
    const mockResponse = "Based on your meeting transcripts and uploaded documents, I found relevant information about your query. Here are the key insights with source references...";
    
    setChatHistory([...chatHistory, { 
      id: Date.now().toString(), 
      message: chatMessage, 
      response: mockResponse 
    }]);
    setChatMessage('');
  };

  const handleSaveVoiceNote = (voiceNote: VoiceNote) => {
    setVoiceNotes(prev => [voiceNote, ...prev]);
  };

  const handleDeleteVoiceNote = (id: string) => {
    setVoiceNotes(prev => prev.filter(note => note.id !== id));
  };

  const handleExportVoiceNotes = (notes: VoiceNote[]) => {
    // Create a summary document of all voice notes
    const summary = notes.map(note => ({
      timestamp: new Date(note.timestamp).toLocaleString(),
      duration: `${Math.floor(note.duration / 60)}:${(note.duration % 60).toString().padStart(2, '0')}`,
      transcript: note.transcript,
      tags: note.tags?.join(', ') || 'None'
    }));
    
    const blob = new Blob([JSON.stringify(summary, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voice-notes-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const handleFileUpload = (files: FileList) => {
    console.log('Files uploaded:', files);
    // Simulate indexing into knowledge base
  };

  const getConfidenceColor = (score?: number) => {
    if (!score) return 'text-gray-500 bg-gray-100';
    if (score >= 0.9) return 'text-green-600 bg-green-100';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const meetingSummary = [
    'Discussed Q4 portfolio performance with 8.5% return',
    'Identified need for ESG investment diversification',
    'Addressed tax planning strategies for 2025',
    'Reviewed estate planning documentation requirements',
    'Explored alternative investment opportunities'
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Post-Meeting Workspace</h2>
        <div className="text-sm text-gray-500">
          Meeting completed • 4 participants • 45 minutes
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Meeting Report Card */}
        <div className="xl:col-span-1 space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                Meeting Report
              </h3>
              <div className="flex items-center space-x-1">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="text-xs border border-gray-200 rounded px-2 py-1"
                >
                  <option>English</option>
                  <option>German</option>
                  <option>French</option>
                </select>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <h4 className="font-medium text-gray-700">Key Highlights</h4>
              <ul className="space-y-2">
                {meetingSummary.map((item, index) => (
                  <motion.li 
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-2 text-sm"
                  >
                    <div className="w-1.5 h-1.5 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </div>

            <button className="w-full flex items-center justify-center space-x-2 p-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
              <Download className="h-4 w-4" />
              <span>Download PDF Report</span>
            </button>
          </motion.div>

          {/* Voice Notes Recorder */}
          <VoiceNoteRecorder 
            onSave={handleSaveVoiceNote}
            meetingId="meeting-123"
          />

          {/* Voice Notes List */}
          {voiceNotes.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Saved Voice Notes ({voiceNotes.length})</h3>
              <VoiceNotesList 
                voiceNotes={voiceNotes}
                onDelete={handleDeleteVoiceNote}
                onExport={handleExportVoiceNotes}
              />
            </motion.div>
          )}

          {/* Document Upload Widget */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2 text-red-600" />
              Document Library
            </h3>

            <div 
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                isDragging ? 'border-red-400 bg-red-50' : 'border-gray-300'
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFileUpload(e.dataTransfer.files);
              }}
            >
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Drag & drop documents here
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Contracts, KYC, proposals
              </p>
            </div>

            <div className="mt-4 space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium text-gray-700 truncate">
                        {doc.name}
                      </div>
                      <div className="text-xs text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
                    <ExternalLink className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Task Board (Kanban) */}
        <div className="xl:col-span-3">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-900">Task Management Board</h3>
              <div className="text-sm text-gray-500">
                {tasks.length} tasks from this meeting
              </div>
            </div>

            <DragDropContext onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(taskColumns).map(([columnId, columnTasks]) => (
                  <div key={columnId} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-700 capitalize flex items-center">
                        {columnId === 'todo' && <Clock className="h-4 w-4 mr-2 text-orange-500" />}
                        {columnId === 'in-progress' && <Star className="h-4 w-4 mr-2 text-blue-500" />}
                        {columnId === 'done' && <Check className="h-4 w-4 mr-2 text-green-500" />}
                        {columnId.replace('-', ' ')}
                      </h4>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {columnTasks.length}
                      </span>
                    </div>

                    <Droppable droppableId={columnId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`space-y-3 min-h-[200px] p-2 rounded-lg transition-colors ${
                            snapshot.isDraggingOver ? 'bg-gray-50' : ''
                          }`}
                        >
                          <AnimatePresence>
                            {columnTasks.map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className={`p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all ${
                                      snapshot.isDragging ? 'shadow-lg rotate-2 scale-105' : ''
                                    }`}
                                    style={{
                                      ...provided.draggableProps.style,
                                      transform: snapshot.isDragging 
                                        ? `${provided.draggableProps.style?.transform} rotate(2deg)` 
                                        : provided.draggableProps.style?.transform
                                    }}
                                  >
                                    <div className="space-y-3">
                                      <div className="flex items-start justify-between">
                                        <p className="text-sm font-medium text-gray-900">
                                          {task.description}
                                        </p>
                                        {task.confidenceScore && (
                                          <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(task.confidenceScore)}`}>
                                            {Math.round(task.confidenceScore * 100)}%
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                                        <User className="h-3 w-3" />
                                        <span>{task.owner}</span>
                                        <span>•</span>
                                        <Calendar className="h-3 w-3" />
                                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                      </div>

                                      {task.evidence && (
                                        <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                                          <strong>Evidence:</strong> "{task.evidence}"
                                        </div>
                                      )}

                                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                          {task.category}
                                        </span>
                                        
                                        {columnId === 'todo' && (
                                          <div className="flex items-center space-x-1">
                                            <button
                                              onClick={() => handleTaskApproval(task.id, true)}
                                              className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                                              title="Approve & Send to Outlook"
                                            >
                                              <Check className="h-4 w-4" />
                                            </button>
                                            <button
                                              onClick={() => handleTaskApproval(task.id, false)}
                                              className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                              title="Reject Task"
                                            >
                                              <X className="h-4 w-4" />
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          </AnimatePresence>
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                ))}
              </div>
            </DragDropContext>
          </motion.div>
        </div>
      </div>

      {/* Enhanced Assistant Widget with Voice */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6 w-96 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden"
      >
        <div className="p-4 bg-red-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
            <MessageCircle className="h-5 w-5" />
              <span className="font-medium">Advisory Assistant</span>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeTab === 'chat' ? 'bg-white text-red-600' : 'hover:bg-red-700'
                }`}
              >
                Chat
              </button>
              <button
                onClick={() => setActiveTab('voice')}
                className={`px-3 py-1 rounded text-xs transition-colors ${
                  activeTab === 'voice' ? 'bg-white text-red-600' : 'hover:bg-red-700'
                }`}
              >
                Voice
              </button>
            </div>
          </div>
        </div>
        
        {activeTab === 'chat' ? (
          <>
            <div className="p-4 max-h-64 overflow-y-auto space-y-3">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="space-y-2">
              <div className="text-right">
                <div className="inline-block bg-red-100 text-red-800 px-3 py-2 rounded-lg text-sm max-w-xs">
                  {chat.message}
                </div>
              </div>
              <div className="text-left">
                <div className="inline-block bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm max-w-xs">
                  {chat.response}
                </div>
              </div>
            </div>
          ))}
            </div>
        
            <form onSubmit={handleChatSubmit} className="p-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about tasks, documents, or clients..."
              className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
            </form>
          </>
        ) : (
          <div className="h-80">
            <VoiceChat />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PostMeetingWorkspace;