
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';
import { generatePatientId } from '@/utils/id-generator';

export interface SearchResult {
    id: string;
    score: number | undefined;
    metadata: any;
    text: string;
}

export class RAGSystem {
  private pinecone: Pinecone;
  private openai: OpenAI;
  private indexes: Map<string, any>;

  constructor() {
    this.pinecone = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY!,
    });

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!
    });

    this.indexes = new Map();
    this.initializeIndexes();
  }

  private async initializeIndexes() {
    // In a real application, you would ensure these indexes exist or create them.
    // For now, we'll assume they are pre-created in Pinecone.
    this.indexes.set('dsm5', this.pinecone.index('dsm5-index'));
    this.indexes.set('fda', this.pinecone.index('fda-drugs-index'));
    this.indexes.set('pubmed', this.pinecone.index('pubmed-index'));
    this.indexes.set('cases', this.pinecone.index('patient-cases-index'));
  }

  async createEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });
    return response.data[0].embedding;
  }

  async search(
    query: string,
    indexName: string,
    topK: number = 10
  ): Promise<SearchResult[]> {
    const embedding = await this.createEmbedding(query);
    const index = this.indexes.get(indexName);

    if (!index) {
      throw new Error(`Index ${indexName} not found`);
    }

    const results = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
      includeValues: false
    });

    return results.matches.map((match: any) => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata,
      text: match.metadata?.text || ''
    }));
  }

  async addKnowledge(
    text: string,
    metadata: any,
    indexName: string
  ): Promise<void> {
    const embedding = await this.createEmbedding(text);
    const index = this.indexes.get(indexName);

    if (!index) {
        throw new Error(`Index ${indexName} not found for adding knowledge.`);
    }

    await index.upsert([{
      id: generatePatientId(), // Using a simple ID generator for now
      values: embedding,
      metadata: {
        text,
        ...metadata,
        timestamp: new Date().toISOString()
      }
    }]);
  }
}

// Example of a specialized RAG module
export class DSM5RAG extends RAGSystem {
  async findDiagnosis(symptoms: string[]): Promise<any[]> {
    const query = `Patient presenting with: ${symptoms.join(', ')}`;
    const results = await this.search(query, 'dsm5', 5);

    return results.map(r => ({
      diagnosis: r.metadata.diagnosis,
      code: r.metadata.dsm5Code,
      confidence: r.score,
      criteria: r.metadata.criteria,
      differentials: r.metadata.differentials
    }));
  }
}
