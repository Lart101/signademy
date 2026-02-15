// lib/asl-data.ts - ASL Module and Challenge Data
// Ported exactly from legacy asl-data.js and module-content-loader.js

export const MODULES = {
  alphabet: {
    id: "alphabet",
    name: "Alphabet",
    emoji: "🔤",
    description: "Learn the ASL alphabet from A to Z",
    count: 26,
    items: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  },
  numbers: {
    id: "numbers",
    name: "Numbers",
    emoji: "🔢",
    description: "Learn ASL numbers from 0 to 9",
    count: 10,
    items: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  },
  colors: {
    id: "colors",
    name: "Colors",
    emoji: "🎨",
    description: "Learn common color signs in ASL",
    count: 10,
    items: ["Red", "Blue", "Green", "Yellow", "Orange", "Purple", "Pink", "Brown", "Black", "White"],
  },
  basicWords: {
    id: "basicWords",
    name: "Basic Words",
    emoji: "💬",
    description: "Learn essential ASL vocabulary",
    count: 6,
    items: ["Hello", "Goodbye", "Please", "ThankYou", "Yes", "No"],
  },
  family: {
    id: "family",
    name: "Family",
    emoji: "👨‍👩‍👧‍👦",
    description: "Learn family-related signs in ASL",
    count: 5,
    items: ["Mother", "Father", "Baby", "Boy", "Girl"],
  },
  food: {
    id: "food",
    name: "Food",
    emoji: "🍎",
    description: "Learn food and drink signs in ASL",
    count: 6,
    items: ["Apple", "Eat", "Drink", "Milk", "Pizza", "Water"],
  },
};

// Exact legacy CHALLENGE_WORDS from asl-data.js (using camelCase keys like legacy)
export const CHALLENGE_WORDS: Record<string, string[]> = {
  alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
  numbers: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  colors: ["Black", "Blue", "Green", "Orange", "Purple", "Red", "White", "Yellow"],
  basicWords: ["Hello", "Goodbye", "Please", "ThankYou", "Yes", "No"],
  family: ["Mother", "Father", "Baby", "Boy", "Girl"],
  food: ["Apple", "Drink", "Eat", "Milk", "Pizza", "Water"],
};

// Exact legacy FOLDER_MAP from asl-data.js
export const FOLDER_MAP: Record<string, string> = {
  alphabet: "alphabet",
  numbers: "numbers",
  colors: "colors",
  basicWords: "basic_words",
  family: "family",
  food: "food",
};

// Alphabet letter descriptions from module-template.js
export const ALPHABET_DESCRIPTIONS: Record<string, string> = {
  A: "Make a fist with your thumb alongside",
  B: "Hold your hand up with fingers together, thumb tucked",
  C: "Curve your hand in a C shape",
  D: "Index finger up, other fingers curled",
  E: "Curl all fingers, show fingertips",
  F: "Connect thumb and index, other fingers up",
  G: "Point index finger sideways, thumb straight",
  H: "Index and middle finger straight, others closed",
  I: "Pinky finger up, others closed",
  J: "Pinky up, draw a J in the air",
  K: "Index and middle finger up, thumb between",
  L: "Index finger and thumb make L shape",
  M: "Three fingers over thumb",
  N: "Two fingers over thumb",
  O: "Fingers curved into O shape",
  P: "Point middle finger down, index straight",
  Q: "Point index finger down, thumb out",
  R: "Cross index and middle finger",
  S: "Make a fist with thumb over fingers",
  T: "Thumb between index and middle finger",
  U: "Index and middle finger up together",
  V: "Index and middle finger in V shape",
  W: "Index, middle, and ring finger up",
  X: "Hook index finger, others closed",
  Y: "Thumb and pinky extended",
  Z: "Draw a Z with index finger",
};

/**
 * Get video path for a sign - ported from legacy getVideoPath()
 */
export function getVideoPath(word: string, category: string): string {
  const folderName = FOLDER_MAP[category] || category;
  return `/sign_language_videos/${folderName}/${word}.mp4`;
}

/**
 * Get image path for a sign
 */
export function getImagePath(word: string, category: string): string {
  const folderName = FOLDER_MAP[category] || category;
  if (category === "alphabet") {
    return `/sign_language_images/alphabet/alphabet_${word.toUpperCase()}.jpg`;
  }
  return `/sign_language_images/${folderName}/${word}.jpg`;
}

export type ModuleKey = keyof typeof MODULES;
export type ChallengeCategory = keyof typeof CHALLENGE_WORDS;
