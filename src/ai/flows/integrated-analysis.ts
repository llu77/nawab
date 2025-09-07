
'use server';

/**
 * @fileOverview This flow corresponds to "Model 4: Filter & Organizer".
 * It takes the results from the initial parallel models (Phase 1),
 * integrates them, resolves conflicts, and generates a unified
 * diagnosis and a comprehensive treatment plan. It now supports
 * iterative analysis by incorporating a doctor's override.
 *
 * - performIntegratedAnalysis - The main function to run the analysis.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { IntegratedAnalysisInputSchema, IntegratedAnalysisOutputSchema, type IntegratedAnalysisInput, type IntegratedAnalysisOutput } from './schemas';

export async function performIntegratedAnalysis(input: IntegratedAnalysisInput): Promise<IntegratedAnalysisOutput> {
  return integratedAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'integratedAnalysisPrompt',
  input: { schema: IntegratedAnalysisInputSchema },
  output: { schema: IntegratedAnalysisOutputSchema },
  model: 'googleai/gemini-1.5-flash',
  prompt: `
    As a senior consultant psychiatrist, your task is to filter, organize, and synthesize information from multiple AI models to create a cohesive and actionable clinical picture.

    You have received the following reports for patient ID: {{patientId}}

    Initial Analysis Results:
    1.  **Diagnostic Hypotheses:**
        \`\`\`json
        {{json initialAnalysis.diagnosis}}
        \`\`\`
    2.  **Relapse Risk Prediction:**
        \`\`\`json
        {{json initialAnalysis.relapsePrediction}}
        \`\`\`
    3.  **Case Summary:**
        \`\`\`json
        {{json initialAnalysis.summary}}
        \`\`\`
    
    {{#if doctorOverride}}
    **CRITICAL FEEDBACK FROM THE TREATING PHYSICIAN:**
    The attending physician has reviewed the initial analysis and provided the following override. You MUST take this into account as the primary source of truth, adjusting your diagnosis and plan accordingly.
    \`\`\`
    {{doctorOverride}}
    \`\`\`
    {{/if}}

    **Your Required Tasks:**

    1.  **Synthesize and Conclude Diagnosis:**
        -   Review the diagnostic hypotheses, prioritizing the doctor's override if provided.
        -   Resolve any conflicts or discrepancies.
        -   Formulate a definitive primary diagnosis and any secondary diagnoses.
        -   State the level of consensus (full, partial, or conflicting) between the initial data sources.
        -   Set the 'requiresManualReview' flag to true if confidence is low or there are significant conflicts.

    2.  **Formulate a Treatment Plan:**
        -   Based on the integrated diagnosis and risk assessment, create a comprehensive treatment plan.
        -   Specify first-line and second-line pharmacological options. List any contraindicated medications.
        -   Recommend specific psychotherapeutic modalities (e.g., CBT, DBT), including suggested duration and frequency.

    3.  **Write a Clinical Discussion:**
        -   Provide a detailed, evidence-based narrative (at least 2-3 paragraphs).
        -   Explain your reasoning for the final diagnosis and treatment choices.
        -   Justify how you integrated the different pieces of data and incorporated the doctor's feedback if available.

    4.  **Provide References:**
        -   Cite at least 2-3 clinical guidelines or key studies that support your recommendations (e.g., "APA Guidelines for Major Depressive Disorder, 2022"). Provide dummy URLs.

    **CRITICAL INSTRUCTIONS:**
    -   You MUST respond in a valid JSON format that adheres to the output schema.
    -   Your final output should be a single JSON object. Do not include any text outside of the JSON structure.
  `,
});

const integratedAnalysisFlow = ai.defineFlow(
  {
    name: 'integratedAnalysisFlow',
    inputSchema: IntegratedAnalysisInputSchema,
    outputSchema: IntegratedAnalysisOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    const validatedOutput = output!;

    // Post-processing validation
    if (validatedOutput.integratedDiagnosis.consensus === 'conflicting' || validatedOutput.integratedDiagnosis.confidence < 0.7) {
        validatedOutput.requiresManualReview = true;
    } else {
        validatedOutput.requiresManualReview = false;
    }

    if (!validatedOutput.treatmentPlan.pharmacological.firstLine.length && 
        !validatedOutput.treatmentPlan.psychotherapeutic.recommended.length) {
      console.warn(`Warning: Model failed to generate any treatment recommendations for patient ${input.patientId}.`);
      validatedOutput.requiresManualReview = true;
    }

    return validatedOutput;
  }
);
