
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
    const placeholderRecord: WordSetActivityRecord = {
      id: generateUniqueId(),
      type: 'wordSet',
      language,
      field,
      wordEntries,
      timestamp: Date.now()
    };
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
      // Adjust parsing to handle potentially old format and new format
      const parsedData = JSON.parse(data) as { learnedItems: Partial<ActivityRecord & { words?: string[], sentence?: string }>[] };
      if (Array.isArray(parsedData.learnedItems)) {
        const migratedItems: ActivityRecord[] = parsedData.learnedItems.map(item => {
          if (!item.id) item.id = generateUniqueId();
          if (!item.timestamp) item.timestamp = Date.now();

          if (item.type === 'wordSet') {
            // If it's a wordSet, ensure it has wordEntries.
            // This is a simple migration: old records might not have individual sentences.
            // For new records, wordEntries should already be there.
            // Old records with `words` and `sentence` will be converted.
            if (item.words && Array.isArray(item.words) && !item.wordEntries) {
               const singleSentence = (item as any).sentence || ""; // old sentence
               (item as Partial<WordSetActivityRecord>).wordEntries = item.words.map(word => ({ word, sentence: singleSentence })); // Simplistic migration
               delete (item as any).words;
               delete (item as any).sentence;
            }
            return {
              ...item,
              wordEntries: (item as WordSetActivityRecord).wordEntries || [],
            } as WordSetActivityRecord;
          }
          if (item.type === 'conversation') {
             return {
                ...item,
                selectedWords: (item as ConversationActivityRecord).selectedWords || [],
                conversation: (item as ConversationActivityRecord).conversation || "",
             } as ConversationActivityRecord;
          }
          // If type is missing, assume it's an old wordSet and try to migrate
          if (!item.type && item.field && (item as any).words) {
            const wordsArray = (item as any).words as string[];
            const singleSentence = (item as any).sentence || "";
            return {
              id: item.id!,
              type: 'wordSet',
              language: item.language!,
              field: item.field!,
              wordEntries: wordsArray.map(w => ({word: w, sentence: singleSentence })), // Simplified: assign shared sentence
              timestamp: item.timestamp!,
            } as WordSetActivityRecord;
          }
          return item as ActivityRecord; // Should be a fully formed new record
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
    (sum, item) => sum + (item.wordEntries?.length || 0), // Count words from wordEntries
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
