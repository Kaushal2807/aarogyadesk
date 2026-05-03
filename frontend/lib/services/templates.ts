import apiClient from '@/lib/api';
import { Template, TemplateCreate, TemplateUpdate } from '@/types';

export const templateService = {
  getAll: async (): Promise<Template[]> => {
    const { data } = await apiClient.get('/templates');
    return data;
  },

  getById: async (id: number): Promise<Template> => {
    const { data } = await apiClient.get(`/templates/${id}`);
    return data;
  },

  create: async (template: TemplateCreate): Promise<Template> => {
    const { data } = await apiClient.post('/templates', template);
    return data;
  },

  update: async (id: number, template: TemplateUpdate): Promise<Template> => {
    const { data } = await apiClient.put(`/templates/${id}`, template);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/templates/${id}`);
  },
};
