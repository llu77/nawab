
import type { Timestamp } from 'firebase/firestore';
import type { Symptom, RiskAssessment, SubstanceHistory, MedicationHistory, FamilyHistory } from '@/types/assessment';
import { AuditAction, AuditSeverity } from '../audit/logger';

export const collections = {
  patients: 'patients',
  assessments: 'assessments',
  diagnoses: 'diagnoses',
  medications: 'medications',
  modelResults: 'model_results',
  auditLog: 'audit_log',
  doctors: 'doctors',
  sessions: 'sessions',
};

// Firestore interfaces
export interface PatientDocument {
  id: string;
  uniqueId: string; // XX-###
  demographics: {
    age: number;
    gender: 'male' | 'female';
    name?: string;
  };
  createdAt: Timestamp;
  createdBy: string; // User ID of the doctor
  encryptedData?: string; // Sensitive data encrypted
}

export interface AssessmentDocument {
  id: string;
  patientId: string;
  symptoms: Symptom[];
  riskAssessment: RiskAssessment;
  substanceHistory: SubstanceHistory;
  medications: MedicationHistory;
  familyHistory: FamilyHistory;
  timestamp: Timestamp;
  status: 'pending' | 'processing' | 'completed';
}

export interface DoctorDocument {
    uid: string;
    email: string;
    name: string;
    clinicId: string;
    specialization: string;
    encryptedData: string; // Encrypted sensitive details
    roles: ('doctor' | 'admin')[];
    createdAt: Timestamp;
}

export interface SessionDocument {
    userId: string;
    deviceInfo: {
        userAgent?: string;
        ipAddress?: string;
    };
    createdAt: Timestamp;
    expiresAt: Timestamp;
    isActive: boolean;
}

export interface AuditLogDocument {
    id: string; // Unique log entry ID
    timestamp: Timestamp;
    userId: string; // User who performed the action
    action: AuditAction;
    resource: {
        type: 'patient' | 'assessment' | 'system' | 'user_account';
        id: string; // ID of the affected resource
    };
    ip?: string;
    userAgent?: string;
    result: 'success' | 'failure';
    severity: AuditSeverity;
    metadata?: Record<string, any>;
    signature: string; // HMAC signature to ensure integrity
}
