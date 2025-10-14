import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useState } from 'react';
import { X, Clock, Users } from 'lucide-react-native';

interface AddSlotModalProps {
  visible: boolean;
  dayOfWeek: number;
  dayLabel: string;
  onClose: () => void;
  onSave: (data: { startTime: string; endTime: string; maxSimultaneous: number }) => Promise<void>;
}

export function AddSlotModal({ visible, dayOfWeek, dayLabel, onClose, onSave }: AddSlotModalProps) {
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('12:00');
  const [maxSimultaneous, setMaxSimultaneous] = useState('3');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!startTime || !endTime) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    const max = parseInt(maxSimultaneous);
    if (isNaN(max) || max < 1) {
      setError('Número de vagas deve ser maior que zero');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onSave({
        startTime,
        endTime,
        maxSimultaneous: max,
      });

      setStartTime('08:00');
      setEndTime('12:00');
      setMaxSimultaneous('3');
      onClose();
    } catch (err) {
      setError('Erro ao salvar horário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Adicionar Horário</Text>
              <Text style={styles.subtitle}>{dayLabel}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            <View style={styles.field}>
              <Text style={styles.label}>Horário de Início</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="08:00"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Horário de Término</Text>
              <View style={styles.inputContainer}>
                <Clock size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="12:00"
                  placeholderTextColor="#9ca3af"
                />
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Vagas Simultâneas</Text>
              <View style={styles.inputContainer}>
                <Users size={20} color="#6b7280" strokeWidth={2} />
                <TextInput
                  style={styles.input}
                  value={maxSimultaneous}
                  onChangeText={setMaxSimultaneous}
                  placeholder="3"
                  keyboardType="numeric"
                  placeholderTextColor="#9ca3af"
                />
              </View>
              <Text style={styles.hint}>
                Quantas pessoas podem ser atendidas ao mesmo tempo
              </Text>
            </View>

            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Salvando...' : 'Salvar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  field: {
    marginBottom: 20,
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
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 6,
  },
  errorContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563eb',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});
