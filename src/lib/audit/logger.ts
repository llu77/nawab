
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generateSecureToken } from "@/utils/helpers";
import CryptoJS from 'crypto-js';

// In a real application, the secret key would be managed securely (e.g., Google Secret Manager)
// and not hardcoded.
const HMAC_SECRET_KEY = process.env.AUDIT_HMAC_KEY || 'default-hmac-secret-for-development';

export type AuditAction = 
    | 'login_success' | 'login_failure' 
    | 'logout' 
    | 'patient_created' | 'patient_viewed' | 'patient_updated'
    | 'assessment_started' | 'assessment_completed'
    | 'report_generated' | 'report_viewed'
    | 'security_config_changed'
    | 'critical_system_error';

export type AuditSeverity = 'info' | 'warning' | 'critical';

export interface AuditEvent {
    userId: string; // The user performing the action
    action: AuditAction;
    resource: {
        type: 'patient' | 'assessment' | 'system' | 'user_account';
        id: string; // ID of the affected resource
    };
    ip?: string;
    userAgent?: string;
    result: 'success' | 'failure';
    severity: AuditSeverity;
    metadata?: Record<string, any>; // For extra context
}

export class AuditLogger {
  
  /**
   * Generates a HMAC-SHA256 signature for the event to ensure log integrity.
   */
  private generateSignature(event: Omit<AuditEvent, 'id' | 'timestamp' | 'signature'>): string {
    const eventString = JSON.stringify(event);
    return CryptoJS.HmacSHA256(eventString, HMAC_SECRET_KEY).toString();
  }

  /**
   * Placeholder for alerting a security/operations team on critical events.
   */
  private async alertSecurityTeam(logEntry: any): Promise<void> {
      console.error("🚨 CRITICAL AUDIT EVENT 🚨:", JSON.stringify(logEntry, null, 2));
      // This would integrate with a real alerting service (e.g., PagerDuty, SendGrid, Opsgenie)
      // For example: await sendAlertToPagerDuty('Critical Security Event in NAWAB-AI', logEntry);
  }
  
  /**
   * Logs an audit event to the 'audit_log' collection in Firestore.
   */
  async log(event: AuditEvent): Promise<void> {
    const logId = generateSecureToken(16); // Generate a unique ID for the log entry
    
    const logEntry = {
      ...event,
      id: logId,
      timestamp: serverTimestamp(),
      signature: this.generateSignature(event) // Sign the event to prevent tampering
    };

    try {
      await setDoc(doc(db, 'audit_log', logId), logEntry);

      if (event.severity === 'critical') {
        await this.alertSecurityTeam(logEntry);
      }
    } catch (error) {
        console.error("FATAL: Failed to write to audit log. This is a critical failure.", error);
        // Fallback logging mechanism or critical alert
        await this.alertSecurityTeam({
            action: 'critical_system_error',
            result: 'failure',
            severity: 'critical',
            metadata: {
                error: "Failed to write to primary audit log",
                originalEvent: event,
            }
        });
    }
  }
}

export const auditLogger = new AuditLogger();
