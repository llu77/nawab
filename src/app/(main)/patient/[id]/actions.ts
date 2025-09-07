
"use server";

import { initializeFirebase } from "@/lib/firebase";
import { getFirestore, updateDoc, doc } from "firebase-admin/firestore";
import { performIntegratedAnalysis } from "@/ai/flows/integrated-analysis";
import type { OrchestratorOutput, IntegratedAnalysisOutput } from "@/ai/flows/schemas";

initializeFirebase();
const db = getFirestore();

export async function getPatientData(patientId: string): Promise<{success: true, data: any} | {success: false, error: string}> {
  if (!patientId) {
    return { success: false, error: "Patient ID is required." };
  }
  
  try {
    const patientDocRef = db.collection('patients').doc(patientId);
    const docSnap = await patientDocRef.get();

    if (!docSnap.exists) {
      return { success: false, error: "No patient found with the provided ID." };
    }
    
    const patientData = {
        id: docSnap.id,
        ...docSnap.data()
    };
    
    return { success: true, data: patientData };
  } catch (error) {
    console.error("Error fetching patient data from Firestore:", error);
    return { success: false, error: "An unexpected error occurred while fetching patient data. Please check server logs." };
  }
}

export async function runIntegratedAnalysis(
  patientId: string, 
  initialAnalysis: OrchestratorOutput
): Promise<{ success: true, data: IntegratedAnalysisOutput } | { success: false, error: string }> {
  if (!patientId || !initialAnalysis) {
    return { success: false, error: "Patient ID and initial analysis data are required." };
  }
  
  const patientDocRef = doc(db, 'patients', patientId);

  try {
    // 1. Set status to 'processing'
    await updateDoc(patientDocRef, { integratedAnalysisStatus: 'processing' });

    // 2. Run the analysis flow
    const result = await performIntegratedAnalysis({ patientId, initialAnalysis });

    // 3. Save the results and update status to 'completed'
    await updateDoc(patientDocRef, {
      integratedAnalysis: result,
      integratedAnalysisStatus: 'completed'
    });
    
    return { success: true, data: result };

  } catch (error) {
    console.error("Error running integrated analysis for patient:", patientId, error);
    
    // 4. Update status to 'failed' in case of an error
    await updateDoc(patientDocRef, { 
      integratedAnalysisStatus: 'failed',
      'processingErrors': { 
        model: 'integratedAnalysis', 
        error: error instanceof Error ? error.message : "An unknown error occurred"
       }
    });

    return { success: false, error: "An unexpected error occurred during the integrated analysis. Please try again." };
  }
}
