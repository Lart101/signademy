// lib/ai-models.ts - AI Model Configuration
// Ported exactly from legacy config.js

// Supabase configuration - loaded from environment variables (.env.local)
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const SUPABASE_BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET!;

// Validate required env vars at module load time
if (typeof window !== "undefined") {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_BUCKET) {
    console.error(
      "[Signademy] Missing required NEXT_PUBLIC_SUPABASE_* environment variables. " +
      "Check your .env.local file."
    );
  }
}

// Model URLs from legacy config.js - exact Supabase storage paths
export const MODEL_URLS: Record<string, string> = {
  alphabet: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/letters.task`,
  numbers: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/numbers.task`,
  colors: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/colors.task`,
  basicWords: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/basicWords.task`,
  family: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/family.task`,
  food: `${SUPABASE_URL}/storage/v1/object/public/${SUPABASE_BUCKET}/food.task`,
};

// Model display names
export const MODEL_DISPLAY_NAMES: Record<string, string> = {
  alphabet: "Letters (A-Z)",
  numbers: "Numbers (0-9)",
  colors: "Colors",
  basicWords: "Basic Words",
  family: "Family & People",
  food: "Food & Drinks",
};

// Model confidence configuration from legacy config.js
export const MODEL_CONFIG = {
  confidenceThreshold: 0.7,
  minConfidence: 0.6,
  debounceTime: 500,
  maxProcessingTime: 100,
};

// Word mappings from legacy config.js - normalizes model output
export const WORD_MAPPINGS: Record<string, Record<string, string>> = {
  basicWords: {
    "thank you": "THANK",
    thankyou: "THANK",
    thanks: "THANK",
    goodbye: "GOODBYE",
    "good bye": "GOODBYE",
    bye: "GOODBYE",
    hello: "HELLO",
    hi: "HELLO",
    please: "PLEASE",
    yes: "YES",
    no: "NO",
  },
};

/**
 * Normalize model output - ported from legacy normalizeModelOutput()
 */
export function normalizeModelOutput(categoryName: string): string {
  if (!categoryName) return "";

  const normalized = categoryName.trim();

  // Check all word mapping categories
  for (const category of Object.values(WORD_MAPPINGS)) {
    const lowerNormalized = normalized.toLowerCase();
    if (category[lowerNormalized]) {
      return category[lowerNormalized];
    }
  }

  return normalized.toUpperCase();
}

/**
 * Get model URL for a category
 */
export function getModelUrl(category: string): string {
  return MODEL_URLS[category] || MODEL_URLS.alphabet;
}

/**
 * Get display name for a model
 */
export function getModelDisplayName(category: string): string {
  return MODEL_DISPLAY_NAMES[category] || category;
}

/**
 * Get all available models
 */
export function getAvailableModels() {
  return Object.entries(MODEL_DISPLAY_NAMES).map(([key, name]) => ({
    value: key,
    name,
    url: MODEL_URLS[key],
  }));
}
