export interface Clinic {
  clinic_id: number;
  clinic_name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status: string;
  current_subscription_end?: string;
  created_at: string;
}

export interface ClinicDoctor {
  id: number;
  clinic_id: number;
  doctor_name: string;
  doctor_position?: string;
  created_at: string;
}

export interface ClinicCreate {
  clinic_name: string;
  clinic_code: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status?: string;
}

export interface ClinicUpdate {
  clinic_name?: string;
  clinic_code?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  status?: string;
  current_subscription_end?: string;
}
