import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, Clock, Search, MessageSquare, Users, AlertCircle, Send,
  Play, Pause, Volume2, Settings, FileText, Calendar, Video, Phone,
  Monitor, MicOff, VideoOff
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
  const [meetingMode, setMeetingMode] = useState<'voice' | 'video'>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);

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
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setMeetingMode('voice')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                meetingMode === 'voice' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Phone className="h-4 w-4" />
              <span>Voice</span>
            </button>
            <button
              onClick={() => setMeetingMode('video')}
              className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                meetingMode === 'video' ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-100'
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video</span>
            </button>
          </div>
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
              onClick={() => setIsMuted(!isMuted)}
              className={`p-2 rounded-lg transition-colors ${
                isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </motion.button>
            {meetingMode === 'video' && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-2 rounded-lg transition-colors ${
                  !isVideoOn ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
              </motion.button>
            )}
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
        {/* Video/Voice Area */}
        {meetingMode === 'video' && (
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <Monitor className="h-5 w-5 mr-2 text-blue-600" />
                Video Conference
              </h3>
              
              <div className="space-y-3">
                {/* Main Speaker Video */}
                <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-white font-semibold text-lg">ET</span>
                    </div>
                    <p className="text-white text-sm">{currentSpeaker}</p>
                    <p className="text-gray-400 text-xs">Speaking</p>
                  </div>
                </div>
                
                {/* Participant Thumbnails */}
                <div className="grid grid-cols-3 gap-2">
                  {['SJ', 'MJ', 'DC'].map((initials, index) => (
                    <div key={initials} className="bg-gray-700 rounded aspect-square flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{initials}</span>
                    </div>
                  ))}
                </div>
                
                {/* Video Controls */}
                <div className="flex justify-center space-x-2 pt-2 border-t border-gray-100">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`p-2 rounded-full ${
                      isMuted ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`p-2 rounded-full ${
                      !isVideoOn ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {isVideoOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Real-time Transcript Panel */}
        <div className={meetingMode === 'video' ? 'lg:col-span-2' : 'lg:col-span-3'}>
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
                    {meetingMode === 'voice' ? 'Voice Call Active' : 'Video Conference'} • Currently speaking: <span className="font-medium text-gray-700">{currentSpeaker}</span>
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
                    className="text-center text-gray-500 py-12"
                  >
                    {meetingMode === 'voice' ? (
                      <>
                        <Phone className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Voice Meeting Ready</p>
                        <p className="text-sm mt-1">Waiting for participants to join...</p>
                      </>
                    ) : (
                      <>
                        <Video className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">Video Conference Ready</p>
                        <p className="text-sm mt-1">Waiting for meeting to start...</p>
                      </>
                    )}
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
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
                AI Facilitator
              </h3>
            </div>
            
            <div className="p-4 space-y-3">
              {facilitatorPrompts.map((prompt, index) => {
                const Icon = prompt.icon;
                const colorClasses = {
                  yellow: 'bg-yellow-50 border-yellow-200 text-yellow-800',
                  blue: 'bg-blue-50 border-blue-200 text-blue-800',
                  green: 'bg-green-50 border-green-200 text-green-800'
                };
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className={`p-3 rounded-lg border ${colorClasses[prompt.color as keyof typeof colorClasses]}`}
                  >
                    <div className="flex items-start space-x-2">
                      <Icon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <p className="text-sm">{prompt.message}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* RAG Search */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900 flex items-center">
                <Search className="h-5 w-5 mr-2 text-green-600" />
                Knowledge Search
              </h3>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleSearch} className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search UBS products, policies..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Send className="h-4 w-4 mr-2" />
                  Search
                </motion.button>
              </form>
              
              <AnimatePresence>
                {searchResults && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                  >
                    <div className="flex items-start space-x-2">
                      <FileText className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 mb-1">Knowledge Base Result</p>
                        <p className="text-sm text-green-700">{searchResults}</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default LiveMeetingView;