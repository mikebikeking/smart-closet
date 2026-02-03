/**
 * Test script for AI Stylist service
 * 
 * Usage:
 * 1. Make sure EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file
 * 2. Run: npx tsx test-ai-stylist.ts
 * 
 * Or import and use in your app:
 * import { suggestOutfit } from '@/src/services/aiStylist';
 */

// Load environment variables
import dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env file from project root
const envPath = resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

// Debug: Check if API key is loaded
console.log('🔍 Debugging environment variables:');
console.log('Current working directory:', process.cwd());
console.log('.env file path:', envPath);
console.log('EXPO_PUBLIC_GEMINI_API_KEY exists:', !!process.env.EXPO_PUBLIC_GEMINI_API_KEY);
console.log('EXPO_PUBLIC_GEMINI_API_KEY length:', process.env.EXPO_PUBLIC_GEMINI_API_KEY?.length || 0);
console.log('EXPO_PUBLIC_GEMINI_API_KEY first 10 chars:', process.env.EXPO_PUBLIC_GEMINI_API_KEY?.substring(0, 10) || 'NOT SET');
console.log('');

import { suggestOutfit } from './src/services/aiStylist';
import { ClosetItem } from './src/types/closet';
import { WeatherData } from './src/types/ClothingItem';

// Dummy inventory data
const dummyInventory: ClosetItem[] = [
  {
    id: 'item-1',
    name: 'Blue Denim Jacket',
    category: 'outerwear',
    wear_count: 2,
    last_worn: '2024-01-15T00:00:00.000Z', // Old date - forgotten item
    tags: ['casual', 'warm', 'denim'],
  },
  {
    id: 'item-2',
    name: 'White Cotton T-Shirt',
    category: 'tops',
    wear_count: 15,
    last_worn: '2024-12-10T00:00:00.000Z', // Recently worn
    tags: ['casual', 'basic'],
  },
  {
    id: 'item-3',
    name: 'Gray Wool Sweater',
    category: 'tops',
    wear_count: 1,
    last_worn: '2023-11-20T00:00:00.000Z', // Very old - highly forgotten
    tags: ['warm', 'casual'],
  },
  {
    id: 'item-4',
    name: 'Black Jeans',
    category: 'bottoms',
    wear_count: 8,
    last_worn: '2024-12-05T00:00:00.000Z',
    tags: ['casual', 'versatile'],
  },
  {
    id: 'item-5',
    name: 'Navy Chinos',
    category: 'bottoms',
    wear_count: 3,
    last_worn: '2024-02-10T00:00:00.000Z', // Old - forgotten
    tags: ['casual', 'smart-casual'],
  },
  {
    id: 'item-6',
    name: 'Leather Boots',
    category: 'shoes',
    wear_count: 12,
    last_worn: '2024-12-08T00:00:00.000Z',
    tags: ['casual', 'waterproof'],
  },
];

// Dummy weather data (cold weather scenario)
const dummyWeather: WeatherData = {
  temp: 45,
  feelsLike: 40,
  description: 'partly cloudy',
  icon: '02d',
  humidity: 65,
  windSpeed: 10,
};

// Test the AI stylist
async function testAIStylist() {
  try {
    console.log('Testing AI Stylist Service...\n');
    console.log('Weather:', dummyWeather);
    console.log('Inventory items:', dummyInventory.length);
    console.log('\nGenerating outfit suggestion...\n');

    const recommendation = await suggestOutfit(dummyInventory, dummyWeather);

    console.log('✅ Outfit Recommendation:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📋 Outfit Item IDs:', recommendation.outfit_ids);
    console.log('\n💡 Styling Advice:');
    console.log(recommendation.styling_advice);
    console.log('\n🌤️  Weather Rationale:');
    console.log(recommendation.weather_rationale);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('\nMake sure:');
    console.error('1. EXPO_PUBLIC_GEMINI_API_KEY is set in your .env file');
    console.error('2. The API key is valid');
    console.error('3. You have internet connection');
  }
}

// Run the test
testAIStylist().catch(console.error);

export { dummyInventory, dummyWeather, testAIStylist };

