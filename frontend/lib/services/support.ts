import apiClient from '@/lib/api';
import { SupportCreate, Support } from '@/types';

export const supportService = {
  create: async (support: SupportCreate): Promise<Support> => {
    const { data } = await apiClient.post('/support', support);
    return data;
  },

  getAll: async (): Promise<Support[]> => {
    const { data } = await apiClient.get('/support');
    return data;
  },

  getById: async (id: number): Promise<Support> => {
    const { data } = await apiClient.get(`/support/${id}`);
    return data;
  },

  resolve: async (id: number): Promise<Support> => {
    const { data } = await apiClient.put(`/support/${id}/resolve`);
    return data;
  },
};
