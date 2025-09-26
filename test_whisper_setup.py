#!/usr/bin/env python3
"""
Test script for Azure Whisper transcription system
"""

import sys
import os

# Add the project root to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from swisshacks.model.whisper import AzureWhisperTranscriber

def test_transcriber_initialization():
    """Test if the transcriber can be initialized properly"""
    try:
        transcriber = AzureWhisperTranscriber()
        print("✅ Transcriber initialized successfully")
        print(f"   Endpoint: {transcriber.endpoint_url}")
        print(f"   API Key configured: {'Yes' if transcriber.api_key else 'No'}")
        print(f"   Sample Rate: {transcriber.sample_rate} Hz")
        print(f"   Channels: {transcriber.channels}")
        print(f"   Transcription Interval: {transcriber.transcription_interval}s")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize transcriber: {e}")
        return False

def test_audio_device():
    """Test if audio devices are available"""
    try:
        import pyaudio
        
        p = pyaudio.PyAudio()
        device_count = p.get_device_count()
        
        print(f"✅ Found {device_count} audio devices:")
        
        input_devices = []
        for i in range(device_count):
            try:
                info = p.get_device_info_by_index(i)
                if info['maxInputChannels'] > 0:
                    input_devices.append(info)
                    print(f"   📱 Device {i}: {info['name']} (Input channels: {info['maxInputChannels']})")
            except Exception as e:
                print(f"   ⚠️  Device {i}: Error getting info - {e}")
        
        p.terminate()
        
        if not input_devices:
            print("❌ No input audio devices found!")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing audio devices: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Azure Whisper Transcription System")
    print("=" * 50)
    
    # Test 1: Transcriber initialization
    print("\n1. Testing transcriber initialization...")
    init_ok = test_transcriber_initialization()
    
    # Test 2: Audio devices
    print("\n2. Testing audio devices...")
    audio_ok = test_audio_device()
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 Test Summary:")
    print(f"   Transcriber Init: {'✅ PASS' if init_ok else '❌ FAIL'}")
    print(f"   Audio Devices:    {'✅ PASS' if audio_ok else '❌ FAIL'}")
    
    if init_ok and audio_ok:
        print("\n🎉 All tests passed! Ready for real-time transcription.")
        print("\nTo start transcribing:")
        print("   python example_whisper_transcription.py")
    else:
        print("\n⚠️  Some tests failed. Check the errors above.")
        
        if not init_ok:
            print("\n🔧 Transcriber issues:")
            print("   - Check your .env file for WHISPER_ENDPOINT_URL and WHISPER_KEY")
            print("   - Verify Azure API credentials")
        
        if not audio_ok:
            print("\n🔧 Audio issues:")
            print("   - Check microphone permissions")
            print("   - Ensure a microphone is connected")
            print("   - Try running as administrator")

if __name__ == "__main__":
    main()