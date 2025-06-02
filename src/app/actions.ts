
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

export async function handleGenerateWordSet(
  data: GenerateWordSetInput
): Promise<GenerateWordSetActionResult> {
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
    console.error("Error generating word set:", e);
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(", ") };
    }
    let errorMessage = "An unexpected error occurred while generating words.";
    if (e instanceof Error) {
        errorMessage = e.message;
    }
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
    console.error("Error generating conversation:", e);
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(", ") };
    }
    let errorMessage = "An unexpected error occurred while generating the conversation.";
     if (e instanceof Error) {
        errorMessage = e.message;
    }
    return { error: errorMessage };
  }
}

// --- New Actions for Firestore Activity Logging and Fetching ---

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
    return { success: false, error: e instanceof Error ? e.message : "Failed to log activity." };
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
    return { success: false, error: e instanceof Error ? e.message : "Failed to log activity." };
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
    return { error: e instanceof Error ? e.message : "Failed to fetch activities." };
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
    return { error: e instanceof Error ? e.message : "Failed to fetch learning stats." };
  }
}
