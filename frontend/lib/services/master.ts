import apiClient from '@/lib/api';
import { MasterItem } from '@/types';

export const masterService = {
  getMedicines: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/medicines');
    return data;
  },

  getDoses: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/doses');
    return data;
  },

  getFrequencies: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/frequencies');
    return data;
  },

  getDurations: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/durations');
    return data;
  },

  getQuantities: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/quantities');
    return data;
  },

  getNotes: async (): Promise<MasterItem[]> => {
    const { data } = await apiClient.get('/master/notes');
    return data;
  },
};
