export interface ClosetItem {
  id: string;
  name: string;
  category: string;
  wear_count: number;
  last_worn: string; // ISO Date
  tags: string[];
}

export interface OutfitRecommendation {
  outfit_ids: string[];
  styling_advice: string;
  weather_rationale: string;
}
