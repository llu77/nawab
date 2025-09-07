// app/(dashboard)/assessment/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generatePatientId } from '@/utils/id-generator';
import { AssessmentForm } from '@/components/assessment/AssessmentForm';
import type { AssessmentData, ModelStatus } from '@/types/assessment';

// Placeholder for a function that would save data to the backend
async function saveAssessment(patientId: string, data: AssessmentData): Promise<void> {
  console.log(`Saving assessment for patient ${patientId}:`, data);
  // In a real app, this would be an API call or server action
  await new Promise(resolve => setTimeout(resolve, 500));
}

// Placeholder for the AI model processing logic
class ModelProcessor {
  async processParallel(
    patientId: string, 
    data: AssessmentData, 
    onStatusUpdate: (status: ModelStatus) => void
  ): Promise<any> {
    console.log(`Starting AI processing for patient ${patientId}`);
    
    // Simulate model processing steps
    onStatusUpdate({ diagnosis: 'running', risk: 'pending', summary: 'pending' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onStatusUpdate({ diagnosis: 'completed', risk: 'running', summary: 'pending' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onStatusUpdate({ diagnosis: 'completed', risk: 'completed', summary: 'running' });
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onStatusUpdate({ diagnosis: 'completed', risk: 'completed', summary: 'completed' });
    console.log(`Finished AI processing for patient ${patientId}`);
    
    return { success: true };
  }
}

// Placeholder component for the header
function AssessmentHeader({ patientId }: { patientId: string }) {
    return (
        <div className="p-4 bg-white shadow-md mb-4 rounded-lg">
            <h1 className="text-2xl font-bold">Comprehensive Assessment</h1>
            <p className="text-gray-500">Patient ID: <span className="font-mono bg-gray-100 p-1 rounded">{patientId || 'Generating...'}</span></p>
        </div>
    );
}

// Placeholder component for the processing status
function ModelProcessingStatus({ status }: { status: ModelStatus }) {
    return (
        <div className="p-4 bg-blue-100 border-l-4 border-blue-500 text-blue-700 rounded-lg mt-4">
            <h2 className="font-bold mb-2">AI Models Processing...</h2>
            <ul className="list-disc pl-5">
                {Object.entries(status).map(([model, modelStatus]) => (
                    <li key={model}>
                       <span className="capitalize">{model}:</span> <span className={`font-semibold ${modelStatus === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{modelStatus}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}


export default function AssessmentPage() {
  const [patientId, setPatientId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>({});
  const router = useRouter();
  
  useEffect(() => {
    // Generate a unique ID when the page loads
    setPatientId(generatePatientId());
  }, []);
  
  const handleSubmit = async (data: AssessmentData) => {
    setIsProcessing(true);
    setModelStatus({});
    
    try {
      // 1. Save the assessment data
      await saveAssessment(patientId, data);
      
      // 2. Run the AI models
      const processor = new ModelProcessor();
      const results = await processor.processParallel(patientId, data, (status) => {
        // Use a callback to update the status in real-time
        setModelStatus(prev => ({...prev, ...status}));
      });
      
      // 3. Navigate to the results page (faking it for now)
      console.log(`Redirecting to results for patient ${patientId}`);
      alert(`Assessment complete! You would now be redirected to the results page for patient ${patientId}.`);
      // router.push(`/patients/${patientId}/results`);
      
    } catch (error) {
      console.error('Error processing assessment:', error);
      alert('An error occurred while processing the assessment. Check the console for details.');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <AssessmentHeader patientId={patientId} />
        <AssessmentForm 
          onSubmit={handleSubmit}
          isProcessing={isProcessing}
        />
        {isProcessing && <ModelProcessingStatus status={modelStatus} />}
      </div>
    </div>
  );
}
