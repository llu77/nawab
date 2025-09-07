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
import { SummaryInputSchema, SummaryOutputSchema, type SummaryInput, type SummaryOutput } from './schemas';


export async function generateSummary(input: SummaryInput): Promise<SummaryOutput> {
  return aiSummaryGeneratorFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSummaryGeneratorPrompt',
  input: {schema: SummaryInputSchema},
  output: {schema: SummaryOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `As a professional medical assistant, your task is to create a comprehensive executive summary based on the provided clinical data. The summary should be concise (5-15 lines) yet cover all critical aspects for quick clinical review.

  Source Data:

  Session Notes:
  {{sessionNotes}}

  Patient Data:
  {{patientData}}

  **Instructions:**

  1.  **Executive Briefing:** Write a professional medical summary of 5-15 lines covering the patient's core complaint, key symptoms, current diagnosis, and treatment plan.
  2.  **Key Points:** Extract the most critical pieces of information a clinician needs to know at a glance.
  3.  **Critical Alerts:** Identify any urgent issues, such as severe drug interactions, safety risks, or critical lab values.
  4.  **Diagnosis & Treatment:** Clearly state the primary diagnosis and the core components of the treatment plan.
  5.  **Actionable Items:** Formulate suggested questions for the patient and list any pending clinical decisions.

  The output MUST be in a valid JSON format that strictly adheres to the 'SummaryOutputSchema'.
  `,
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
