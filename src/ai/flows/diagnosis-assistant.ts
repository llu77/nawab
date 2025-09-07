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
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are an AI-powered diagnostic assistant for mental health professionals, specializing in DSM-5 criteria.

Your task is to analyze the provided session notes and patient history to generate a differential diagnosis.

**Source Data:**
-   **Session Notes:** {{#each sessionNotes}} - {{this}} {{/each}}
-   **Patient History & Symptoms:** {{patientHistory}}

**Instructions:**
1.  **Analyze Symptoms:** Carefully review all provided information, focusing on the primary symptoms, their duration, and severity.
2.  **Formulate Hypotheses:** Generate at least 3-5 possible diagnostic hypotheses based on DSM-5 criteria.
3.  **Assign Confidence:** For each hypothesis, provide a confidence score (from 0.0 to 1.0) representing your level of certainty.
4.  **Provide Rationale:** Justify each hypothesis with a clear, concise rationale that links specific symptoms from the input data to the diagnostic criteria.
5.  **Extract Evidence:** Quote or reference specific phrases from the input data as 'supportingEvidence' for each hypothesis.

The output MUST be a valid JSON object that strictly adheres to the 'DiagnosePatientOutputSchema'.
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
