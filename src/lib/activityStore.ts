
// Ensure this code only runs on the client-side
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
  wordEntries: WordEntry[]; // Changed from words: string[] and sentence: string
  timestamp: number;
}

export interface ConversationActivityRecord {
  id: string;
  type: 'conversation';
  language: string;
  selectedWords: string[];
  conversation: string;
  timestamp: number;
}

export type ActivityRecord = WordSetActivityRecord | ConversationActivityRecord;

export interface ActivityData {
  learnedItems: ActivityRecord[];
}

const STORAGE_KEY = "linguaLeapActivity";

function generateUniqueId(): string {
  return Date.now().toString() + Math.random().toString(36).substring(2, 9);
}

// Updated to accept wordEntries
export function addWordSetActivity(language: string, field: string, wordEntries: WordEntry[]): WordSetActivityRecord {
  if (typeof window === "undefined") {
    // This case should ideally not be hit if called correctly from client components after server action.
    // However, providing a fallback for SSR/build time if somehow invoked.
    const placeholderRecord: WordSetActivityRecord = {
      id: generateUniqueId(),
      type: 'wordSet',
      language,
      field,
      wordEntries,
      timestamp: Date.now()
    };
    console.warn("addWordSetActivity called in a non-client environment. Activity not saved to localStorage.");
    return placeholderRecord;
  }

  const activityData = getActivityData();
  const newRecord: WordSetActivityRecord = {
    id: generateUniqueId(),
    type: 'wordSet',
    language,
    field,
    wordEntries,
    timestamp: Date.now(),
  };
  activityData.learnedItems.unshift(newRecord);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(activityData));
  return newRecord;
}

export function addConversationActivity(language: string, selectedWords: string[], conversation: string): ConversationActivityRecord {
   if (typeof window === "undefined") {
    const placeholderRecord: ConversationActivityRecord = {
      id: generateUniqueId(),
      type: 'conversation',
      language,
      selectedWords,
      conversation,
      timestamp: Date.now(),
    };
    console.warn("addConversationActivity called in a non-client environment. Activity not saved to localStorage.");
    return placeholderRecord;
  }
  const activityData = getActivityData();
  const newRecord: ConversationActivityRecord = {
    id: generateUniqueId(),
    type: 'conversation',
    language,
    selectedWords,
    conversation,
    timestamp: Date.now(),
  };
  activityData.learnedItems.unshift(newRecord);
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
      const parsedData = JSON.parse(data) as { learnedItems: Partial<ActivityRecord & { words?: string[], sentence?: string }>[] };
      if (Array.isArray(parsedData.learnedItems)) {
        const migratedItems: ActivityRecord[] = parsedData.learnedItems.map(item => {
          if (!item) return null; // Skip null/undefined items
          if (!item.id) item.id = generateUniqueId();
          if (!item.timestamp) item.timestamp = Date.now();

          if (item.type === 'wordSet') {
            // If old format (words array, single sentence), migrate to wordEntries
            if (Array.isArray((item as any).words) && typeof (item as any).sentence === 'string' && !item.wordEntries) {
              const oldWords = (item as any).words as string[];
              const oldSentence = (item as any).sentence as string;
              (item as WordSetActivityRecord).wordEntries = oldWords.map(word => ({ word, sentence: oldSentence })); // Simplistic migration for old structure
              delete (item as any).words;
              delete (item as any).sentence;
            } else if (!Array.isArray(item.wordEntries)) { // Ensure wordEntries is an array if type is wordSet
                (item as WordSetActivityRecord).wordEntries = [];
            }
            return item as WordSetActivityRecord;
          }
          if (item.type === 'conversation') {
             return {
                ...item,
                selectedWords: Array.isArray((item as ConversationActivityRecord).selectedWords) ? (item as ConversationActivityRecord).selectedWords : [],
                conversation: (item as ConversationActivityRecord).conversation || "",
             } as ConversationActivityRecord;
          }
          // If type is missing, assume it's an old wordSet and try to migrate
          if (!item.type && item.field && (item as any).words && Array.isArray((item as any).words) ) {
            const wordsArray = (item as any).words as string[];
            const singleSentence = (item as any).sentence || "Sentence not available for this old record.";
            return {
              id: item.id!,
              type: 'wordSet',
              language: item.language!,
              field: item.field!,
              wordEntries: wordsArray.map(w => ({word: w, sentence: singleSentence })),
              timestamp: item.timestamp!,
            } as WordSetActivityRecord;
          }
          return item as ActivityRecord; 
        }).filter(item => item && item.type && item.id && item.language && item.timestamp) as ActivityRecord[];
        
        return { learnedItems: migratedItems };
      }
    } catch (error) {
      console.error("Error parsing activity data from localStorage:", error);
    }
  }
  return { learnedItems: [] };
}

export interface LearningStats {
  totalWordsLearned: number;
  fieldsCoveredCount: number;
  wordSetsGenerated: number;
  // Future: add conversation stats if needed
}

export function getStats(): LearningStats {
  if (typeof window === "undefined") {
    return { totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0 };
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
  return {
    totalWordsLearned,
    fieldsCoveredCount: uniqueFields.size,
    wordSetsGenerated: wordSetActivities.length,
  };
}

