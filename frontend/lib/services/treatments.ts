import apiClient from '@/lib/api';
import { TreatmentPlan, TreatmentPlanCreate, PatientTreatment, PatientTreatmentCreate, PatientTreatmentUpdate } from '@/types';

export const treatmentService = {
  getPlans: async (params?: { search?: string; skip?: number; limit?: number }): Promise<TreatmentPlan[]> => {
    const { data } = await apiClient.get('/treatment-plans', { params });
    return data;
  },

  createPlan: async (plan: TreatmentPlanCreate): Promise<TreatmentPlan> => {
    const { data } = await apiClient.post('/treatment-plans', plan);
    return data;
  },

  getAll: async (): Promise<PatientTreatment[]> => {
    const { data } = await apiClient.get('/patient-treatments');
    return data;
  },

  getByPatient: async (uid: string): Promise<PatientTreatment[]> => {
    const { data } = await apiClient.get(`/patient-treatments/${uid}`);
    return data;
  },

  create: async (treatment: PatientTreatmentCreate): Promise<PatientTreatment> => {
    const { data } = await apiClient.post('/patient-treatments', treatment);
    return data;
  },

  update: async (id: number, treatment: PatientTreatmentUpdate): Promise<PatientTreatment> => {
    const { data } = await apiClient.put(`/patient-treatments/${id}`, treatment);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/patient-treatments/${id}`);
  },
};
