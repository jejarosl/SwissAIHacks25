#!/usr/bin/env python3
"""
Quick test of real-time transcription - 5 second recording
"""

import sys
import os
import time

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from swisshacks.model.whisper import AzureWhisperTranscriber

def quick_test():
    """Quick 5-second transcription test"""
    
    print("🎤 Quick Transcription Test")
    print("=" * 30)
    
    # Create transcriber
    transcriber = AzureWhisperTranscriber()
    
    # Set shorter interval for quick testing
    transcriber.transcription_interval = 2.0
    transcriber.min_audio_length = 1.0
    
    transcriptions = []
    
    def on_transcription(text):
        transcriptions.append(text)
        print(f"📝 Transcribed: {text}")
    
    print("Starting 5-second recording...")
    print("Say something into your microphone!")
    print()
    
    # Start recording
    transcriber.start_recording(on_transcription)
    
    # Countdown
    for i in range(5, 0, -1):
        print(f"⏰ {i} seconds remaining...")
        time.sleep(1)
    
    # Stop recording
    transcriber.stop_recording()
    
    print("\n🛑 Recording finished!")
    
    if transcriptions:
        print(f"\n✅ Captured {len(transcriptions)} transcription(s):")
        for i, text in enumerate(transcriptions, 1):
            print(f"   {i}. {text}")
    else:
        print("\n❌ No transcriptions captured.")
        print("   Try speaking louder or closer to the microphone.")

if __name__ == "__main__":
    try:
        quick_test()
    except KeyboardInterrupt:
        print("\n👋 Test interrupted by user.")
    except Exception as e:
        print(f"\n❌ Error during test: {e}")
        print("Make sure your microphone is working and Azure credentials are correct.")