// diagnosis-assistant.ts
'use server';

/**
 * @fileOverview An AI-powered tool that analyzes session notes and patient history to provide possible diagnoses.
 *
 * - diagnosePatient - A function that handles the patient diagnosis process.
 * - DiagnosePatientInput - The input type for the diagnosePatient function.
 * - DiagnosePatientOutput - The return type for the diagnosePatient function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DiagnosePatientInputSchema = z.object({
  sessionNotes: z.array(z.string()).describe('An array of session notes for the patient.'),
  patientHistory: z.string().describe('The patient\'s medical history.'),
});
export type DiagnosePatientInput = z.infer<typeof DiagnosePatientInputSchema>;

const DiagnosisHypothesisSchema = z.object({
  diagnosis: z.string().describe('The possible diagnosis.'),
  confidence: z.number().describe('The confidence level of the diagnosis (0-1).'),
  reasoning: z.string().describe('The reasoning behind the diagnosis based on DSM-5 criteria.'),
  supportingEvidence: z.string().describe('Supporting evidence from session notes and patient history.'),
});

const DiagnosePatientOutputSchema = z.object({
  diagnosisHypotheses: z.array(DiagnosisHypothesisSchema).describe('An array of possible diagnoses with confidence levels and reasoning.'),
});
export type DiagnosePatientOutput = z.infer<typeof DiagnosePatientOutputSchema>;

export async function diagnosePatient(input: DiagnosePatientInput): Promise<DiagnosePatientOutput> {
  return diagnosePatientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePatientPrompt',
  input: {schema: DiagnosePatientInputSchema},
  output: {schema: DiagnosePatientOutputSchema},
  prompt: `You are an AI-powered diagnostic assistant for mental health professionals.

  Your task is to analyze the provided session notes and patient history to generate possible diagnoses, along with confidence levels and transparent reasoning paths based on DSM-5 criteria.

  Session Notes:
  {{#each sessionNotes}}
  - {{{this}}}
  {{/each}}

  Patient History:
  {{{patientHistory}}}

  Provide a list of possible diagnoses with confidence scores and supporting evidence from the session notes and patient history. Explain your reasoning based on DSM-5 criteria for each diagnosis.

  Format your response as a JSON object with a 'diagnosisHypotheses' array. Each element in the array should have the following fields:
  - 'diagnosis': The possible diagnosis.
  - 'confidence': The confidence level (0-1).
  - 'reasoning': The reasoning behind the diagnosis.
  - 'supportingEvidence': Evidence from the session notes and patient history.
  `,
});

const diagnosePatientFlow = ai.defineFlow(
  {
    name: 'diagnosePatientFlow',
    inputSchema: DiagnosePatientInputSchema,
    outputSchema: DiagnosePatientOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
