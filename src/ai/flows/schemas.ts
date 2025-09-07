import { z } from 'zod';

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
export const SummaryInputSchema = z.object({
  sessionNotes: z.string().describe('The session notes to summarize.'),
  patientData: z.string().describe('The patient data to summarize.'),
});
export type SummaryInput = z.infer<typeof SummaryInputSchema>;

const CriticalAlertSchema = z.object({
    type: z.enum(["drug_interaction", "clinical", "safety"]).describe("The category of the alert."),
    message: z.string().describe("A concise description of the alert."),
    urgency: z.enum(["routine", "urgent", "stat"]).describe("The urgency level of the alert."),
});

export const SummaryOutputSchema = z.object({
  briefing: z.string().describe("The executive summary briefing (5-15 lines)."),
  keyPoints: z.array(z.string()).describe("A list of the most important key points."),
  criticalAlerts: z.array(CriticalAlertSchema).describe("A list of critical alerts requiring attention."),
  suggestedQuestions: z.array(z.string()).describe("A list of suggested questions to ask the patient during the next visit."),
  pendingDecisions: z.array(z.string()).describe("A list of pending clinical decisions that need to be made."),
});
export type SummaryOutput = z.infer<typeof SummaryOutputSchema>;



//-////////////////////////////////////////////////////////////////
// MEDICATION ANALYSIS (CLINICAL PHARMACIST) SCHEMAS
//-////////////////////////////////////////////////////////////////

export const MedicationAnalysisInputSchema = z.object({
  patientHistory: z.string().describe("The patient's medical history, including diagnoses and comorbidities."),
  patientGenetics: z.string().describe("Pharmacogenomic data, if available (e.g., CYP2D6 status)."),
  currentMedications: z.string().describe("A comma-separated list of the patient's current medications, including dosage."),
});
export type MedicationAnalysisInput = z.infer<typeof MedicationAnalysisInputSchema>;

const MedicationAdjustmentSchema = z.object({
  medication: z.string().describe("The medication to be adjusted."),
  recommendation: z.string().describe("The recommended adjustment (e.g., 'Increase dose to 20mg', 'Taper and discontinue')."),
  rationale: z.string().describe("The clinical reasoning for the recommendation."),
});

const DrugInteractionSchema = z.object({
  drug1: z.string().describe("The first drug in the interaction."),
  drug2: z.string().describe("The second drug in the interaction."),
  severity: z.enum(["minor", "moderate", "major", "contraindicated"]).describe("The severity of the interaction."),
  clinicalSignificance: z.string().describe("The clinical significance and potential effect of the interaction."),
  recommendation: z.string().describe("The recommended action to manage the interaction."),
});

const MedicationAlternativeSchema = z.object({
  medication: z.string().describe("The suggested alternative medication."),
  rationale: z.string().describe("The reason for suggesting this alternative (e.g., 'better side effect profile', 'targets specific symptoms')."),
});

const MonitoringParameterSchema = z.object({
    parameter: z.string().describe("The parameter to monitor (e.g., 'Blood Pressure', 'Serum Creatinine', 'PHQ-9 Score')."),
    frequency: z.string().describe("How often to monitor the parameter (e.g., 'Weekly for first 4 weeks', 'At baseline and 3 months').")
});

export const MedicationAnalysisOutputSchema = z.object({
  medicationReview: z.object({
    adjustments: z.array(MedicationAdjustmentSchema).describe("Recommended adjustments to current medications."),
    contraindicated: z.array(z.string()).describe("Medications that are contraindicated for this patient."),
  }).describe("A review of the patient's current medication regimen."),
  drugInteractions: z.array(DrugInteractionSchema).describe("A list of potential drug-drug interactions."),
  alternatives: z.array(MedicationAlternativeSchema).describe("Suggested alternative medications."),
  monitoringPlan: z.array(MonitoringParameterSchema).describe("A plan for monitoring the medication therapy."),
  pharmacistNotes: z.string().describe("General notes and clinical pearls from the pharmacist."),
});
export type MedicationAnalysisOutput = z.infer<typeof MedicationAnalysisOutputSchema>;


//-////////////////////////////////////////////////////////////////
// ORCHESTRATOR SCHEMAS
//-////////////////////////////////////////////////////////////////

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
