import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Clock, Search, MessageSquare, Users, AlertCircle, Send,
  Play, Pause, Volume2, Settings, FileText, Calendar
} from 'lucide-react';
import { mockTranscript } from '../utils/mockData';
import { TranscriptEntry } from '../types';

const LiveMeetingView: React.FC = () => {
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string | null>(null);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [currentSpeaker, setCurrentSpeaker] = useState('Emma Thompson');
  const [isRecording, setIsRecording] = useState(true);

  useEffect(() => {
    // Simulate real-time transcript updates
    const interval = setInterval(() => {
      setTranscript(prev => {
        if (prev.length < mockTranscript.length) {
          const newEntry = mockTranscript[prev.length];
          setCurrentSpeaker(newEntry.speaker);
          return [...prev, newEntry];
        }
        return prev;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Meeting timer
    const timer = setInterval(() => {
      setMeetingDuration(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getSpeakerColor = (speaker: string) => {
    const colors = {
      'Emma Thompson': { border: 'border-red-200', bg: 'bg-red-50', text: 'text-red-800' },
      'Sarah Johnson': { border: 'border-blue-200', bg: 'bg-blue-50', text: 'text-blue-800' },
      'Michael Johnson': { border: 'border-green-200', bg: 'bg-green-50', text: 'text-green-800' },
      'David Chen': { border: 'border-purple-200', bg: 'bg-purple-50', text: 'text-purple-800' }
    };
    return colors[speaker as keyof typeof colors] || { border: 'border-gray-200', bg: 'bg-gray-50', text: 'text-gray-800' };
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Simulate RAG search with realistic responses
    const responses: Record<string, string> = {
      'inheritance planning': 'Based on UBS product catalog, for inheritance planning we recommend: UBS Wealth Planning Advisory services, Trust & Estate Planning solutions, and Tax-optimized investment structures. These products help clients minimize estate taxes while ensuring smooth wealth transfer.',
      'tax planning': 'UBS offers comprehensive tax planning solutions including Tax-Optimized Portfolios, Municipal Bond Strategies, and International Tax Advisory services. Our specialists can help optimize your tax efficiency across multiple jurisdictions.',
      'esg investment': 'UBS Sustainable Investment products include ESG-focused mutual funds, Impact Investing strategies, and Sustainable Private Banking solutions. These align with client values while maintaining competitive returns.',
      'risk management': 'UBS risk management solutions encompass Portfolio Diversification strategies, Hedging instruments, Currency Risk Management, and Alternative Investment platforms to reduce overall portfolio volatility.'
    };

    const queryLower = searchQuery.toLowerCase();
    const matchedKey = Object.keys(responses).find(key => queryLower.includes(key));
    const response = matchedKey ? responses[matchedKey] : `Based on UBS knowledge base, here are relevant insights for "${searchQuery}". Our advisors recommend consulting with specialists for detailed product recommendations and compliance requirements.`;
    
    setSearchResults(response);
  };

  const jumpToTimestamp = (timestamp: string) => {
    console.log(`Jumping to ${timestamp}`);
    // Simulate jumping to timestamp in recording
  };

  const facilitatorPrompts = [
    {
      type: 'suggestion',
      message: "You haven't covered tax planning yet. Consider bringing it up.",
      icon: AlertCircle,
      color: 'yellow'
    },
    {
      type: 'reminder',
      message: `${45 - Math.floor(meetingDuration / 60)} minutes remaining in scheduled time.`,
      icon: Clock,
      color: 'blue'
    },
    {
      type: 'action',
      message: "Follow-up meeting detected. Consider scheduling ESG discussion.",
      icon: Calendar,
      color: 'green'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
          <motion.div 
            animate={{ scale: isRecording ? [1, 1.2, 1] : 1 }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-3 h-3 bg-red-500 rounded-full mr-3"
          />
          Live Meeting Session
        </h2>
        <div className="flex items-center space-x-6 text-sm text-gray-500">
          <motion.span 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center"
          >
            <Clock className="h-4 w-4 mr-1" />
            {formatDuration(meetingDuration)}
          </motion.span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            4 participants
          </span>
          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsRecording(!isRecording)}
              className={`p-2 rounded-lg transition-colors ${
                isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRecording ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </motion.button>
            <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
              <Volume2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Real-time Transcript Panel */}
        <div className="lg:col-span-3">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Mic className="h-5 w-5 mr-2 text-red-600" />
                  Live Transcript
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Currently speaking: <span className="font-medium text-gray-700">{currentSpeaker}</span>
                  </div>
                  <button className="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                    <Settings className="h-4 w-4 mr-1" />
                    Settings
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                <AnimatePresence>
                  {transcript.map((entry, index) => {
                    const colors = getSpeakerColor(entry.speaker);
                    return (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-lg border ${colors.border} ${colors.bg}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${colors.text}`}>{entry.speaker}</span>
                            {entry.isActionItem && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="flex items-center space-x-1"
                              >
                                <AlertCircle className="h-4 w-4 text-orange-500" />
                                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">
                                  Action Item ({entry.confidenceScore ? Math.round(entry.confidenceScore * 100) : 0}%)
                                </span>
                              </motion.div>
                            )}
                          </div>
                          <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => jumpToTimestamp(entry.timestamp)}
                            className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-white hover:bg-gray-50 transition-colors"
                          >
                            {entry.timestamp}
                          </motion.button>
                        </div>
                        <p className="text-gray-700">{entry.text}</p>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                
                {transcript.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-500 py-8"
                  >
                    <Mic className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                    Waiting for meeting to start...
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Facilitator Sidebar */}
        <div className="space-y-4">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
              Meeting Facilitator
            </h3>
            
            <div className="space-y-3">
              <AnimatePresence>
                {facilitatorPrompts.map((prompt, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`p-3 rounded-lg border ${
                      prompt.color === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
                      prompt.color === 'blue' ? 'bg-blue-50 border-blue-200' :
                      'bg-green-50 border-green-200'
                    }`}
                  >
                    <div className={`text-sm font-medium flex items-center ${
                      prompt.color === 'yellow' ? 'text-yellow-800' :
                      prompt.color === 'blue' ? 'text-blue-800' :
                      'text-green-800'
                    }`}>
                      <prompt.icon className="h-4 w-4 mr-2" />
                      {prompt.type === 'suggestion' ? 'Suggestion' :
                       prompt.type === 'reminder' ? 'Time Reminder' : 'Follow-up Detected'}
                    </div>
                    <div className={`text-sm mt-1 ${
                      prompt.color === 'yellow' ? 'text-yellow-700' :
                      prompt.color === 'blue' ? 'text-blue-700' :
                      'text-green-700'
                    }`}>
                      {prompt.message}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-4"
          >
            <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
            
            <div className="space-y-2">
              {[
                'Create Task from Selection',
                'Schedule Follow-up',
                'Add Note',
                'Flag for Compliance'
              ].map((action, index) => (
                <motion.button
                  key={action}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full p-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {action}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RAG Assistant Search Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4"
      >
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask about UBS products, regulations, or client history... (e.g., 'inheritance planning', 'tax planning', 'ESG investment')"
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
            />
          </div>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Ask</span>
          </motion.button>
        </form>
        
        <AnimatePresence>
          {searchResults && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200"
            >
              <div className="text-sm text-gray-600">
                <div className="flex items-center mb-2">
                  <FileText className="h-4 w-4 mr-2 text-red-600" />
                  <strong>UBS Knowledge Assistant:</strong>
                </div>
                <p className="mb-3">{searchResults}</p>
                <div className="text-xs text-gray-500 italic">
                  Sources: UBS Product Catalog 2025, Wealth Management Guidelines, Compliance Requirements
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default LiveMeetingView;