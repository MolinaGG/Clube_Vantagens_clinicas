import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClinicUser, Clinic } from '@/types/database';

interface AuthContextData {
  user: ClinicUser | null;
  clinic: Clinic | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClinicUser | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  const loadStoredAuth = async () => {
    setLoading(false);
  };

  const loadUserData = async (email: string) => {
    try {
      console.log('Loading user data for:', email);

      const { data: userData, error: userError } = await supabase
        .from('clinic_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      console.log('User data result:', { userData, userError });

      if (userError) throw userError;
      if (!userData) throw new Error('Usuário não encontrado');

      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userData.clinic_id)
        .maybeSingle();

      console.log('Clinic data result:', { clinicData, clinicError });

      if (clinicError) throw clinicError;
      if (!clinicData) throw new Error('Clínica não encontrada');

      console.log('Setting user and clinic:', { userData, clinicData });
      setUser(userData);
      setClinic(clinicData);
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  };

  const signIn = async (email: string) => {
    try {
      setLoading(true);
      await loadUserData(email);
    } catch (error) {
      setUser(null);
      setClinic(null);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setUser(null);
    setClinic(null);
  };

  return (
    <AuthContext.Provider value={{ user, clinic, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
