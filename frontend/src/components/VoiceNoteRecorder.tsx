import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Play, Pause, Trash2, Save, 
  Volume2, Clock, MessageSquare, Tag 
} from 'lucide-react';
import { VoiceRecorder, transcribeAudio, createAudioURL, formatDuration, VoiceNote } from '../utils/voiceUtils';

interface VoiceNoteRecorderProps {
  onSave: (voiceNote: VoiceNote) => void;
  meetingId?: string;
}

const VoiceNoteRecorder: React.FC<VoiceNoteRecorderProps> = ({ onSave, meetingId }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const voiceRecorderRef = useRef<VoiceRecorder>(new VoiceRecorder());
  const audioRef = useRef<HTMLAudioElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
    };
  }, [audioURL]);

  const startRecording = async () => {
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

  const stopRecording = async () => {
    try {
      const blob = await voiceRecorderRef.current.stopRecording();
      setAudioBlob(blob);
      setAudioURL(createAudioURL(blob));
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Auto-transcribe
      setIsTranscribing(true);
      try {
        const transcription = await transcribeAudio(blob);
        setTranscript(transcription);
      } catch (error) {
        console.error('Transcription failed:', error);
        setTranscript('Transcription failed. You can still save the audio note.');
      } finally {
        setIsTranscribing(false);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const playPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const clearRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioBlob(null);
    setAudioURL(null);
    setTranscript('');
    setRecordingDuration(0);
    setTags([]);
    setIsExpanded(false);
  };

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const saveVoiceNote = () => {
    if (!audioBlob) return;

    const voiceNote: VoiceNote = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      duration: recordingDuration,
      transcript,
      audioBlob,
      meetingId,
      tags
    };

    onSave(voiceNote);
    clearRecording();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-red-600" />
          Voice Notes
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          {isExpanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="space-y-4"
          >
            {/* Recording Controls */}
            <div className="flex items-center justify-center space-x-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors ${
                  isRecording 
                    ? 'bg-red-600 text-white shadow-lg' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                disabled={isTranscribing}
              >
                {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
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
                  <Clock className="h-4 w-4" />
                  <span className="font-mono">{formatDuration(recordingDuration)}</span>
                </motion.div>
              )}
            </div>

            {/* Audio Playback */}
            {audioURL && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={playPause}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
                      {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <span className="text-sm text-gray-600">
                      Duration: {formatDuration(recordingDuration)}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={clearRecording}
                      className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={saveVoiceNote}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setIsPlaying(false)}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />

                {/* Transcript */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-700 mb-2">Transcript</h4>
                  {isTranscribing ? (
                    <div className="flex items-center space-x-2 text-gray-500">
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1 }}
                        className="w-4 h-4 border-2 border-gray-300 border-t-red-600 rounded-full"
                      />
                      <span>Transcribing...</span>
                    </div>
                  ) : (
                    <textarea
                      value={transcript}
                      onChange={(e) => setTranscript(e.target.value)}
                      placeholder="Transcript will appear here..."
                      className="w-full p-3 border border-gray-200 rounded-lg resize-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={4}
                    />
                  )}
                </div>

                {/* Tags */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-700 mb-2 flex items-center">
                    <Tag className="h-4 w-4 mr-1" />
                    Tags
                  </h4>
                  
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTag()}
                      placeholder="Add tag..."
                      className="flex-1 p-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VoiceNoteRecorder;