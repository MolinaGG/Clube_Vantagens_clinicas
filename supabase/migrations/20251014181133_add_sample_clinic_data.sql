/*
  # Dados de Exemplo para Testes
  
  Popula o banco com dados de exemplo:
  - 1 clínica modelo
  - 1 usuário admin da clínica
  - 3 serviços de exemplo
  - Horários de disponibilidade para dias úteis
  - Alguns agendamentos de exemplo
*/

-- Inserir clínica de exemplo
INSERT INTO clinics (id, name, cnpj, email, phone, address, active)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Clínica Modelo',
  '12.345.678/0001-90',
  'contato@clinicamodelo.com.br',
  '+5511999999999',
  '{"street": "Av. Paulista, 1000", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}'::jsonb,
  true
)
ON CONFLICT (id) DO NOTHING;

-- Inserir usuário admin da clínica
INSERT INTO clinic_users (id, clinic_id, email, name, role, active)
VALUES (
  'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'admin@clinicamodelo.com.br',
  'Dr. João Silva',
  'admin',
  true
)
ON CONFLICT (id) DO NOTHING;

-- Inserir serviços de exemplo
INSERT INTO services (id, clinic_id, name, description, category, duration_minutes, price, discount_price, active)
VALUES
  (
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Exame Admissional',
    'Exame médico completo para admissão',
    'exam',
    30,
    15000,
    12000,
    true
  ),
  (
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Exame Periódico',
    'Avaliação periódica de saúde ocupacional',
    'exam',
    45,
    18000,
    14000,
    true
  ),
  (
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Consulta Ocupacional',
    'Consulta médica ocupacional',
    'consultation',
    60,
    25000,
    20000,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- Inserir horários de disponibilidade (Segunda a Sexta, 8h-17h)
INSERT INTO availability_slots (clinic_id, day_of_week, start_time, end_time, max_simultaneous, active)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '08:00', '12:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 1, '13:00', '17:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '08:00', '12:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2, '13:00', '17:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, '08:00', '12:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3, '13:00', '17:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, '08:00', '12:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 4, '13:00', '17:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, '08:00', '12:00', 3, true),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 5, '13:00', '17:00', 3, true)
ON CONFLICT DO NOTHING;

-- Inserir alguns agendamentos de exemplo para hoje
INSERT INTO appointments (
  clinic_id,
  service_id,
  user_name,
  user_email,
  user_phone,
  appointment_date,
  appointment_time,
  status,
  payment_status,
  price_paid,
  notes
)
VALUES
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Maria Santos',
    'maria@email.com',
    '+5511988887777',
    CURRENT_DATE,
    '09:00',
    'scheduled',
    'paid',
    12000,
    'Primeira consulta'
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'João Oliveira',
    'joao@email.com',
    '+5511977776666',
    CURRENT_DATE,
    '10:00',
    'confirmed',
    'paid',
    14000,
    'Paciente recorrente'
  ),
  (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'Ana Paula Costa',
    'ana@email.com',
    '+5511966665555',
    CURRENT_DATE,
    '14:00',
    'scheduled',
    'authorized',
    20000,
    ''
  )
ON CONFLICT DO NOTHING;