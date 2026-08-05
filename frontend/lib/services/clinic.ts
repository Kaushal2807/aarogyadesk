import apiClient from '@/lib/api';
import { Clinic, ClinicDoctor } from '@/types';

export const clinicService = {
  /** Get the clinic belonging to the logged-in user's clinic_id */
  getMine: async (): Promise<Clinic | null> => {
    try {
      const { data } = await apiClient.get('/clinics/me');
      return data;
    } catch {
      return null;
    }
  },

  /** Get all doctors for the current clinic */
  getDoctors: async (): Promise<ClinicDoctor[]> => {
    try {
      const { data } = await apiClient.get('/doctors');
      return data;
    } catch {
      return [];
    }
  },
};
