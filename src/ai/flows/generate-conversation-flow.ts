
'use server';
/**
 * @fileOverview Generates a conversation based on selected words and language.
 *
 * - generateConversation - A function that generates a conversation.
 * - GenerateConversationInput - The input type for the generateConversation function.
 * - GenerateConversationOutput - The return type for the generateConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const GenerateConversationInputSchema = z.object({
  language: z.string().describe('The language for the conversation.'),
  selectedWords: z.array(z.string()).min(2, "Please select at least two words.").describe('A list of words to include in the conversation.'),
});
export type GenerateConversationInput = z.infer<typeof GenerateConversationInputSchema>;

export const GenerateConversationOutputSchema = z.object({
  conversation: z.string().describe('The generated conversation script.'),
});
export type GenerateConversationOutput = z.infer<typeof GenerateConversationOutputSchema>;

export async function generateConversation(input: GenerateConversationInput): Promise<GenerateConversationOutput> {
  return generateConversationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConversationPrompt',
  input: {schema: GenerateConversationInputSchema},
  output: {schema: GenerateConversationOutputSchema},
  prompt: `You are a language learning assistant.
Create a short, natural-sounding dialogue in {{language}} between two people (Person A and Person B).
The dialogue MUST meaningfully incorporate and use ALL of the following words:
{{#each selectedWords}}
- {{{this}}}
{{/each}}

Ensure the conversation flows logically and uses the words in context.
Return the dialogue as a single string with speaker labels (e.g., "Person A: ...", "Person B: ...").`,
});

const generateConversationFlow = ai.defineFlow(
  {
    name: 'generateConversationFlow',
    inputSchema: GenerateConversationInputSchema,
    outputSchema: GenerateConversationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate conversation from AI.");
    }
    return output;
  }
);
