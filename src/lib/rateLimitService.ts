
'use server';

import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { GENERATION_LIMIT, WINDOW_HOURS } from '@/constants/data';

const GENERATION_ACTIVITY_COLLECTION_PATH = (userId: string) => `users/${userId}/generationActivity`;

/**
 * Checks if a user has exceeded their generation limit for a specific type, language, and field within the time window.
 * @param userId The UID of the user.
 * @param type The type of generation ('wordSet' or 'conversation').
 * @param language The target language.
 * @param field The target field.
 * @returns {Promise<{isAllowed: boolean, remaining: number, hoursUntilReset: number}>}
 */
export async function checkRateLimit(
  userId: string,
  type: 'wordSet' | 'conversation',
  language: string,
  field: string
): Promise<{ isAllowed: boolean; remaining: number; hoursUntilReset: number }> {
  if (!userId) {
    // For non-logged-in users, always allow generation.
    return { isAllowed: true, remaining: Infinity, hoursUntilReset: 0 };
  }

  try {
    const activityCollectionRef = collection(db, GENERATION_ACTIVITY_COLLECTION_PATH(userId));
    
    const windowAgo = new Date();
    windowAgo.setHours(windowAgo.getHours() - WINDOW_HOURS);
    const windowAgoTimestamp = Timestamp.fromDate(windowAgo);

    const q = query(
      activityCollectionRef,
      where('type', '==', type),
      where('language', '==', language),
      where('field', '==', field),
      where('timestamp', '>=', windowAgoTimestamp)
    );

    const querySnapshot = await getDocs(q);
    const recentGenerations = querySnapshot.docs;
    const count = recentGenerations.length;

    const isAllowed = count < GENERATION_LIMIT;
    const remaining = GENERATION_LIMIT - count;

    let hoursUntilReset = 0;
    if (!isAllowed && recentGenerations.length > 0) {
      // Find the oldest generation in the current window to calculate when the limit resets for one slot.
      const oldestTimestamp = recentGenerations
        .map(doc => (doc.data().timestamp as Timestamp).toDate())
        .sort((a, b) => a.getTime() - b.getTime())[0];
      
      const resetTime = new Date(oldestTimestamp.getTime());
      resetTime.setHours(resetTime.getHours() + WINDOW_HOURS);

      const diffMillis = resetTime.getTime() - Date.now();
      hoursUntilReset = Math.max(0, Math.ceil(diffMillis / (1000 * 60 * 60)));
    }

    return { isAllowed, remaining: Math.max(0, remaining), hoursUntilReset };
  } catch (error: any) {
    console.error('Error checking rate limit from Firestore:', error);
    if (error.code === 'failed-precondition' && error.message?.includes('index')) {
        const helpfulMessage = `A database index is required for rate limiting. This is a one-time setup. Firebase usually provides a direct link in the browser's developer console (F12) to create the necessary index. The query needs an index on 'type', 'language', 'field', and 'timestamp'.`;
        // We will allow the request but log a severe warning. We don't want to block users due to a missing index.
        console.error("RATE LIMITING FAILED: " + helpfulMessage);
        // Fail open: allow the user to proceed if the check fails due to a missing index.
        return { isAllowed: true, remaining: Infinity, hoursUntilReset: 0 }; 
    }
    // For other errors, also fail open to not block the user.
    console.error("An unexpected error occurred during rate limit check. Allowing request.");
    return { isAllowed: true, remaining: Infinity, hoursUntilReset: 0 };
  }
}

/**
 * Logs a generation event for a user.
 * @param userId The UID of the user.
 * @param type The type of generation ('wordSet' | 'conversation').
 * @param language The target language.
 * @param field The target field.
 * @returns {Promise<void>}
 */
export async function logGeneration(
  userId: string,
  type: 'wordSet' | 'conversation',
  language: string,
  field: string
): Promise<void> {
  if (!userId) {
    return; // Don't log for non-logged-in users
  }
  try {
    const activityCollectionRef = collection(db, GENERATION_ACTIVITY_COLLECTION_PATH(userId));
    await addDoc(activityCollectionRef, {
      type,
      language,
      field,
      timestamp: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error logging generation event to Firestore:', error);
    // We don't throw here because the primary action (generation) already succeeded.
    // We just log the error.
  }
}
