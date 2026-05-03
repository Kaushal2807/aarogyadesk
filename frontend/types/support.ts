export interface SupportCreate {
  person_name: string;
  subject: string;
  message: string;
}

export interface Support {
  id: number;
  clinic_id: number;
  clinic_name?: string;
  person_name: string;
  email?: string;
  phone?: string;
  subject: string;
  message: string;
  status: number;
  resolved_at?: string;
  created_at: string;
}
