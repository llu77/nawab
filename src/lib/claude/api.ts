// lib/claude/api.ts
import { Anthropic } from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY,
});

// Example function
export async function getClaudeResponse(prompt: string) {
  // Claude API logic will go here
  return { response: 'This is a placeholder response from Claude API.' };
}
