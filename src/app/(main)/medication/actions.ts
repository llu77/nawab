
"use server";

import { getMedicationAnalysis, type MedicationAnalysisInput, type MedicationAnalysisOutput } from "@/ai/flows/medication-alternatives";

export async function suggestAlternatives(input: MedicationAnalysisInput): Promise<{success: true, data: MedicationAnalysisOutput} | {success: false, error: string}> {
  try {
    const result = await getMedicationAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting medication alternatives:", error);
    return { success: false, error: "An unexpected error occurred while processing your request. Please try again." };
  }
}
