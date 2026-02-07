# Gemini Live Agent Demo

A real-time voice chat application using Google's Gemini Live API with the official @google/genai SDK. Talk to Gemini using your microphone and hear responses in real-time with text transcription.

## Features

- Real-time bidirectional voice communication with Gemini
- Text transcription of Gemini's responses
- Text message input option
- Browser-based microphone capture with device selection
- Audio streaming with WebSockets
- Modern, clean UI with mute and hangup controls
- Google Search integration

## Prerequisites

- Node.js (v18 or higher recommended)
- A Google API key from [Google AI Studio](https://aistudio.google.com/apikey)

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   - Copy `.env.example` to `.env`
   - Add your Google API key to the `.env` file:
     ```
     GOOGLE_API_KEY=your_actual_api_key_here
     ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   - Navigate to `http://localhost:8000`
   - Select your microphone from the dropdown (bottom right)
   - Click the microphone button to start
   - Allow microphone access when prompted
   - Start talking to Gemini!

## How It Works

1. **Frontend** ([index.html](index.html)):
   - Captures microphone audio at 16kHz, 16-bit PCM, mono using AudioWorklet
   - Converts audio to base64 and sends via WebSocket to backend
   - Receives and plays audio responses from Gemini at 24kHz
   - Displays text transcription in real-time
   - Provides text input for messaging
   - Mute/unmute and hangup controls

2. **Backend** ([server.ts](server.ts)):
   - Built with Hono framework for HTTP server
   - Manages WebSocket connections from clients
   - Connects to Gemini Live API using @google/genai SDK
   - Forwards audio data between client and Gemini
   - Handles response streaming and transcription
   - Broadcasts audio and text to all connected clients

## Technical Details

- **Audio Format (Input):** 16-bit PCM, 16kHz, mono
- **Audio Format (Output):** 24kHz from Gemini
- **Model:** `gemini-live-2.5-flash-preview`
- **Voice:** Zephyr
- **Response Modalities:** AUDIO with output transcription
- **Tools:** Google Search enabled
- **Framework:** Hono + Node.js WebSocket Server
- **Runtime:** tsx for TypeScript execution

## Features Explained

### Voice Chat
- Click the microphone button to start a live conversation
- Use mute button to temporarily disable your microphone
- Use hangup button to end the session and clear audio

### Text Input
- Type messages in the text field and press Enter
- Gemini will respond with audio and text

### Microphone Selection
- Use the dropdown in the bottom-right corner to select your audio input device

## Troubleshooting

- **No audio received:** Check your API key is valid and has access to the Gemini Live API
- **Microphone not working:** Ensure browser has microphone permissions and a device is selected
- **Connection errors:** Verify your API key in the `.env` file
- **Module errors:** Ensure you have Node.js v18+ and run `npm install` again
- **Port already in use:** The server runs on port 8000 by default, ensure no other service is using it

## Credits

Based on the work by [jaydanurwin](https://github.com/jaydanurwin/gemini-live-agent-demo)

## API Documentation

For more information about the Gemini Live API, see:
- https://ai.google.dev/gemini-api/docs/live
- https://github.com/google-gemini/multimodal-live-api-web-console
