
'use server';

import { orchestratorAgent } from "@/ai/flows/orchestrator-agent";
import { generateSummary } from "@/ai/flows/ai-summary-generator";
import { performIntegratedAnalysis } from "@/ai/flows/integrated-analysis";
import { 
    OrchestratorInputSchema, 
    SummaryInputSchema,
    IntegratedAnalysisInputSchema, 
    type OrchestratorInput, 
    type SummaryInput,
    type IntegratedAnalysisInput
} from "@/ai/flows/schemas";

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


/**
 * Server action to run the AI summary generator.
 * @param input The session notes and patient data.
 * @returns The generated summary.
 */
export async function runSummaryAction(input: SummaryInput) {
    try {
        const validatedInput = SummaryInputSchema.parse(input);
        console.log("Server Action: Running summary generator with validated input:", validatedInput);
        const result = await generateSummary(validatedInput);
        console.log("Server Action: Summary generator completed with result:", result);
        return JSON.parse(JSON.stringify(result));
    } catch (error) {
        console.error("Error running summary action:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to execute AI summary generation: ${error.message}`);
        }
        throw new Error("An unknown error occurred during AI summary generation.");
    }
}


/**
 * Server action to run the integrated analysis flow.
 */
export async function runIntegratedAnalysisAction(input: IntegratedAnalysisInput) {
    try {
        const validatedInput = IntegratedAnalysisInputSchema.parse(input);
        console.log("Server Action: Running integrated analysis with validated input:", validatedInput);
        const result = await performIntegratedAnalysis(validatedInput);
        console.log("Server Action: Integrated analysis completed with result:", result);
        return JSON.parse(JSON.stringify(result));
    } catch (error) {
        console.error("Error running integrated analysis action:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to execute integrated analysis: ${error.message}`);
        }
        throw new Error("An unknown error occurred during integrated analysis.");
    }
}

