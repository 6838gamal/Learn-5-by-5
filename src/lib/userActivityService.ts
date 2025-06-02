
// src/lib/userActivityService.ts
"use server";

import { 
  doc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  ActivityRecord, 
  WordSetActivityRecord, 
  ConversationActivityRecord, 
  WordEntry,
  LearningStats
} from '@/lib/activityStore'; // Reuse types for consistency

const USER_ACTIVITY_COLLECTION_PATH = (userId: string) => `users/${userId}/activity`;

/**
 * Adds an activity record to Firestore for the given user.
 * @param userId The UID of the user.
 * @param activityData The activity data to save (WordSet or Conversation).
 * @returns Promise<string> The ID of the newly created document.
 */
export async function addActivityToFirestore(
  userId: string, 
  activityData: Omit<WordSetActivityRecord, 'id' | 'timestamp'> | Omit<ConversationActivityRecord, 'id' | 'timestamp'>
): Promise<string> {
  if (!userId) {
    throw new Error("User ID is required to save activity.");
  }
  try {
    const activityCollectionRef = collection(db, USER_ACTIVITY_COLLECTION_PATH(userId));
    const docRef = await addDoc(activityCollectionRef, {
      ...activityData,
      timestamp: serverTimestamp() // Use Firestore server timestamp
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding activity to Firestore:", error);
    throw error;
  }
}

/**
 * Fetches activity records from Firestore for the given user, ordered by timestamp descending.
 * @param userId The UID of the user.
 * @param count Optional limit for the number of records to fetch.
 * @returns Promise<ActivityRecord[]>
 */
export async function getActivitiesFromFirestore(userId: string, count?: number): Promise<ActivityRecord[]> {
  if (!userId) {
    console.warn("getActivitiesFromFirestore called without userId. Returning empty array.");
    return [];
  }
  try {
    const activityCollectionRef = collection(db, USER_ACTIVITY_COLLECTION_PATH(userId));
    const q = count 
      ? query(activityCollectionRef, orderBy("timestamp", "desc"), limit(count))
      : query(activityCollectionRef, orderBy("timestamp", "desc"));
      
    const querySnapshot = await getDocs(q);
    const activities: ActivityRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const timestamp = (data.timestamp as Timestamp)?.toDate().getTime() || Date.now(); // Convert Firestore Timestamp
      activities.push({ 
        id: docSnap.id, 
        ...data,
        timestamp,
      } as ActivityRecord); // Cast carefully, ensure data matches type
    });
    return activities;
  } catch (error) {
    console.error("Error fetching activities from Firestore:", error);
    return []; // Return empty on error to avoid breaking UI
  }
}

/**
 * Calculates learning stats from Firestore data for a given user.
 * @param userId The UID of the user.
 * @returns Promise<LearningStats>
 */
export async function getLearningStatsFromFirestore(userId: string): Promise<LearningStats> {
  if (!userId) {
    return { totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0 };
  }
  try {
    const allActivities = await getActivitiesFromFirestore(userId); // Fetch all activities for stats
    
    const wordSetActivities = allActivities.filter(
      (item): item is WordSetActivityRecord => item.type === 'wordSet'
    );

    const totalWordsLearned = wordSetActivities.reduce(
      (sum, item) => sum + (item.wordEntries?.length || 0),
      0
    );
    const uniqueFields = new Set(
      wordSetActivities.map(item => `${item.language} - ${item.field}`)
    );
    
    // For now, conversation stats are not explicitly part of LearningStats,
    // but you could add them here if needed (e.g., totalConversationsGenerated).

    return {
      totalWordsLearned,
      fieldsCoveredCount: uniqueFields.size,
      wordSetsGenerated: wordSetActivities.length,
    };
  } catch (error) {
    console.error("Error calculating stats from Firestore:", error);
    return { totalWordsLearned: 0, fieldsCoveredCount: 0, wordSetsGenerated: 0 };
  }
}
