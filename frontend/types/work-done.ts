export interface WorkDone {
  id: number;
  clinic_id: number;
  work_name: string;
  created_at: string;
}

export interface WorkDoneCreate {
  work_name: string;
}

export interface WorkDoneUpdate {
  work_name: string;
}

export interface PatientWorkDone {
  id: number;
  clinic_id: number;
  patient_uid: string;
  patient_name: string;
  work_done_id?: number;
  description?: string;
  work_date?: string;
  created_at: string;
  work_name?: string;
}

export interface PatientWorkDoneCreate {
  patient_uid: string;
  patient_name: string;
  work_done_id?: number;
  description?: string;
  work_date?: string;
}

export interface PatientWorkDoneUpdate {
  patient_uid?: string;
  patient_name?: string;
  work_done_id?: number;
  description?: string;
  work_date?: string;
}
