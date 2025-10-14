import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, Clock, Edit2, Trash2, Calendar } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { AvailabilitySlot, AvailabilityException } from '@/types/database';
import { AddSlotModal } from '@/components/AddSlotModal';

const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo', short: 'Dom' },
  { value: 1, label: 'Segunda-feira', short: 'Seg' },
  { value: 2, label: 'Terça-feira', short: 'Ter' },
  { value: 3, label: 'Quarta-feira', short: 'Qua' },
  { value: 4, label: 'Quinta-feira', short: 'Qui' },
  { value: 5, label: 'Sexta-feira', short: 'Sex' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
];

export default function AvailabilityScreen() {
  const { clinic } = useAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([]);
  const [selectedTab, setSelectedTab] = useState<'regular' | 'exceptions'>('regular');
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState<{ value: number; label: string } | null>(null);

  useEffect(() => {
    loadAvailability();
  }, []);

  const loadAvailability = async () => {
    setLoading(true);
    try {
      const [slotsResult, exceptionsResult] = await Promise.all([
        supabase
          .from('availability_slots')
          .select('*')
          .order('day_of_week', { ascending: true })
          .order('start_time', { ascending: true }),
        supabase
          .from('availability_exceptions')
          .select('*')
          .gte('date', new Date().toISOString().split('T')[0])
          .order('date', { ascending: true })
      ]);

      if (slotsResult.data) setSlots(slotsResult.data);
      if (exceptionsResult.data) setExceptions(exceptionsResult.data);
    } catch (error) {
      console.error('Error loading availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSlotStatus = async (slotId: string, currentStatus: boolean) => {
    try {
      await supabase
        .from('availability_slots')
        .update({ active: !currentStatus })
        .eq('id', slotId);

      setSlots(slots.map(slot =>
        slot.id === slotId ? { ...slot, active: !currentStatus } : slot
      ));
    } catch (error) {
      console.error('Error toggling slot:', error);
    }
  };

  const openAddSlotModal = (day: { value: number; label: string }) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const handleSaveSlot = async (data: { startTime: string; endTime: string; maxSimultaneous: number }) => {
    if (!clinic || !selectedDay) return;

    const { data: newSlot, error } = await supabase
      .from('availability_slots')
      .insert({
        clinic_id: clinic.id,
        day_of_week: selectedDay.value,
        start_time: data.startTime,
        end_time: data.endTime,
        max_simultaneous: data.maxSimultaneous,
        active: true,
      })
      .select()
      .single();

    if (error) throw error;
    if (newSlot) {
      setSlots([...slots, newSlot]);
    }
  };

  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || '';
  };

  const getSlotsByDay = (dayOfWeek: number) => {
    return slots.filter(slot => slot.day_of_week === dayOfWeek);
  };

  const formatExceptionDate = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Disponibilidade</Text>
          <Text style={styles.subtitle}>Gerencie horários e exceções</Text>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'regular' && styles.tabActive]}
          onPress={() => setSelectedTab('regular')}
        >
          <Clock size={20} color={selectedTab === 'regular' ? '#2563eb' : '#6b7280'} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === 'regular' && styles.tabTextActive]}>
            Horários Regulares
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, selectedTab === 'exceptions' && styles.tabActive]}
          onPress={() => setSelectedTab('exceptions')}
        >
          <Calendar size={20} color={selectedTab === 'exceptions' ? '#2563eb' : '#6b7280'} strokeWidth={2} />
          <Text style={[styles.tabText, selectedTab === 'exceptions' && styles.tabTextActive]}>
            Exceções
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'regular' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {DAYS_OF_WEEK.map(day => {
            const daySlots = getSlotsByDay(day.value);

            return (
              <View key={day.value} style={styles.daySection}>
                <View style={styles.daySectionHeader}>
                  <Text style={styles.dayTitle}>{day.label}</Text>
                  <TouchableOpacity
                    style={styles.addSlotButton}
                    onPress={() => openAddSlotModal(day)}
                  >
                    <Plus size={16} color="#2563eb" strokeWidth={2} />
                    <Text style={styles.addSlotText}>Adicionar Horário</Text>
                  </TouchableOpacity>
                </View>

                {daySlots.length === 0 ? (
                  <View style={styles.emptyDay}>
                    <Text style={styles.emptyDayText}>Nenhum horário configurado</Text>
                  </View>
                ) : (
                  <View style={styles.slotsList}>
                    {daySlots.map(slot => (
                      <View key={slot.id} style={styles.slotCard}>
                        <View style={styles.slotInfo}>
                          <Clock size={16} color="#6b7280" strokeWidth={2} />
                          <Text style={styles.slotTime}>
                            {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                          </Text>
                          <View style={styles.capacityBadge}>
                            <Text style={styles.capacityText}>{slot.max_simultaneous} vagas</Text>
                          </View>
                        </View>

                        <View style={styles.slotActions}>
                          <Switch
                            value={slot.active}
                            onValueChange={() => toggleSlotStatus(slot.id, slot.active)}
                            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
                            thumbColor={slot.active ? '#2563eb' : '#f3f4f6'}
                          />
                          <TouchableOpacity style={styles.slotActionButton}>
                            <Edit2 size={16} color="#6b7280" strokeWidth={2} />
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.slotActionButton}>
                            <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.addExceptionButton}>
            <Plus size={20} color="#ffffff" strokeWidth={2} />
            <Text style={styles.addExceptionText}>Nova Exceção</Text>
          </TouchableOpacity>

          {exceptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Calendar size={48} color="#d1d5db" strokeWidth={2} />
              <Text style={styles.emptyStateTitle}>Nenhuma exceção cadastrada</Text>
              <Text style={styles.emptyStateText}>
                Crie exceções para feriados, fechamentos ou horários especiais
              </Text>
            </View>
          ) : (
            <View style={styles.exceptionsList}>
              {exceptions.map(exception => (
                <View key={exception.id} style={styles.exceptionCard}>
                  <View style={styles.exceptionHeader}>
                    <View style={styles.exceptionDateSection}>
                      <Calendar size={20} color="#2563eb" strokeWidth={2} />
                      <Text style={styles.exceptionDate}>{formatExceptionDate(exception.date)}</Text>
                    </View>
                    {exception.is_closed && (
                      <View style={styles.closedBadge}>
                        <Text style={styles.closedBadgeText}>Fechado</Text>
                      </View>
                    )}
                  </View>

                  {exception.reason && (
                    <Text style={styles.exceptionReason}>{exception.reason}</Text>
                  )}

                  <View style={styles.exceptionActions}>
                    <TouchableOpacity style={styles.exceptionActionButton}>
                      <Edit2 size={16} color="#6b7280" strokeWidth={2} />
                      <Text style={styles.exceptionActionText}>Editar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.exceptionActionButton}>
                      <Trash2 size={16} color="#ef4444" strokeWidth={2} />
                      <Text style={[styles.exceptionActionText, { color: '#ef4444' }]}>Remover</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}

      <AddSlotModal
        visible={modalVisible}
        dayOfWeek={selectedDay?.value || 0}
        dayLabel={selectedDay?.label || ''}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveSlot}
      />
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  tabActive: {
    backgroundColor: '#dbeafe',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#2563eb',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  daySection: {
    marginBottom: 24,
  },
  daySectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  addSlotButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#dbeafe',
  },
  addSlotText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2563eb',
  },
  emptyDay: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  emptyDayText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  slotsList: {
    gap: 8,
  },
  slotCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  slotTime: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  capacityBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  capacityText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
  },
  slotActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  slotActionButton: {
    padding: 6,
  },
  addExceptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    marginBottom: 24,
  },
  addExceptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 64,
    gap: 12,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    maxWidth: 280,
  },
  exceptionsList: {
    gap: 12,
  },
  exceptionCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  exceptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  exceptionDateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  exceptionDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  closedBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  exceptionReason: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  exceptionActions: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  exceptionActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f9fafb',
  },
  exceptionActionText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },
});
