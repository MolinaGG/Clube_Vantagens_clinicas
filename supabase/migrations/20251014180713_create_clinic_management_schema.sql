/*
  # Schema do Sistema de Clínicas - Clube de Vantagens
  
  1. Novas Tabelas
    - `clinics` - Cadastro de clínicas parceiras
    - `clinic_users` - Usuários das clínicas (atendentes/gestores)
    - `services` - Serviços oferecidos
    - `availability_slots` - Slots de disponibilidade
    - `availability_exceptions` - Exceções de disponibilidade
    - `appointments` - Agendamentos
  
  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas para authenticated users baseadas em clinic_id
*/

-- Tabela de Clínicas
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text UNIQUE NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  address jsonb DEFAULT '{}',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de Usuários das Clínicas
CREATE TABLE IF NOT EXISTS clinic_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'attendant')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Serviços
CREATE TABLE IF NOT EXISTS services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL CHECK (category IN ('exam', 'consultation', 'procedure')),
  duration_minutes int NOT NULL DEFAULT 30,
  price decimal NOT NULL,
  discount_price decimal NOT NULL,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Slots de Disponibilidade
CREATE TABLE IF NOT EXISTS availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_id uuid REFERENCES services(id) ON DELETE CASCADE,
  day_of_week int NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  max_simultaneous int DEFAULT 1,
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabela de Exceções de Disponibilidade
CREATE TABLE IF NOT EXISTS availability_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_closed boolean DEFAULT true,
  custom_hours jsonb DEFAULT '{}',
  reason text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, date)
);

-- Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  user_name text NOT NULL,
  user_email text NOT NULL,
  user_phone text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  token text UNIQUE,
  token_validated_at timestamptz,
  validated_by uuid REFERENCES clinic_users(id),
  payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'authorized', 'paid', 'refunded')),
  payment_id text,
  price_paid decimal NOT NULL,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Clinics
CREATE POLICY "Clinics can view own data"
  ON clinics FOR SELECT
  TO authenticated
  USING (id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinics can update own data"
  ON clinics FOR UPDATE
  TO authenticated
  USING (id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

-- RLS Policies for Clinic Users
CREATE POLICY "Clinic users can view own clinic users"
  ON clinic_users FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

-- RLS Policies for Services
CREATE POLICY "Clinic users can view own clinic services"
  ON services FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinic users can insert own clinic services"
  ON services FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic users can update own clinic services"
  ON services FOR UPDATE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- RLS Policies for Availability Slots
CREATE POLICY "Clinic users can view own clinic availability"
  ON availability_slots FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinic admin can insert availability"
  ON availability_slots FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can update availability"
  ON availability_slots FOR UPDATE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can delete availability"
  ON availability_slots FOR DELETE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- RLS Policies for Availability Exceptions
CREATE POLICY "Clinic users can view own clinic exceptions"
  ON availability_exceptions FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinic admin can insert exceptions"
  ON availability_exceptions FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can update exceptions"
  ON availability_exceptions FOR UPDATE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can delete exceptions"
  ON availability_exceptions FOR DELETE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- RLS Policies for Appointments
CREATE POLICY "Clinic users can view own clinic appointments"
  ON appointments FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinic users can update own clinic appointments"
  ON appointments FOR UPDATE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_clinic_date ON appointments(clinic_id, appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_token ON appointments(token) WHERE token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_availability_slots_clinic ON availability_slots(clinic_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_services_clinic ON services(clinic_id, active);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clinics_updated_at') THEN
    CREATE TRIGGER update_clinics_updated_at BEFORE UPDATE ON clinics
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_appointments_updated_at') THEN
    CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;