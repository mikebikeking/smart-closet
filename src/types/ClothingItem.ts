export interface ClothingItem {
  id: string;
  name: string;
  category: 'tops' | 'bottoms' | 'outerwear' | 'shoes' | 'accessories';
  brand?: string;
  size?: string;
  colors: string[];
  material?: string;
  purchasePrice: number;
  purchaseDate: string; // ISO date string
  photoUri: string;
  careInstructions?: string;
  tags: string[]; // ['casual', 'formal', 'workout', 'waterproof', etc.]
  createdAt: string;
  updatedAt: string;
}

export interface WearLog {
  id: string;
  itemId: string;
  wearDate: string; // ISO date string
}

export interface ItemAnalytics {
  itemId: string;
  timesWorn: number;
  costPerWear: number;
  daysSinceLastWear: number;
  daysOwned: number;
  wearFrequency: number; // times worn / days owned
}

export interface WeatherData {
  temp: number;
  feelsLike: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
}
