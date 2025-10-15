import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClinicUser, Clinic } from '@/types/database';
import { findUserByEmail, findClinicById } from '@/lib/mockData';

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
  const [loading, setLoading] = useState(true);

  const loadUserData = async (email: string) => {
    await new Promise(resolve => setTimeout(resolve, 500));

    const userData = findUserByEmail(email);
    if (!userData) throw new Error('Usuário não encontrado');

    const clinicData = findClinicById(userData.clinic_id);
    if (!clinicData) throw new Error('Clínica não encontrada');

    setUser(userData);
    setClinic(clinicData);
    localStorage.setItem('userEmail', email);
    setLoading(false);
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
        setLoading(false);
      });
    } else {
      setLoading(false);
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
