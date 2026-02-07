// Quick test script to verify the Gemini API connection
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

  if (!GOOGLE_API_KEY) {
    console.error('❌ GOOGLE_API_KEY not found in .env file');
    process.exit(1);
  }

  console.log('✅ API Key found');
  console.log('🔌 Testing Gemini Live API connection...');

  try {
    const ai = new GoogleGenAI({ apiKey: GOOGLE_API_KEY });
    const session = await ai.live.connect({
      model: 'gemini-live-2.5-flash-preview',
      config: {
        responseModalities: ['audio']
      },
      callbacks: {
        onopen: () => {
          console.log('✅ Successfully connected to Gemini Live API!');
          console.log('👍 Your setup is working correctly');
          session.close();
          process.exit(0);
        },
        onerror: (error) => {
          console.error('❌ Connection error:', error);
          process.exit(1);
        },
        onclose: () => {
          console.log('Connection closed');
        }
      }
    });
  } catch (error) {
    console.error('❌ Failed to connect:', error.message);
    if (error.message.includes('API key')) {
      console.error('   Check that your API key is valid and has access to Gemini Live API');
    }
    process.exit(1);
  }
}

test();
