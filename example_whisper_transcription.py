"""
Example usage of the Azure Whisper real-time transcription system
"""

from swisshacks.model.whisper import AzureWhisperTranscriber, RealTimeTranscriptionApp
import time

def simple_transcription_example():
    """Simple example of real-time transcription"""
    
    # Create transcriber instance
    transcriber = AzureWhisperTranscriber()
    
    def on_new_transcription(text):
        """Callback function for new transcriptions"""
        print(f"🎤 You said: {text}")
    
    print("Starting 10-second recording session...")
    print("Speak into your microphone!")
    
    # Start recording
    transcriber.start_recording(on_new_transcription)
    
    # Record for 10 seconds
    time.sleep(10)
    
    # Stop recording
    transcriber.stop_recording()
    print("Recording session finished.")

def interactive_example():
    """Interactive transcription session"""
    app = RealTimeTranscriptionApp()
    app.start_interactive_session()

def file_transcription_example():
    """Example of transcribing an audio file"""
    transcriber = AzureWhisperTranscriber()
    
    # Replace with your audio file path
    audio_file = "path/to/your/audio/file.wav"
    
    print(f"Transcribing file: {audio_file}")
    result = transcriber.transcribe_file(audio_file)
    
    if result:
        print(f"Transcription: {result}")
    else:
        print("Failed to transcribe file.")

if __name__ == "__main__":
    print("Choose an example:")
    print("1. Simple 10-second recording")
    print("2. Interactive session")
    print("3. File transcription")
    
    choice = input("Enter choice (1-3): ").strip()
    
    if choice == "1":
        simple_transcription_example()
    elif choice == "2":
        interactive_example()
    elif choice == "3":
        file_transcription_example()
    else:
        print("Invalid choice!")