/*
  # Dados Completos de Exemplo (Corrigido)
  
  Adiciona dados de exemplo com UUIDs corretos
*/

-- Inserir mais clínicas
INSERT INTO clinics (id, name, cnpj, email, phone, address, active)
VALUES 
  (
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Clínica Saúde Total',
    '23.456.789/0001-91',
    'contato@saudetotal.com.br',
    '+5511988881111',
    '{"street": "Rua Augusta, 2500", "city": "São Paulo", "state": "SP", "zipCode": "01412-100", "neighborhood": "Consolação"}'::jsonb,
    true
  ),
  (
    'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Clínica Vida & Trabalho',
    '34.567.890/0001-92',
    'contato@vidaetrabalho.com.br',
    '+5521987772222',
    '{"street": "Av. Rio Branco, 156", "city": "Rio de Janeiro", "state": "RJ", "zipCode": "20040-006", "neighborhood": "Centro"}'::jsonb,
    true
  ),
  (
    'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Clínica Bem-Estar Empresarial',
    '45.678.901/0001-93',
    'contato@bemestarempresarial.com.br',
    '+5531976663333',
    '{"street": "Av. Afonso Pena, 1234", "city": "Belo Horizonte", "state": "MG", "zipCode": "30130-005", "neighborhood": "Centro"}'::jsonb,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir usuários de login para as clínicas
INSERT INTO clinic_users (id, clinic_id, email, name, role, active)
VALUES
  (
    'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'admin@saudetotal.com.br',
    'Dra. Maria Oliveira',
    'admin',
    true
  ),
  (
    'b2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'atendente@saudetotal.com.br',
    'Carlos Santos',
    'attendant',
    true
  ),
  (
    'b3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'admin@vidaetrabalho.com.br',
    'Dr. Pedro Silva',
    'admin',
    true
  ),
  (
    'b4eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'admin@bemestarempresarial.com.br',
    'Dra. Ana Costa',
    'admin',
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir mais serviços
INSERT INTO services (clinic_id, name, description, category, duration_minutes, price, discount_price, active)
VALUES
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Exame Admissional Completo', 'Avaliação médica completa com exames laboratoriais', 'exam', 45, 20000, 16000, true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Exame Demissional', 'Avaliação médica para desligamento', 'exam', 30, 15000, 12000, true),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Audiometria Ocupacional', 'Exame de audição ocupacional', 'exam', 20, 8000, 6000, true),
  ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Check-up Ocupacional', 'Check-up completo para empresas', 'exam', 60, 30000, 24000, true),
  ('a2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Acuidade Visual', 'Teste de visão ocupacional', 'exam', 15, 5000, 4000, true),
  ('a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 'Consulta ASO', 'Atestado de Saúde Ocupacional', 'consultation', 30, 12000, 10000, true)
ON CONFLICT DO NOTHING;

-- Inserir anúncios
INSERT INTO clinic_ads (clinic_id, title, description, price_range, category, active)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Pacote Admissional Completo',
    'Realize todos os exames admissionais com desconto especial. Inclui avaliação médica, exames laboratoriais e certificado ASO.',
    'R$ 100,00 - R$ 150,00',
    'package',
    true
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Check-up Empresarial',
    'Oferecemos serviços personalizados para empresas. Entre em contato para condições especiais.',
    'R$ 80,00 - R$ 250,00',
    'corporate',
    true
  )
ON CONFLICT DO NOTHING;

-- Inserir transações financeiras baseadas em agendamentos pagos
INSERT INTO financial_transactions (clinic_id, appointment_id, type, amount, description, status, payment_method, settled_at)
SELECT 
  a.clinic_id,
  a.id,
  'credit',
  a.price_paid,
  'Pagamento - ' || a.user_name,
  'completed',
  'credit_card',
  CURRENT_TIMESTAMP - interval '1 day'
FROM appointments a
WHERE a.payment_status = 'paid' AND a.status = 'completed'
AND NOT EXISTS (
  SELECT 1 FROM financial_transactions ft 
  WHERE ft.appointment_id = a.id AND ft.type = 'credit'
);

-- Inserir taxas
INSERT INTO financial_transactions (clinic_id, appointment_id, type, amount, description, status, payment_method, settled_at)
SELECT 
  a.clinic_id,
  a.id,
  'fee',
  -1 * CAST(ROUND(a.price_paid * 0.08) AS DECIMAL),
  'Taxa de processamento (8%)',
  'completed',
  'automatic',
  CURRENT_TIMESTAMP - interval '1 day'
FROM appointments a
WHERE a.payment_status = 'paid' AND a.status = 'completed'
AND NOT EXISTS (
  SELECT 1 FROM financial_transactions ft 
  WHERE ft.appointment_id = a.id AND ft.type = 'fee'
);

-- Criar saldos
INSERT INTO clinic_balance (clinic_id, available_balance, pending_balance, total_earned, total_withdrawn)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 11040, 34000, 38000, 0)
ON CONFLICT (clinic_id) 
DO UPDATE SET
  available_balance = EXCLUDED.available_balance,
  total_earned = EXCLUDED.total_earned;