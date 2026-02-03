import { ClothingItem, ItemAnalytics, WearLog } from '@/src/types/ClothingItem';
import { daysSince } from './dateHelpers';

export const calculateCostPerWear = (
  purchasePrice: number,
  timesWorn: number
): number => {
  if (timesWorn === 0) return purchasePrice;
  return purchasePrice / timesWorn;
};

export const calculateDaysSinceLastWear = (wearLogs: WearLog[]): number => {
  if (wearLogs.length === 0) return -1; // Never worn
  
  const sortedLogs = [...wearLogs].sort(
    (a, b) => new Date(b.wearDate).getTime() - new Date(a.wearDate).getTime()
  );
  
  return daysSince(sortedLogs[0].wearDate);
};

export const calculateDaysOwned = (purchaseDate: string): number => {
  return daysSince(purchaseDate);
};

export const calculateWearFrequency = (
  timesWorn: number,
  daysOwned: number
): number => {
  if (daysOwned === 0) return 0;
  return timesWorn / daysOwned;
};

export const calculateItemAnalytics = (
  item: ClothingItem,
  wearLogs: WearLog[]
): ItemAnalytics => {
  const timesWorn = wearLogs.length;
  const costPerWear = calculateCostPerWear(item.purchasePrice, timesWorn);
  const daysSinceLastWear = calculateDaysSinceLastWear(wearLogs);
  const daysOwned = calculateDaysOwned(item.purchaseDate);
  const wearFrequency = calculateWearFrequency(timesWorn, daysOwned);

  return {
    itemId: item.id,
    timesWorn,
    costPerWear,
    daysSinceLastWear,
    daysOwned,
    wearFrequency,
  };
};

export const identifyStagnantItems = (
  items: ClothingItem[],
  wearLogsByItem: Record<string, WearLog[]>
): ClothingItem[] => {
  const stagnantThreshold = 90; // days
  
  return items.filter((item) => {
    const logs = wearLogsByItem[item.id] || [];
    const daysSinceLastWear = calculateDaysSinceLastWear(logs);
    
    // Items never worn or not worn in 90+ days
    return daysSinceLastWear === -1 || daysSinceLastWear >= stagnantThreshold;
  });
};
