
// @/app/actions.ts
"use server";

import { generateWordSet, type GenerateWordSetInput, type GenerateWordSetOutput } from "@/ai/flows/generate-word-set";
import { generateConversation, type GenerateConversationInput, type GenerateConversationOutput } from "@/ai/flows/generate-conversation-flow";
import { z } from "zod";
import type { WordEntry } from "@/lib/activityStore"; // Import WordEntry type

const WordSetActionInputSchema = z.object({
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
});

export interface GenerateWordSetActionResult {
  wordEntries?: WordEntry[]; // Changed from words and sentence
  error?: string;
  language?: string;
  field?: string;
}

export async function handleGenerateWordSet(
  data: GenerateWordSetInput
): Promise<GenerateWordSetActionResult> {
  try {
    const validatedData = WordSetActionInputSchema.parse(data);
    const result: GenerateWordSetOutput = await generateWordSet(validatedData);
    
    if (result.wordEntries && result.wordEntries.length > 0) {
      return { wordEntries: result.wordEntries, language: validatedData.language, field: validatedData.field };
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
      return { conversation: result.conversation, language: validatedData.language, selectedWords: validatedData.selectedWords };
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
