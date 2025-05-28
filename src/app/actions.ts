// @/app/actions.ts
"use server";

import { generateWordSet, type GenerateWordSetInput, type GenerateWordSetOutput } from "@/ai/flows/generate-word-set";
import { z } from "zod";

const ActionInputSchema = z.object({
  language: z.string().min(1, "Language is required."),
  field: z.string().min(1, "Field is required."),
});

export interface GenerateWordSetActionResult {
  words?: string[];
  error?: string;
}

export async function handleGenerateWordSet(
  data: GenerateWordSetInput
): Promise<GenerateWordSetActionResult> {
  try {
    const validatedData = ActionInputSchema.parse(data);
    const result: GenerateWordSetOutput = await generateWordSet(validatedData);
    if (result.words && result.words.length > 0) {
      return { words: result.words };
    }
    return { error: "No words were generated. Please try again." };
  } catch (e) {
    console.error("Error generating word set:", e);
    if (e instanceof z.ZodError) {
      return { error: e.errors.map(err => err.message).join(", ") };
    }
    return { error: "An unexpected error occurred while generating words." };
  }
}
