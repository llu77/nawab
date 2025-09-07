
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { generatePatientId } from "@/utils/id-generator"; // Using this for a unique log ID
import CryptoJS from 'crypto-js';

export interface AuditEvent {
    userId: string;
    action: 'login' | 'logout' | 'create_patient' | 'view_patient' | 'update_assessment' | 'critical_failure';
    resource: {
        type: 'patient' | 'assessment' | 'system';
        id: string;
    };
    ip?: string;
    userAgent?: string;
    result: 'success' | 'failure';
    severity: 'info' | 'warning' | 'critical';
    metadata?: Record<string, any>;
}

export class AuditLogger {
  
  /**
   * Generates a SHA256 signature for the event to ensure log integrity.
   * This should use a private key from a secure environment in a real application.
   */
  private generateSignature(event: AuditEvent): string {
    const eventString = JSON.stringify(event);
    // In a real implementation, this would use a private key (e.g., HMAC-SHA256).
    // Using a simple hash here for demonstration.
    return CryptoJS.SHA256(eventString).toString();
  }

  /**
   * Placeholder for alerting the security team on critical events.
   */
  private async alertSecurityTeam(logEntry: any): Promise<void> {
      console.error("CRITICAL AUDIT EVENT:", logEntry);
      // This would integrate with a real alerting service (e.g., PagerDuty, SendGrid, etc.)
  }
  
  /**
   * Logs an audit event to the 'audit_log' collection in Firestore.
   */
  async log(event: AuditEvent): Promise<void> {
    const logEntry = {
      ...event,
      id: generatePatientId(), // Generate a unique ID for the log entry
      timestamp: serverTimestamp(),
      signature: this.generateSignature(event) // Sign the event
    };

    try {
      await addDoc(collection(db, 'audit_log'), logEntry);

      if (event.severity === 'critical') {
        await this.alertSecurityTeam(logEntry);
      }
    } catch (error) {
        console.error("Failed to write to audit log:", error);
        // Fallback logging mechanism or critical alert
        await this.alertSecurityTeam({
            ...event,
            action: 'critical_failure',
            result: 'failure',
            metadata: {
                error: "Failed to write to audit log",
                originalEvent: event,
            }
        });
    }
  }
}

export const auditLogger = new AuditLogger();
