
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

// This is a server-side rate limiter. It should be used in API routes or Firebase Functions.
// The in-memory `attempts` map is not suitable for a stateless/serverless environment.
// A Firestore-based implementation is provided as a more robust alternative.

interface RateLimitInfo {
    attempts: number;
    firstAttempt: Date;
}

export class RateLimiter {
  
  /**
   * A more robust, Firestore-based rate limiter suitable for serverless environments.
   * @param identifier - A unique string for the user/IP, e.g., `login_attempt_${ipAddress}`.
   * @param maxAttempts - The max number of attempts allowed.
   * @param windowMinutes - The time window in minutes.
   * @returns `true` if the request is allowed, `false` if it is rate-limited.
   */
  async checkLimit(
    identifier: string, 
    maxAttempts: number = 5, 
    windowMinutes: number = 15
  ): Promise<boolean> {
    const now = new Date();
    const windowMs = windowMinutes * 60 * 1000;
    const rateLimitRef = doc(db, 'rateLimits', identifier);
    const docSnap = await getDoc(rateLimitRef);

    if (!docSnap.exists()) {
      // First attempt
      await setDoc(rateLimitRef, { attempts: 1, firstAttempt: now });
      return true;
    }

    const data = docSnap.data();
    const firstAttemptTime = data.firstAttempt.toDate();

    if (now.getTime() - firstAttemptTime.getTime() > windowMs) {
      // Window has expired, reset
      await setDoc(rateLimitRef, { attempts: 1, firstAttempt: now });
      return true;
    }

    if (data.attempts >= maxAttempts) {
      // Limit exceeded
      console.warn(`Rate limit exceeded for identifier: ${identifier}`);
      return false;
    }

    // Increment attempts
    await setDoc(rateLimitRef, { attempts: data.attempts + 1 }, { merge: true });
    return true;
  }
  
  /**
   * Placeholder for a more permanent blocking mechanism.
   */
  async blockUser(identifier: string): Promise<void> {
    console.error(`Blocking user/IP with identifier: ${identifier}. Requires a more permanent solution like a firewall rule.`);
    // In a real application, this would add the user's IP to a blocklist in a firewall
    // or update a 'blocked' flag on their user document.
  }
}

export const rateLimiter = new RateLimiter();
