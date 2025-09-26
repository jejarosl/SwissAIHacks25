# Real-Time Audio Transcription with Azure Whisper

This module provides real-time audio transcription using Azure's Whisper API endpoint.

## Features

- **Real-time transcription**: Continuously record and transcribe audio from your microphone
- **Configurable intervals**: Set how often audio chunks are sent for transcription (default: 3 seconds)
- **File transcription**: Transcribe existing audio files
- **Interactive interface**: Simple command-line interface for controlling recording
- **Callback support**: Custom callback functions for handling transcriptions

## Setup

### 1. Install Dependencies

```bash
pip install -r swisshacks/requirements.txt
```

**Note**: PyAudio installation on Windows might require additional steps:
- Install Microsoft C++ Build Tools
- Or install pre-compiled wheels: `pip install pipwin && pipwin install pyaudio`

### 2. Environment Variables

Make sure your `.env` file contains:
```
WHISPER_ENDPOINT_URL=https://your-azure-endpoint.com/openai/deployments/whisper/audio/translations?api-version=2024-06-01
WHISPER_KEY=your-azure-api-key
```

## Usage

### Basic Real-Time Transcription

```python
from swisshacks.model.whisper import AzureWhisperTranscriber

# Create transcriber
transcriber = AzureWhisperTranscriber()

# Define callback for transcriptions
def on_transcription(text):
    print(f"Transcribed: {text}")

# Start recording
transcriber.start_recording(on_transcription)

# ... do other work ...

# Stop recording
transcriber.stop_recording()
```

### Interactive Session

```python
from swisshacks.model.whisper import RealTimeTranscriptionApp

app = RealTimeTranscriptionApp()
app.start_interactive_session()
```

Commands in interactive mode:
- `start` - Begin recording and transcription
- `stop` - Stop recording
- `history` - View recent transcriptions
- `quit` - Exit the application

### File Transcription

```python
from swisshacks.model.whisper import AzureWhisperTranscriber

transcriber = AzureWhisperTranscriber()
result = transcriber.transcribe_file("path/to/audio.wav")
print(f"Transcription: {result}")
```

### Run Example

```bash
python example_whisper_transcription.py
```

## Configuration Options

You can customize the transcriber behavior:

```python
transcriber = AzureWhisperTranscriber()

# Change transcription interval (seconds)
transcriber.transcription_interval = 5.0

# Change minimum audio length before transcription
transcriber.min_audio_length = 2.0

# Change audio settings
transcriber.sample_rate = 44100
transcriber.chunk_size = 4096
```

## Audio Requirements

- **Format**: 16-bit PCM WAV
- **Sample Rate**: 16kHz (default, configurable)
- **Channels**: Mono (1 channel)
- **Supported file formats**: WAV, MP3, M4A, FLAC, OGG

## Error Handling

The system includes robust error handling for:
- Network connectivity issues
- Audio device problems
- API rate limits
- Invalid audio formats

## Performance Tips

1. **Adjust transcription interval**: Longer intervals = less API calls but higher latency
2. **Audio quality**: Use a good microphone for better accuracy
3. **Network**: Stable internet connection improves reliability
4. **Background noise**: Minimize background noise for better transcription quality

## Troubleshooting

### PyAudio Installation Issues (Windows)
```bash
# Try one of these approaches:
pip install pipwin
pipwin install pyaudio

# Or download pre-compiled wheel from:
# https://www.lfd.uci.edu/~gohlke/pythonlibs/#pyaudio
```

### No Audio Device Found
```python
# List available audio devices
import pyaudio
p = pyaudio.PyAudio()
for i in range(p.get_device_count()):
    info = p.get_device_info_by_index(i)
    print(f"Device {i}: {info['name']}")
```

### API Connection Issues
- Check your environment variables
- Verify Azure endpoint URL and API key
- Test connectivity with a simple HTTP request