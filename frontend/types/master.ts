export interface MasterItem {
  id: number;
  name: string;
  created_at?: string;
}

export interface MasterDiagnosis {
  id: number;
  clinic_id: number;
  diagnosis_name: string;
  description?: string;
  created_at: string;
}

export interface MasterTreatment {
  id: number;
  clinic_id: number;
  treatment_name: string;
  description?: string;
  created_at: string;
}
