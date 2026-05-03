import apiClient from '@/lib/api';
import { KPIResponse, PatientTrendResponse, ExpenseComparisonResponse } from '@/types';

export const reportService = {
  getKPI: async (): Promise<KPIResponse> => {
    const { data } = await apiClient.get('/reports/kpi');
    return data;
  },

  getPatientTrend: async (): Promise<PatientTrendResponse[]> => {
    const { data } = await apiClient.get('/reports/patient-trend');
    return data;
  },

  getExpenseComparison: async (): Promise<ExpenseComparisonResponse[]> => {
    const { data } = await apiClient.get('/reports/expense-comparison');
    return data;
  },
};
