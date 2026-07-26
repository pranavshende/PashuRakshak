import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';

// Simple in-memory fallback for web since expo-sqlite is native only (unless using WASM)
let db: SQLite.SQLiteDatabase | null = null;
const isWeb = Platform.OS === 'web';

export const initDb = async () => {
  if (isWeb) return; // Web handles state via IndexedDB/Context, skipped for simple offline shim
  
  db = await SQLite.openDatabaseAsync('pashurakshak.db');
  
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY NOT NULL,
      disease TEXT NOT NULL,
      confidence REAL NOT NULL,
      riskLevel TEXT NOT NULL,
      imagePath TEXT,
      synced INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS symptoms (
      id TEXT PRIMARY KEY NOT NULL,
      predictionId TEXT NOT NULL,
      symptomData TEXT NOT NULL,
      FOREIGN KEY (predictionId) REFERENCES predictions(id)
    );
  `);
};

export const savePredictionLocally = async (
  prediction: { id: string; disease: string; confidence: number; riskLevel: string; imagePath: string },
  symptoms: any
) => {
  if (isWeb || !db) return; // Skip or handle via web storage
  
  await db.runAsync(
    `INSERT INTO predictions (id, disease, confidence, riskLevel, imagePath, createdAt) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      prediction.id,
      prediction.disease,
      prediction.confidence,
      prediction.riskLevel,
      prediction.imagePath,
      new Date().toISOString(),
    ]
  );

  await db.runAsync(
    `INSERT INTO symptoms (id, predictionId, symptomData) VALUES (?, ?, ?)`,
    [
      Math.random().toString(36).substring(7),
      prediction.id,
      JSON.stringify(symptoms),
    ]
  );
};

export const getPendingSyncs = async () => {
  if (isWeb || !db) return [];
  const rows = await db.getAllAsync(
    `SELECT p.*, s.symptomData 
     FROM predictions p 
     LEFT JOIN symptoms s ON p.id = s.predictionId 
     WHERE p.synced = 0`
  );
  return rows.map((row: any) => ({
    ...row,
    symptoms: row.symptomData ? JSON.parse(row.symptomData) : null,
  }));
};

export const markAsSynced = async (id: string) => {
  if (isWeb || !db) return;
  await db.runAsync('UPDATE predictions SET synced = 1 WHERE id = ?', [id]);
};

// Dummy default export to prevent Expo Router from crashing
export default function LocalDbRoute() {
  return null;
}
