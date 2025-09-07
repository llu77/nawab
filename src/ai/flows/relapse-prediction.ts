'use server';

/**
 * @fileOverview This file implements the relapse prediction flow for mental health professionals.
 *
 * - predictRelapseProbability - An exported function that takes behavioral patterns as input and returns the predicted relapse probability.
 */

import {ai} from '@/ai/genkit';
import { RelapsePredictionInputSchema, RelapsePredictionOutputSchema, type RelapsePredictionInput, type RelapsePredictionOutput } from './schemas';


// Define the main function that calls the relapse prediction flow
export async function predictRelapseProbability(
  input: RelapsePredictionInput
): Promise<RelapsePredictionOutput> {
  return relapsePredictionFlow(input);
}

// Define the prompt for the relapse prediction flow
const relapsePredictionPrompt = ai.definePrompt({
  name: 'relapsePredictionPrompt',
  input: {schema: RelapsePredictionInputSchema},
  output: {schema: RelapsePredictionOutputSchema},
  prompt: `You are an expert AI risk analyst specializing in predicting relapse for mental health patients.
  Based on the provided data, determine the likelihood of relapse and provide a clear, evidence-based rationale.

  **Patient Data:**
  -   **Behavioral Patterns:** {{{behavioralPatterns}}}
  -   **Patient History:** {{{patientHistory}}}
  -   **Specific Risk Factors:** {{{riskFactors}}}

  **Your Tasks:**

  1.  **Predict Relapse Probability:** Calculate a percentage probability of relapse within the next 6 months.
  2.  **Provide Rationale:** Write a detailed rationale explaining your prediction. Reference specific data points from the inputs.
  3.  **Identify Key Risk Factors:** Explicitly list the top 3-5 factors that contributed most to your prediction.

  Ensure that the output is valid JSON that strictly adheres to the provided schema.
  `, 
});

// Define the Genkit flow for relapse prediction
const relapsePredictionFlow = ai.defineFlow(
  {
    name: 'relapsePredictionFlow',
    inputSchema: RelapsePredictionInputSchema,
    outputSchema: RelapsePredictionOutputSchema,
  },
  async input => {
    const {output} = await relapsePredictionPrompt(input);
    return output!;
  }
);

    