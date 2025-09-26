import pyaudio
import wave
import io
import os
import requests
from typing import Optional, Callable
import threading
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AzureWhisperTranscriber:
    """Real-time audio transcription using Azure Whisper API"""
    
    def __init__(self):
        self.endpoint_url = os.getenv('WHISPER_ENDPOINT_URL')
        self.api_key = os.getenv('WHISPER_KEY')
        
        if not self.endpoint_url or not self.api_key:
            raise ValueError("WHISPER_ENDPOINT_URL and WHISPER_KEY must be set in environment variables")
        
        # Audio configuration
        self.sample_rate = 16000
        self.chunk_size = 1024
        self.channels = 1
        self.format = pyaudio.paInt16
        
        # Recording state
        self.is_recording = False
        self.audio_buffer = []
        self.pyaudio_instance = None
        self.stream = None
        
        # Transcription settings
        self.transcription_interval = 3.0  # seconds
        self.min_audio_length = 1.0  # minimum seconds of audio before transcription
        
    def start_recording(self, on_transcription: Optional[Callable[[str], None]] = None):
        """Start real-time audio recording and transcription"""
        if self.is_recording:
            print("Already recording!")
            return
            
        self.is_recording = True
        self.audio_buffer = []
        
        # Initialize PyAudio
        self.pyaudio_instance = pyaudio.PyAudio()
        
        try:
            self.stream = self.pyaudio_instance.open(
                format=self.format,
                channels=self.channels,
                rate=self.sample_rate,
                input=True,
                frames_per_buffer=self.chunk_size,
                stream_callback=self._audio_callback
            )
            
            print("🎤 Recording started. Speak into your microphone...")
            self.stream.start_stream()
            
            # Start transcription thread
            transcription_thread = threading.Thread(
                target=self._transcription_loop,
                args=(on_transcription,)
            )
            transcription_thread.daemon = True
            transcription_thread.start()
            
        except Exception as e:
            print(f"Error starting recording: {e}")
            self.stop_recording()
    
    def stop_recording(self):
        """Stop audio recording"""
        self.is_recording = False
        
        if self.stream:
            self.stream.stop_stream()
            self.stream.close()
            self.stream = None
            
        if self.pyaudio_instance:
            self.pyaudio_instance.terminate()
            self.pyaudio_instance = None
            
        print("🛑 Recording stopped.")
    
    def _audio_callback(self, in_data, frame_count, time_info, status):
        """Callback function for audio stream"""
        if self.is_recording:
            self.audio_buffer.append(in_data)
        return (in_data, pyaudio.paContinue)
    
    def _transcription_loop(self, on_transcription: Optional[Callable[[str], None]]):
        """Background loop for periodic transcription"""
        last_transcription_time = time.time()
        
        while self.is_recording:
            current_time = time.time()
            
            # Check if it's time to transcribe
            if (current_time - last_transcription_time >= self.transcription_interval and
                len(self.audio_buffer) > 0):
                
                # Calculate audio duration
                total_frames = len(self.audio_buffer) * self.chunk_size
                audio_duration = total_frames / self.sample_rate
                
                if audio_duration >= self.min_audio_length:
                    # Create audio data for transcription
                    audio_data = b''.join(self.audio_buffer)
                    
                    # Transcribe in background
                    threading.Thread(
                        target=self._transcribe_audio_chunk,
                        args=(audio_data, on_transcription)
                    ).start()
                    
                    # Clear buffer and update time
                    self.audio_buffer = []
                    last_transcription_time = current_time
            
            time.sleep(0.1)  # Small delay to prevent busy waiting
    
    def _transcribe_audio_chunk(self, audio_data: bytes, on_transcription: Optional[Callable[[str], None]]):
        """Transcribe a chunk of audio data"""
        try:
            # Convert raw audio to WAV format
            wav_buffer = io.BytesIO()
            with wave.open(wav_buffer, 'wb') as wav_file:
                wav_file.setnchannels(self.channels)
                wav_file.setsampwidth(self.pyaudio_instance.get_sample_size(self.format))
                wav_file.setframerate(self.sample_rate)
                wav_file.writeframes(audio_data)
            
            wav_buffer.seek(0)
            
            # Send to Azure Whisper API
            headers = {
                'api-key': self.api_key,
            }
            
            files = {
                'file': ('audio.wav', wav_buffer.read(), 'audio/wav')
            }
            
            response = requests.post(
                self.endpoint_url,
                headers=headers,
                files=files,
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                transcription = result.get('text', '').strip()
                
                if transcription:
                    print(f"📝 Transcription: {transcription}")
                    if on_transcription:
                        on_transcription(transcription)
            else:
                print(f"❌ Transcription failed: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Error during transcription: {e}")
    
    def transcribe_file(self, audio_file_path: str) -> Optional[str]:
        """Transcribe an audio file"""
        try:
            with open(audio_file_path, 'rb') as audio_file:
                headers = {
                    'api-key': self.api_key,
                }
                
                files = {
                    'file': audio_file
                }
                
                response = requests.post(
                    self.endpoint_url,
                    headers=headers,
                    files=files,
                    timeout=30
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return result.get('text', '').strip()
                else:
                    print(f"❌ Transcription failed: {response.status_code} - {response.text}")
                    return None
                    
        except Exception as e:
            print(f"❌ Error transcribing file: {e}")
            return None


class RealTimeTranscriptionApp:
    """Simple application for real-time transcription"""
    
    def __init__(self):
        self.transcriber = AzureWhisperTranscriber()
        self.transcriptions = []
    
    def on_transcription_received(self, text: str):
        """Handle new transcription"""
        timestamp = time.strftime("%H:%M:%S")
        self.transcriptions.append(f"[{timestamp}] {text}")
        
        # Keep only last 10 transcriptions in memory
        if len(self.transcriptions) > 10:
            self.transcriptions.pop(0)
    
    def start_interactive_session(self):
        """Start an interactive transcription session"""
        print("🎯 Real-Time Audio Transcription with Azure Whisper")
        print("Commands: 'start' to begin, 'stop' to end, 'history' to view, 'quit' to exit")
        
        while True:
            try:
                command = input("\n> ").strip().lower()
                
                if command == 'start':
                    if not self.transcriber.is_recording:
                        self.transcriber.start_recording(self.on_transcription_received)
                    else:
                        print("Already recording!")
                
                elif command == 'stop':
                    if self.transcriber.is_recording:
                        self.transcriber.stop_recording()
                    else:
                        print("Not currently recording!")
                
                elif command == 'history':
                    if self.transcriptions:
                        print("\n📋 Recent Transcriptions:")
                        for transcription in self.transcriptions:
                            print(f"  {transcription}")
                    else:
                        print("No transcriptions yet.")
                
                elif command == 'quit':
                    if self.transcriber.is_recording:
                        self.transcriber.stop_recording()
                    print("👋 Goodbye!")
                    break
                
                else:
                    print("Unknown command. Use: start, stop, history, quit")
                    
            except KeyboardInterrupt:
                if self.transcriber.is_recording:
                    self.transcriber.stop_recording()
                print("\n👋 Session ended.")
                break
            except Exception as e:
                print(f"❌ Error: {e}")


def main():
    """Main function to run the transcription app"""
    try:
        app = RealTimeTranscriptionApp()
        app.start_interactive_session()
    except Exception as e:
        print(f"❌ Failed to start application: {e}")


if __name__ == "__main__":
    main()
