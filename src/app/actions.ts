
'use server';

import { orchestratorAgent, type OrchestratorInput } from "@/ai/flows/orchestrator-agent";

/**
 * A dedicated server action to bridge the client and the AI orchestrator.
 * This prevents the client from directly importing server-heavy modules.
 * @param input The data from the new patient assessment form.
 * @returns The result from the AI orchestrator.
 */
export async function runOrchestratorAction(input: OrchestratorInput) {
    try {
        const result = await orchestratorAgent(input);
        return result;
    } catch (error) {
        console.error("Error running orchestrator action:", error);
        // We can throw a more specific error or return a structured error object.
        throw new Error("Failed to execute the AI analysis orchestration.");
    }
}

    