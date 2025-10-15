import { Clinic, ClinicUser, Appointment, ClinicBalance, FinancialTransaction, ClinicAd } from '@/types/database';

export const MOCK_CLINICS: Clinic[] = [
  {
    id: 'clinic-1',
    name: 'Clínica Modelo',
    cnpj: '12.345.678/0001-90',
    email: 'admin@clinicamodelo.com.br',
    phone: '(11) 3456-7890',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'clinic-2',
    name: 'Clínica Saúde Total',
    cnpj: '98.765.432/0001-10',
    email: 'admin@saudetotal.com.br',
    phone: '(11) 2345-6789',
    address: {
      street: 'R. Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000'
    },
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'clinic-3',
    name: 'Clínica Vida & Trabalho',
    cnpj: '11.222.333/0001-44',
    email: 'admin@vidaetrabalho.com.br',
    phone: '(21) 3456-7890',
    address: {
      street: 'Av. Rio Branco, 200',
      city: 'Rio de Janeiro',
      state: 'RJ',
      zipCode: '20040-001'
    },
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const MOCK_USERS: ClinicUser[] = [
  {
    id: 'user-1',
    clinic_id: 'clinic-1',
    email: 'admin@clinicamodelo.com.br',
    name: 'Admin Clínica Modelo',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-2',
    clinic_id: 'clinic-2',
    email: 'admin@saudetotal.com.br',
    name: 'Admin Saúde Total',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'user-3',
    clinic_id: 'clinic-3',
    email: 'admin@vidaetrabalho.com.br',
    name: 'Admin Vida & Trabalho',
    role: 'admin',
    active: true,
    created_at: '2024-01-01T00:00:00Z'
  }
];

const today = new Date().toISOString().split('T')[0];

export const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-1',
    clinic_id: 'clinic-1',
    user_name: 'Maria Santos',
    user_email: 'maria@email.com',
    user_phone: '(11) 98765-4321',
    service_id: 'service-1',
    appointment_date: today,
    appointment_time: '09:00:00',
    status: 'confirmed',
    payment_status: 'paid',
    price_paid: 15000,
    notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    service: {
      id: 'service-1',
      name: 'Consulta Médica',
      description: 'Consulta com clínico geral',
      category: 'consultation',
      price: 20000,
      discount_price: 15000,
      clinic_id: 'clinic-1',
      duration_minutes: 30,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'apt-2',
    clinic_id: 'clinic-1',
    user_name: 'João Silva',
    user_email: 'joao@email.com',
    user_phone: '(11) 98765-1234',
    service_id: 'service-2',
    appointment_date: today,
    appointment_time: '10:30:00',
    status: 'scheduled',
    payment_status: 'pending',
    price_paid: 8000,
    notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    service: {
      id: 'service-2',
      name: 'Exame de Sangue',
      description: 'Hemograma completo',
      category: 'exam',
      price: 12000,
      discount_price: 8000,
      clinic_id: 'clinic-1',
      duration_minutes: 15,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  },
  {
    id: 'apt-3',
    clinic_id: 'clinic-1',
    user_name: 'Ana Paula',
    user_email: 'ana@email.com',
    user_phone: '(11) 98765-5678',
    service_id: 'service-3',
    appointment_date: today,
    appointment_time: '14:00:00',
    status: 'confirmed',
    payment_status: 'paid',
    price_paid: 25000,
    notes: '',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    service: {
      id: 'service-3',
      name: 'Raio-X',
      description: 'Raio-X de tórax',
      category: 'exam',
      price: 35000,
      discount_price: 25000,
      clinic_id: 'clinic-1',
      duration_minutes: 20,
      active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  }
];

export const MOCK_BALANCE: ClinicBalance = {
  id: 'balance-1',
  clinic_id: 'clinic-1',
  available_balance: 145000,
  pending_balance: 35000,
  total_earned: 580000,
  total_withdrawn: 400000,
  updated_at: '2024-01-01T00:00:00Z'
};

export const MOCK_TRANSACTIONS: FinancialTransaction[] = [
  {
    id: 'tx-1',
    clinic_id: 'clinic-1',
    type: 'credit',
    amount: 15000,
    description: 'Consulta - Maria Santos',
    status: 'completed',
    payment_method: 'credit_card',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-2',
    clinic_id: 'clinic-1',
    type: 'credit',
    amount: 8000,
    description: 'Exame - João Silva',
    status: 'completed',
    payment_method: 'pix',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-3',
    clinic_id: 'clinic-1',
    type: 'withdrawal',
    amount: -50000,
    description: 'Saque para conta bancária',
    status: 'completed',
    payment_method: 'bank_transfer',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-4',
    clinic_id: 'clinic-1',
    type: 'credit',
    amount: 25000,
    description: 'Raio-X - Ana Paula',
    status: 'completed',
    payment_method: 'credit_card',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'tx-5',
    clinic_id: 'clinic-1',
    type: 'credit',
    amount: 12000,
    description: 'Ultrassom - Carlos Mendes',
    status: 'completed',
    payment_method: 'debit_card',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const MOCK_ADS: ClinicAd[] = [
  {
    id: 'ad-1',
    clinic_id: 'clinic-1',
    title: 'Consulta Médica com Desconto',
    description: 'Consulta com clínico geral por apenas R$ 150. Atendimento rápido e qualificado.',
    images: [],
    category: 'consultation',
    price_range: 'R$ 150 - R$ 200',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    id: 'ad-2',
    clinic_id: 'clinic-1',
    title: 'Exames Laboratoriais',
    description: 'Hemograma, glicemia e muito mais com até 40% de desconto.',
    images: [],
    category: 'exam',
    price_range: 'R$ 80 - R$ 300',
    active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

export const MOCK_AVAILABLE_SLOTS = [
  { id: 'slot-1', clinic_id: 'clinic-1', date: today, time_slot: '08:00', capacity: 3, booked: 0 },
  { id: 'slot-2', clinic_id: 'clinic-1', date: today, time_slot: '09:00', capacity: 3, booked: 1 },
  { id: 'slot-3', clinic_id: 'clinic-1', date: today, time_slot: '10:00', capacity: 3, booked: 2 },
  { id: 'slot-4', clinic_id: 'clinic-1', date: today, time_slot: '11:00', capacity: 3, booked: 3 },
  { id: 'slot-5', clinic_id: 'clinic-1', date: today, time_slot: '14:00', capacity: 3, booked: 1 },
  { id: 'slot-6', clinic_id: 'clinic-1', date: today, time_slot: '15:00', capacity: 3, booked: 0 },
  { id: 'slot-7', clinic_id: 'clinic-1', date: today, time_slot: '16:00', capacity: 3, booked: 0 },
  { id: 'slot-8', clinic_id: 'clinic-1', date: today, time_slot: '17:00', capacity: 3, booked: 1 }
];

export function findUserByEmail(email: string): ClinicUser | undefined {
  return MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findClinicById(clinicId: string): Clinic | undefined {
  return MOCK_CLINICS.find(c => c.id === clinicId);
}

export function getAppointmentsByClinicAndDate(clinicId: string, date: string): Appointment[] {
  return MOCK_APPOINTMENTS.filter(a => a.clinic_id === clinicId && a.appointment_date === date);
}

export function getBalanceByClinic(clinicId: string): ClinicBalance {
  return { ...MOCK_BALANCE, clinic_id: clinicId };
}

export function getTransactionsByClinic(clinicId: string): FinancialTransaction[] {
  return MOCK_TRANSACTIONS.map(t => ({ ...t, clinic_id: clinicId }));
}

export function getAdsByClinic(clinicId: string): ClinicAd[] {
  return MOCK_ADS.map(a => ({ ...a, clinic_id: clinicId }));
}

export function getSlotsByClinicAndDate(clinicId: string, date: string) {
  return MOCK_AVAILABLE_SLOTS.filter(s => s.clinic_id === clinicId && s.date === date);
}

export function findAppointmentById(id: string): Appointment | undefined {
  return MOCK_APPOINTMENTS.find(a => a.id === id);
}
