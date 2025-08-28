
'use server';

/**
 * @fileOverview The orchestrator agent that coordinates other AI agents upon new patient registration.
 *
 * - orchestratorAgent - The main function that runs concurrent analyses.
 * - OrchestratorInput - The input type for the orchestrator.
 * - OrchestratorOutput - The return type for the orchestrator.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { diagnosePatient, DiagnosePatientInput, DiagnosePatientOutput } from './diagnosis-assistant';
import { predictRelapseProbability, RelapsePredictionInput, RelapsePredictionOutput } from './relapse-prediction';
import { generateSummary, SummaryInput, SummaryOutput } from './ai-summary-generator';

export const OrchestratorInputSchema = z.object({
    patientId: z.string().describe("The unique identifier for the patient."),
    name: z.string().describe("The patient's full name."),
    age: z.number().describe("The patient's age."),
    gender: z.string().describe("The patient's gender."),
    patientHistory: z.string().describe("A brief summary of the patient's medical and psychological history."),
    symptoms: z.array(z.string()).describe("A list of the patient's primary presenting symptoms."),
    currentMedications: z.array(z.string()).optional().describe("A list of the patient's current or previous medications."),
    addictionHistory: z.boolean().describe("Whether the patient has a history of addiction."),
    addictionDetails: z.string().optional().describe("Details about the patient's addiction history."),
    familyHistory: z.boolean().describe("Whether the patient has a family history of mental illness."),
    familyHistoryDetails: z.string().optional().describe("Details about the family history of mental illness."),
});
export type OrchestratorInput = z.infer<typeof OrchestratorInputSchema>;

export const OrchestratorOutputSchema = z.object({
    diagnosis: DiagnosePatientOutput,
    relapsePrediction: RelapsePredictionOutput,
    summary: SummaryOutput,
});
export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>;

export async function orchestratorAgent(input: OrchestratorInput): Promise<OrchestratorOutput> {
    return orchestratorAgentFlow(input);
}

const orchestratorAgentFlow = ai.defineFlow(
  {
    name: 'orchestratorAgentFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: OrchestratorOutputSchema,
  },
  async (input) => {
    console.log(`Orchestrator agent started for patient: ${input.patientId}`);
    
    // Combine all available information into a rich context for the agents
    let comprehensiveHistory = `Patient Name: ${input.name}, Age: ${input.age}, Gender: ${input.gender}.\n`;
    comprehensiveHistory += `Brief History: ${input.patientHistory}\n`;
    comprehensiveHistory += `Primary Symptoms Reported: ${input.symptoms.join(', ')}.\n`;
    
    if (input.currentMedications && input.currentMedications.length > 0) {
        comprehensiveHistory += `Current/Previous Medications: ${input.currentMedications.join(', ')}.\n`;
    }
    if (input.addictionHistory) {
        comprehensiveHistory += `History of Addiction: Yes. Details: ${input.addictionDetails || 'Not specified'}.\n`;
    }
    if (input.familyHistory) {
        comprehensiveHistory += `Family History of Mental Illness: Yes. Details: ${input.familyHistoryDetails || 'Not specified'}.\n`;
    }
    
    // Prepare inputs for the sub-agents
    const diagnosisInput: DiagnosePatientInput = {
        sessionNotes: [`Initial intake notes for ${input.name}, age ${input.age}.`],
        patientHistory: comprehensiveHistory,
    };

    const relapsePredictionInput: RelapsePredictionInput = {
        behavioralPatterns: `Initial assessment based on reported symptoms: ${input.symptoms.join(', ')}.`,
        patientHistory: comprehensiveHistory,
        riskFactors: "Initial risk factors to consider include reported symptoms, medication history, and addiction/family history if provided.",
    };
    
    const summaryInput: SummaryInput = {
        sessionNotes: `Initial intake session for patient ${input.name}.`,
        patientData: comprehensiveHistory,
    };

    // Run agents concurrently
    console.log("Starting concurrent analysis for Diagnosis, Relapse Prediction, and Summarization...");
    const [diagnosis, relapsePrediction, summary] = await Promise.all([
      diagnosePatient(diagnosisInput),
      predictRelapseProbability(relapsePredictionInput),
      generateSummary(summaryInput),
    ]);

    console.log(`Orchestrator agent finished for patient: ${input.patientId}`);

    return {
      diagnosis,
      relapsePrediction,
      summary,
    };
  }
);
