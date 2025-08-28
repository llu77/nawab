
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
    patientHistory: z.string().describe("A brief summary of the patient's medical and psychological history."),
    symptoms: z.array(z.string()).describe("A list of the patient's primary presenting symptoms."),
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
    
    // Prepare inputs for the sub-agents
    const combinedHistoryAndSymptoms = `${input.patientHistory}\n\nPrimary Symptoms Reported:\n- ${input.symptoms.join('\n- ')}`;

    const diagnosisInput: DiagnosePatientInput = {
        // For a new patient, session notes might be empty or derived from the initial intake
        sessionNotes: [`Initial intake notes for ${input.name}, age ${input.age}.`],
        patientHistory: combinedHistoryAndSymptoms,
    };

    const relapsePredictionInput: RelapsePredictionInput = {
        // Behavioral patterns could be derived from the initial symptom description
        behavioralPatterns: `Initial reported symptoms include: ${input.symptoms.join(', ')}. Patient history summary: ${input.patientHistory}`,
        patientHistory: combinedHistoryAndSymptoms,
        // Risk factors could be empty initially or derived from history
        riskFactors: "To be determined in subsequent sessions. Initial assessment based on provided history.",
    };
    
    const summaryInput: SummaryInput = {
        sessionNotes: `Initial intake for ${input.name}.`,
        patientData: `Patient: ${input.name}, Age: ${input.age}.\nHistory: ${input.patientHistory}\nSymptoms: ${input.symptoms.join(', ')}`,
    };

    // Run agents concurrently
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
