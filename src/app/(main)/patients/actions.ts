"use server";

import { initializeFirebase } from "@/lib/firebase";
import { getFirestore } from "firebase-admin/firestore";

initializeFirebase();
const db = getFirestore();

export async function getPatients(): Promise<{success: true, data: any[]} | {success: false, error: string}> {
  try {
    const patientsCollection = db.collection('patients');
    const snapshot = await patientsCollection.orderBy('registrationDate', 'desc').get();

    if (snapshot.empty) {
      return { success: true, data: [] };
    }

    const patientsData = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, data: patientsData };
  } catch (error) {
    console.error("Error fetching patients data from Firestore:", error);
    return { success: false, error: "An unexpected error occurred while fetching patients data. Please check server logs." };
  }
}
