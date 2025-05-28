'use server';
/**
 * @fileOverview Generates a set of five related words in the target language based on the selected knowledge field.
 *
 * - generateWordSet - A function that generates a set of words.
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
});
export type GenerateWordSetOutput = z.infer<typeof GenerateWordSetOutputSchema>;

export async function generateWordSet(input: GenerateWordSetInput): Promise<GenerateWordSetOutput> {
  return generateWordSetFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWordSetPrompt',
  input: {schema: GenerateWordSetInputSchema},
  output: {schema: GenerateWordSetOutputSchema},
  prompt: `You are a language learning assistant. Generate a set of five related words in the target language based on the selected knowledge field. Ensure the words have a semantic connection and vary with each generation. The target language is {{language}} and the knowledge field is {{field}}. Return a JSON array of 5 words.`,
});

const generateWordSetFlow = ai.defineFlow(
  {
    name: 'generateWordSetFlow',
    inputSchema: GenerateWordSetInputSchema,
    outputSchema: GenerateWordSetOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
