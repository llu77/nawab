
"use server";

import { initializeFirebase } from "@/lib/firebase";
import { getFirestore } from "firebase-admin/firestore";

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
