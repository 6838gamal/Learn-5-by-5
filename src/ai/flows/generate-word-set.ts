
'use server';
/**
 * @fileOverview Generates a set of related words in the target language based on the selected knowledge field,
 * each with its own example sentence. Allows specifying the number of words (3 or 5).
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
  count: z.number().min(3).max(5).optional().default(5).describe('The number of word entries to generate (3 or 5). Defaults to 5.'),
});
export type GenerateWordSetInput = z.infer<typeof GenerateWordSetInputSchema>;

const WordEntrySchema = z.object({
  word: z.string().describe('A word in the target language related to the field.'),
  sentence: z.string().describe('A meaningful sentence using this specific word in the target language.'),
});

const GenerateWordSetOutputSchema = z.object({
  wordEntries: z.array(WordEntrySchema).min(3).max(5).describe('A set of distinct words, each accompanied by its own example sentence in the target language. Ensure the words are varied and relevant to the field, and the number of entries matches the requested count.'),
});
export type GenerateWordSetOutput = z.infer<typeof GenerateWordSetOutputSchema>;

export async function generateWordSet(input: GenerateWordSetInput): Promise<GenerateWordSetOutput> {
  // Ensure count in input is used, or default if not provided.
  const validatedInput = GenerateWordSetInputSchema.parse(input);
  return generateWordSetFlow(validatedInput);
}

const prompt = ai.definePrompt({
  name: 'generateWordSetPrompt',
  model: 'googleai/gemini-1.5-flash-latest',
  input: {schema: GenerateWordSetInputSchema},
  output: {schema: GenerateWordSetOutputSchema},
  prompt: `You are a language learning assistant.
Generate a set of {{count}} distinct and related words in the target language: {{language}}, based on the knowledge field: {{field}}.
Critically, ensure these words are different from any words you have generated in the very recent past for this specific combination of language and field. The words should have a clear semantic connection.
For EACH of these {{count}} words, create one meaningful and natural-sounding example sentence in the target language ({{language}}) that incorporates that specific word.

Return a JSON object containing a 'wordEntries' array. Each element in this array should be an object with two keys:
1. 'word': The generated word (string).
2. 'sentence': The example sentence for that word (string).

Example for one entry: { "word": "example_word", "sentence": "This is an example_sentence using the example_word." }
The 'wordEntries' array should contain exactly {{count}} such objects.`,
});

const generateWordSetFlow = ai.defineFlow(
  {
    name: 'generateWordSetFlow',
    inputSchema: GenerateWordSetInputSchema,
    outputSchema: GenerateWordSetOutputSchema,
  },
  async (input) => { // input here is already validated by the .parse in the wrapper
    const {output} = await prompt(input);
    if (!output || !output.wordEntries || output.wordEntries.length !== input.count) {
      throw new Error(`Failed to generate a complete set of ${input.count} words and sentences from AI. Received ${output?.wordEntries?.length || 0}.`);
    }
    return output;
  }
);
