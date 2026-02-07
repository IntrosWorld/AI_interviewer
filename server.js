require('dotenv').config();
const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

// WebSocket connection handler
wss.on('connection', (clientWs) => {
  console.log('✅ Client connected');

  let audioChunksSent = 0;
  let responsesReceived = 0;
  let geminiWs = null;

  // Connect to Gemini Live API (using v1beta, not v1alpha!)
  const geminiUrl = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${GEMINI_API_KEY}`;

  console.log('🔌 Connecting to Gemini Live API...');

  try {
    geminiWs = new WebSocket(geminiUrl);

    geminiWs.on('open', () => {
      console.log('✅ Connected to Gemini Live API');

      // Send initial setup message (using camelCase!)
      const setupMessage = {
        setup: {
          model: "models/gemini-2.0-flash-exp",
          generationConfig: {
            responseModalities: "audio"
          }
        }
      };

      console.log('📤 Sending setup message:', JSON.stringify(setupMessage, null, 2));
      geminiWs.send(JSON.stringify(setupMessage));

      // Note: Don't notify client until we get setupComplete
      console.log('⏳ Waiting for setupComplete from Gemini...');
    });

    geminiWs.on('message', (data) => {
      try {
        const response = JSON.parse(data.toString());
        responsesReceived++;

        console.log(`\n📥 Response #${responsesReceived} from Gemini:`);
        console.log('Full response:', JSON.stringify(response, null, 2));

        // Check for setupComplete
        if (response.setupComplete) {
          console.log('✅ Setup complete! Connection ready');
          clientWs.send(JSON.stringify({ type: 'ready' }));
          return;
        }

        // Check for audio data
        let hasAudio = false;
        let hasText = false;

        if (response.serverContent?.modelTurn?.parts) {
          for (const part of response.serverContent.modelTurn.parts) {
            if (part.inlineData?.data) {
              hasAudio = true;
              console.log('🔊 Audio data found! Length:', part.inlineData.data.length);
              console.log('   MIME type:', part.inlineData.mimeType);
            }
            if (part.text) {
              hasText = true;
              console.log('📝 Text found:', part.text);
            }
          }
        }

        if (!hasAudio && !hasText) {
          console.log('⚠️  No audio or text in this response');
        }

        // Forward Gemini response to client
        clientWs.send(JSON.stringify({
          type: 'gemini_response',
          data: response
        }));
      } catch (error) {
        console.error('❌ Error parsing Gemini response:', error);
        console.error('Raw data:', data.toString().substring(0, 500));
      }
    });

    geminiWs.on('error', (error) => {
      console.error('Gemini WebSocket error:', error);
      clientWs.send(JSON.stringify({
        type: 'error',
        message: 'Gemini API connection error'
      }));
    });

    geminiWs.on('close', () => {
      console.log('Gemini connection closed');
    });

  } catch (error) {
    console.error('Error connecting to Gemini:', error);
    clientWs.send(JSON.stringify({
      type: 'error',
      message: 'Failed to connect to Gemini API'
    }));
  }

  // Handle messages from client
  clientWs.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());

      if (data.type === 'audio' && geminiWs && geminiWs.readyState === WebSocket.OPEN) {
        audioChunksSent++;

        if (audioChunksSent % 10 === 0) {
          console.log(`📤 Sent ${audioChunksSent} audio chunks (data length: ${data.audio.length})`);
        }

        // Forward audio to Gemini (using correct realtimeInput format with camelCase!)
        const audioMessage = {
          realtimeInput: {
            mediaChunks: [{
              mimeType: "audio/pcm;rate=16000",
              data: data.audio
            }]
          }
        };

        geminiWs.send(JSON.stringify(audioMessage));
      }
    } catch (error) {
      console.error('❌ Error processing client message:', error);
    }
  });

  clientWs.on('close', () => {
    console.log(`\n👋 Client disconnected`);
    console.log(`   Audio chunks sent: ${audioChunksSent}`);
    console.log(`   Responses received: ${responsesReceived}`);
    if (geminiWs) {
      geminiWs.close();
    }
  });

  clientWs.on('error', (error) => {
    console.error('❌ Client WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set GEMINI_API_KEY in your .env file');
});
