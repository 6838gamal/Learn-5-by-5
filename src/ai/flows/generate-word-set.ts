
'use server';
/**
 * @fileOverview Generates a set of five related words in the target language based on the selected knowledge field,
 * and a sentence using some of those words. Ensures variation in generated words.
 *
 * - generateWordSet - A function that generates a set of words and a sentence.
 * - GenerateWordSetInput - The input type for the generateWordSet function.
 * - GenerateWordSetOutput - The return type for the generateWordSet function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWordSetInputSchema = z.object({
  language: z.string().describe('The target language for the word set.'),
  field: z.string().describe('The knowledge field for the word set (e.g., technology, food, travel).'),
});
export type GenerateWordSetInput = z.infer<typeof GenerateWordSetInputSchema>;

const GenerateWordSetOutputSchema = z.object({
  words: z.array(z.string()).length(5).describe('A set of five related words in the target language.'),
  sentence: z.string().describe('A meaningful sentence using at least three of the generated words in the target language.'),
});
export type GenerateWordSetOutput = z.infer<typeof GenerateWordSetOutputSchema>;

export async function generateWordSet(input: GenerateWordSetInput): Promise<GenerateWordSetOutput> {
  return generateWordSetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordSetPrompt',
  model: 'googleai/gemini-1.5-flash-latest', // Added model specification
  input: {schema: GenerateWordSetInputSchema},
  output: {schema: GenerateWordSetOutputSchema},
  prompt: `You are a language learning assistant.
Generate a set of five related words in the target language: {{language}}, based on the knowledge field: {{field}}.
Critically, ensure these words are different from any words you have generated in the very recent past for this specific combination of language and field. The words should have a clear semantic connection.
After generating the five words, create one meaningful and natural-sounding sentence in the target language ({{language}}) that incorporates at least three of these newly generated words.
Return a JSON object containing a 'words' array (with 5 string elements) and a 'sentence' string.`,
});

const generateWordSetFlow = ai.defineFlow(
  {
    name: 'generateWordSetFlow',
    inputSchema: GenerateWordSetInputSchema,
    outputSchema: GenerateWordSetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate word set and sentence from AI.");
    }
    // Ensure the output structure matches the schema, especially if the LLM might sometimes fail to perfectly adhere.
    // For simplicity, we're directly returning output here, assuming it's valid.
    // In a more robust setup, you might add validation or default values if output is partial.
    return output;
  }
);

