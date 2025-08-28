"use server";

import { generateSummary, type SummaryInput, type SummaryOutput } from "@/ai/flows/ai-summary-generator";

export async function createSummary(input: SummaryInput): Promise<{success: true, data: SummaryOutput} | {success: false, error: string}> {
  try {
    const result = await generateSummary(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating summary:", error);
    return { success: false, error: "An unexpected error occurred while generating the summary. Please try again." };
  }
}
