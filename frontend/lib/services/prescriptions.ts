import apiClient from '@/lib/api';
import { Prescription, PrescriptionCreate } from '@/types';

export const prescriptionService = {
  getAll: async (params?: { skip?: number; limit?: number }): Promise<Prescription[]> => {
    const { data } = await apiClient.get('/prescriptions', { params });
    return data;
  },

  getByPatient: async (uid: string): Promise<Prescription[]> => {
    const { data } = await apiClient.get(`/prescriptions/patient/${uid}`);
    return data;
  },

  getById: async (id: number): Promise<Prescription> => {
    const { data } = await apiClient.get(`/prescriptions/${id}`);
    return data;
  },

  create: async (prescription: PrescriptionCreate): Promise<Prescription> => {
    const { data } = await apiClient.post('/prescriptions', prescription);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/prescriptions/${id}`);
  },
};
