/**
 * List available Gemini models
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env file
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

if (!API_KEY) {
  console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY is not set');
  process.exit(1);
}

async function testModels() {
  try {
    console.log('🧪 Testing available Gemini models...\n');
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Try common model names
    const testModels = [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-pro-latest',
      'gemini-1.5-flash',
      'gemini-1.5-flash-001',
      'gemini-1.5-flash-latest',
      'gemini-1.0-pro',
    ];
    
    console.log('Testing models with simple request...\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    for (const modelName of testModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say "test"');
        const response = result.response;
        const text = response.text();
        console.log(`✅ ${modelName} - WORKS (Response: "${text.trim()}")`);
      } catch (error: any) {
        const errorMsg = error.message || 'Unknown error';
        if (errorMsg.includes('404')) {
          console.log(`❌ ${modelName} - Not found (404)`);
        } else if (errorMsg.includes('403')) {
          console.log(`⚠️  ${modelName} - Access denied (403)`);
        } else {
          console.log(`❌ ${modelName} - ${errorMsg.substring(0, 70)}`);
        }
      }
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('Now testing structured outputs (JSON mode)...\n');
    
    // Test structured outputs
    const structuredTestModels = ['gemini-pro', 'gemini-1.5-pro', 'gemini-1.5-flash'];
    
    for (const modelName of structuredTestModels) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            responseMimeType: 'application/json',
          },
        });
        const result = await model.generateContent('Return JSON: {"test": "value"}');
        const response = result.response;
        const text = response.text();
        console.log(`✅ ${modelName} - Supports JSON mode`);
      } catch (error: any) {
        console.log(`❌ ${modelName} - JSON mode failed: ${error.message?.substring(0, 60) || 'Error'}`);
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
  }
}

testModels();
