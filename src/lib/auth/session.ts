
import { doc, getDoc, setDoc, serverTimestamp, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateSecureToken } from "@/utils/helpers"; // Assuming this helper exists

interface DeviceInfo {
    userAgent?: string;
    ipAddress?: string;
}

export class SessionManager {
  private readonly SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

  /**
   * Creates a new session for a user and returns the session token.
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
   * Terminates a session by marking it as inactive.
   */
  async terminateSession(token: string): Promise<void> {
      await updateDoc(doc(db, 'sessions', token), {
          isActive: false
      });
  }

  /**
   * Validates a session token. Returns true if valid, false otherwise.
   */
  async validateSession(token: string): Promise<boolean> {
    const sessionRef = doc(db, 'sessions', token);
    const sessionSnap = await getDoc(sessionRef);

    if (!sessionSnap.exists()) {
      return false;
    }

    const data = sessionSnap.data();
    
    if (!data.isActive) {
        return false;
    }

    if (data.expiresAt.toDate() < new Date()) {
      await this.terminateSession(token);
      return false;
    }

    // If the session is valid, refresh it
    await this.refreshSession(token);
    return true;
  }
}

export const sessionManager = new SessionManager();
