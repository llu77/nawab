
import { doc, getDoc, setDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateSecureToken } from "@/utils/helpers"; 

interface DeviceInfo {
    userAgent?: string;
    ipAddress?: string;
}

export class SessionManager {
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Creates a new session for a user and returns the session token.
   * This should be called upon successful login.
   */
  async createSession(userId: string, deviceInfo: DeviceInfo): Promise<string> {
    const sessionToken = generateSecureToken();
    const expiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_MS);

    await setDoc(doc(db, 'sessions', sessionToken), {
      userId,
      deviceInfo,
      createdAt: serverTimestamp(),
      expiresAt,
      isActive: true
    });

    return sessionToken;
  }

  /**
   * Refreshes the session's expiration time.
   */
  private async refreshSession(token: string): Promise<void> {
      const newExpiresAt = new Date(Date.now() + this.SESSION_TIMEOUT_MS);
      await updateDoc(doc(db, 'sessions', token), {
          expiresAt: newExpiresAt
      });
  }
  
  /**
   * Terminates a session by marking it as inactive (e.g., on logout).
   */
  async terminateSession(token: string): Promise<void> {
      await updateDoc(doc(db, 'sessions', token), {
          isActive: false
      });
  }

  /**
   * Validates a session token. Returns true if valid, false otherwise.
   * This would be used in middleware or at the start of protected API calls.
   */
  async validateSession(token: string): Promise<boolean> {
    const sessionRef = doc(db, 'sessions', token);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      console.warn(`Session validation failed: Token ${token} not found.`);
      return false;
    }

    const data = sessionSnap.data();
    
    if (!data.isActive) {
        console.warn(`Session validation failed: Token ${token} is inactive.`);
        return false;
    }

    if (data.expiresAt.toDate() < new Date()) {
      console.warn(`Session validation failed: Token ${token} has expired.`);
      await this.terminateSession(token); // Clean up expired session
      return false;
    }

    // If the session is valid, refresh it to extend the user's activity window
    await this.refreshSession(token);
    return true;
  }
}

export const sessionManager = new SessionManager();
