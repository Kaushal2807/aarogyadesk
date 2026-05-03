export interface Subscription {
  subscription_id: number;
  clinic_id: number;
  plan_type?: string;
  plan_amount?: number;
  payment_status: string;
  payment_method?: string;
  transaction_reference?: string;
  received_by?: string;
  start_date?: string;
  end_date?: string;
  notes?: string;
  created_at: string;
  clinic_name?: string;
}

export interface SubscriptionCreate {
  clinic_id: number;
  plan_type: string;
  plan_amount: number;
  payment_status?: string;
  payment_method?: string;
  transaction_reference?: string;
  received_by?: string;
  start_date: string;
  end_date: string;
  notes?: string;
}

export interface SubscriptionRenew {
  plan_type: string;
  plan_amount: number;
  payment_status?: string;
  payment_method?: string;
  transaction_reference?: string;
  received_by?: string;
}
