import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function listModels() {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

    console.log('📋 Fetching available models...\n');

    const models = await ai.models.list();

    console.log('Available models:');
    console.log('================\n');

    for await (const model of models) {
      console.log(`Name: ${model.name}`);
      console.log(`Display Name: ${model.displayName || 'N/A'}`);
      console.log(`Supported methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('---');
    }
  } catch (error) {
    console.error('Error listing models:', error.message);
  }
}

listModels();
