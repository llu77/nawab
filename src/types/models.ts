// types/models.ts
export interface ModelStatus {
    [key: string]: 'pending' | 'running' | 'completed' | 'failed';
}

export interface ModelResult {
    modelName: string;
    output: any;
    confidenceScore?: number;
    timestamp: Date;
}
