import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, WearLog } from '@/src/types/ClothingItem';

// Web storage keys
const STORAGE_ITEMS_KEY = '@wearwise:clothing_items';
const STORAGE_WEAR_LOGS_KEY = '@wearwise:wear_logs';

// Web storage helpers
const getStoredItems = async (): Promise<ClothingItem[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_ITEMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredItems = async (items: ClothingItem[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
};

const getStoredWearLogs = async (): Promise<WearLog[]> => {
  try {
    const data = await AsyncStorage.getItem(STORAGE_WEAR_LOGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

const setStoredWearLogs = async (wearLogs: WearLog[]): Promise<void> => {
  await AsyncStorage.setItem(STORAGE_WEAR_LOGS_KEY, JSON.stringify(wearLogs));
};

export const initDatabase = async (): Promise<null> => {
  // No-op on web, using AsyncStorage instead
  return null;
};

// Clothing Items CRUD
export const getAllClothingItems = async (): Promise<ClothingItem[]> => {
  return getStoredItems();
};

export const getClothingItemById = async (id: string): Promise<ClothingItem | null> => {
  const items = await getStoredItems();
  return items.find(item => item.id === id) || null;
};

export const insertClothingItem = async (item: ClothingItem): Promise<void> => {
  const items = await getStoredItems();
  items.push(item);
  await setStoredItems(items);
};

export const updateClothingItem = async (item: ClothingItem): Promise<void> => {
  const items = await getStoredItems();
  const index = items.findIndex(i => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    await setStoredItems(items);
  }
};

export const deleteClothingItem = async (id: string): Promise<void> => {
  const items = await getStoredItems();
  const filtered = items.filter(item => item.id !== id);
  await setStoredItems(filtered);
  // Also delete related wear logs
  const wearLogs = await getStoredWearLogs();
  const filteredLogs = wearLogs.filter(log => log.itemId !== id);
  await setStoredWearLogs(filteredLogs);
};

// Wear Logs CRUD
export const getWearLogsByItemId = async (itemId: string): Promise<WearLog[]> => {
  const wearLogs = await getStoredWearLogs();
  return wearLogs.filter(log => log.itemId === itemId);
};

export const getAllWearLogs = async (): Promise<WearLog[]> => {
  return getStoredWearLogs();
};

export const insertWearLog = async (wearLog: WearLog): Promise<void> => {
  const wearLogs = await getStoredWearLogs();
  wearLogs.push(wearLog);
  await setStoredWearLogs(wearLogs);
};

export const deleteWearLog = async (id: string): Promise<void> => {
  const wearLogs = await getStoredWearLogs();
  const filtered = wearLogs.filter(log => log.id !== id);
  await setStoredWearLogs(filtered);
};
