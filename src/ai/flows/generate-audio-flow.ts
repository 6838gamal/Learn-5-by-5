'use server';
/**
 * @fileOverview A text-to-speech generation flow.
 *
 * - generateAudio - A function that converts text to speech audio.
 * - GenerateAudioInput - The input type for the generateAudio function.
 * - GenerateAudioOutput - The return type for the generateAudio function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';
import wav from 'wav';

const GenerateAudioInputSchema = z.string().describe('The text to be converted to speech.');
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

const GenerateAudioOutputSchema = z.object({
  audioDataUri: z.string().describe("The generated audio as a data URI in WAV format. Expected format: 'data:audio/wav;base64,<encoded_data>'."),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;

export async function generateAudio(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
  return generateAudioFlow(input);
}

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const generateAudioFlow = ai.defineFlow(
  {
    name: 'generateAudioFlow',
    inputSchema: GenerateAudioInputSchema,
    outputSchema: GenerateAudioOutputSchema,
  },
  async (text) => {
    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' }, // A standard voice
          },
        },
      },
      prompt: text,
    });

    if (!media) {
      throw new Error('No audio media was returned from the AI service.');
    }
    
    // The media URL is a data URI with base64 encoded PCM data
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavBase64 = await toWav(audioBuffer);

    return {
      audioDataUri: 'data:audio/wav;base64,' + wavBase64,
    };
  }
);
