export interface Expense {
  id: number;
  clinic_id: number;
  category_id?: number;
  expense_month?: number;
  expense_year?: number;
  title: string;
  description?: string;
  amount: number;
  payment_mode: 'Cash' | 'UPI';
  expense_date?: string;
  created_at: string;
  category_name?: string;
}

export interface ExpenseCreate {
  category_id?: number;
  expense_month: number;
  expense_year: number;
  title: string;
  description?: string;
  amount: number;
  payment_mode?: 'Cash' | 'UPI';
  expense_date?: string;
}

export interface ExpenseUpdate {
  category_id?: number;
  expense_month?: number;
  expense_year?: number;
  title?: string;
  description?: string;
  amount?: number;
  payment_mode?: 'Cash' | 'UPI';
  expense_date?: string;
}

export interface ExpenseCategory {
  id: number;
  clinic_id: number;
  category_name: string;
  created_at: string;
}

export interface ExpenseCategoryCreate {
  category_name: string;
}

export interface ExpenseCategoryUpdate {
  category_name: string;
}

export interface ExpenseSummary {
  total_amount: number;
  month: number;
  year: number;
  cash_total: number;
  upi_total: number;
}
