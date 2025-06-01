
// @/app/actions.ts
"use server";

import { generateWordSet, type GenerateWordSetInput, type GenerateWordSetOutput } from "@/ai/flows/generate-word-set";
import { generateConversation, type GenerateConversationInput, type GenerateConversationOutput, GenerateConversationInputSchema } from "@/ai/flows/generate-conversation-flow"; // Added
import { z } from "zod";

const WordSetActionInputSchema = z.object({
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
});

export interface GenerateWordSetActionResult {
  words?: string[];
  sentence?: string;
  error?: string;
}

export async function handleGenerateWordSet(
  data: GenerateWordSetInput
): Promise<GenerateWordSetActionResult> {
  try {
    const validatedData = WordSetActionInputSchema.parse(data);
    const result: GenerateWordSetOutput = await generateWordSet(validatedData);
    if (result.words && result.words.length > 0 && result.sentence) {
      return { words: result.words, sentence: result.sentence };
    }
    if (result.words && result.words.length > 0 && !result.sentence) {
        return { words: result.words, error: "Words were generated, but the sentence was missing." };
    }
    return { error: "No words or sentence were generated. Please try again." };
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

// New action for generating conversations
export interface GenerateConversationActionResult {
  conversation?: string;
  error?: string;
}

export async function handleGenerateConversation(
  data: GenerateConversationInput
): Promise<GenerateConversationActionResult> {
  try {
    // Validate input against the schema from the flow
    const validatedData = GenerateConversationInputSchema.parse(data);
    const result: GenerateConversationOutput = await generateConversation(validatedData);
    if (result.conversation) {
      return { conversation: result.conversation };
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
