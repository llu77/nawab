
'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting alternative medications and providing a comprehensive pharmacy review.
 *
 * - getMedicationAnalysis - A function that provides a full clinical pharmacist review.
 * - MedicationAnalysisInput - The input type for the getMedicationAnalysis function.
 * - MedicationAnalysisOutput - The return type for the getMedicationAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { MedicationAnalysisInputSchema, MedicationAnalysisOutputSchema, type MedicationAnalysisInput, type MedicationAnalysisOutput } from './schemas';


export async function getMedicationAnalysis(
  input: MedicationAnalysisInput
): Promise<MedicationAnalysisOutput> {
  return medicationAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'medicationAnalysisPrompt',
  input: {schema: MedicationAnalysisInputSchema},
  output: {schema: MedicationAnalysisOutputSchema},
  model: 'googleai/gemini-1.5-flash',
  prompt: `You are a clinical pharmacist specializing in psychiatric medications. Your task is to conduct a thorough medication review and provide actionable recommendations.

  **Patient Information:**
  -   **History:** {{patientHistory}}
  -   **Pharmacogenomics (if available):** {{patientGenetics}}
  -   **Current Medications:** {{#each currentMedications}} - {{{this}}} {{/each}}

  **Required Analysis:**

  1.  **Medication Review:**
      -   Analyze the current medications for appropriateness, efficacy, and safety.
      -   Suggest specific adjustments (e.g., dose changes, discontinuation).
      -   Identify any contraindicated medications based on the patient's profile.

  2.  **Drug Interactions:**
      -   Analyze potential interactions between the listed medications.
      -   For each significant interaction, describe its clinical significance and provide a clear recommendation. Classify severity as 'minor', 'moderate', 'major', 'contraindicated'.

  3.  **Safe Alternatives:**
      -   Based on the entire clinical picture, recommend safe and effective alternative medications.
      -   Provide a strong rationale for each recommendation, linking it to the patient's history, genetics, or current medication issues.

  4.  **Monitoring Plan:**
      -   Propose a plan for monitoring the patient's response to the recommended medication therapy, including necessary lab tests and clinical observations.

  5.  **Pharmacist's Notes:**
      -   Add any other critical notes or clinical pearls that the treating physician should be aware of.

  The output MUST be in a valid JSON format that strictly adheres to the 'MedicationAnalysisOutputSchema'.
  `,
});

const medicationAnalysisFlow = ai.defineFlow(
  {
    name: 'medicationAnalysisFlow',
    inputSchema: MedicationAnalysisInputSchema,
    outputSchema: MedicationAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
