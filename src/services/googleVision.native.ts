import axios from 'axios';
import * as FileSystem from 'expo-file-system';

const VISION_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_VISION_KEY;
const VISION_API_URL = `https://vision.googleapis.com/v1/images:annotate?key=${VISION_API_KEY}`;

interface VisionResponse {
  category?: string;
  colors?: string[];
  brand?: string;
  labels?: string[];
}

const categoryMapping: Record<string, 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories'> = {
  'shirt': 'tops',
  't-shirt': 'tops',
  'blouse': 'tops',
  'sweater': 'tops',
  'hoodie': 'tops',
  'jacket': 'outerwear',
  'coat': 'outerwear',
  'pants': 'bottoms',
  'jeans': 'bottoms',
  'shorts': 'bottoms',
  'skirt': 'bottoms',
  'shoes': 'shoes',
  'sneakers': 'shoes',
  'boots': 'shoes',
  'hat': 'accessories',
  'bag': 'accessories',
  'watch': 'accessories',
};

const parseVisionResponse = (data: any): VisionResponse => {
  const result: VisionResponse = {
    labels: [],
    colors: [],
  };

  if (data.responses && data.responses[0]) {
    const response = data.responses[0];

    // Extract labels
    if (response.labelAnnotations) {
      result.labels = response.labelAnnotations.map((label: any) => label.description);
      
      // Try to map labels to category
      if (result.labels) {
        for (const label of result.labels) {
          const lowerLabel = label.toLowerCase();
          for (const [key, category] of Object.entries(categoryMapping)) {
            if (lowerLabel.includes(key)) {
              result.category = category;
              break;
            }
          }
          if (result.category) break;
        }
      }
    }

    // Extract colors
    if (response.imagePropertiesAnnotation?.dominantColors?.colors) {
      result.colors = response.imagePropertiesAnnotation.dominantColors.colors
        .slice(0, 3)
        .map((color: any) => {
          const r = Math.round(color.color.red || 0);
          const g = Math.round(color.color.green || 0);
          const b = Math.round(color.color.blue || 0);
          return `rgb(${r}, ${g}, ${b})`;
        });
    }

    // Try to detect brand from logo detection
    if (response.logoAnnotations && response.logoAnnotations.length > 0) {
      result.brand = response.logoAnnotations[0].description;
    }
  }

  return result;
};

export const analyzeClothingImage = async (imageUri: string): Promise<VisionResponse> => {
  if (!VISION_API_KEY) {
    throw new Error('Google Vision API key not configured');
  }

  try {
    // Read image as base64
    // In newer versions of expo-file-system, encoding is just a string 'base64'
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: 'base64' as any,
    });

    const body = {
      requests: [{
        image: { content: base64 },
        features: [
          { type: 'LABEL_DETECTION', maxResults: 10 },
          { type: 'IMAGE_PROPERTIES', maxResults: 5 },
          { type: 'LOGO_DETECTION', maxResults: 3 },
        ],
      }],
    };

    const response = await axios.post(VISION_API_URL, body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return parseVisionResponse(response.data);
  } catch (error) {
    console.error('Vision API error:', error);
    throw new Error('Failed to analyze image');
  }
};
