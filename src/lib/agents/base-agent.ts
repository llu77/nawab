
import { Anthropic } from '@anthropic-ai/sdk';
import { EventEmitter } from 'events';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

// Define core types for agents
export type AgentState = 'idle' | 'processing' | 'error' | 'success';
export interface AgentInput {
  patientId: string;
  data: any;
  [key: string]: any;
}
export interface AgentOutput {
  success: boolean;
  data: any;
  error?: string;
  metadata?: Record<string, any>;
}
export interface AgentConfig {
  name: string;
  model: string;
  memorySize?: number;
}
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Memory System for Agents
export class AgentMemory {
  private shortTermMemory: Message[];
  private longTermMemory: Map<string, any>;
  private maxSize: number;

  constructor(maxSize: number = 10) {
    this.shortTermMemory = [];
    this.longTermMemory = new Map();
    this.maxSize = maxSize;
  }

  add(message: Message): void {
    this.shortTermMemory.push(message);
    if (this.shortTermMemory.length > this.maxSize) {
      this.shortTermMemory.shift();
    }
  }

  getContext(): Message[] {
    return this.shortTermMemory;
  }

  remember(key: string, value: any): void {
    this.longTermMemory.set(key, value);
  }

  recall(key: string): any {
    return this.longTermMemory.get(key);
  }

  serialize(): string {
    return JSON.stringify({
      shortTerm: this.shortTermMemory,
      longTerm: Array.from(this.longTermMemory.entries())
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.shortTermMemory = parsed.shortTerm;
    this.longTermMemory = new Map(parsed.longTerm);
  }
}

// Base Agent Class
export abstract class BaseAgent extends EventEmitter {
  public name: string;
  protected model: string;
  protected claude: Anthropic;
  protected memory: AgentMemory;
  protected state: AgentState;

  constructor(config: AgentConfig) {
    super();
    this.name = config.name;
    this.model = config.model;
    this.claude = new Anthropic({ apiKey: process.env.CLAUDE_API_KEY });
    this.memory = new AgentMemory(config.memorySize || 10);
    this.state = 'idle';
  }

  abstract execute(input: AgentInput): Promise<AgentOutput>;
  abstract validateInput(input: any): ValidationResult;
  abstract getCapabilities(): string[];

  protected async callClaude(prompt: string, systemPrompt?: string): Promise<string> {
    const response = await this.claude.messages.create({
      model: this.model,
      max_tokens: 4096,
      temperature: 0.2,
      system: systemPrompt || this.getSystemPrompt(),
      messages: [
        ...this.memory.getContext(),
        { role: 'user', content: prompt }
      ]
    });

    const result = response.content[0].text;
    this.memory.add({ role: 'assistant', content: result });

    return result;
  }

  protected abstract getSystemPrompt(): string;

  async saveState(): Promise<void> {
    await setDoc(doc(db, 'agent_states', this.name), {
      name: this.name,
      state: this.state,
      memory: this.memory.serialize(),
      timestamp: serverTimestamp()
    });
  }

  async loadState(): Promise<void> {
    const agentStateDoc = await getDoc(doc(db, 'agent_states', this.name));
    if (agentStateDoc.exists()) {
      const data = agentStateDoc.data();
      this.state = data.state;
      this.memory.deserialize(data.memory);
    }
  }
}
