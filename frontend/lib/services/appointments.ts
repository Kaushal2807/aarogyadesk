import apiClient from '@/lib/api';
import { Appointment, AppointmentCreate, AppointmentUpdate } from '@/types';

export const appointmentService = {
  getAll: async (params?: { date?: string; status?: string; skip?: number; limit?: number }): Promise<Appointment[]> => {
    const { data } = await apiClient.get('/appointments', { params });
    return data;
  },

  getTodayCount: async (): Promise<{ count: number }> => {
    const { data } = await apiClient.get('/appointments/today-count');
    return data;
  },

  create: async (appointment: AppointmentCreate): Promise<Appointment> => {
    const { data } = await apiClient.post('/appointments', appointment);
    return data;
  },

  update: async (id: number, appointment: AppointmentUpdate): Promise<Appointment> => {
    const { data } = await apiClient.put(`/appointments/${id}`, appointment);
    return data;
  },

  updateStatus: async (id: number, status: string): Promise<Appointment> => {
    const { data } = await apiClient.put(`/appointments/${id}/status`, null, { params: { status } });
    return data;
  },
};
