
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase/config";
import { encryptionService } from "@/lib/encryption/service";
// Note: setCustomUserClaims requires an admin environment (Firebase Functions),
// so we'll simulate this and note it for backend implementation.

interface DoctorProfile {
    name: string;
    clinicId: string;
    specialization: string;
    [key: string]: any;
}


export class AuthService {
  /**
   * Registers a new doctor, sets their custom claims, and saves their profile to Firestore.
   * NOTE: Setting custom claims must be done from a trusted server environment (e.g., Firebase Functions).
   * This client-side code assumes a corresponding backend function will be called to set claims.
   */
  async registerDoctor(email: string, password: string, profile: DoctorProfile) {
    // 1. Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Update the user's display name in Firebase Auth
    await updateProfile(user, { displayName: profile.name });

    // 3. Encrypt sensitive profile data before saving
    const { name, clinicId, specialization, ...sensitiveData } = profile;
    const encryptedProfile = encryptionService.encrypt(sensitiveData);

    // 4. Save the doctor's profile to Firestore
    await setDoc(doc(db, 'doctors', user.uid), {
      email: user.email,
      name: profile.name,
      clinicId: profile.clinicId,
      specialization: profile.specialization,
      encryptedData: encryptedProfile,
      createdAt: serverTimestamp(),
      roles: ['doctor'] // Assign role in Firestore document
    });

    // 5. **IMPORTANT**: Trigger a backend function to set custom claims
    // This cannot be done from the client.
    console.log(`User ${user.uid} created. A backend function must be triggered to set custom claims for role-based access.`);
    // Example of a function call that would need to be implemented:
    // await callFirebaseFunction('setDoctorClaims', { userId: user.uid, clinicId: profile.clinicId });
    
    return userCredential;
  }

  /**
   * Placeholder for setting up Multi-Factor Authentication.
   * This would typically involve using the Firebase Auth SDK to guide the user
   * through enrolling a second factor.
   */
  async setupMFA(userId: string) {
    console.log(`Setting up MFA for user ${userId}. This requires further implementation using the Firebase Auth SDK for multi-factor authentication.`);
    // Implementation would involve functions like `multiFactor(auth.currentUser).enroll()`
  }
}

export const authService = new AuthService();
