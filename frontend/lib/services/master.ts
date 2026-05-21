import apiClient from '@/lib/api';
import { MasterItem } from '@/types';

export const masterService = {
  getMedicines: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/medicines');
    return data;
  },
  createMedicine: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/medicines', { name });
    return data;
  },
  updateMedicine: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/medicines/${id}`, { name });
    return data;
  },
  deleteMedicine: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/medicines/${id}`);
  },

  getDoses: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/doses');
    return data;
  },
  createDose: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/doses', { name });
    return data;
  },
  updateDose: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/doses/${id}`, { name });
    return data;
  },
  deleteDose: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/doses/${id}`);
  },

  getFrequencies: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/frequencies');
    return data;
  },
  createFrequency: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/frequencies', { name });
    return data;
  },
  updateFrequency: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/frequencies/${id}`, { name });
    return data;
  },
  deleteFrequency: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/frequencies/${id}`);
  },

  getDurations: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/durations');
    return data;
  },
  createDuration: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/durations', { name });
    return data;
  },
  updateDuration: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/durations/${id}`, { name });
    return data;
  },
  deleteDuration: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/durations/${id}`);
  },

  getQuantities: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/quantities');
    return data;
  },
  createQuantity: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/quantities', { name });
    return data;
  },
  updateQuantity: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/quantities/${id}`, { name });
    return data;
  },
  deleteQuantity: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/quantities/${id}`);
  },

  getNotes: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/notes');
    return data;
  },
  createNote: async (name: string): Promise<MasterItem> => {
    const { data } = await apiClient.post('/master/notes', { name });
    return data;
  },
  updateNote: async (id: number, name: string): Promise<MasterItem> => {
    const { data } = await apiClient.put(`/master/notes/${id}`, { name });
    return data;
  },
  deleteNote: async (id: number): Promise<void> => {
    await apiClient.delete(`/master/notes/${id}`);
  },
};
