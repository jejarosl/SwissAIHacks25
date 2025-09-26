import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, Trash2, Tag, Calendar, Clock, 
  Search, Filter, Download, Share 
} from 'lucide-react';
import { VoiceNote, formatDuration, createAudioURL } from '../utils/voiceUtils';

interface VoiceNotesListProps {
  voiceNotes: VoiceNote[];
  onDelete: (id: string) => void;
  onExport?: (notes: VoiceNote[]) => void;
}

const VoiceNotesList: React.FC<VoiceNotesListProps> = ({ 
  voiceNotes, 
  onDelete, 
  onExport 
}) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [sortBy, setSortBy] = useState<'date' | 'duration'>('date');

  const allTags = Array.from(new Set(voiceNotes.flatMap(note => note.tags || [])));

  const filteredNotes = voiceNotes
    .filter(note => {
      const matchesSearch = searchQuery === '' || 
        note.transcript.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (note.tags && note.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesTag = selectedTag === '' || 
        (note.tags && note.tags.includes(selectedTag));
      
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      } else {
        return b.duration - a.duration;
      }
    });

  const playNote = (note: VoiceNote) => {
    if (playingId === note.id) {
      setPlayingId(null);
      return;
    }

    const audioURL = createAudioURL(note.audioBlob);
    const audio = new Audio(audioURL);
    
    audio.onended = () => {
      setPlayingId(null);
      URL.revokeObjectURL(audioURL);
    };
    
    audio.play();
    setPlayingId(note.id);
  };

  const exportNotes = () => {
    if (onExport) {
      onExport(filteredNotes);
    }
  };

  if (voiceNotes.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-8 text-gray-500"
      >
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Tag className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-lg font-medium">No voice notes yet</p>
        <p className="text-sm mt-1">Start recording to create your first voice note</p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Bar */}
      <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search voice notes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>
        
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">All Tags</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'duration')}
          className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="date">Sort by Date</option>
          <option value="duration">Sort by Duration</option>
        </select>
        
        {filteredNotes.length > 0 && (
          <button
            onClick={exportNotes}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        )}
      </div>

      {/* Voice Notes List */}
      <div className="space-y-3">
        <AnimatePresence>
          {filteredNotes.map((note, index) => (
            <motion.div
              key={note.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => playNote(note)}
                      className={`p-2 rounded-full transition-colors ${
                        playingId === note.id 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {playingId === note.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 text-sm text-gray-500 mb-2">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(note.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatDuration(note.duration)}</span>
                        </div>
                      </div>
                      
                      <p className="text-gray-700 text-sm">
                        {note.transcript || 'No transcript available'}
                      </p>
                    </div>
                  </div>
                  
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Tag className="h-3 w-3 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const audioURL = createAudioURL(note.audioBlob);
                      const a = document.createElement('a');
                      a.href = audioURL;
                      a.download = `voice-note-${note.timestamp}.webm`;
                      a.click();
                      URL.revokeObjectURL(audioURL);
                    }}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Download"
                  >
                    <Download className="h-4 w-4" />
                  </button>
                  
                  <button
                    onClick={() => onDelete(note.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {filteredNotes.length === 0 && searchQuery && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-8 text-gray-500"
        >
          <p>No voice notes found matching "{searchQuery}"</p>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceNotesList;