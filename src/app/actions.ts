
// @/app/actions.ts
"use server";

import { generateWordSet, type GenerateWordSetInput, type GenerateWordSetOutput } from "@/ai/flows/generate-word-set";
import { generateConversation, type GenerateConversationInput, type GenerateConversationOutput } from "@/ai/flows/generate-conversation-flow";
import { z } from "zod";
import type { WordEntry, WordSetActivityRecord, ConversationActivityRecord, LearningStats, ActivityRecord } from "@/lib/activityStore"; 
import { 
  addActivityToFirestore, 
  getActivitiesFromFirestore,
  getLearningStatsFromFirestore
} from "@/lib/userActivityService";

const WordSetActionInputSchema = z.object({
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
  count: z.number().min(3).max(5).optional().default(5),
});

export interface GenerateWordSetActionResult {
  wordEntries?: WordEntry[];
  error?: string;
  language?: string; 
  field?: string;    
  count?: number; 
}

function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof z.ZodError) {
    return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(", ");
  }
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'string') {
    return error;
  }
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  if (error && typeof error === 'object' && 'error' in error && typeof error.error === 'string') {
    return error.error;
  }
  try {
    return JSON.stringify(error);
  } catch {
    // If stringification fails, return the default message
  }
  return defaultMessage;
}

export async function handleGenerateWordSet(
  data: GenerateWordSetInput
): Promise<GenerateWordSetActionResult> {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("CRITICAL: GOOGLE_API_KEY is not set for word generation.");
    return { error: "AI Service API Key is not configured. Please contact support or check server configuration." };
  }
  try {
    const validatedData = WordSetActionInputSchema.parse(data); 
    const result: GenerateWordSetOutput = await generateWordSet(validatedData); 
    
    if (result.wordEntries && result.wordEntries.length > 0) {
      return { 
        wordEntries: result.wordEntries, 
        language: validatedData.language, 
        field: validatedData.field,
        count: validatedData.count 
      };
    }
    return { error: "No word entries were generated. Please try again." };
  } catch (e) {
    console.error("Error in handleGenerateWordSet action:", e);
    const errorMessage = getErrorMessage(e, "An unexpected error occurred while generating words.");
    return { error: errorMessage };
  }
}

const ConversationActionInputSchema = z.object({
  language: z.string().describe('The language for the conversation.'),
  selectedWords: z.array(z.string()).min(2, "Please select at least two words.").describe('A list of words to include in the conversation.'),
});


export interface GenerateConversationActionResult {
  conversation?: string;
  error?: string;
  language?: string; 
  selectedWords?: string[]; 
}

export async function handleGenerateConversation(
  data: GenerateConversationInput
): Promise<GenerateConversationActionResult> {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("CRITICAL: GOOGLE_API_KEY is not set for conversation generation.");
    return { error: "AI Service API Key is not configured. Please contact support or check server configuration." };
  }
  try {
    const validatedData = ConversationActionInputSchema.parse(data);
    const result: GenerateConversationOutput = await generateConversation(validatedData);
    if (result.conversation) {
      return { 
        conversation: result.conversation, 
        language: validatedData.language, 
        selectedWords: validatedData.selectedWords 
      };
    }
    return { error: "No conversation was generated. Please try again." };
  } catch (e) {
    console.error("Error in handleGenerateConversation action:", e);
    const errorMessage = getErrorMessage(e, "An unexpected error occurred while generating the conversation.");
    return { error: errorMessage };
  }
}

// --- Activity Logging and Fetching Actions ---

const LogWordSetActivityInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
  wordEntries: z.array(z.object({ word: z.string(), sentence: z.string() })).min(1, "Word entries are required."),
});
export type LogWordSetActivityInput = z.infer<typeof LogWordSetActivityInputSchema>;

export async function logWordSetActivityAction(data: LogWordSetActivityInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = LogWordSetActivityInputSchema.parse(data);
    const activityToSave: Omit<WordSetActivityRecord, 'id' | 'timestamp'> = {
      type: 'wordSet',
      language: validatedData.language,
      field: validatedData.field,
      wordEntries: validatedData.wordEntries,
    };
    await addActivityToFirestore(validatedData.userId, activityToSave);
    return { success: true };
  } catch (e) {
    console.error("Error logging word set activity:", e);
    const errorMessage = getErrorMessage(e, "Failed to log word set activity.");
    return { success: false, error: errorMessage };
  }
}

const LogConversationActivityInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  language: z.string().min(1, "Language is required."),
  selectedWords: z.array(z.string()).min(2, "At least two words are required."),
  conversation: z.string().min(1, "Conversation script is required."),
});
export type LogConversationActivityInput = z.infer<typeof LogConversationActivityInputSchema>;

export async function logConversationActivityAction(data: LogConversationActivityInput): Promise<{ success: boolean; error?: string }> {
  try {
    const validatedData = LogConversationActivityInputSchema.parse(data);
    const activityToSave: Omit<ConversationActivityRecord, 'id' | 'timestamp'> = {
      type: 'conversation',
      language: validatedData.language,
      selectedWords: validatedData.selectedWords,
      conversation: validatedData.conversation,
    };
    await addActivityToFirestore(validatedData.userId, activityToSave);
    return { success: true };
  } catch (e) {
    console.error("Error logging conversation activity:", e);
    const errorMessage = getErrorMessage(e, "Failed to log conversation activity.");
    return { success: false, error: errorMessage };
  }
}

const FetchUserActivitiesInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
  count: z.number().optional(),
});
export interface FetchUserActivitiesResult {
  activities?: ActivityRecord[];
  error?: string;
}
export async function fetchUserActivitiesAction(data: {userId: string, count?: number}): Promise<FetchUserActivitiesResult> {
  try {
    const validatedData = FetchUserActivitiesInputSchema.parse(data);
    const activities = await getActivitiesFromFirestore(validatedData.userId, validatedData.count);
    return { activities };
  } catch (e) {
    console.error("Error fetching user activities:", e);
    const errorMessage = getErrorMessage(e, "Failed to fetch activities.");
    return { error: errorMessage };
  }
}

const FetchUserLearningStatsInputSchema = z.object({
  userId: z.string().min(1, "User ID is required."),
});
export interface FetchUserLearningStatsResult {
  stats?: LearningStats;
  error?: string;
}
export async function fetchUserLearningStatsAction(data: {userId: string}): Promise<FetchUserLearningStatsResult> {
  try {
    const validatedData = FetchUserLearningStatsInputSchema.parse(data);
    const stats = await getLearningStatsFromFirestore(validatedData.userId);
    return { stats };
  } catch (e) {
    console.error("Error fetching user learning stats:", e);
    const errorMessage = getErrorMessage(e, "Failed to fetch learning stats.");
    return { error: errorMessage };
  }
}

// --- Support Request Action (Conceptual) ---
const SupportRequestInputSchema = z.object({
  email: z.string().email("Invalid email address.").min(1, "Email is required."),
  subject: z.string().min(3, "Subject must be at least 3 characters.").max(100, "Subject is too long."),
  category: z.string().min(1, "Please select a category."),
  description: z.string().min(10, "Description must be at least 10 characters.").max(2000, "Description is too long."),
  userId: z.string().optional(), // Optional: if the user is logged in
});
export type SupportRequestInput = z.infer<typeof SupportRequestInputSchema>;

export interface HandleSupportRequestResult {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: z.ZodIssue[];
}

export async function handleSupportRequest(data: SupportRequestInput): Promise<HandleSupportRequestResult> {
  try {
    const validatedData = SupportRequestInputSchema.parse(data);
    console.log("Support Request Received (Conceptual):", validatedData);

    // In a real application, you would:
    // 1. Save this data to a database (e.g., a 'support_tickets' collection in Firestore).
    // 2. Potentially send an email to your support team.
    // 3. Potentially send a confirmation email to the user.

    // For this prototype, we just simulate success.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation

    return { success: true, message: "Your support request has been submitted successfully! We'll get back to you soon." };
  } catch (e) {
    console.error("Error handling support request:", e);
    if (e instanceof z.ZodError) {
      // The getErrorMessage function handles ZodError specifically, but if you want to return `errors` array:
      return { error: "Validation failed. Please check your input.", errors: e.errors };
    }
    const errorMessage = getErrorMessage(e, "An unexpected error occurred. Please try again.");
    return { error: errorMessage };
  }
}
