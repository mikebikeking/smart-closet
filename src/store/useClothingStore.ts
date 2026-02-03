import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, WearLog } from '@/src/types/ClothingItem';
import * as database from '@/src/services/database';

interface ClothingState {
  items: ClothingItem[];
  wearLogs: WearLog[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  loadItems: () => Promise<void>;
  loadWearLogs: () => Promise<void>;
  addItem: (item: ClothingItem) => Promise<void>;
  updateItem: (item: ClothingItem) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  logWear: (itemId: string) => Promise<void>;
  getWearLogsForItem: (itemId: string) => WearLog[];
}

export const useClothingStore = create<ClothingState>()(
  persist(
    (set, get) => ({
      items: [],
      wearLogs: [],
      isLoading: false,
      error: null,

      loadItems: async () => {
        try {
          set({ isLoading: true, error: null });
          const items = await database.getAllClothingItems();
          set({ items, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load items',
            isLoading: false 
          });
        }
      },

      loadWearLogs: async () => {
        try {
          const wearLogs = await database.getAllWearLogs();
          set({ wearLogs });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load wear logs'
          });
        }
      },

      addItem: async (item: ClothingItem) => {
        try {
          await database.insertClothingItem(item);
          const items = await database.getAllClothingItems();
          set({ items });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add item'
          });
          throw error;
        }
      },

      updateItem: async (item: ClothingItem) => {
        try {
          await database.updateClothingItem(item);
          const items = await database.getAllClothingItems();
          set({ items });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update item'
          });
          throw error;
        }
      },

      deleteItem: async (id: string) => {
        try {
          await database.deleteClothingItem(id);
          const items = get().items.filter(item => item.id !== id);
          const wearLogs = get().wearLogs.filter(log => log.itemId !== id);
          set({ items, wearLogs });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete item'
          });
          throw error;
        }
      },

      logWear: async (itemId: string) => {
        try {
          const wearLog: WearLog = {
            id: `${itemId}-${Date.now()}`,
            itemId,
            wearDate: new Date().toISOString(),
          };
          await database.insertWearLog(wearLog);
          const wearLogs = await database.getAllWearLogs();
          set({ wearLogs });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to log wear'
          });
          throw error;
        }
      },

      getWearLogsForItem: (itemId: string) => {
        return get().wearLogs.filter(log => log.itemId === itemId);
      },
    }),
    {
      name: 'clothing-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items, wearLogs: state.wearLogs }),
    }
  )
);
