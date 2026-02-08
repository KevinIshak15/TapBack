import { db } from "../db";

/**
 * Ensures Firestore is available
 * (No-op for Firestore, but kept for compatibility)
 */
export function requireDb() {
  if (!db) {
    throw new Error("Firestore not initialized. Please check Firebase configuration.");
  }
  return db;
}
