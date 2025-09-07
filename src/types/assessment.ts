// types/assessment.ts
export interface Symptom {
  name: string;
  severity: number; // e.g., 1-10
}

export interface RiskAssessment {
  suicidalIdeation: boolean;
  homicidalIdeation: boolean;
  selfHarm: boolean;
}

export interface SubstanceHistory {
  hasHistory: boolean;
  details?: string;
}

export interface MedicationHistory {
  current: string[];
  past: string[];
}

export interface FamilyHistory {
  hasHistory: boolean;
  details?: string;
}

export interface AssessmentData {
    symptoms?: Symptom[];
    riskAssessment?: RiskAssessment;
    substanceHistory?: SubstanceHistory;
    medicationHistory?: MedicationHistory;
    familyHistory?: FamilyHistory;
}
