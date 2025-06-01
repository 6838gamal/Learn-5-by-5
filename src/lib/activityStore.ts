
// Ensure this code only runs on the client-side
"use client";

export interface WordSetActivityRecord {
  id: string;
  type: 'wordSet';
  language: string;
  field: string;
  words: string[];
  sentence: string;
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

export function addWordSetActivity(language: string, field: string, words: string[], sentence: string): WordSetActivityRecord {
  if (typeof window === "undefined") {
    // Should not happen if called from client component effect
    const placeholderRecord: WordSetActivityRecord = { 
      id: generateUniqueId(), 
      type: 'wordSet',
      language, 
      field, 
      words, 
      sentence, 
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
    words,
    sentence,
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
      const parsedData = JSON.parse(data) as { learnedItems: Partial<ActivityRecord>[] }; // Allow partial for migration
      if (Array.isArray(parsedData.learnedItems)) {
        const migratedItems: ActivityRecord[] = parsedData.learnedItems.map(item => {
          if (!item.type && item.field && item.words) { // Likely an old WordSetRecord
            return {
              id: item.id || generateUniqueId(),
              type: 'wordSet',
              language: item.language!,
              field: item.field!,
              words: item.words!,
              sentence: (item as WordSetActivityRecord).sentence || "", // Ensure sentence, cast to access
              timestamp: item.timestamp || Date.now(),
            } as WordSetActivityRecord;
          }
          // Ensure new records have all their fields or provide defaults
          if (item.type === 'wordSet') {
            return { 
              ...item, 
              sentence: (item as WordSetActivityRecord).sentence || "",
              id: item.id || generateUniqueId(),
              language: item.language!,
              field: (item as WordSetActivityRecord).field!,
              words: (item as WordSetActivityRecord).words!,
              timestamp: item.timestamp || Date.now(),
            } as WordSetActivityRecord;
          }
          if (item.type === 'conversation') {
             return {
                ...item,
                id: item.id || generateUniqueId(),
                language: item.language!,
                selectedWords: (item as ConversationActivityRecord).selectedWords || [],
                conversation: (item as ConversationActivityRecord).conversation || "",
                timestamp: item.timestamp || Date.now(),
             } as ConversationActivityRecord;
          }
          return item as ActivityRecord; // Should be a fully formed new record
        }).filter(item => item && item.type && item.id && item.language && item.timestamp) as ActivityRecord[]; // Filter out malformed
        
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
  wordSetsGenerated: number; // Specifically word sets
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
    (sum, item) => sum + item.words.length,
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
