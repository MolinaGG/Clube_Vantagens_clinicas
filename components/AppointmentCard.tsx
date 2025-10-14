import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Clock, User, Phone, CreditCard, CheckCircle, XCircle } from 'lucide-react-native';
import { Appointment } from '@/types/database';

interface AppointmentCardProps {
  appointment: Appointment;
}

const STATUS_CONFIG = {
  scheduled: {
    label: 'Agendado',
    color: '#3b82f6',
    bg: '#dbeafe',
  },
  confirmed: {
    label: 'Confirmado',
    color: '#10b981',
    bg: '#d1fae5',
  },
  completed: {
    label: 'Concluído',
    color: '#6b7280',
    bg: '#f3f4f6',
  },
  cancelled: {
    label: 'Cancelado',
    color: '#ef4444',
    bg: '#fee2e2',
  },
  no_show: {
    label: 'Não Compareceu',
    color: '#f59e0b',
    bg: '#fef3c7',
  },
};

const PAYMENT_CONFIG = {
  pending: { label: 'Pendente', color: '#f59e0b' },
  authorized: { label: 'Autorizado', color: '#3b82f6' },
  paid: { label: 'Pago', color: '#10b981' },
  refunded: { label: 'Reembolsado', color: '#6b7280' },
};

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  const statusConfig = STATUS_CONFIG[appointment.status];
  const paymentConfig = PAYMENT_CONFIG[appointment.payment_status];

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const formatPrice = (price: number) => {
    return `R$ ${(price / 100).toFixed(2)}`;
  };

  return (
    <TouchableOpacity style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.timeSection}>
          <Clock size={20} color="#6b7280" strokeWidth={2} />
          <Text style={styles.time}>{formatTime(appointment.appointment_time)}</Text>
        </View>

        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <User size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.infoText}>{appointment.user_name}</Text>
        </View>

        <View style={styles.infoRow}>
          <Phone size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.infoText}>{appointment.user_phone}</Text>
        </View>

        {appointment.service && (
          <View style={styles.serviceTag}>
            <Text style={styles.serviceText}>{appointment.service.name}</Text>
            <Text style={styles.durationText}>{appointment.service.duration_minutes}min</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.paymentSection}>
          <CreditCard size={16} color="#6b7280" strokeWidth={2} />
          <Text style={styles.priceText}>{formatPrice(appointment.price_paid)}</Text>
          <View style={[styles.paymentBadge, { backgroundColor: `${paymentConfig.color}20` }]}>
            <Text style={[styles.paymentText, { color: paymentConfig.color }]}>
              {paymentConfig.label}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {appointment.status === 'scheduled' && (
            <>
              <TouchableOpacity style={styles.actionButton}>
                <CheckCircle size={18} color="#10b981" strokeWidth={2} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <XCircle size={18} color="#ef4444" strokeWidth={2} />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      {appointment.notes && (
        <View style={styles.notesSection}>
          <Text style={styles.notesText}>{appointment.notes}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  timeSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  time: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardBody: {
    gap: 8,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#374151',
  },
  serviceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  serviceText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  durationText: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  paymentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  priceText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  paymentText: {
    fontSize: 11,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  notesSection: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  notesText: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
  },
});
