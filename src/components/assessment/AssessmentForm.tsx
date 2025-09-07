// components/assessment/AssessmentForm.tsx
import { useForm } from 'react-hook-form';
import type { AssessmentData } from '@/types/assessment';

interface AssessmentFormProps {
  onSubmit: (data: AssessmentData) => void;
  isProcessing: boolean;
}

export function AssessmentForm({ onSubmit, isProcessing }: AssessmentFormProps) {
  const { register, handleSubmit } = useForm<AssessmentData>();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4 bg-white shadow-md rounded-lg">
      <fieldset disabled={isProcessing} className="space-y-4">
        <legend className="text-lg font-semibold mb-4">Patient Assessment</legend>
        
        <div>
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700">Symptoms</label>
            <textarea
                id="symptoms"
                {...register('symptoms')}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter patient symptoms..."
                rows={4}
            />
        </div>

        <div>
            <label htmlFor="risk" className="block text-sm font-medium text-gray-700">Risk Factors</label>
            <textarea
                id="risk"
                {...register('riskAssessment')}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Describe any risk factors..."
                rows={3}
            />
        </div>

        <div className="flex justify-end">
            <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
            >
                {isProcessing ? 'Processing...' : 'Submit Assessment'}
            </button>
        </div>
      </fieldset>
    </form>
  );
}
