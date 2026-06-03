export interface Patient {
  id: number;
  clinic_id: number;
  patient_uid: string;
  name: string;
  age?: number | null;
  contact_number?: string;
  address?: string;
  date_of_visit?: string | null;
  total_visit: number;
  notes?: string;
  total_amount: number;
  payment_status: 'paid' | 'pending';
  payment_pending: number;
  chief_complain?: string;
  medical_history?: string;
  oral_diet_habit?: string;
  family_history?: string;
  xray_remark?: string;
  created_at: string;
}

export interface PatientCreate {
  name: string;
  age?: number;
  contact_number?: string;
  address?: string;
  date_of_visit?: string;
  notes?: string;
  total_amount?: number;
  payment_status?: 'paid' | 'pending';
  payment_pending?: number;
  chief_complain?: string;
  medical_history?: string;
  oral_diet_habit?: string;
  family_history?: string;
  xray_remark?: string;
}

export interface PatientUpdate {
  name?: string;
  age?: number;
  contact_number?: string;
  address?: string;
  date_of_visit?: string;
  total_visit?: number;
  notes?: string;
  total_amount?: number;
  payment_status?: 'paid' | 'pending';
  payment_pending?: number;
  chief_complain?: string;
  medical_history?: string;
  oral_diet_habit?: string;
  family_history?: string;
  xray_remark?: string;
}

export interface PatientCount {
  total: number;
  paid: number;
  partial: number;
  pending: number;
}
