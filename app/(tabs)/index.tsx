import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Search } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { Appointment } from '@/types/database';
import { AppointmentCard } from '@/components/AppointmentCard';
import { CalendarHeader } from '@/components/CalendarHeader';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AgendaScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  useEffect(() => {
    generateCalendarDays();
  }, [currentDate]);

  useEffect(() => {
    loadAppointments();
  }, [selectedDate]);

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const days: Date[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1);
      days.push(prevDate);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    setCalendarDays(days);
  };

  const loadAppointments = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          service:services(*)
        `)
        .eq('appointment_date', dateStr)
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getAppointmentCount = (date: Date) => {
    return 0;
  };

  const formatSelectedDate = () => {
    const day = selectedDate.getDate();
    const month = MONTHS[selectedDate.getMonth()];
    const year = selectedDate.getFullYear();
    const dayOfWeek = DAYS[selectedDate.getDay()];
    return `${dayOfWeek}, ${day} de ${month} de ${year}`;
  };

  return (
    <View style={styles.container}>
      <CalendarHeader />

      <View style={styles.calendarContainer}>
        <View style={styles.monthHeader}>
          <TouchableOpacity onPress={previousMonth} style={styles.monthButton}>
            <ChevronLeft size={24} color="#1f2937" strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.monthTitle}>
            {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
          </Text>

          <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
            <ChevronRight size={24} color="#1f2937" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <View style={styles.weekDaysHeader}>
          {DAYS.map(day => (
            <View key={day} style={styles.weekDay}>
              <Text style={styles.weekDayText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {calendarDays.map((date, index) => {
            const count = getAppointmentCount(date);
            const selected = isSelected(date);
            const today = isToday(date);
            const currentMonth = isCurrentMonth(date);

            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dayCell,
                  selected && styles.dayCellSelected,
                  today && !selected && styles.dayCellToday,
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text
                  style={[
                    styles.dayText,
                    !currentMonth && styles.dayTextOtherMonth,
                    selected && styles.dayTextSelected,
                    today && !selected && styles.dayTextToday,
                  ]}
                >
                  {date.getDate()}
                </Text>
                {count > 0 && (
                  <View style={styles.appointmentBadge}>
                    <Text style={styles.appointmentBadgeText}>{count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <View style={styles.appointmentsSection}>
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>{formatSelectedDate()}</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton}>
              <Search size={20} color="#6b7280" strokeWidth={2} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={20} color="#ffffff" strokeWidth={2} />
              <Text style={styles.addButtonText}>Novo Agendamento</Text>
            </TouchableOpacity>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563eb" />
          </View>
        ) : appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Nenhum agendamento para esta data</Text>
            <Text style={styles.emptyStateSubtext}>
              Selecione outra data ou crie um novo agendamento
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.appointmentsList} showsVerticalScrollIndicator={false}>
            {appointments.map(appointment => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  monthButton: {
    padding: 8,
    borderRadius: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  weekDaysHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#2563eb',
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  dayTextOtherMonth: {
    color: '#d1d5db',
  },
  dayTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  dayTextToday: {
    color: '#2563eb',
    fontWeight: '700',
  },
  appointmentBadge: {
    position: 'absolute',
    bottom: 2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  appointmentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  appointmentsSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  appointmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  appointmentsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  appointmentsList: {
    flex: 1,
  },
});
