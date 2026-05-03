export type UserRole = 'admin' | 'clinic';

export interface User {
  id: number;
  name: string;
  email: string;
  user_type: UserRole;
  clinic_id?: number;
  status: 'Active' | 'Inactive';
  login_status?: string;
  created_at: string;
}

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  user_type?: UserRole;
  clinic_id?: number;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  user_type?: UserRole;
  clinic_id?: number;
  status?: 'Active' | 'Inactive';
  password?: string;
}
