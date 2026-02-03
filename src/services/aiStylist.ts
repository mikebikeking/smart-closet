import { ClosetItem, OutfitRecommendation } from '@/src/types/closet';
import { ClothingItem, WearLog, WeatherData } from '@/src/types/ClothingItem';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Get API key lazily (at function call time, not module load time)
// This allows dotenv to load before the key is checked
const getGeminiAPI = () => {
  const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// Define the response schema for structured outputs
const responseSchema: {
  type: typeof SchemaType.OBJECT;
  properties: {
    outfit_ids: {
      type: typeof SchemaType.ARRAY;
      items: {
        type: typeof SchemaType.STRING;
      };
      description: string;
    };
    styling_advice: {
      type: typeof SchemaType.STRING;
      description: string;
    };
    weather_rationale: {
      type: typeof SchemaType.STRING;
      description: string;
    };
  };
  required: string[];
} = {
  type: SchemaType.OBJECT,
  properties: {
    outfit_ids: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.STRING,
      },
      description: 'Array of item IDs that make up the recommended outfit',
    },
    styling_advice: {
      type: SchemaType.STRING,
      description: 'Styling tips and advice for wearing this outfit',
    },
    weather_rationale: {
      type: SchemaType.STRING,
      description: 'Explanation of why this outfit is appropriate for the current weather conditions',
    },
  },
  required: ['outfit_ids', 'styling_advice', 'weather_rationale'],
};

/**
 * Converts ClothingItem array to ClosetItem array format for AI stylist
 */
export const convertToClosetItems = (
  items: ClothingItem[],
  wearLogsByItem: Record<string, WearLog[]>
): ClosetItem[] => {
  return items.map((item) => {
    const logs = wearLogsByItem[item.id] || [];
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.wearDate).getTime() - new Date(a.wearDate).getTime()
    );
    const lastWorn = sortedLogs.length > 0 ? sortedLogs[0].wearDate : item.createdAt;

    return {
      id: item.id,
      name: item.name,
      category: item.category,
      wear_count: logs.length,
      last_worn: lastWorn,
      tags: item.tags,
    };
  });
};

/**
 * Suggests an outfit using Gemini 1.5 Flash AI based on closet inventory and weather data.
 * Prioritizes "forgotten" items (low wear_count and old last_worn dates) while ensuring
 * weather appropriateness.
 * 
 * @param inventory - Array of closet items with wear history
 * @param weather - Current weather data
 * @returns Promise<OutfitRecommendation> - AI-generated outfit recommendation
 */
export const suggestOutfit = async (
  inventory: ClosetItem[],
  weather: WeatherData
): Promise<OutfitRecommendation> => {
  const genAI = getGeminiAPI();
  if (!genAI) {
    throw new Error('Gemini API key not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file.');
  }

  if (inventory.length === 0) {
    throw new Error('Inventory is empty. Cannot suggest outfits.');
  }

  // Use gemini-3-flash (2026 stable model)
  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: responseSchema,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });

  // System instruction to prioritize forgotten items while staying weather-appropriate
  const systemInstruction = `You are a personal stylist AI that helps users get more value from their wardrobe.

CRITICAL PRIORITIES:
1. Prioritize "forgotten" items - items with low wear_count and old last_worn dates should be given HIGHEST priority
2. Weather appropriateness is MANDATORY - the outfit must be suitable for the current weather conditions
3. Create complete, cohesive outfits that include appropriate items for the weather

OUTFIT SELECTION RULES:
- Always include at least one top and one bottom
- Add outerwear if the weather is cold (temp < 60°F)
- Include shoes that are appropriate for the weather
- Prefer items that haven't been worn recently (old last_worn dates)
- Prefer items with low wear_count (items that need more use)
- Consider tags when matching items (e.g., casual, formal, workout)
- Ensure color coordination when possible

WEATHER CONSIDERATIONS:
- Cold weather (< 60°F): Include warm layers, jackets, or coats
- Hot weather (> 75°F): Avoid heavy outerwear, prefer breathable materials
- Rainy conditions: Prefer waterproof items if available
- Windy conditions: Consider layering options

Your response must be a valid JSON object matching the schema.`;

  // Build the prompt with inventory and weather data
  const inventorySummary = inventory
    .map(
      (item) =>
        `ID: ${item.id}, Name: ${item.name}, Category: ${item.category}, ` +
        `Worn: ${item.wear_count} times, Last worn: ${item.last_worn}, Tags: ${item.tags.join(', ')}`
    )
    .join('\n');

  const prompt = `Current Weather Conditions:
- Temperature: ${weather.temp}°F (feels like ${weather.feelsLike}°F)
- Conditions: ${weather.description}
- Humidity: ${weather.humidity}%
- Wind Speed: ${weather.windSpeed} mph

Available Closet Items:
${inventorySummary}

Based on the weather conditions and prioritizing forgotten items (low wear_count, old last_worn), suggest a complete, weather-appropriate outfit. Include styling advice and explain why this outfit works for the current weather.`;

  try {
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      systemInstruction: systemInstruction,
    });

    const response = result.response;
    const text = response.text();

    // Parse the JSON response
    const recommendation: OutfitRecommendation = JSON.parse(text);

    // Validate the response
    if (!recommendation.outfit_ids || !Array.isArray(recommendation.outfit_ids)) {
      throw new Error('Invalid response format: outfit_ids is missing or not an array');
    }

    if (!recommendation.styling_advice || !recommendation.weather_rationale) {
      throw new Error('Invalid response format: missing styling_advice or weather_rationale');
    }

    return recommendation;
  } catch (error: any) {
    console.error('Error generating outfit suggestion:', error);
    
    if (error.message?.includes('API key')) {
      throw new Error('Invalid Gemini API key. Please check your EXPO_PUBLIC_GEMINI_API_KEY.');
    }
    
    if (error.message?.includes('JSON')) {
      throw new Error('Failed to parse AI response. Please try again.');
    }
    
    throw new Error(`Failed to generate outfit suggestion: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Convenience function that accepts ClothingItem format directly
 */
export const suggestOutfitFromClothingItems = async (
  items: ClothingItem[],
  weather: WeatherData,
  wearLogsByItem: Record<string, WearLog[]>
): Promise<OutfitRecommendation> => {
  const closetItems = convertToClosetItems(items, wearLogsByItem);
  return suggestOutfit(closetItems, weather);
};
