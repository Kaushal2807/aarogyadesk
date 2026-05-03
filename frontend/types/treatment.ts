export interface TreatmentPlan {
  id: number;
  clinic_id: number;
  diagnosis: string;
  treatment: string;
  created_at: string;
}

export interface TreatmentPlanCreate {
  diagnosis: string;
  treatment: string;
}

export interface PatientTreatment {
  id: number;
  clinic_id: number;
  patient_uid: string;
  patient_name: string;
  tooth_upper_right?: string;
  tooth_upper_left?: string;
  tooth_lower_right?: string;
  tooth_lower_left?: string;
  diagnosis_id?: number;
  treatment_id?: number;
  estimates?: string;
  remarks?: string;
  created_at: string;
  diagnosis?: string;
  treatment?: string;
}

export interface PatientTreatmentCreate {
  patient_uid: string;
  patient_name: string;
  tooth_upper_right?: string;
  tooth_upper_left?: string;
  tooth_lower_right?: string;
  tooth_lower_left?: string;
  diagnosis?: string;
  treatment?: string;
  diagnosis_id?: number;
  treatment_id?: number;
  estimates?: string;
  remarks?: string;
}

export interface PatientTreatmentUpdate {
  patient_uid?: string;
  patient_name?: string;
  tooth_upper_right?: string;
  tooth_upper_left?: string;
  tooth_lower_right?: string;
  tooth_lower_left?: string;
  diagnosis_id?: number;
  treatment_id?: number;
  estimates?: string;
  remarks?: string;
}
