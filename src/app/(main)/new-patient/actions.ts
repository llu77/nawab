
"use server";

import * as z from "zod";
import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";

const newPatientFormSchema = z.object({
  name: z.string().min(3),
  age: z.coerce.number().min(1).max(120),
  patientHistory: z.string().min(20),
  symptoms: z.array(z.string()).min(3).max(10),
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

    // Generate a unique patient ID
    const patientId = `PSY-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // In a real application, you would save the new patient data to your database here.
    console.log("Registering new patient in DB (simulation):", { patientId, ...validatedInput.data });

    // Trigger the Orchestrator Agent with the initial data.
    // This is the "real work" being done by the agents.
    // This call is intentionally not awaited on the client-side to allow for immediate UI feedback.
    // The agent will run in the background.
    orchestratorAgent({ patientId, ...validatedInput.data })
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
