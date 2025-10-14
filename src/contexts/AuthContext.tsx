import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClinicUser, Clinic } from '@/types/database';

interface AuthContextData {
  user: ClinicUser | null;
  clinic: Clinic | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ClinicUser | null>(null);
  const [clinic, setClinic] = useState<Clinic | null>(null);
  const [loading, setLoading] = useState(false);

  const loadUserData = async (email: string) => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('clinic_users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError) throw userError;
      if (!userData) throw new Error('Usuário não encontrado');

      const { data: clinicData, error: clinicError } = await supabase
        .from('clinics')
        .select('*')
        .eq('id', userData.clinic_id)
        .maybeSingle();

      if (clinicError) throw clinicError;
      if (!clinicData) throw new Error('Clínica não encontrada');

      setUser(userData);
      setClinic(clinicData);
      localStorage.setItem('userEmail', email);
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

  const signOut = () => {
    setUser(null);
    setClinic(null);
    localStorage.removeItem('userEmail');
  };

  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
      loadUserData(storedEmail).catch(() => {
        localStorage.removeItem('userEmail');
      });
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, clinic, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
