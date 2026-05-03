import apiClient from '@/lib/api';
import { Patient, PatientCreate, PatientUpdate, PatientCount } from '@/types';

export const patientService = {
  getAll: async (params?: { search?: string; payment_status?: string; skip?: number; limit?: number }): Promise<Patient[]> => {
    const { data } = await apiClient.get('/patients', { params });
    return data;
  },

  getByUid: async (uid: string): Promise<Patient> => {
    const { data } = await apiClient.get(`/patients/${uid}`);
    return data;
  },

  getCount: async (): Promise<PatientCount> => {
    const { data } = await apiClient.get('/patients/count');
    return data;
  },

  create: async (patient: PatientCreate): Promise<Patient> => {
    const { data } = await apiClient.post('/patients', patient);
    return data;
  },

  update: async (uid: string, patient: PatientUpdate): Promise<Patient> => {
    const { data } = await apiClient.put(`/patients/${uid}`, patient);
    return data;
  },

  delete: async (uid: string): Promise<void> => {
    await apiClient.delete(`/patients/${uid}`);
  },
};
