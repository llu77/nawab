"use server";

import { diagnosePatient } from "@/ai/flows/diagnosis-assistant";
import type { DiagnosePatientInput, DiagnosePatientOutput } from "@/ai/flows/schemas";


export async function getDiagnosis(input: DiagnosePatientInput): Promise<{success: true, data: DiagnosePatientOutput} | {success: false, error: string}> {
  try {
    const result = await diagnosePatient(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting diagnosis:", error);
    return { success: false, error: "An unexpected error occurred while processing the diagnosis. Please try again." };
  }
}
