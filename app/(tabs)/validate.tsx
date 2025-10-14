import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { QrCode, Scan, CheckCircle, XCircle, AlertCircle, User, Clock, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types/database';

export default function ValidateScreen() {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    appointment?: Appointment;
  } | null>(null);

  const validateToken = async () => {
    if (!token.trim()) {
      setResult({
        success: false,
        message: 'Por favor, insira um token válido',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*)
        `)
        .eq('token', token.trim())
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        setResult({
          success: false,
          message: 'Token não encontrado ou inválido',
        });
        return;
      }

      if (data.token_validated_at) {
        setResult({
          success: false,
          message: 'Token já foi utilizado',
          appointment: data,
        });
        return;
      }

      if (data.status === 'cancelled') {
        setResult({
          success: false,
          message: 'Agendamento cancelado',
          appointment: data,
        });
        return;
      }

      if (data.payment_status !== 'paid' && data.payment_status !== 'authorized') {
        setResult({
          success: false,
          message: 'Pagamento não confirmado',
          appointment: data,
        });
        return;
      }

      const appointmentDate = new Date(data.appointment_date + 'T' + data.appointment_time);
      const now = new Date();
      const hoursDiff = (appointmentDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        setResult({
          success: false,
          message: 'Agendamento é para uma data futura',
          appointment: data,
        });
        return;
      }

      await supabase
        .from('appointments')
        .update({
          token_validated_at: new Date().toISOString(),
          status: 'confirmed',
        })
        .eq('id', data.id);

      setResult({
        success: true,
        message: 'Token validado com sucesso!',
        appointment: data,
      });

      setToken('');
    } catch (error) {
      console.error('Error validating token:', error);
      setResult({
        success: false,
        message: 'Erro ao validar token. Tente novamente.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2)}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Validar Agendamento</Text>
          <Text style={styles.subtitle}>Verifique o token do paciente</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.scanSection}>
          <View style={styles.iconContainer}>
            <QrCode size={64} color="#2563eb" strokeWidth={2} />
          </View>

          <Text style={styles.instructionTitle}>Escanear QR Code ou Inserir Token</Text>
          <Text style={styles.instructionText}>
            Peça ao paciente para apresentar o QR Code ou código do agendamento
          </Text>

          <TouchableOpacity style={styles.scanButton}>
            <Scan size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.scanButtonText}>Escanear QR Code</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>Código do Token</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                value={token}
                onChangeText={setToken}
                placeholder="Digite o código do token"
                placeholderTextColor="#9ca3af"
                autoCapitalize="characters"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.validateButton, loading && styles.validateButtonDisabled]}
              onPress={validateToken}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <>
                  <CheckCircle size={20} color="#ffffff" strokeWidth={2} />
                  <Text style={styles.validateButtonText}>Validar Token</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {result && (
          <View
            style={[
              styles.resultContainer,
              result.success ? styles.resultSuccess : styles.resultError,
            ]}
          >
            <View style={styles.resultHeader}>
              {result.success ? (
                <CheckCircle size={32} color="#10b981" strokeWidth={2} />
              ) : (
                <XCircle size={32} color="#ef4444" strokeWidth={2} />
              )}
              <Text
                style={[
                  styles.resultMessage,
                  result.success ? styles.resultMessageSuccess : styles.resultMessageError,
                ]}
              >
                {result.message}
              </Text>
            </View>

            {result.appointment && (
              <View style={styles.appointmentDetails}>
                <View style={styles.detailRow}>
                  <User size={16} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.detailLabel}>Paciente:</Text>
                  <Text style={styles.detailValue}>{result.appointment.user_name}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Calendar size={16} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.detailLabel}>Data:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(result.appointment.appointment_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Clock size={16} color="#6b7280" strokeWidth={2} />
                  <Text style={styles.detailLabel}>Horário:</Text>
                  <Text style={styles.detailValue}>
                    {formatTime(result.appointment.appointment_time)}
                  </Text>
                </View>

                {result.appointment.service && (
                  <View style={styles.serviceDetail}>
                    <Text style={styles.serviceName}>{result.appointment.service.name}</Text>
                    <Text style={styles.servicePrice}>
                      {formatPrice(result.appointment.price_paid)}
                    </Text>
                  </View>
                )}

                {result.success && (
                  <View style={styles.successActions}>
                    <TouchableOpacity style={styles.completeButton}>
                      <CheckCircle size={18} color="#ffffff" strokeWidth={2} />
                      <Text style={styles.completeButtonText}>Marcar como Concluído</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        <View style={styles.infoBox}>
          <AlertCircle size={20} color="#3b82f6" strokeWidth={2} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Importante</Text>
            <Text style={styles.infoText}>
              • Cada token pode ser usado apenas uma vez{'\n'}
              • Valide o documento do paciente antes do atendimento{'\n'}
              • O token é válido apenas no dia do agendamento
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  scanSection: {
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#dbeafe',
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    justifyContent: 'center',
  },
  scanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    fontSize: 14,
    color: '#9ca3af',
    paddingHorizontal: 12,
  },
  inputSection: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
  },
  validateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 8,
  },
  validateButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  validateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  resultContainer: {
    marginTop: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
  },
  resultSuccess: {
    backgroundColor: '#d1fae5',
    borderColor: '#10b981',
  },
  resultError: {
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
  },
  resultHeader: {
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  resultMessage: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  resultMessageSuccess: {
    color: '#047857',
  },
  resultMessageError: {
    color: '#dc2626',
  },
  appointmentDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 1,
  },
  serviceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2563eb',
  },
  successActions: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#10b981',
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
  },
  completeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1e40af',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#1e3a8a',
    lineHeight: 20,
  },
});
