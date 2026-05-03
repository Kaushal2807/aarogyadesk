export interface Prescription {
  id: number;
  clinic_id: number;
  patient_uid: string;
  patient_name: string;
  prescription_date: string;
  created_at: string;
  items: PrescriptionItem[];
}

export interface PrescriptionItem {
  id: number;
  prescription_id: number;
  drug_id?: number;
  dose_id?: number;
  frequency_id?: number;
  duration_id?: number;
  quantity_id?: number;
  instruction?: string;
  drug_name?: string;
  dose_name?: string;
  frequency_name?: string;
  duration_name?: string;
  quantity_name?: string;
}

export interface PrescriptionItemCreate {
  drug_id?: number;
  dose_id?: number;
  frequency_id?: number;
  duration_id?: number;
  quantity_id?: number;
  instruction?: string;
}

export interface PrescriptionCreate {
  patient_uid: string;
  patient_name: string;
  prescription_date: string;
  items: PrescriptionItemCreate[];
}
