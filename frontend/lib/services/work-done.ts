import apiClient from '@/lib/api';
import { WorkDone, WorkDoneCreate, WorkDoneUpdate, PatientWorkDone, PatientWorkDoneCreate, PatientWorkDoneUpdate } from '@/types';

export const workDoneService = {
  getWorkTypes: async (): Promise<WorkDone[]> => {
    const { data } = await apiClient.get('/work-done');
    return data;
  },

  createWorkType: async (work: WorkDoneCreate): Promise<WorkDone> => {
    const { data } = await apiClient.post('/work-done', work);
    return data;
  },

  updateWorkType: async (id: number, work: WorkDoneUpdate): Promise<WorkDone> => {
    const { data } = await apiClient.put(`/work-done/${id}`, work);
    return data;
  },

  deleteWorkType: async (id: number): Promise<void> => {
    await apiClient.delete(`/work-done/${id}`);
  },

  getAll: async (): Promise<PatientWorkDone[]> => {
    const { data } = await apiClient.get('/patient-work-done');
    return data;
  },

  getByPatient: async (uid: string): Promise<PatientWorkDone[]> => {
    const { data } = await apiClient.get(`/patient-work-done/${uid}`);
    return data;
  },

  create: async (work: PatientWorkDoneCreate): Promise<PatientWorkDone> => {
    const { data } = await apiClient.post('/patient-work-done', work);
    return data;
  },

  update: async (id: number, work: PatientWorkDoneUpdate): Promise<PatientWorkDone> => {
    const { data } = await apiClient.put(`/patient-work-done/${id}`, work);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/patient-work-done/${id}`);
  },
};
