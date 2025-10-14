export interface Clinic {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  address: Record<string, any>;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClinicUser {
  id: string;
  clinic_id: string;
  email: string;
  name: string;
  role: 'admin' | 'attendant';
  active: boolean;
  created_at: string;
}

export interface Service {
  id: string;
  clinic_id: string;
  name: string;
  description: string;
  category: 'exam' | 'consultation' | 'procedure';
  duration_minutes: number;
  price: number;
  discount_price: number;
  active: boolean;
  created_at: string;
}

export interface AvailabilitySlot {
  id: string;
  clinic_id: string;
  service_id?: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  max_simultaneous: number;
  active: boolean;
  created_at: string;
}

export interface AvailabilityException {
  id: string;
  clinic_id: string;
  date: string;
  is_closed: boolean;
  custom_hours: Record<string, any>;
  reason: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  clinic_id: string;
  service_id: string;
  user_name: string;
  user_email: string;
  user_phone: string;
  appointment_date: string;
  appointment_time: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  token?: string;
  token_validated_at?: string;
  validated_by?: string;
  payment_status: 'pending' | 'authorized' | 'paid' | 'refunded';
  payment_id?: string;
  price_paid: number;
  notes: string;
  created_at: string;
  updated_at: string;
  service?: Service;
}

export interface ClinicAd {
  id: string;
  clinic_id: string;
  title: string;
  description: string;
  images: string[];
  price_range: string;
  category: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FinancialTransaction {
  id: string;
  clinic_id: string;
  appointment_id?: string;
  type: 'credit' | 'debit' | 'refund' | 'fee' | 'withdrawal';
  amount: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  payment_method: string;
  settled_at?: string;
  created_at: string;
}

export interface ClinicBalance {
  id: string;
  clinic_id: string;
  available_balance: number;
  pending_balance: number;
  total_earned: number;
  total_withdrawn: number;
  updated_at: string;
}
