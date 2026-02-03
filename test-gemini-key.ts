/**
 * Simple test to verify Gemini API key is working
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY;

console.log('🔍 Testing Gemini API Key...\n');
console.log('API Key loaded:', !!API_KEY);
console.log('API Key length:', API_KEY?.length || 0);

if (!API_KEY) {
  console.error('❌ EXPO_PUBLIC_GEMINI_API_KEY is not set in your .env file');
  console.error('\nPlease check:');
  console.error('1. .env file exists in the project root');
  console.error('2. EXPO_PUBLIC_GEMINI_API_KEY=your_key_here is in the file');
  console.error('3. No quotes around the key value');
  process.exit(1);
}

// Test the API key with a simple request
async function testAPIKey() {
  try {
    console.log('\n🧪 Testing API key with Gemini...\n');

    // Ensure API_KEY is a string (not undefined) - already checked above, but for TS
    const genAI = new GoogleGenerativeAI(API_KEY as string);

    // Try the models that were found to be available
    const modelsToTry = [
      { name: 'gemini-2.5-flash', apiVersion: 'v1' },
      { name: 'gemini-2.5-pro', apiVersion: 'v1' },
      { name: 'gemini-2.0-flash', apiVersion: 'v1' },
      { name: 'gemini-2.0-flash-001', apiVersion: 'v1' },
      { name: 'gemini-2.5-flash-lite', apiVersion: 'v1' },
    ];
    
    let success = false;
    for (const { name, apiVersion } of modelsToTry) {
      try {
        console.log(`Trying model: ${name} (${apiVersion})...`);
        const model = genAI.getGenerativeModel({ 
          model: name,
          // Try without specifying API version first (default)
        });
        const result = await model.generateContent('Say "Hello" if you can read this.');
        const response = result.response;
        const text = response.text();
        
        console.log('\n✅ API Key is VALID!');
        console.log(`✅ Working model: ${name}`);
        console.log('Response:', text);
        console.log('\n🎉 Your Gemini API key is working correctly!\n');
        success = true;
        break;
      } catch (error: any) {
        const errorMsg = error.message || String(error);
        const status = error.status || 'unknown';
        console.log(`  ❌ ${name} (${apiVersion}) failed: [${status}] ${errorMsg.substring(0, 70)}`);
        
        // If it's a 404, try making a direct API call to see what's available
        if (status === 404 && name === 'gemini-pro') {
          try {
            console.log('  🔍 Trying direct API call to check available models...');
            const response = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
            if (response.ok) {
              const data = await response.json();
              console.log('  📋 Available models:', data.models?.map((m: any) => m.name).join(', ') || 'None found');
            }
          } catch (fetchError) {
            // Ignore fetch errors
          }
        }
        continue;
      }
    }
    
    if (!success) {
      throw new Error('All model attempts failed');
    }
  } catch (error: any) {
    console.error('\n❌ API Key test FAILED');
    console.error('Error:', error.message);
    
    if (error.status === 404) {
      console.error('\n⚠️  Models not found (404). This usually means:');
      console.error('1. The Gemini API is not enabled for your API key');
      console.error('2. Go to: https://aistudio.google.com/apikey');
      console.error('3. Make sure you created a Gemini API key (not Google Cloud Vision)');
      console.error('4. Enable the "Generative Language API" in Google Cloud Console');
      console.error('5. Your API key might be for a different Google service');
    } else if (error.message?.includes('API_KEY_INVALID') || error.status === 403) {
      console.error('\n⚠️  Your API key appears to be invalid or lacks permissions.');
      console.error('Please check:');
      console.error('1. Get a new key from: https://aistudio.google.com/apikey');
      console.error('2. Make sure it\'s a Gemini API key (not Google Cloud Vision)');
      console.error('3. Ensure the key is copied correctly (no extra spaces)');
    } else if (error.message?.includes('quota') || error.message?.includes('limit')) {
      console.error('\n⚠️  You may have hit a rate limit or quota.');
    } else {
      console.error('\n⚠️  Unknown error. Full error:', error);
    }
    process.exit(1);
  }
}

testAPIKey();
