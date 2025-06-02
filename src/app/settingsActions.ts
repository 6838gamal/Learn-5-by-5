
// src/app/settingsActions.ts
"use server";

import { 
  getUserSettings as fetchUserSettingsFromDb,
  updateUserSettings as updateUserSettingsInDb,
  type UserSettings,
  type NumberOfWordsSetting,
  type AppLanguageSetting,
  defaultUserSettings
} from "@/lib/userSettingsService";
import { z } from "zod";

// --- Schemas for input validation ---
const SaveSettingsInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  settings: z.object({
    numberOfWords: z.enum(["3", "5"]).transform(val => parseInt(val, 10) as NumberOfWordsSetting).optional(),
    appLanguage: z.enum(["en", "es", "fr", "ar"]).optional(),
    // Add conceptual settings here if they were to be validated and saved
    // textSize: z.enum(["small", "medium", "large"]).optional(),
    // colorContrast: z.enum(["default", "high-light", "high-dark"]).optional(),
  }),
});

const FetchSettingsInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});

// --- Action Results ---
export interface FetchSettingsActionResult {
  settings?: UserSettings;
  error?: string;
}

export interface SaveSettingsActionResult {
  success?: boolean;
  error?: string;
}

// --- Server Actions ---

/**
 * Fetches user settings. Requires userId.
 */
export async function fetchUserSettingsAction(data: { userId: string }): Promise<FetchSettingsActionResult> {
  try {
    const validatedData = FetchSettingsInputSchema.parse(data);
    const settings = await fetchUserSettingsFromDb(validatedData.userId);
    return { settings };
  } catch (e) {
    console.error("Error in fetchUserSettingsAction:", e);
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(", ") };
    }
    return { error: e instanceof Error ? e.message : "An unexpected error occurred while fetching settings." };
  }
}

/**
 * Saves user settings. Requires userId and settings object.
 */
export async function saveUserSettingsAction(
  data: { userId: string; settings: Partial<Pick<UserSettings, 'numberOfWords' | 'appLanguage'>> }
): Promise<SaveSettingsActionResult> {
  try {
    // Construct the object to validate based on how data is passed from client
    const inputToValidate = {
        userId: data.userId,
        settings: {
            ...(data.settings.numberOfWords !== undefined && { numberOfWords: data.settings.numberOfWords.toString() }),
            ...(data.settings.appLanguage !== undefined && { appLanguage: data.settings.appLanguage }),
        }
    };
    const validatedData = SaveSettingsInputSchema.parse(inputToValidate);
    
    // The validatedData.settings will have transformed numberOfWords to number
    // and other fields if they were present and valid.
    // We need to pass the correctly typed (and potentially filtered) settings to the DB function.
    const settingsToSave: Partial<UserSettings> = {};
    if (validatedData.settings.numberOfWords !== undefined) {
        settingsToSave.numberOfWords = validatedData.settings.numberOfWords;
    }
    if (validatedData.settings.appLanguage !== undefined) {
        settingsToSave.appLanguage = validatedData.settings.appLanguage;
    }

    if (Object.keys(settingsToSave).length === 0) {
        return { success: true }; // Nothing to save
    }

    await updateUserSettingsInDb(validatedData.userId, settingsToSave);
    return { success: true };
  } catch (e) {
    console.error("Error in saveUserSettingsAction:", e);
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(", ") };
    }
    return { error: e instanceof Error ? e.message : "An unexpected error occurred while saving settings." };
  }
}

// --- Convenience getters for specific settings (can be used by client components) ---

export async function getNumberOfWordsSettingAction(userId: string): Promise<NumberOfWordsSetting> {
  if (!userId) return defaultUserSettings.numberOfWords;
  const result = await fetchUserSettingsAction({ userId });
  return result.settings?.numberOfWords || defaultUserSettings.numberOfWords;
}

export async function getAppLanguageSettingAction(userId: string): Promise<AppLanguageSetting> {
  if (!userId) return defaultUserSettings.appLanguage;
  const result = await fetchUserSettingsAction({ userId });
  return result.settings?.appLanguage || defaultUserSettings.appLanguage;
}
