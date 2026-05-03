export interface KPIResponse {
  total_patients: number;
  paid: number;
  partial: number;
  pending: number;
  today_patients: number;
}

export interface PatientTrendResponse {
  month: string;
  patients: number;
}

export interface ExpenseComparisonResponse {
  month: string;
  expenses: number;
}
