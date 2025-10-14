/*
  # Adicionar Tabelas de Anúncios e Financeiro
  
  1. Novas Tabelas
    - `clinic_ads` - Anúncios/promoções da clínica
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `images` (jsonb) - Array de URLs de imagens
      - `price_range` (text)
      - `category` (text)
      - `active` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `financial_transactions` - Transações financeiras
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key)
      - `appointment_id` (uuid, foreign key, nullable)
      - `type` (text) - 'credit' | 'debit' | 'refund' | 'fee'
      - `amount` (decimal) - Valor em centavos
      - `description` (text)
      - `status` (text) - 'pending' | 'completed' | 'failed'
      - `payment_method` (text)
      - `settled_at` (timestamptz)
      - `created_at` (timestamptz)
    
    - `clinic_balance` - Saldo da clínica
      - `id` (uuid, primary key)
      - `clinic_id` (uuid, foreign key, unique)
      - `available_balance` (decimal)
      - `pending_balance` (decimal)
      - `total_earned` (decimal)
      - `total_withdrawn` (decimal)
      - `updated_at` (timestamptz)
  
  2. Segurança
    - Enable RLS em todas as tabelas
    - Políticas baseadas em clinic_id
*/

-- Tabela de Anúncios da Clínica
CREATE TABLE IF NOT EXISTS clinic_ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  images jsonb DEFAULT '[]',
  price_range text DEFAULT '',
  category text NOT NULL DEFAULT 'service',
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_ads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic users can view own clinic ads"
  ON clinic_ads FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Clinic admin can insert ads"
  ON clinic_ads FOR INSERT
  TO authenticated
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can update ads"
  ON clinic_ads FOR UPDATE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'))
  WITH CHECK (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

CREATE POLICY "Clinic admin can delete ads"
  ON clinic_ads FOR DELETE
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email' AND role = 'admin'));

-- Tabela de Transações Financeiras
CREATE TABLE IF NOT EXISTS financial_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  appointment_id uuid REFERENCES appointments(id),
  type text NOT NULL CHECK (type IN ('credit', 'debit', 'refund', 'fee', 'withdrawal')),
  amount decimal NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method text DEFAULT '',
  settled_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic users can view own clinic transactions"
  ON financial_transactions FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

-- Tabela de Saldo da Clínica
CREATE TABLE IF NOT EXISTS clinic_balance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id uuid NOT NULL REFERENCES clinics(id) ON DELETE CASCADE UNIQUE,
  available_balance decimal DEFAULT 0,
  pending_balance decimal DEFAULT 0,
  total_earned decimal DEFAULT 0,
  total_withdrawn decimal DEFAULT 0,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE clinic_balance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clinic users can view own clinic balance"
  ON clinic_balance FOR SELECT
  TO authenticated
  USING (clinic_id IN (SELECT clinic_id FROM clinic_users WHERE email = auth.jwt()->>'email'));

-- Índices
CREATE INDEX IF NOT EXISTS idx_clinic_ads_clinic ON clinic_ads(clinic_id, active);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_clinic ON financial_transactions(clinic_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment ON financial_transactions(appointment_id);

-- Triggers para updated_at
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clinic_ads_updated_at') THEN
    CREATE TRIGGER update_clinic_ads_updated_at BEFORE UPDATE ON clinic_ads
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clinic_balance_updated_at') THEN
    CREATE TRIGGER update_clinic_balance_updated_at BEFORE UPDATE ON clinic_balance
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;