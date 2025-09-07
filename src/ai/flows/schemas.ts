import { z } from 'genkit';

/**
 * @fileOverview This file contains the Zod schemas and TypeScript types for the AI flows.
 * This allows for shared, consistent data structures across different server actions
 * without violating the 'use server' directive constraints.
 */

//-////////////////////////////////////////////////////////////////
// DIAGNOSIS ASSISTANT SCHEMAS
//-////////////////////////////////////////////////////////////////

export const DiagnosePatientInputSchema = z.object({
  sessionNotes: z.array(z.string()).describe('An array of session notes for the patient.'),
  patientHistory: z.string().describe("The patient's medical history."),
});
export type DiagnosePatientInput = z.infer<typeof DiagnosePatientInputSchema>;

const DiagnosisHypothesisSchema = z.object({
  diagnosis: z.string().describe('The possible diagnosis.'),
  confidence: z.number().describe('The confidence level of the diagnosis (0-1).'),
  reasoning: z.string().describe('The reasoning behind the diagnosis based on DSM-5 criteria.'),
  supportingEvidence: z.string().describe('Supporting evidence from session notes and patient history.'),
});

export const DiagnosePatientOutputSchema = z.object({
  diagnosisHypotheses: z.array(DiagnosisHypothesisSchema).describe('An array of possible diagnoses with confidence levels and reasoning.'),
});
export type DiagnosePatientOutput = z.infer<typeof DiagnosePatientOutputSchema>;


//-////////////////////////////////////////////////////////////////
// RELAPSE PREDICTION SCHEMAS
//-////////////////////////////////////////////////////////////////

export const RelapsePredictionInputSchema = z.object({
  behavioralPatterns: z
    .string()
    .describe(
      'A detailed description of the patient’s recent behavioral patterns, including changes in mood, sleep, activity levels, social interactions, and adherence to treatment.'
    ),
  patientHistory: z.string().describe('The patient’s medical and psychiatric history.'),
  riskFactors: z.string().describe('Known risk factors specific to the patient.'),
});
export type RelapsePredictionInput = z.infer<typeof RelapsePredictionInputSchema>;


export const RelapsePredictionOutputSchema = z.object({
  relapseProbability: z
    .number()
    .describe(
      'The predicted probability of relapse, expressed as a percentage between 0 and 100.'
    ),
  rationale: z
    .string()
    .describe(
      'A detailed explanation of the factors contributing to the relapse prediction, including specific behavioral patterns and risk factors.'
    ),
});
export type RelapsePredictionOutput = z.infer<typeof RelapsePredictionOutputSchema>;


//-////////////////////////////////////////////////////////////////
// AI SUMMARY GENERATOR SCHEMAS
//-////////////////////////////////////////////////////////////////

export const SummaryOutputSchema = z.object({
  summary: z.string().describe('The generated summary of the session notes and patient data.'),
});
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;


//-////////////////////////////////////////////////////////////////
// ORCHESTRATOR SCHEMAS
//-////////////////////////////////////////////////////////////////

export const OrchestratorOutputSchema = z.object({
    diagnosis: DiagnosePatientOutputSchema.optional(),
    relapsePrediction: RelapsePredictionOutputSchema.optional(),
    summary: SummaryOutputSchema.optional(),
});
export type OrchestratorOutput = z.infer<typeof OrchestratorOutputSchema>;


//-////////////////////////////////////////////////////////////////
// INTEGRATED ANALYSIS (MODEL 4) SCHEMAS
//-////////////////////////////////////////////////////////////////

export const IntegratedAnalysisInputSchema = z.object({
    patientId: z.string().describe("The patient's unique ID."),
    initialAnalysis: OrchestratorOutputSchema.describe("The results from the initial parallel processing phase (diagnosis, risk, summary).")
});
export type IntegratedAnalysisInput = z.infer<typeof IntegratedAnalysisInputSchema>;

const TreatmentPlanPharmacologicalSchema = z.object({
    firstLine: z.array(z.string()).describe("First-line medication recommendations."),
    secondLine: z.array(z.string()).describe("Second-line medication recommendations."),
    contraindicated: z.array(z.string()).describe("Medications that are contraindicated for this patient."),
});

const TreatmentPlanPsychotherapeuticSchema = z.object({
    recommended: z.array(z.string()).describe("Recommended psychotherapeutic interventions (e.g., CBT, DBT)."),
    duration: z.string().describe("Recommended duration for the therapy."),
    frequency: z.string().describe("Recommended frequency of therapy sessions."),
});

const TreatmentPlanSchema = z.object({
    pharmacological: TreatmentPlanPharmacologicalSchema,
    psychotherapeutic: TreatmentPlanPsychotherapeuticSchema,
});

const IntegratedDiagnosisSchema = z.object({
    primary: DiagnosisHypothesisSchema.describe("The confirmed primary diagnosis after integration."),
    secondary: z.array(DiagnosisHypothesisSchema).describe("Any secondary or comorbid diagnoses."),
    confidence: z.number().describe("The overall confidence in the integrated diagnosis (0-1)."),
    consensus: z.enum(["full", "partial", "conflicting"]).describe("The level of consensus between the initial models."),
});


export const IntegratedAnalysisOutputSchema = z.object({
    integratedDiagnosis: IntegratedDiagnosisSchema,
    treatmentPlan: TreatmentPlanSchema,
    clinicalDiscussion: z.string().describe("A detailed clinical discussion synthesizing all available data and justifying the treatment plan."),
    references: z.array(z.string()).optional().describe("Citations or references used to formulate the plan."),
    requiresManualReview: z.boolean().describe("A flag indicating if the case has conflicts or low confidence, requiring manual review."),
});
export type IntegratedAnalysisOutput = z.infer<typeof IntegratedAnalysisOutputSchema>;
