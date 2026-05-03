export interface Medicine {
  id: number;
  clinic_id: number;
  name: string;
  quantity: number;
  threshold_level: number;
  notes?: string;
  created_at: string;
}

export interface MedicineCreate {
  name: string;
  quantity?: number;
  threshold_level?: number;
  notes?: string;
}

export interface MedicineUpdate {
  name?: string;
  quantity?: number;
  threshold_level?: number;
  notes?: string;
}
