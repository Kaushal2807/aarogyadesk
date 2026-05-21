import apiClient from '@/lib/api';

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

export const masterTreatmentService = {
  // Diagnosis endpoints
  getDiagnoses: async (): Promise<MasterDiagnosis[]> => {
    const { data } = await apiClient.get('/master-diagnosis');
    return data;
  },

  createDiagnosis: async (diagnosis: { diagnosis_name: string; description?: string }): Promise<MasterDiagnosis> => {
    const { data } = await apiClient.post('/master-diagnosis', diagnosis);
    return data;
  },

  updateDiagnosis: async (
    id: number,
    diagnosis: { diagnosis_name?: string; description?: string }
  ): Promise<MasterDiagnosis> => {
    const { data } = await apiClient.put(`/master-diagnosis/${id}`, diagnosis);
    return data;
  },

  deleteDiagnosis: async (id: number): Promise<void> => {
    await apiClient.delete(`/master-diagnosis/${id}`);
  },

  // Treatment endpoints
  getTreatments: async (): Promise<MasterTreatment[]> => {
    const { data } = await apiClient.get('/master-treatment');
    return data;
  },

  createTreatment: async (treatment: { treatment_name: string; description?: string }): Promise<MasterTreatment> => {
    const { data } = await apiClient.post('/master-treatment', treatment);
    return data;
  },

  updateTreatment: async (
    id: number,
    treatment: { treatment_name?: string; description?: string }
  ): Promise<MasterTreatment> => {
    const { data } = await apiClient.put(`/master-treatment/${id}`, treatment);
    return data;
  },

  deleteTreatment: async (id: number): Promise<void> => {
    await apiClient.delete(`/master-treatment/${id}`);
  },
};
