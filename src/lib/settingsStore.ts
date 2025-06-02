
"use client";

export type NumberOfWordsSetting = 3 | 5;
export type AppLanguageSetting = "en" | "es" | "fr"; // Example languages

const NUMBER_OF_WORDS_KEY = "linguaLeapNumberOfWords";
const APP_LANGUAGE_KEY = "linguaLeapAppLanguage";

// --- Number of Words per Generation ---
export function getNumberOfWordsSetting(): NumberOfWordsSetting {
  if (typeof window === "undefined") {
    return 5; // Default for server or build time
  }
  const storedValue = localStorage.getItem(NUMBER_OF_WORDS_KEY);
  if (storedValue === "3") {
    return 3;
  }
  return 5; // Default if not set or invalid
}

export function setNumberOfWordsSetting(count: NumberOfWordsSetting): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(NUMBER_OF_WORDS_KEY, count.toString());
}

// --- App Language (Theme) ---
export function getAppLanguageSetting(): AppLanguageSetting {
  if (typeof window === "undefined") {
    return "en"; // Default for server or build time
  }
  const storedValue = localStorage.getItem(APP_LANGUAGE_KEY) as AppLanguageSetting | null;
  // Add more supported languages to this check if needed
  if (storedValue && ["en", "es", "fr"].includes(storedValue)) {
    return storedValue;
  }
  return "en"; // Default if not set or invalid
}

export function setAppLanguageSetting(language: AppLanguageSetting): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(APP_LANGUAGE_KEY, language);
}
