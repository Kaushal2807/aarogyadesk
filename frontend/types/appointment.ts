export interface Appointment {
  id: number;
  clinic_id: number;
  patient_name: string;
  age?: number | null;
  contact_number?: string;
  address?: string;
  appointment_date: string;
  appointment_time: string;
  booking_type: 'walk-in' | 'call';
  status: 'pending' | 'completed';
  created_at: string;
}

export interface AppointmentCreate {
  patient_name: string;
  age?: number;
  contact_number?: string;
  address?: string;
  appointment_date: string;
  appointment_time: string;
  booking_type?: 'walk-in' | 'call';
}

export interface AppointmentUpdate {
  patient_name?: string;
  age?: number;
  contact_number?: string;
  address?: string;
  appointment_date?: string;
  appointment_time?: string;
  booking_type?: 'walk-in' | 'call';
}
