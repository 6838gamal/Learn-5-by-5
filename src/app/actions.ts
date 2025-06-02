
// @/app/actions.ts
"use server";

import { generateWordSet, type GenerateWordSetInput, type GenerateWordSetOutput } from "@/ai/flows/generate-word-set";
import { generateConversation, type GenerateConversationInput, type GenerateConversationOutput } from "@/ai/flows/generate-conversation-flow";
import { z } from "zod";
import type { WordEntry } from "@/lib/activityStore"; 

const WordSetActionInputSchema = z.object({
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
  count: z.number().min(3).max(5).optional().default(5), // Added count
});

export interface GenerateWordSetActionResult {
  wordEntries?: WordEntry[];
  error?: string;
  language?: string; 
  field?: string;    
  count?: number; // Pass back count for client-side activity logging
}

export async function handleGenerateWordSet(
  data: GenerateWordSetInput // This already includes count
): Promise<GenerateWordSetActionResult> {
  try {
    // The input 'data' to this function now matches GenerateWordSetInput from the flow,
    // which already includes an optional 'count' that defaults in the flow's schema if not provided.
    // So, we parse against that directly or ensure the Zod schema used here is compatible.
    const validatedData = WordSetActionInputSchema.parse(data); 
    const result: GenerateWordSetOutput = await generateWordSet(validatedData); // Pass validatedData (which has count)
    
    if (result.wordEntries && result.wordEntries.length > 0) {
      return { 
        wordEntries: result.wordEntries, 
        language: validatedData.language, 
        field: validatedData.field,
        count: validatedData.count // Return the count used
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
