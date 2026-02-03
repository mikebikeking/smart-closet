import { ClothingItem, WearLog } from '@/src/types/ClothingItem';
import { calculateItemAnalytics } from '@/src/utils/calculations';

export interface OutfitSuggestion {
  items: ClothingItem[];
  score: number;
  reason: string;
  avgCostPerWear: number;
}

export const suggestOutfits = (
  items: ClothingItem[],
  weather: { temp: number; description: string },
  wearLogsByItem: Record<string, WearLog[]>
): OutfitSuggestion[] => {
  const suggestions: OutfitSuggestion[] = [];
  
  if (items.length === 0) {
    return [];
  }

  // Determine temperature-appropriate conditions
  const isCold = weather.temp < 60;
  const isHot = weather.temp > 75;
  const isRainy = weather.description.toLowerCase().includes('rain');

  // Score items by weather appropriateness (don't exclude, just prefer)
  const scoreItemForWeather = (item: ClothingItem): number => {
    let score = 1.0;
    
    if (isCold) {
      if (item.tags.includes('warm') || item.category === 'outerwear') {
        score += 0.5;
      }
      if (item.category === 'outerwear') {
        score += 0.3;
      }
    }
    
    if (isHot) {
      if (item.tags.includes('warm') && item.category === 'outerwear') {
        score -= 0.5; // Penalize warm outerwear in hot weather
      }
      if (item.category === 'outerwear') {
        score -= 0.2;
      }
    }
    
    if (isRainy) {
      if (item.tags.includes('waterproof') || item.category === 'outerwear') {
        score += 0.4;
      }
    }
    
    return score;
  };

  // Group by category
  const tops = items.filter(item => item.category === 'tops');
  const bottoms = items.filter(item => item.category === 'bottoms');
  const outerwear = items.filter(item => item.category === 'outerwear');
  const shoes = items.filter(item => item.category === 'shoes');
  const accessories = items.filter(item => item.category === 'accessories');

  // Need at least tops and bottoms to create outfits
  if (tops.length === 0 || bottoms.length === 0) {
    return [];
  }

  // Sort items by weather appropriateness and wear frequency
  const sortItems = (categoryItems: ClothingItem[]) => {
    return [...categoryItems].sort((a, b) => {
      const weatherScoreA = scoreItemForWeather(a);
      const weatherScoreB = scoreItemForWeather(b);
      
      const analyticsA = calculateItemAnalytics(a, wearLogsByItem[a.id] || []);
      const analyticsB = calculateItemAnalytics(b, wearLogsByItem[b.id] || []);
      
      // Prefer items worn less frequently (lower wear frequency = higher priority)
      const wearScoreA = 1 - analyticsA.wearFrequency;
      const wearScoreB = 1 - analyticsB.wearFrequency;
      
      // Combine weather and wear scores
      const totalScoreA = weatherScoreA * 0.6 + wearScoreA * 0.4;
      const totalScoreB = weatherScoreB * 0.6 + wearScoreB * 0.4;
      
      return totalScoreB - totalScoreA;
    });
  };

  const sortedTops = sortItems(tops);
  const sortedBottoms = sortItems(bottoms);
  const sortedOuterwear = sortItems(outerwear);
  const sortedShoes = sortItems(shoes);

  // Generate outfit combinations (up to 5 outfits)
  const maxOutfits = 5;
  const maxTops = Math.min(5, sortedTops.length);
  const maxBottoms = Math.min(5, sortedBottoms.length);

  for (let i = 0; i < maxTops && suggestions.length < maxOutfits; i++) {
    for (let j = 0; j < maxBottoms && suggestions.length < maxOutfits; j++) {
      const outfit: ClothingItem[] = [sortedTops[i], sortedBottoms[j]];
      
      // Add outerwear if cold (prefer first/best one)
      if (isCold && sortedOuterwear.length > 0) {
        outfit.push(sortedOuterwear[0]);
      }
      
      // Add shoes (prefer first/best one)
      if (sortedShoes.length > 0) {
        outfit.push(sortedShoes[0]);
      }

      // Calculate overall outfit score
      const analytics = outfit.map(item => 
        calculateItemAnalytics(item, wearLogsByItem[item.id] || [])
      );
      
      const avgWeatherScore = outfit.reduce((sum, item) => sum + scoreItemForWeather(item), 0) / outfit.length;
      const avgWearFrequency = analytics.reduce((sum, a) => sum + a.wearFrequency, 0) / analytics.length;
      const avgDaysSinceWear = analytics
        .map(a => a.daysSinceLastWear === -1 ? 30 : Math.min(a.daysSinceLastWear, 30))
        .reduce((sum, days) => sum + days, 0) / analytics.length;
      
      // Calculate average cost per wear for the outfit
      const avgCostPerWear = analytics.reduce((sum, a) => sum + a.costPerWear, 0) / analytics.length;
      
      // Score: weather appropriateness (40%) + low wear frequency (30%) + days since last wear (30%)
      const score = (avgWeatherScore * 0.4) + ((1 - avgWearFrequency) * 0.3) + (avgDaysSinceWear / 30 * 0.3);

      // Generate reason
      let reason = 'Weather-appropriate outfit';
      if (isCold) {
        reason = 'Perfect for the cold weather';
      } else if (isHot) {
        reason = 'Great for warm weather';
      } else if (isRainy) {
        reason = 'Rain-ready outfit';
      }

      suggestions.push({
        items: outfit,
        score,
        reason,
        avgCostPerWear,
      });
    }
  }

  // Sort by score and return top 5
  return suggestions
    .sort((a, b) => b.score - a.score)
    .slice(0, maxOutfits);
};
