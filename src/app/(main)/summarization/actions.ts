
"use server";

import { generateSummary } from "@/ai/flows/ai-summary-generator";
import type { SummaryInput, SummaryOutput } from "@/ai/flows/schemas";

export async function createSummary(input: SummaryInput): Promise<{success: true, data: SummaryOutput} | {success: false, error: string}> {
  try {
    const result = await generateSummary(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating summary:", error);
    return { success: false, error: "An unexpected error occurred while generating the summary. Please try again." };
  }
}
