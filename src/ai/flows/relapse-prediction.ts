
'use server';

/**
 * @fileOverview This file implements the relapse prediction flow for mental health professionals.
 *
 * - predictRelapseProbability - An exported function that takes behavioral patterns as input and returns the predicted relapse probability.
 * - RelapsePredictionInput - The input type for the predictRelapseProbability function, defining the behavioral patterns.
 * - RelapsePredictionOutput - The output type for the predictRelapseProbability function, providing the relapse prediction and rationale.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
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
  prompt: `You are an AI assistant designed to predict the probability of relapse for mental health patients.
  Based on the provided behavioral patterns, patient history and risk factors, determine the likelihood of relapse.
  Provide a rationale for your prediction, referencing specific behavioral patterns and risk factors.

  Behavioral Patterns: {{{behavioralPatterns}}}
  Patient History: {{{patientHistory}}}
  Risk Factors: {{{riskFactors}}}

  Please provide the relapse probability as a percentage (0-100) and a detailed rationale.
  Ensure that the output is valid and adheres to the schema.
  Remember that the schema descriptions will be passed to the LLM to guide formatting, so be as descriptive as possible.
  `, // Updated prompt string to include instructions to LLM.
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
