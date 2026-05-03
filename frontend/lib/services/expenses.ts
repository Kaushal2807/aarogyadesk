import apiClient from '@/lib/api';
import { Expense, ExpenseCreate, ExpenseUpdate, ExpenseCategory, ExpenseCategoryCreate, ExpenseCategoryUpdate, ExpenseSummary } from '@/types';

export const expenseService = {
  getAll: async (params?: { month?: number; year?: number; category_id?: number; skip?: number; limit?: number }): Promise<Expense[]> => {
    const { data } = await apiClient.get('/expenses', { params });
    return data;
  },

  getSummary: async (params?: { month?: number; year?: number }): Promise<ExpenseSummary> => {
    const { data } = await apiClient.get('/expenses/summary', { params });
    return data;
  },

  create: async (expense: ExpenseCreate): Promise<Expense> => {
    const { data } = await apiClient.post('/expenses', expense);
    return data;
  },

  update: async (id: number, expense: ExpenseUpdate): Promise<Expense> => {
    const { data } = await apiClient.put(`/expenses/${id}`, expense);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/expenses/${id}`);
  },

  getCategories: async (): Promise<ExpenseCategory[]> => {
    const { data } = await apiClient.get('/expense-categories');
    return data;
  },

  createCategory: async (category: ExpenseCategoryCreate): Promise<ExpenseCategory> => {
    const { data } = await apiClient.post('/expense-categories', category);
    return data;
  },

  updateCategory: async (id: number, category: ExpenseCategoryUpdate): Promise<ExpenseCategory> => {
    const { data } = await apiClient.put(`/expense-categories/${id}`, category);
    return data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/expense-categories/${id}`);
  },
};
