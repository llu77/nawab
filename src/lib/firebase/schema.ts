
import type { Timestamp } from 'firebase/firestore';
import type { Symptom, RiskAssessment, SubstanceHistory, MedicationHistory, FamilyHistory } from '@/types/assessment';

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
    encryptedData: string;
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
    id: string;
    timestamp: Timestamp;
    userId: string;
    action: string;
    resource: {
        type: string;
        id: string;
    };
    ip?: string;
    userAgent?: string;
    result: 'success' | 'failure';
    severity: 'info' | 'warning' | 'critical';
    metadata?: Record<string, any>;
    signature: string;
}
