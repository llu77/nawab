
'use server';

/**
 * @fileOverview The orchestrator agent that coordinates other AI agents upon new patient registration.
 *
 * - orchestratorAgent - The main function that runs concurrent analyses.
 * - OrchestratorInput - The input type for the orchestrator.
 * - OrchestratorOutput - The return type for the orchestrator.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { diagnosePatient } from './diagnosis-assistant';
import { predictRelapseProbability } from './relapse-prediction';
import { generateSummary, type SummaryInput } from './ai-summary-generator';
import { getFirestore } from "firebase-admin/firestore";
import { initializeFirebase } from '@/lib/firebase';
import { 
    DiagnosePatientOutputSchema, 
    RelapsePredictionOutputSchema, 
    SummaryOutputSchema, 
    type DiagnosePatientInput, 
    type RelapsePredictionInput,
    type OrchestratorOutput,
    DiagnosePatientOutput,
    RelapsePredictionOutput,
    SummaryOutput,
    IntegratedAnalysisOutputSchema,
    type IntegratedAnalysisOutput,
    OrchestratorInputSchema,
    type OrchestratorInput
} from './schemas';


export const OrchestratorOutputSchema = z.object({
    diagnosis: DiagnosePatientOutputSchema.optional(),
    relapsePrediction: RelapsePredictionOutputSchema.optional(),
    summary: SummaryOutputSchema.optional(),
});


export async function orchestratorAgent(input: OrchestratorInput): Promise<OrchestratorOutput> {
    return orchestratorAgentFlow(input);
}

// Initialize Firebase and Firestore
initializeFirebase();
const db = getFirestore();


const orchestratorAgentFlow = ai.defineFlow(
  {
    name: 'orchestratorAgentFlow',
    inputSchema: OrchestratorInputSchema,
    outputSchema: OrchestratorOutputSchema,
  },
  async (input) => {
    console.log(`🚀 Orchestrator agent started for patient: ${input.patientId}`);
    
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

    console.log("Starting concurrent analysis for Diagnosis, Relapse Prediction, and Summarization...");

    const [diagnosisResult, relapsePredictionResult, summaryResult] = await Promise.allSettled([
      diagnosePatient(diagnosisInput),
      predictRelapseProbability(relapsePredictionInput),
      generateSummary(summaryInput),
    ]);

    const errors: { model: string, error: any }[] = [];
    if (diagnosisResult.status === 'rejected') {
        console.error("Diagnosis model failed:", diagnosisResult.reason);
        errors.push({ model: 'diagnosis', error: diagnosisResult.reason?.message || diagnosisResult.reason });
    }
     if (relapsePredictionResult.status === 'rejected') {
        console.error("Relapse prediction model failed:", relapsePredictionResult.reason);
        errors.push({ model: 'relapsePrediction', error: relapsePredictionResult.reason?.message || relapsePredictionResult.reason });
    }
     if (summaryResult.status === 'rejected') {
        console.error("Summary model failed:", summaryResult.reason);
        errors.push({ model: 'summary', error: summaryResult.reason?.message || summaryResult.reason });
    }
    
    const results: OrchestratorOutput = {
        diagnosis: diagnosisResult.status === 'fulfilled' ? diagnosisResult.value : undefined,
        relapsePrediction: relapsePredictionResult.status === 'fulfilled' ? relapsePredictionResult.value : undefined,
        summary: summaryResult.status === 'fulfilled' ? summaryResult.value : undefined,
    };

    // Save results to Firestore
    try {
        const patientDocRef = db.collection('patients').doc(input.patientId);
        const patientDataToSave = {
            ...input,
            registrationDate: new Date().toISOString().split('T')[0],
            aiResults: results,
            processingErrors: errors.length > 0 ? errors : null,
            processingStatus: errors.length > 0 ? 'partial_success' : 'completed',
            integratedAnalysisStatus: 'pending' as 'pending' | 'completed' | 'failed',
        };

        await patientDocRef.set(patientDataToSave);
        console.log(`Successfully saved AI results to Firestore for patient: ${input.patientId}`);
    } catch (error) {
        console.error(`Failed to save AI results to Firestore for patient ${input.patientId}:`, error);
        // Optionally, re-throw the error or handle it as needed
        throw new Error(`Failed to save data to Firestore: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log(`Orchestrator agent finished for patient: ${input.patientId}`);

    return results;
  }
);
