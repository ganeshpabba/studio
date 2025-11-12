'use server';
/**
 * @fileOverview A flow to analyze an image from a camera feed.
 * It describes the scene, identifies objects, and assesses the situation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const AnalyzeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo from a camera feed, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeImageInput = z.infer<typeof AnalyzeImageInputSchema>;

const AnalyzeImageOutputSchema = z.object({
  description: z.string().describe('A detailed description of the scene in the image.'),
  objects: z.array(z.string()).describe('A list of objects and animals identified in the image.'),
  action: z.string().describe('A potential action or event happening in the scene (e.g., walking, sitting, idle).'),
  emotion: z.string().describe('The perceived emotion of any person in the scene (e.g., happy, sad, neutral). If no person, return "N/A".'),
});
export type AnalyzeImageOutput = z.infer<typeof AnalyzeImageOutputSchema>;

export async function analyzeImage(input: AnalyzeImageInput): Promise<AnalyzeImageOutput> {
  return analyzeImageFlow(input);
}

const analyzeImagePrompt = ai.definePrompt({
  name: 'analyzeImagePrompt',
  input: {schema: AnalyzeImageInputSchema},
  output: {schema: AnalyzeImageOutputSchema},
  prompt: `You are a security surveillance AI. Analyze the provided image from a security camera.

  Describe the scene in detail. Identify all relevant objects, people, and animals.
  Determine what action is taking place.
  Assess the primary emotion of any person present (e.g., happy, sad, angry, neutral). If no person is visible, the emotion should be "N/A".

  Photo: {{media url=photoDataUri}}`,
});

const analyzeImageFlow = ai.defineFlow(
  {
    name: 'analyzeImageFlow',
    inputSchema: AnalyzeImageInputSchema,
    outputSchema: AnalyzeImageOutputSchema,
  },
  async input => {
    const {output} = await analyzeImagePrompt(input);
    return output!;
  }
);
