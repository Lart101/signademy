// lib/supabase.ts - Supabase client configuration
// Ported from legacy admin.js config

import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_BUCKET, MODEL_DISPLAY_NAMES } from "./ai-models";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export const STORAGE_BUCKET = SUPABASE_BUCKET;

// Re-export from ai-models.ts (single source of truth)
export { MODEL_DISPLAY_NAMES };

// Category to expected filename mapping - from legacy admin.js
export const CATEGORY_FILENAMES: Record<string, string> = {
  alphabet: "letters.task",
  numbers: "numbers.task",
  colors: "colors.task",
  basicWords: "basicWords.task",
  family: "family.task",
  food: "food.task",
};

export function getExpectedFilename(category: string): string {
  return CATEGORY_FILENAMES[category] || `${category}.task`;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}
