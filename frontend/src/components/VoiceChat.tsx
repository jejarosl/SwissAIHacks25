import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Volume2, VolumeX, MessageCircle, 
  Send, Loader, Phone, PhoneOff 
} from 'lucide-react';
import { 
  VoiceRecorder, 
  transcribeAudio, 
  synthesizeSpeech, 
  chatWithGPT,
  formatDuration 
} from '../utils/voiceUtils';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: string;
  audioURL?: string;
}

const VoiceChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your UBS advisory assistant. You can speak with me about client management, investment strategies, or any wealth management questions.',
      role: 'assistant',
      timestamp: new Date().toISOString()
    }
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const startVoiceRecording = async () => {
    try {
      await voiceRecorderRef.current.startRecording();
      setIsRecording(true);
      setRecordingDuration(0);
      
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const stopVoiceRecording = async () => {
    try {
      const audioBlob = await voiceRecorderRef.current.stopRecording();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      await processVoiceInput(audioBlob);
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessing(true);
    
    try {
      // Transcribe audio
      const transcript = await transcribeAudio(audioBlob);
      
      // Add user message
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        content: transcript,
        role: 'user',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, userMessage]);
      
      // Get GPT response
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const gptResponse = await chatWithGPT(transcript, conversationHistory);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: gptResponse,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      // Generate speech if speaker is on
      if (isSpeakerOn) {
        try {
          const audioBuffer = await synthesizeSpeech(gptResponse);
          const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const audioURL = URL.createObjectURL(audioBlob);
          assistantMessage.audioURL = audioURL;
          
          // Play the audio
          const audio = new Audio(audioURL);
          audio.play();
        } catch (error) {
          console.error('Failed to synthesize speech:', error);
        }
      }
      
      setMessages(prev => [...prev, assistantMessage]);
      
    } catch (error) {
      console.error('Failed to process voice input:', error);
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        content: 'I apologize, but I encountered an error processing your voice input. Please try again.',
        role: 'assistant',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const sendTextMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: textInput,
      role: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = textInput;
    setTextInput('');
    setIsProcessing(true);

    try {
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      const gptResponse = await chatWithGPT(messageText, conversationHistory);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: gptResponse,
        role: 'assistant',
        timestamp: new Date().toISOString()
      };

      if (isSpeakerOn) {
        try {
          const audioBuffer = await synthesizeSpeech(gptResponse);
          const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
          const audioURL = URL.createObjectURL(audioBlob);
          assistantMessage.audioURL = audioURL;
          
          const audio = new Audio(audioURL);
          audio.play();
        } catch (error) {
          console.error('Failed to synthesize speech:', error);
        }
      }
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Failed to get GPT response:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleCall = () => {
    setIsCallActive(!isCallActive);
    if (isCallActive && isRecording) {
      stopVoiceRecording();
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden h-96 flex flex-col"
    >
      {/* Header */}
      <div className="p-4 bg-red-600 text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span className="font-medium">Voice Assistant</span>
          {isCallActive && (
            <motion.div 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
              className="flex items-center space-x-1"
            >
              <div className="w-2 h-2 bg-green-300 rounded-full" />
              <span className="text-sm">Live</span>
            </motion.div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsSpeakerOn(!isSpeakerOn)}
            className="p-1 hover:bg-red-700 rounded transition-colors"
          >
            {isSpeakerOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>
          
          <button
            onClick={toggleCall}
            className={`p-2 rounded-full transition-colors ${
              isCallActive ? 'bg-green-500 hover:bg-green-600' : 'bg-red-700 hover:bg-red-800'
            }`}
          >
            {isCallActive ? <Phone className="h-4 w-4" /> : <PhoneOff className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs ${
                    message.role === 'user' ? 'text-red-200' : 'text-gray-500'
                  }`}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                  
                  {message.audioURL && (
                    <button
                      onClick={() => {
                        const audio = new Audio(message.audioURL);
                        audio.play();
                      }}
                      className={`p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors ${
                        message.role === 'user' ? 'text-red-200' : 'text-gray-500'
                      }`}
                    >
                      <Volume2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isProcessing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <Loader className="h-4 w-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-500">Processing...</span>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {isCallActive ? (
          <div className="flex items-center justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isRecording 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'bg-white border-2 border-red-600 text-red-600 hover:bg-red-50'
              }`}
              disabled={isProcessing}
            >
              {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </motion.button>
            
            {isRecording && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center space-x-2 text-red-600"
              >
                <motion.div 
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-2 h-2 bg-red-600 rounded-full"
                />
                <span className="font-mono text-sm">{formatDuration(recordingDuration)}</span>
              </motion.div>
            )}
          </div>
        ) : (
          <form onSubmit={sendTextMessage} className="flex items-center space-x-2">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Type your message or activate voice mode..."
              className="flex-1 p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isProcessing}
            />
            <button
              type="submit"
              disabled={isProcessing || !textInput.trim()}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

export default VoiceChat;