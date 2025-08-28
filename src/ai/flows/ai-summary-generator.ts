
'use server';

/**
 * @fileOverview AI-powered summarization tool for mental health professionals.
 *
 * - generateSummary - A function that generates a summary of session notes and patient data.
 * - SummaryInput - The input type for the generateSummary function.
 * - SummaryOutput - The return type for the generateSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { SummaryOutputSchema } from './schemas';

const SummaryInputSchema = z.object({
  sessionNotes: z.string().describe('The session notes to summarize.'),
  patientData: z.string().describe('The patient data to summarize.'),
});

export type SummaryInput = z.infer<typeof SummaryInputSchema>;
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;

export async function generateSummary(input: SummaryInput): Promise<SummaryOutput> {
  return aiSummaryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSummaryGeneratorPrompt',
  input: {schema: SummaryInputSchema},
  output: {schema: SummaryOutputSchema},
  prompt: `You are an AI assistant designed to help mental health professionals by summarizing session notes and patient data into quick, readable summaries.

  Summarize the following session notes and patient data:

  Session Notes: {{{sessionNotes}}}

  Patient Data: {{{patientData}}}

  Provide a concise and informative summary that captures the key information.`,
});

const aiSummaryGeneratorFlow = ai.defineFlow(
  {
    name: 'aiSummaryGeneratorFlow',
    inputSchema: SummaryInputSchema,
    outputSchema: SummaryOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
