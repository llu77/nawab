"use server";

import { predictRelapseProbability, type RelapsePredictionInput, type RelapsePredictionOutput } from "@/ai/flows/relapse-prediction";

export async function getRelapsePrediction(input: RelapsePredictionInput): Promise<{success: true, data: RelapsePredictionOutput} | {success: false, error: string}> {
  try {
    const result = await predictRelapseProbability(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error getting relapse prediction:", error);
    return { success: false, error: "An unexpected error occurred while processing the prediction. Please try again." };
  }
}
