
// src/lib/userSettingsService.ts

import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import Firestore instance

export type NumberOfWordsSetting = 3 | 5;
export type AppLanguageSetting = "en" | "es" | "fr" | "ar";

export interface UserSettings {
  numberOfWords: NumberOfWordsSetting;
  appLanguage: AppLanguageSetting;
  targetLanguage?: string; // New: For preferred learning language
  targetField?: string; // New: For preferred field of knowledge
  enableAccessibilityAids?: boolean; // New: For accessibility features
  updatedAt?: any; // For Firestore server timestamp
  // Add other conceptual settings if they were to be persisted
  // textSize?: "small" | "medium" | "large";
  // colorContrast?: "default" | "high-light" | "high-dark";
}

const USER_SETTINGS_DOC_PATH = (userId: string) => `users/${userId}/settings/appSettings`;

// Default settings for a new user or if no settings are found
export const defaultUserSettings: UserSettings = {
  numberOfWords: 5,
  appLanguage: "en",
  targetLanguage: "en", // Default to English
  targetField: "daily_conversation", // Default to a common field
  enableAccessibilityAids: false,
};

/**
 * Fetches user settings from Firestore.
 * Returns default settings if no settings are found for the user.
 * @param userId The UID of the user.
 * @returns Promise<UserSettings>
 */
export async function getUserSettings(userId: string): Promise<UserSettings> {
  if (!userId) {
    console.warn("getUserSettings called without userId. Returning default settings.");
    return defaultUserSettings;
  }
  try {
    const settingsDocRef = doc(db, USER_SETTINGS_DOC_PATH(userId));
    const docSnap = await getDoc(settingsDocRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      // Ensure returned data conforms to UserSettings and has defaults for missing fields
      return {
        numberOfWords: data.numberOfWords === 3 || data.numberOfWords === 5 ? data.numberOfWords : defaultUserSettings.numberOfWords,
        appLanguage: ["en", "es", "fr", "ar"].includes(data.appLanguage) ? data.appLanguage : defaultUserSettings.appLanguage,
        targetLanguage: typeof data.targetLanguage === 'string' ? data.targetLanguage : defaultUserSettings.targetLanguage,
        targetField: typeof data.targetField === 'string' ? data.targetField : defaultUserSettings.targetField,
        enableAccessibilityAids: typeof data.enableAccessibilityAids === 'boolean' ? data.enableAccessibilityAids : defaultUserSettings.enableAccessibilityAids,
      };
    } else {
      // No settings document found, return defaults
      return defaultUserSettings;
    }
  } catch (error) {
    console.error("Error fetching user settings from Firestore:", error);
    // Fallback to default settings in case of an error
    return defaultUserSettings;
  }
}

/**
 * Updates or creates user settings in Firestore.
 * @param userId The UID of the user.
 * @param settings Partial UserSettings object containing fields to update.
 * @returns Promise<void>
 */
export async function updateUserSettings(userId: string, settings: Partial<UserSettings>): Promise<void> {
  if (!userId) {
    throw new Error("User ID is required to update settings.");
  }
  if (!settings || Object.keys(settings).length === 0) {
    console.warn("updateUserSettings called with empty settings. No update performed.");
    return;
  }

  try {
    const settingsDocRef = doc(db, USER_SETTINGS_DOC_PATH(userId));
    // Use setDoc with merge: true to update existing fields or create the document if it doesn't exist.
    await setDoc(settingsDocRef, { ...settings, updatedAt: serverTimestamp() }, { merge: true });
  } catch (error) {
    console.error("Error updating user settings in Firestore:", error);
    throw error; // Re-throw to be handled by the caller
  }
}
