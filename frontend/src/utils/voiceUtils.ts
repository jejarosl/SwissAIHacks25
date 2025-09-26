import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export interface VoiceNote {
  id: string;
  timestamp: string;
  duration: number;
  transcript: string;
  audioBlob: Blob;
  meetingId?: string;
  tags?: string[];
}

export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async startRecording(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(this.stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.start();
    } catch (error) {
      console.error('Error starting recording:', error);
      throw new Error('Failed to access microphone');
    }
  }

  async stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.cleanup();
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();
    });
  }

  private cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.mediaRecorder = null;
    this.audioChunks = [];
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording';
  }
}

export async function transcribeAudio(audioBlob: Blob): Promise<string> {
  try {
    const file = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });
    
    const response = await openai.audio.transcriptions.create({
      file: file,
      model: 'whisper-1',
      language: 'en'
    });

    return response.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    throw new Error('Failed to transcribe audio');
  }
}

export async function synthesizeSpeech(text: string): Promise<ArrayBuffer> {
  try {
    const response = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    });

    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error synthesizing speech:', error);
    throw new Error('Failed to synthesize speech');
  }
}

export async function chatWithGPT(message: string, conversationHistory: Array<{role: string, content: string}> = []): Promise<string> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: 'You are an intelligent UBS wealth management assistant. Provide helpful, professional advice about financial planning, investments, and client management. Keep responses concise and actionable.'
      },
      ...conversationHistory,
      { role: 'user' as const, content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || 'I apologize, but I could not process your request.';
  } catch (error) {
    console.error('Error chatting with GPT:', error);
    throw new Error('Failed to get response from GPT');
  }
}

export function createAudioURL(audioBlob: Blob): string {
  return URL.createObjectURL(audioBlob);
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}