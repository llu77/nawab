
"use server";

import * as z from "zod";
import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";

const newPatientFormSchema = z.object({
  patientId: z.string(),
  name: z.string().optional(),
  age: z.coerce.number().min(1).max(120),
  gender: z.string().min(1, "الجنس مطلوب."),
  patientHistory: z.string().min(20),
  symptoms: z.array(z.string()).min(1).max(10),
  currentMedications: z.array(z.string()).optional(),
  addictionHistory: z.boolean(),
  addictionDetails: z.string().optional(),
  familyHistory: z.boolean(),
  familyHistoryDetails: z.string().optional(),
});

type NewPatientInput = z.infer<typeof newPatientFormSchema>;

export async function registerPatient(input: NewPatientInput): Promise<{success: true, patientId: string} | {success: false, error: string}> {
  try {
    // Validate input server-side
    const validatedInput = newPatientFormSchema.safeParse(input);
    if (!validatedInput.success) {
      // Create a more detailed error message from Zod issues
      const errorMessages = validatedInput.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ');
      return { success: false, error: `Invalid input data: ${errorMessages}` };
    }

    const { patientId, ...agentData } = validatedInput.data;

    // In a real application, you would save the new patient data to your database here.
    console.log("Registering new patient in DB (simulation):", { patientId, ...agentData });

    // Trigger the Orchestrator Agent with the initial data.
    // This is the "real work" being done by the agents.
    // This call is intentionally not awaited on the client-side to allow for immediate UI feedback.
    // The agent will run in the background.
    orchestratorAgent({ patientId, ...agentData })
        .then(results => {
            console.log(`Orchestrator Agent completed for patient ${patientId}:`);
            console.log("Diagnosis:", results.diagnosis);
            console.log("Risk Prediction:", results.relapsePrediction);
            console.log("Summary:", results.summary);
            // In a real application, you would save these results to the database, associated with the patientId.
        })
        .catch(error => {
            console.error(`Orchestrator Agent failed for patient ${patientId}:`, error);
            // Implement error handling, e.g., logging to a monitoring service or flagging the patient record.
        });

    return { success: true, patientId };
  } catch (error) {
    console.error("Error in registerPatient action:", error);
    return { success: false, error: "An unexpected error occurred while registering the patient. Please try again." };
  }
}
