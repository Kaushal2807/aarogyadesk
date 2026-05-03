import apiClient from '@/lib/api';
import { Medicine, MedicineCreate, MedicineUpdate } from '@/types';

export const medicineService = {
  getAll: async (params?: { search?: string }): Promise<Medicine[]> => {
    const { data } = await apiClient.get('/medicine', { params });
    return data;
  },

  getLowStock: async (): Promise<Medicine[]> => {
    const { data } = await apiClient.get('/medicine/low-stock');
    return data;
  },

  create: async (medicine: MedicineCreate): Promise<Medicine> => {
    const { data } = await apiClient.post('/medicine', medicine);
    return data;
  },

  update: async (id: number, medicine: MedicineUpdate): Promise<Medicine> => {
    const { data } = await apiClient.put(`/medicine/${id}`, medicine);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/medicine/${id}`);
  },
};
