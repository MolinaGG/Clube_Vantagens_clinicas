/*
  # Corrigir Acesso de Login
  
  Permite que usuários não autenticados possam fazer login verificando suas credenciais
*/

-- Remover políticas antigas e criar novas
DROP POLICY IF EXISTS "Clinic users can view own clinic users" ON clinic_users;
DROP POLICY IF EXISTS "Clinics can view own data" ON clinics;

-- Permitir leitura pública de clinic_users para autenticação
CREATE POLICY "Public read for login"
  ON clinic_users FOR SELECT
  TO public
  USING (true);

-- Permitir leitura pública de clinics para autenticação
CREATE POLICY "Public read for login"
  ON clinics FOR SELECT
  TO public
  USING (true);