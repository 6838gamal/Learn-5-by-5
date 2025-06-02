
"use client";

// This file is now DEPRECATED for user-specific settings if they are logged in,
// as those are handled by src/lib/userSettingsService.ts and src/app/settingsActions.ts
// which interact with Firestore.

// However, these functions can still serve as a fallback for NON-LOGGED-IN users
// or if Firestore is unavailable, storing preferences locally in the browser.
// Or, it can be removed entirely if local storage persistence for non-logged-in users is not desired.

// For the purpose of this refactor, we will assume that for logged-in users,
// Firestore is the source of truth, and these localStorage functions might be
// used as a temporary cache or for users who are not logged in.

// It's important that components fetching settings prioritize the Firestore-backed
// settings for logged-in users.

export type NumberOfWordsSetting = 3 | 5;
export type AppLanguageSetting = "en" | "es" | "fr" | "ar";

const NUMBER_OF_WORDS_KEY_LOCAL = "linguaLeapNumberOfWords_local"; // Suffix to avoid conflict if old key exists
const APP_LANGUAGE_KEY_LOCAL = "linguaLeapAppLanguage_local";

// --- Number of Words per Generation (Local Fallback) ---
export function getLocalNumberOfWordsSetting(): NumberOfWordsSetting {
  if (typeof window === "undefined") {
    return 5; 
  }
  const storedValue = localStorage.getItem(NUMBER_OF_WORDS_KEY_LOCAL);
  if (storedValue === "3") {
    return 3;
  }
  return 5; 
}

export function setLocalNumberOfWordsSetting(count: NumberOfWordsSetting): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NUMBER_OF_WORDS_KEY_LOCAL, count.toString());
}

// --- App Language (Local Fallback) ---
export function getLocalAppLanguageSetting(): AppLanguageSetting {
  if (typeof window === "undefined") {
    return "en"; 
  }
  const storedValue = localStorage.getItem(APP_LANGUAGE_KEY_LOCAL) as AppLanguageSetting | null;
  if (storedValue && ["en", "es", "fr", "ar"].includes(storedValue)) {
    return storedValue;
  }
  return "en"; 
}

export function setLocalAppLanguageSetting(language: AppLanguageSetting): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_LANGUAGE_KEY_LOCAL, language);
}

// Note: The main settings logic for logged-in users now resides in:
// - src/lib/userSettingsService.ts (direct Firestore interaction, server-side context)
// - src/app/settingsActions.ts (server actions called by client)
// Components should primarily use the server actions to get/set settings for authenticated users.
// These local functions can be a fallback or for unauthenticated user experience.
