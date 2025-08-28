"use server";

import { getAlternativeMedications, type AlternativeMedicationsInput, type AlternativeMedicationsOutput } from "@/ai/flows/medication-alternatives";

export async function suggestAlternatives(input: AlternativeMedicationsInput): Promise<{success: true, data: AlternativeMedicationsOutput} | {success: false, error: string}> {
  try {
    const result = await getAlternativeMedications(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting medication alternatives:", error);
    return { success: false, error: "An unexpected error occurred while processing your request. Please try again." };
  }
}
