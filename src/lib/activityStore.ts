// Ensure this code only runs on the client-side
"use client";

export interface WordSetRecord {
  id: string;
  language: string;
  field: string;
  words: string[];
  timestamp: number;
}

export interface ActivityData {
  learnedItems: WordSetRecord[];
}

const STORAGE_KEY = "linguaLeapActivity";

export function addWordSet(language: string, field: string, words: string[]): WordSetRecord {
  if (typeof window === "undefined") {
    // Should not happen if called from client component effect
    const placeholderRecord: WordSetRecord = { id: Date.now().toString(), language, field, words, timestamp: Date.now() };
    return placeholderRecord;
  }

  const activityData = getActivityData();
  const newRecord: WordSetRecord = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // more unique id
    language,
    field,
    words,
    timestamp: Date.now(),
  };
  activityData.learnedItems.unshift(newRecord); // Add to the beginning for chronological order
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activityData));
  return newRecord;
}

export function getActivityData(): ActivityData {
   if (typeof window === "undefined") {
    return { learnedItems: [] };
  }
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsedData = JSON.parse(data) as ActivityData;
      // Ensure learnedItems is an array
      if (Array.isArray(parsedData.learnedItems)) {
        return parsedData;
      }
    } catch (error) {
      console.error("Error parsing activity data from localStorage:", error);
      // Fallback to default if parsing fails or structure is incorrect
    }
  }
  return { learnedItems: [] };
}

export interface LearningStats {
  totalWordsLearned: number;
  fieldsCoveredCount: number;
  wordSetsGenerated: number;
}

export function getStats(): LearningStats {
  if (typeof window === "undefined") {
    return { totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0 };
  }
  const activityData = getActivityData();
  const totalWordsLearned = activityData.learnedItems.reduce(
    (sum, item) => sum + item.words.length,
    0
  );
  const uniqueFields = new Set(
    activityData.learnedItems.map(item => `${item.language} - ${item.field}`)
  );
  return {
    totalWordsLearned,
    fieldsCoveredCount: uniqueFields.size,
    wordSetsGenerated: activityData.learnedItems.length,
  };
}
