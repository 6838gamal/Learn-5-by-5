
'use server';
/**
 * @fileOverview Generates a set of five related words in the target language based on the selected knowledge field,
 * each with its own example sentence. Ensures variation in generated words.
 *
 * - generateWordSet - A function that generates a set of words, each with a sentence.
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

const WordEntrySchema = z.object({
  word: z.string().describe('A word in the target language related to the field.'),
  sentence: z.string().describe('A meaningful sentence using this specific word in the target language.'),
});
// This type is implicitly exported via GenerateWordSetOutput, but can be explicitly exported if needed elsewhere.
// export type WordEntry = z.infer<typeof WordEntrySchema>; 

const GenerateWordSetOutputSchema = z.object({
  wordEntries: z.array(WordEntrySchema).length(5).describe('A set of five distinct words, each accompanied by its own example sentence in the target language. Ensure the words are varied and relevant to the field.'),
});
export type GenerateWordSetOutput = z.infer<typeof GenerateWordSetOutputSchema>;

export async function generateWordSet(input: GenerateWordSetInput): Promise<GenerateWordSetOutput> {
  return generateWordSetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordSetPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateWordSetInputSchema},
  output: {schema: GenerateWordSetOutputSchema},
  prompt: `You are a language learning assistant.
Generate a set of five distinct and related words in the target language: {{language}}, based on the knowledge field: {{field}}.
Critically, ensure these words are different from any words you have generated in the very recent past for this specific combination of language and field. The words should have a clear semantic connection.
For EACH of these five words, create one meaningful and natural-sounding example sentence in the target language ({{language}}) that incorporates that specific word.

Return a JSON object containing a 'wordEntries' array. Each element in this array should be an object with two keys:
1. 'word': The generated word (string).
2. 'sentence': The example sentence for that word (string).

Example for one entry: { "word": "example_word", "sentence": "This is an example_sentence using the example_word." }
The 'wordEntries' array should contain exactly five such objects.`,
});

const generateWordSetFlow = ai.defineFlow(
  {
    name: 'generateWordSetFlow',
    inputSchema: GenerateWordSetInputSchema,
    outputSchema: GenerateWordSetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output || !output.wordEntries || output.wordEntries.length !== 5) {
      throw new Error("Failed to generate a complete set of 5 words and sentences from AI.");
    }
    return output;
  }
);

