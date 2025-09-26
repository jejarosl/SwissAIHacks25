# Enhanced Real-Time Transcription Service with Speaker Identification

import os
import asyncio
import json
import wave
import io
from typing import List, Dict, Any, Optional, Callable
from datetime import datetime
import numpy as np

# Audio processing imports
try:
    import pyaudio
    import webrtcvad
    from pyannote.audio import Pipeline
except ImportError:
    print("Warning: Audio processing libraries not installed. Install with: pip install pyaudio webrtcvad pyannote.audio")

# Extend the existing Whisper transcription
from swisshacks.model.whisper import AzureWhisperTranscriber
from app.models.meeting_models import TranscriptionSegment, TranscriptionUpdate


class EnhancedTranscriptionService:
    """Enhanced transcription service with speaker identification and real-time processing"""
    
    def __init__(self):
        self.whisper_transcriber = AzureWhisperTranscriber()
        self.speaker_pipeline = None
        self.active_sessions = {}
        
        # Initialize speaker diarization pipeline
        try:
            # Requires pyannote.audio token - replace with actual token
            self.speaker_pipeline = Pipeline.from_pretrained(
                "pyannote/speaker-diarization@2.1",
                use_auth_token=os.getenv("PYANNOTE_AUTH_TOKEN")
            )
        except Exception as e:
            print(f"Warning: Speaker diarization not available: {e}")
            self.speaker_pipeline = None
        
        # Voice activity detection
        self.vad = None
        try:
            self.vad = webrtcvad.Vad(2)  # Aggressiveness level 2
        except:
            print("Warning: WebRTC VAD not available")
    
    async def start_real_time_session(self, meeting_id: int, callback: Callable = None) -> str:
        """Start a real-time transcription session"""
        session_id = f"session_{meeting_id}_{datetime.utcnow().timestamp()}"
        
        self.active_sessions[session_id] = {
            "meeting_id": meeting_id,
            "callback": callback,
            "audio_buffer": [],
            "speaker_embeddings": {},
            "last_transcription": None,
            "is_active": True
        }
        
        return session_id
    
    async def process_audio_chunk(self, session_id: str, audio_data: bytes) -> Optional[TranscriptionSegment]:
        """Process incoming audio chunk and return transcription if available"""
        if session_id not in self.active_sessions:
            raise ValueError("Invalid session ID")
        
        session = self.active_sessions[session_id]
        
        # Add to audio buffer
        session["audio_buffer"].append(audio_data)
        
        # Check if we have enough audio for processing (e.g., 3 seconds)
        if len(session["audio_buffer"]) >= 3:  # Adjust based on chunk size
            # Combine audio chunks
            combined_audio = b''.join(session["audio_buffer"])
            
            # Clear buffer
            session["audio_buffer"] = []
            
            # Process transcription and speaker identification
            segment = await self._process_audio_segment(combined_audio, session)
            
            if segment and session["callback"]:
                await session["callback"](segment)
            
            return segment
        
        return None
    
    async def _process_audio_segment(self, audio_data: bytes, session: Dict) -> Optional[TranscriptionSegment]:
        """Process audio segment for transcription and speaker identification"""
        try:
            # Convert audio data to proper format
            audio_file = io.BytesIO(audio_data)
            
            # Transcribe with Whisper
            transcription_result = await self.whisper_transcriber.transcribe_audio_data(audio_data)
            
            if not transcription_result or not transcription_result.get("text"):
                return None
            
            # Identify speaker
            speaker_id = await self._identify_speaker(audio_data, session)
            
            # Detect language
            language = transcription_result.get("language", "unknown")
            
            # Calculate confidence
            confidence = transcription_result.get("confidence", 0.8)
            
            # Create transcription segment
            segment = TranscriptionSegment(
                start_time=transcription_result.get("start", 0.0),
                end_time=transcription_result.get("end", 3.0),
                text=transcription_result["text"].strip(),
                speaker_id=speaker_id,
                confidence=confidence,
                language=language
            )
            
            session["last_transcription"] = segment
            return segment
            
        except Exception as e:
            print(f"Error processing audio segment: {e}")
            return None
    
    async def _identify_speaker(self, audio_data: bytes, session: Dict) -> Optional[str]:
        """Identify speaker from audio data"""
        if not self.speaker_pipeline:
            return "unknown_speaker"
        
        try:
            # Convert audio data to format expected by pyannote
            # This is a simplified version - real implementation would handle format conversion
            
            # For now, return a mock speaker ID based on session
            speaker_count = len(session["speaker_embeddings"])
            return f"speaker_{speaker_count % 4 + 1}"  # Simulate up to 4 speakers
            
        except Exception as e:
            print(f"Error in speaker identification: {e}")
            return "unknown_speaker"
    
    async def transcribe_file(self, file_path: str, meeting_id: int) -> TranscriptionUpdate:
        """Transcribe an uploaded audio file with speaker diarization"""
        try:
            # Use existing Whisper transcriber for full file
            transcription_result = await self.whisper_transcriber.transcribe_file(file_path)
            
            # Process speaker diarization if available
            segments = []
            if self.speaker_pipeline and os.path.exists(file_path):
                diarization = self.speaker_pipeline(file_path)
                
                # Combine transcription with speaker information
                for segment, track, speaker in diarization.itertracks(yield_label=True):
                    # Find corresponding transcription text
                    text = self._get_text_for_timerange(
                        transcription_result, segment.start, segment.end
                    )
                    
                    if text:
                        segments.append(TranscriptionSegment(
                            start_time=segment.start,
                            end_time=segment.end,
                            text=text,
                            speaker_id=speaker,
                            confidence=0.85,
                            language=transcription_result.get("language", "unknown")
                        ))
            else:
                # No speaker diarization available, create single segment
                segments.append(TranscriptionSegment(
                    start_time=0.0,
                    end_time=transcription_result.get("duration", 0.0),
                    text=transcription_result.get("text", ""),
                    speaker_id="speaker_1",
                    confidence=transcription_result.get("confidence", 0.8),
                    language=transcription_result.get("language", "unknown")
                ))
            
            return TranscriptionUpdate(
                meeting_id=meeting_id,
                segments=segments,
                timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            print(f"Error transcribing file: {e}")
            return TranscriptionUpdate(
                meeting_id=meeting_id,
                segments=[],
                timestamp=datetime.utcnow()
            )
    
    def _get_text_for_timerange(self, transcription_result: Dict, start_time: float, end_time: float) -> str:
        """Extract text for specific time range from transcription result"""
        # This is a simplified implementation
        # In real implementation, you'd need detailed word-level timestamps
        
        full_text = transcription_result.get("text", "")
        duration = transcription_result.get("duration", 1.0)
        
        # Estimate text position based on time
        if duration > 0:
            start_ratio = start_time / duration
            end_ratio = end_time / duration
            
            start_char = int(len(full_text) * start_ratio)
            end_char = int(len(full_text) * end_ratio)
            
            return full_text[start_char:end_char].strip()
        
        return full_text
    
    async def stop_session(self, session_id: str):
        """Stop a real-time transcription session"""
        if session_id in self.active_sessions:
            self.active_sessions[session_id]["is_active"] = False
            del self.active_sessions[session_id]
    
    def is_speech(self, audio_data: bytes, sample_rate: int = 16000) -> bool:
        """Detect if audio contains speech using VAD"""
        if not self.vad:
            return True  # Assume speech if VAD not available
        
        try:
            # VAD expects 10ms, 20ms, or 30ms of audio
            frame_duration = 30  # ms
            frame_size = int(sample_rate * frame_duration / 1000)
            
            if len(audio_data) >= frame_size * 2:  # 2 bytes per sample for 16-bit
                return self.vad.is_speech(audio_data[:frame_size * 2], sample_rate)
            
            return False
        except:
            return True  # Assume speech on error
    
    async def get_session_status(self, session_id: str) -> Dict[str, Any]:
        """Get status of a transcription session"""
        if session_id not in self.active_sessions:
            return {"error": "Session not found"}
        
        session = self.active_sessions[session_id]
        
        return {
            "session_id": session_id,
            "meeting_id": session["meeting_id"],
            "is_active": session["is_active"],
            "buffer_size": len(session["audio_buffer"]),
            "speakers_detected": len(session["speaker_embeddings"]),
            "last_transcription": session["last_transcription"].dict() if session["last_transcription"] else None
        }
    
    async def identify_speakers_in_meeting(self, meeting_id: int, audio_file_path: str) -> Dict[str, Any]:
        """Analyze an entire meeting audio file to identify and profile speakers"""
        if not self.speaker_pipeline:
            return {"error": "Speaker diarization not available"}
        
        try:
            # Run speaker diarization
            diarization = self.speaker_pipeline(audio_file_path)
            
            # Analyze speaker segments
            speaker_stats = {}
            total_duration = 0
            
            for segment, track, speaker in diarization.itertracks(yield_label=True):
                duration = segment.end - segment.start
                total_duration += duration
                
                if speaker not in speaker_stats:
                    speaker_stats[speaker] = {
                        "total_time": 0,
                        "segments": 0,
                        "avg_segment_length": 0,
                        "first_appearance": segment.start,
                        "last_appearance": segment.end
                    }
                
                speaker_stats[speaker]["total_time"] += duration
                speaker_stats[speaker]["segments"] += 1
                speaker_stats[speaker]["last_appearance"] = max(
                    speaker_stats[speaker]["last_appearance"], segment.end
                )
            
            # Calculate percentages and averages
            for speaker, stats in speaker_stats.items():
                stats["percentage"] = (stats["total_time"] / total_duration) * 100 if total_duration > 0 else 0
                stats["avg_segment_length"] = stats["total_time"] / stats["segments"] if stats["segments"] > 0 else 0
            
            return {
                "meeting_id": meeting_id,
                "total_duration": total_duration,
                "total_speakers": len(speaker_stats),
                "speakers": speaker_stats,
                "analysis_timestamp": datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            return {"error": f"Failed to analyze speakers: {str(e)}"}


# Meeting facilitation features
class MeetingFacilitator:
    """AI-powered meeting facilitation assistant"""
    
    def __init__(self):
        self.meeting_states = {}
        self.facilitation_rules = {
            "max_speaker_time": 300,  # 5 minutes max speaking time
            "silence_threshold": 30,   # 30 seconds of silence triggers intervention
            "meeting_time_warning": 300,  # Warn 5 minutes before end
            "agenda_item_time": 900    # 15 minutes per agenda item
        }
    
    def start_meeting_monitoring(self, meeting_id: int, scheduled_end: datetime, agenda: List[str] = []):
        """Start monitoring a meeting for facilitation"""
        self.meeting_states[meeting_id] = {
            "start_time": datetime.utcnow(),
            "scheduled_end": scheduled_end,
            "agenda": agenda,
            "current_agenda_item": 0,
            "speaker_times": {},
            "last_activity": datetime.utcnow(),
            "warnings_sent": [],
            "total_silence_time": 0
        }
    
    async def process_transcription_for_facilitation(self, meeting_id: int, segment: TranscriptionSegment) -> List[str]:
        """Process transcription segment and return facilitation messages"""
        if meeting_id not in self.meeting_states:
            return []
        
        state = self.meeting_states[meeting_id]
        messages = []
        
        # Update speaker time tracking
        if segment.speaker_id:
            if segment.speaker_id not in state["speaker_times"]:
                state["speaker_times"][segment.speaker_id] = 0
            
            segment_duration = segment.end_time - segment.start_time
            state["speaker_times"][segment.speaker_id] += segment_duration
            
            # Check if speaker has been talking too long
            if state["speaker_times"][segment.speaker_id] > self.facilitation_rules["max_speaker_time"]:
                if f"long_speaker_{segment.speaker_id}" not in state["warnings_sent"]:
                    messages.append(f"💬 Suggestion: {segment.speaker_id} has been speaking for over 5 minutes. Consider giving others a chance to contribute.")
                    state["warnings_sent"].append(f"long_speaker_{segment.speaker_id}")
        
        # Update last activity
        state["last_activity"] = datetime.utcnow()
        
        # Check for action items mentioned
        if any(keyword in segment.text.lower() for keyword in ["action", "todo", "follow up", "next steps", "assign"]):
            messages.append("📝 Action item detected! Consider adding this to the meeting tasks.")
        
        # Check for next meeting scheduling
        if any(keyword in segment.text.lower() for keyword in ["next meeting", "schedule", "follow-up meeting"]):
            messages.append("📅 Meeting scheduling mentioned. Would you like me to create a calendar event?")
        
        # Check meeting time
        time_remaining = (state["scheduled_end"] - datetime.utcnow()).total_seconds()
        if time_remaining <= self.facilitation_rules["meeting_time_warning"] and "time_warning" not in state["warnings_sent"]:
            messages.append(f"⏰ Time check: {int(time_remaining/60)} minutes remaining in the meeting.")
            state["warnings_sent"].append("time_warning")
        
        return messages
    
    async def check_meeting_silence(self, meeting_id: int) -> List[str]:
        """Check for prolonged silence and suggest interventions"""
        if meeting_id not in self.meeting_states:
            return []
        
        state = self.meeting_states[meeting_id]
        silence_duration = (datetime.utcnow() - state["last_activity"]).total_seconds()
        
        messages = []
        if silence_duration > self.facilitation_rules["silence_threshold"]:
            if "silence_warning" not in state["warnings_sent"]:
                messages.append("🤔 There's been a pause in the conversation. Consider asking an open-ended question or moving to the next agenda item.")
                state["warnings_sent"].append("silence_warning")
                state["total_silence_time"] += silence_duration
        
        return messages
    
    def get_meeting_insights(self, meeting_id: int) -> Dict[str, Any]:
        """Get insights about the meeting dynamics"""
        if meeting_id not in self.meeting_states:
            return {"error": "Meeting not being monitored"}
        
        state = self.meeting_states[meeting_id]
        total_time = (datetime.utcnow() - state["start_time"]).total_seconds()
        
        # Calculate speaking time distribution
        total_speaking_time = sum(state["speaker_times"].values())
        speaker_percentages = {}
        
        for speaker, time in state["speaker_times"].items():
            speaker_percentages[speaker] = (time / total_speaking_time) * 100 if total_speaking_time > 0 else 0
        
        return {
            "meeting_id": meeting_id,
            "total_meeting_time": total_time,
            "total_speaking_time": total_speaking_time,
            "silence_percentage": ((state["total_silence_time"] / total_time) * 100) if total_time > 0 else 0,
            "speaker_distribution": speaker_percentages,
            "agenda_progress": state["current_agenda_item"] / len(state["agenda"]) * 100 if state["agenda"] else 0,
            "warnings_triggered": len(state["warnings_sent"]),
            "participation_balance": self._calculate_participation_balance(speaker_percentages)
        }
    
    def _calculate_participation_balance(self, speaker_percentages: Dict[str, float]) -> str:
        """Calculate how balanced the participation is"""
        if not speaker_percentages:
            return "unknown"
        
        values = list(speaker_percentages.values())
        if not values:
            return "unknown"
        
        # Calculate coefficient of variation
        mean_participation = sum(values) / len(values)
        if mean_participation == 0:
            return "no_participation"
        
        variance = sum((x - mean_participation) ** 2 for x in values) / len(values)
        cv = (variance ** 0.5) / mean_participation
        
        if cv < 0.3:
            return "well_balanced"
        elif cv < 0.6:
            return "moderately_balanced" 
        else:
            return "unbalanced"


# Service class that combines everything
class TranscriptionService:
    """Main transcription service combining all features"""
    
    def __init__(self):
        self.enhanced_transcriber = EnhancedTranscriptionService()
        self.facilitator = MeetingFacilitator()
    
    async def transcribe_audio(self, audio_data: bytes, meeting_id: int) -> TranscriptionUpdate:
        """Main method for audio transcription"""
        return await self.enhanced_transcriber.transcribe_file("temp_audio.wav", meeting_id)
    
    async def transcribe_file(self, file_path: str, meeting_id: int) -> TranscriptionUpdate:
        """Transcribe uploaded file"""
        return await self.enhanced_transcriber.transcribe_file(file_path, meeting_id)