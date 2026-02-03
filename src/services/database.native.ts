import * as SQLite from 'expo-sqlite';
import { ClothingItem, WearLog } from '@/src/types/ClothingItem';

let db: SQLite.SQLiteDatabase | null = null;

export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('wearwise.db');
  
  // Create clothing_items table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS clothing_items (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      brand TEXT,
      size TEXT,
      colors TEXT,
      material TEXT,
      purchase_price REAL NOT NULL,
      purchase_date TEXT NOT NULL,
      photo_uri TEXT NOT NULL,
      care_instructions TEXT,
      tags TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);

  // Create wear_logs table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS wear_logs (
      id TEXT PRIMARY KEY,
      item_id TEXT NOT NULL,
      wear_date TEXT NOT NULL,
      FOREIGN KEY (item_id) REFERENCES clothing_items(id) ON DELETE CASCADE
    );
  `);

  // Create indexes
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_wear_logs_item_id ON wear_logs(item_id);
    CREATE INDEX IF NOT EXISTS idx_wear_logs_wear_date ON wear_logs(wear_date);
  `);

  return db;
};

// Clothing Items CRUD
export const getAllClothingItems = async (): Promise<ClothingItem[]> => {
  const database = await initDatabase();
  const result = await database.getAllAsync<{
    id: string;
    name: string;
    category: string;
    brand: string | null;
    size: string | null;
    colors: string;
    material: string | null;
    purchase_price: number;
    purchase_date: string;
    photo_uri: string;
    care_instructions: string | null;
    tags: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM clothing_items ORDER BY created_at DESC');

  return result.map((row) => ({
    id: row.id,
    name: row.name,
    category: row.category as ClothingItem['category'],
    brand: row.brand || undefined,
    size: row.size || undefined,
    colors: JSON.parse(row.colors || '[]'),
    material: row.material || undefined,
    purchasePrice: row.purchase_price,
    purchaseDate: row.purchase_date,
    photoUri: row.photo_uri,
    careInstructions: row.care_instructions || undefined,
    tags: JSON.parse(row.tags || '[]'),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};

export const getClothingItemById = async (id: string): Promise<ClothingItem | null> => {
  const database = await initDatabase();
  const result = await database.getFirstAsync<{
    id: string;
    name: string;
    category: string;
    brand: string | null;
    size: string | null;
    colors: string;
    material: string | null;
    purchase_price: number;
    purchase_date: string;
    photo_uri: string;
    care_instructions: string | null;
    tags: string;
    created_at: string;
    updated_at: string;
  }>('SELECT * FROM clothing_items WHERE id = ?', [id]);

  if (!result) return null;

  return {
    id: result.id,
    name: result.name,
    category: result.category as ClothingItem['category'],
    brand: result.brand || undefined,
    size: result.size || undefined,
    colors: JSON.parse(result.colors || '[]'),
    material: result.material || undefined,
    purchasePrice: result.purchase_price,
    purchaseDate: result.purchase_date,
    photoUri: result.photo_uri,
    careInstructions: result.care_instructions || undefined,
    tags: JSON.parse(result.tags || '[]'),
    createdAt: result.created_at,
    updatedAt: result.updated_at,
  };
};

export const insertClothingItem = async (item: ClothingItem): Promise<void> => {
  const database = await initDatabase();
  await database.runAsync(
    `INSERT INTO clothing_items (
      id, name, category, brand, size, colors, material,
      purchase_price, purchase_date, photo_uri, care_instructions,
      tags, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      item.id,
      item.name,
      item.category,
      item.brand || null,
      item.size || null,
      JSON.stringify(item.colors),
      item.material || null,
      item.purchasePrice,
      item.purchaseDate,
      item.photoUri,
      item.careInstructions || null,
      JSON.stringify(item.tags),
      item.createdAt,
      item.updatedAt,
    ]
  );
};

export const updateClothingItem = async (item: ClothingItem): Promise<void> => {
  const database = await initDatabase();
  await database.runAsync(
    `UPDATE clothing_items SET
      name = ?, category = ?, brand = ?, size = ?, colors = ?,
      material = ?, purchase_price = ?, purchase_date = ?,
      photo_uri = ?, care_instructions = ?, tags = ?, updated_at = ?
    WHERE id = ?`,
    [
      item.name,
      item.category,
      item.brand || null,
      item.size || null,
      JSON.stringify(item.colors),
      item.material || null,
      item.purchasePrice,
      item.purchaseDate,
      item.photoUri,
      item.careInstructions || null,
      JSON.stringify(item.tags),
      item.updatedAt,
      item.id,
    ]
  );
};

export const deleteClothingItem = async (id: string): Promise<void> => {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM clothing_items WHERE id = ?', [id]);
};

// Wear Logs CRUD
export const getWearLogsByItemId = async (itemId: string): Promise<WearLog[]> => {
  const database = await initDatabase();
  const result = await database.getAllAsync<{
    id: string;
    item_id: string;
    wear_date: string;
  }>('SELECT * FROM wear_logs WHERE item_id = ? ORDER BY wear_date DESC', [itemId]);

  return result.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    wearDate: row.wear_date,
  }));
};

export const getAllWearLogs = async (): Promise<WearLog[]> => {
  const database = await initDatabase();
  const result = await database.getAllAsync<{
    id: string;
    item_id: string;
    wear_date: string;
  }>('SELECT * FROM wear_logs ORDER BY wear_date DESC');

  return result.map((row) => ({
    id: row.id,
    itemId: row.item_id,
    wearDate: row.wear_date,
  }));
};

export const insertWearLog = async (wearLog: WearLog): Promise<void> => {
  const database = await initDatabase();
  await database.runAsync(
    'INSERT INTO wear_logs (id, item_id, wear_date) VALUES (?, ?, ?)',
    [wearLog.id, wearLog.itemId, wearLog.wearDate]
  );
};

export const deleteWearLog = async (id: string): Promise<void> => {
  const database = await initDatabase();
  await database.runAsync('DELETE FROM wear_logs WHERE id = ?', [id]);
};
