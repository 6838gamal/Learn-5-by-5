// src/lib/activityStore.ts

// NOTE: With the introduction of Firestore for logged-in users, 
// the role of this localStorage-based store is primarily for:
// 1. Users who are not logged in.
// 2. A potential quick-access cache if Firestore is slow or offline (though not explicitly implemented as such).
// 3. Initial client-side rendering before Firestore data is loaded.
// For logged-in users, Firestore (via userActivityService.ts and server actions) is the source of truth.

"use client";

export interface WordEntry {
  word: string;
  sentence: string;
}

export interface WordSetActivityRecord {
  id: string;
  type: 'wordSet';
  language: string;
  field: string;
  wordEntries: WordEntry[];
  timestamp: number;
}

export interface ConversationActivityRecord {
  id: string;
  type: 'conversation';
  language: string;
  field: string;
  selectedWords: string[];
  conversation: string;
  timestamp: number;
}

export type ActivityRecord = WordSetActivityRecord | ConversationActivityRecord;

export interface ActivityData {
  learnedItems: ActivityRecord[];
}

// This interface is primarily for local/fallback stats if Firestore is not used.
export interface LearningStats {
  totalWordsLearned: number;
  fieldsCoveredCount: number;
  wordSetsGenerated: number;
  languagesCoveredCount: number; // Added new field
}

const STORAGE_KEY = "linguaLeapActivity_local"; // Suffix to differentiate if old keys exist

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

/**
 * Adds a word set activity to localStorage. 
 * Primarily for non-logged-in users or as a fallback.
 */
export function addWordSetActivity(language: string, field: string, wordEntries: WordEntry[]): WordSetActivityRecord {
  if (typeof window === "undefined") {
    const placeholderRecord: WordSetActivityRecord = {
      id: generateUniqueId(), type: 'wordSet', language, field, wordEntries, timestamp: Date.now()
    };
    console.warn("addWordSetActivity (local) called server-side.");
    return placeholderRecord;
  }

  const activityData = getActivityData();
  const newRecord: WordSetActivityRecord = {
    id: generateUniqueId(), type: 'wordSet', language, field, wordEntries, timestamp: Date.now(),
  };
  activityData.learnedItems.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activityData));
  return newRecord;
}

/**
 * Adds a conversation activity to localStorage.
 * Primarily for non-logged-in users or as a fallback.
 */
export function addConversationActivity(language: string, field: string, selectedWords: string[], conversation: string): ConversationActivityRecord {
   if (typeof window === "undefined") {
    const placeholderRecord: ConversationActivityRecord = {
      id: generateUniqueId(), type: 'conversation', language, field, selectedWords, conversation, timestamp: Date.now(),
    };
    console.warn("addConversationActivity (local) called server-side.");
    return placeholderRecord;
  }
  const activityData = getActivityData();
  const newRecord: ConversationActivityRecord = {
    id: generateUniqueId(), type: 'conversation', language, field, selectedWords, conversation, timestamp: Date.now(),
  };
  activityData.learnedItems.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activityData));
  return newRecord;
}

/**
 * Retrieves activity data from localStorage.
 * Primarily for non-logged-in users or as a fallback.
 */
export function getActivityData(): ActivityData {
   if (typeof window === "undefined") return { learnedItems: [] };
  
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    try {
      const parsedData = JSON.parse(data) as { learnedItems: Partial<ActivityRecord & { words?: string[], sentence?: string }>[] };
      if (Array.isArray(parsedData.learnedItems)) {
        const migratedItems: ActivityRecord[] = parsedData.learnedItems.map(item => {
          if (!item) return null; 
          if (!item.id) item.id = generateUniqueId();
          if (!item.timestamp) item.timestamp = Date.now();

          if (item.type === 'wordSet') {
            if (Array.isArray((item as any).words) && typeof (item as any).sentence === 'string' && !item.wordEntries) {
              const oldWords = (item as any).words as string[];
              const oldSentence = (item as any).sentence as string;
              (item as WordSetActivityRecord).wordEntries = oldWords.map(word => ({ word, sentence: oldSentence }));
              delete (item as any).words;
              delete (item as any).sentence;
            } else if (!Array.isArray(item.wordEntries)) {
                (item as WordSetActivityRecord).wordEntries = [];
            }
            return item as WordSetActivityRecord;
          }
          if (item.type === 'conversation') {
             return {
                ...item,
                field: (item as ConversationActivityRecord).field || "daily_conversation", // Default for old records
                selectedWords: Array.isArray((item as ConversationActivityRecord).selectedWords) ? (item as ConversationActivityRecord).selectedWords : [],
                conversation: (item as ConversationActivityRecord).conversation || "",
             } as ConversationActivityRecord;
          }
          if (!item.type && item.field && (item as any).words && Array.isArray((item as any).words) ) {
            const wordsArray = (item as any).words as string[];
            const singleSentence = (item as any).sentence || "Sentence not available.";
            return {
              id: item.id!, type: 'wordSet', language: item.language!, field: item.field!,
              wordEntries: wordsArray.map(w => ({word: w, sentence: singleSentence })),
              timestamp: item.timestamp!,
            } as WordSetActivityRecord;
          }
          return item as ActivityRecord; 
        }).filter(item => item && item.type && item.id && item.language && item.timestamp) as ActivityRecord[];
        
        return { learnedItems: migratedItems };
      }
    } catch (error) {
      console.error("Error parsing local activity data:", error);
    }
  }
  return { learnedItems: [] };
}

/**
 * Calculates learning stats from localStorage.
 * Primarily for non-logged-in users or as a fallback.
 */
export function getStats(): LearningStats {
  if (typeof window === "undefined") {
    return { totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0, languagesCoveredCount: 0 };
  }
  const activityData = getActivityData();
  
  const wordSetActivities = activityData.learnedItems.filter(
    (item): item is WordSetActivityRecord => item.type === 'wordSet'
  );

  const totalWordsLearned = wordSetActivities.reduce(
    (sum, item) => sum + (item.wordEntries?.length || 0),
    0
  );
  const uniqueFields = new Set(
    wordSetActivities.map(item => `${item.language} - ${item.field}`)
  );
  const uniqueLanguages = new Set(
    wordSetActivities.map(item => item.language)
  );
  return {
    totalWordsLearned,
    fieldsCoveredCount: uniqueFields.size,
    wordSetsGenerated: wordSetActivities.length,
    languagesCoveredCount: uniqueLanguages.size,
  };
}
