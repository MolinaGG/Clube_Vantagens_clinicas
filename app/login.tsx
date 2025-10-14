import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Building2, Mail, Lock } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email.trim()) {
      setError('Por favor, insira seu e-mail');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signIn(email.toLowerCase().trim());
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err?.message || 'E-mail não encontrado. Verifique e tente novamente.');
      setLoading(false);
    }
  };

  const fillDemoCredentials = (demoEmail: string) => {
    setEmail(demoEmail);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Building2 size={48} color="#2563eb" strokeWidth={2} />
            </View>
            <Text style={styles.title}>Clube de Vantagens</Text>
            <Text style={styles.subtitle}>Portal da Clínica</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>E-mail da Clínica</Text>
            <View style={styles.inputContainer}>
              <Mail size={20} color="#6b7280" strokeWidth={2} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="admin@suaclinica.com.br"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <Lock size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.loginButtonText}>Acessar Painel</Text>
                </>
              )}
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Contas de Demonstração</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.demoAccounts}>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('admin@clinicamodelo.com.br')}
              >
                <Text style={styles.demoButtonLabel}>Clínica Modelo</Text>
                <Text style={styles.demoButtonEmail}>admin@clinicamodelo.com.br</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('admin@saudetotal.com.br')}
              >
                <Text style={styles.demoButtonLabel}>Clínica Saúde Total</Text>
                <Text style={styles.demoButtonEmail}>admin@saudetotal.com.br</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={() => fillDemoCredentials('admin@vidaetrabalho.com.br')}
              >
                <Text style={styles.demoButtonLabel}>Clínica Vida & Trabalho</Text>
                <Text style={styles.demoButtonEmail}>admin@vidaetrabalho.com.br</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sistema seguro e confiável</Text>
            <Text style={styles.footerSubtext}>© 2025 Clube de Vantagens</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#dbeafe',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  form: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    textAlign: 'center',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  loginButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 13,
    color: '#9ca3af',
    paddingHorizontal: 12,
  },
  demoAccounts: {
    gap: 12,
  },
  demoButton: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  demoButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  demoButtonEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 13,
    color: '#9ca3af',
  },
});
