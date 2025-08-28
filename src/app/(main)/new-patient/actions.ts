
"use server";

import * as z from "zod";

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
      return { success: false, error: "Invalid input data." };
    }

    // In a real application, you would:
    // 1. Generate a unique patient ID
    const patientId = `PSY-${new Date().getFullYear()}${(new Date().getMonth() + 1).toString().padStart(2, '0')}${new Date().getDate().toString().padStart(2, '0')}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    
    // 2. Save the new patient data to your database (e.g., MongoDB)
    console.log("Registering new patient:", { patientId, ...validatedInput.data });

    // 3. Trigger the Orchestrator Agent with the initial data
    // This is where you would call the Genkit flow to start the analysis.
    // e.g., await orchestratorAgentFlow({ patientId, ...validatedInput.data });
    
    // Simulate a delay for the AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));


    return { success: true, patientId };
  } catch (error) {
    console.error("Error registering new patient:", error);
    return { success: false, error: "An unexpected error occurred while registering the patient. Please try again." };
  }
}
