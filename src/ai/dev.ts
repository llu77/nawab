import { config } from 'dotenv';
config();

import '@/ai/flows/relapse-prediction.ts';
import '@/ai/flows/medication-alternatives.ts';
import '@/ai/flows/diagnosis-assistant.ts';
import '@/ai/flows/ai-summary-generator.ts';
import '@/ai/flows/orchestrator-agent.ts';
