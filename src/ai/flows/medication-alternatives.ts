'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative medications based on patient history, genetics, and current prescriptions.
 *
 * - getAlternativeMedications - A function that suggests alternative medications.
 * - AlternativeMedicationsInput - The input type for the getAlternativeMedications function.
 * - AlternativeMedicationsOutput - The return type for the getAlternativeMedications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AlternativeMedicationsInputSchema = z.object({
  patientHistory: z
    .string()
    .describe('The patient medical history.'),
  patientGenetics: z
    .string()
    .describe('The patient genetic information.'),
  currentMedications: z
    .string()
    .describe('The patient current prescriptions.'),
});
export type AlternativeMedicationsInput = z.infer<
  typeof AlternativeMedicationsInputSchema
>;

const AlternativeMedicationsOutputSchema = z.object({
  alternatives: z
    .string()
    .describe('Suggested alternative medications based on the provided information.'),
});
export type AlternativeMedicationsOutput = z.infer<
  typeof AlternativeMedicationsOutputSchema
>;

export async function getAlternativeMedications(
  input: AlternativeMedicationsInput
): Promise<AlternativeMedicationsOutput> {
  return alternativeMedicationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'alternativeMedicationsPrompt',
  input: {schema: AlternativeMedicationsInputSchema},
  output: {schema: AlternativeMedicationsOutputSchema},
  prompt: `You are a clinical pharmacist, and you are tasked to analyze patient data and suggest alternative medications.

  Patient History: {{{patientHistory}}}
  Patient Genetics: {{{patientGenetics}}}
  Current Medications: {{{currentMedications}}}

  Based on this information, suggest alternative medications.
  Give a detailed reason why each medication is being suggested.
  `,
});

const alternativeMedicationsFlow = ai.defineFlow(
  {
    name: 'alternativeMedicationsFlow',
    inputSchema: AlternativeMedicationsInputSchema,
    outputSchema: AlternativeMedicationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
