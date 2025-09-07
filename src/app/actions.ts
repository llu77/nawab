'use server';

import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";
import { OrchestratorInputSchema, type OrchestratorInput } from "@/ai/flows/schemas";

/**
 * A dedicated server action to bridge the client and the AI orchestrator.
 * This prevents the client from directly importing server-heavy modules.
 * @param input The data from the new patient assessment form.
 * @returns The result from the AI orchestrator.
 */
export async function runOrchestratorAction(input: OrchestratorInput) {
    try {
        // Validate input on the server side to ensure data integrity
        const validatedInput = OrchestratorInputSchema.parse(input);

        console.log("Server Action: Running orchestrator with validated input:", validatedInput);
        const result = await orchestratorAgent(validatedInput);
        console.log("Server Action: Orchestrator completed with result:", result);
        
        // Ensure the result is a plain object for serialization
        return JSON.parse(JSON.stringify(result));
    } catch (error) {
        console.error("Error running orchestrator action:", error);
        // Propagate a more informative error to the client
        if (error instanceof Error) {
            throw new Error(`Failed to execute AI analysis: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI analysis orchestration.");
    }
}
