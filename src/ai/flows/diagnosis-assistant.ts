// diagnosis-assistant.ts
'use server';

/**
 * @fileOverview An AI-powered tool that analyzes session notes and patient history to provide possible diagnoses.
 *
 * - diagnosePatient - A function that handles the patient diagnosis process.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { DiagnosePatientInputSchema, DiagnosePatientOutputSchema, type DiagnosePatientInput, type DiagnosePatientOutput } from './schemas';


export async function diagnosePatient(input: DiagnosePatientInput): Promise<DiagnosePatientOutput> {
  return diagnosePatientFlow(input);
}

const prompt = ai.definePrompt({
  name: 'diagnosePatientPrompt',
  input: {schema: DiagnosePatientInputSchema},
  output: {schema: DiagnosePatientOutputSchema},
  prompt: `You are an AI-powered diagnostic assistant for mental health professionals.

  Your task is to analyze the provided session notes, patient history, and reported symptoms to generate possible diagnoses, along with confidence levels, and transparent reasoning paths based on DSM-5 criteria.

  Session Notes:
  {{#each sessionNotes}}
  - {{{this}}}
  {{/each}}

  Patient History & Symptoms:
  {{{patientHistory}}}

  Provide a list of possible diagnoses with confidence scores and supporting evidence. Explain your reasoning based on DSM-5 criteria for each diagnosis. The patient history also contains the key symptoms reported, use them as a primary guide for your analysis.

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
